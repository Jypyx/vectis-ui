import { describe, expect, it } from 'vitest'

import { formatBytes, matchesAccept, screenFiles } from './file'

/**
 * A `File` of an arbitrary size, without allocating it: `size` is a getter on
 * `Blob.prototype`, so an own property on the instance shadows it.
 */
function fileOf(name: string, size = 10, type = ''): File {
  const file = new File(['x'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

const names = (files: readonly File[]) => files.map((file) => file.name)

describe('matchesAccept', () => {
  const pdf = { name: 'Report.PDF', type: 'application/pdf' }
  const unknown = { name: 'archive.heic', type: '' }

  it.each([
    ['an absent accept', undefined, true],
    ['an empty accept', '', true],
    ['a matching extension, case-insensitive', '.pdf', true],
    ['a non-matching extension', '.txt', false],
    ['an exact MIME type', 'application/pdf', true],
    ['a wildcard family', 'application/*', true],
    ['another family', 'image/*', false],
    ['a list where one token matches', 'image/*,.pdf', true],
  ])('%s', (_label, accept, expected) => {
    expect(matchesAccept(pdf, accept)).toBe(expected)
  })

  it('a file whose type the browser did not guess is refused by a MIME-only accept', () => {
    expect(matchesAccept(unknown, 'image/*')).toBe(false)
    // Hence the documented advice: spell the extension alongside.
    expect(matchesAccept(unknown, 'image/*,.heic')).toBe(true)
  })
})

describe('formatBytes', () => {
  it.each([
    [0, '0 byte'],
    [1, '1 byte'],
    [999, '999 byte'],
    [1000, '1 kB'],
    [1_200_000, '1.2 MB'],
    [2_500_000_000, '2.5 GB'],
    // The carry: 999 999 B lands on the kilobyte rung and rounds to 1000 there.
    [999_999, '1 MB'],
  ])('formats %i as "%s" in en-US', (bytes, expected) => {
    expect(formatBytes(bytes, 'en-US')).toBe(expected)
  })

  // `\u202f` = the NARROW no-break space ICU puts between a number and its
  // unit in French. Escaped rather than literal: ESLint rejects the character,
  // and it would be invisible in review.
  it('follows the locale: French says "Mo" and uses a comma', () => {
    expect(formatBytes(1_200_000, 'fr-FR')).toBe('1,2\u202fMo')
  })

  it('falls back to zero rather than producing a nonsensical size', () => {
    expect(formatBytes(Number.NaN, 'en-US')).toBe('0 byte')
    expect(formatBytes(-10, 'en-US')).toBe('0 byte')
  })
})

describe('screenFiles', () => {
  it('accepts everything when no limit is given', () => {
    const { accepted, rejected } = screenFiles([fileOf('a.pdf'), fileOf('b.jpg')], [], {})

    expect(names(accepted)).toEqual(['a.pdf', 'b.jpg'])
    expect(rejected).toEqual([])
  })

  /*
   * The order of the checks is a contract both components document. Each case
   * below breaks EVERY limit that comes after the expected one, so the assertion
   * is genuinely about precedence and not about the check in isolation.
   */
  it.each([
    ['type', { accept: '.pdf', maxSize: 1, maxFiles: 1, maxTotalSize: 1 }],
    ['size', { maxSize: 1, maxFiles: 1, maxTotalSize: 1 }],
    ['count', { maxFiles: 1, maxTotalSize: 1 }],
    ['total-size', { maxTotalSize: 1 }],
  ])('reports "%s" first when the later limits are broken too', (reason, limits) => {
    const file = fileOf('photo.jpg', 500, 'image/jpeg')
    // One file already held: that is what makes `maxFiles: 1` bite.
    const { accepted, rejected } = screenFiles([file], [fileOf('held.pdf', 500)], limits)

    expect(accepted).toEqual([])
    expect(rejected).toEqual([{ file, reason }])
  })

  it('seeds both the count and the running total from the current selection', () => {
    const current = [fileOf('a.pdf', 60)]

    expect(names(screenFiles([fileOf('b.pdf', 60)], current, { maxTotalSize: 100 }).accepted)) //
      .toEqual([])
    expect(names(screenFiles([fileOf('b.pdf', 60)], current, { maxTotalSize: 200 }).accepted)) //
      .toEqual(['b.pdf'])
    expect(names(screenFiles([fileOf('b.pdf')], current, { maxFiles: 1 }).accepted)).toEqual([])
  })

  it('counts the files accepted within the same batch, not only the current ones', () => {
    const incoming = [fileOf('a.pdf'), fileOf('b.pdf'), fileOf('c.pdf')]
    const { accepted, rejected } = screenFiles(incoming, [], { maxFiles: 2 })

    expect(names(accepted)).toEqual(['a.pdf', 'b.pdf'])
    expect(rejected).toEqual([{ file: incoming[2], reason: 'count' }])
  })

  // A `File` is opaque and two files may share a name across folders, so
  // `duplicate` is deliberately not one of the reasons.
  it('never de-duplicates', () => {
    const file = fileOf('a.pdf')

    expect(screenFiles([file, file], [file], {}).accepted).toHaveLength(2)
  })
})
