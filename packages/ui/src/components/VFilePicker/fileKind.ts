/**
 * What KIND of thing a file is, for the sole purpose of choosing an icon. It is
 * deliberately coarse: the question is which of eight pictures to show, not how to
 * classify every type in existence.
 *
 * The answer comes from the type the browser reports FIRST, and from the extension
 * afterwards. That order is the contract: the reported type is authoritative when there
 * IS one, but it is empty far more often than one expects — an extension the operating
 * system does not know, certain Linux setups — which is why the extension has to be
 * there as a fallback rather than as a first resort.
 *
 * The module is pure and knows nothing of Vue. It lives in the component's folder for
 * the usual reason: a single consumer, so it does not qualify as shared code — promote
 * it the day a second one appears.
 *
 * What is NOT here is which icon each kind takes. That belongs to VFilePicker, which
 * exposes it as a prop a consumer can override.
 */

import type { FileCandidate } from '../../utils/file'

export type FilePickerKind =
  'image' | 'pdf' | 'audio' | 'video' | 'archive' | 'spreadsheet' | 'code' | 'file'

const MIME_KINDS: Record<string, FilePickerKind> = {
  'application/pdf': 'pdf',
  'application/zip': 'archive',
  'application/x-zip-compressed': 'archive',
  'application/vnd.rar': 'archive',
  'application/x-7z-compressed': 'archive',
  'application/x-tar': 'archive',
  'application/gzip': 'archive',
  'text/csv': 'spreadsheet',
  'application/vnd.ms-excel': 'spreadsheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'spreadsheet',
  'application/vnd.oasis.opendocument.spreadsheet': 'spreadsheet',
  'application/json': 'code',
  'application/xml': 'code',
  'text/xml': 'code',
  'text/html': 'code',
  'text/css': 'code',
  'text/javascript': 'code',
  'application/javascript': 'code',
}

const EXTENSION_KINDS: Record<string, FilePickerKind> = {
  avif: 'image',
  bmp: 'image',
  gif: 'image',
  heic: 'image',
  heif: 'image',
  ico: 'image',
  jpeg: 'image',
  jpg: 'image',
  png: 'image',
  svg: 'image',
  tif: 'image',
  tiff: 'image',
  webp: 'image',

  pdf: 'pdf',

  aac: 'audio',
  flac: 'audio',
  m4a: 'audio',
  mp3: 'audio',
  ogg: 'audio',
  wav: 'audio',

  avi: 'video',
  mkv: 'video',
  mov: 'video',
  mp4: 'video',
  webm: 'video',

  '7z': 'archive',
  bz2: 'archive',
  gz: 'archive',
  iso: 'archive',
  rar: 'archive',
  tar: 'archive',
  xz: 'archive',
  zip: 'archive',

  csv: 'spreadsheet',
  ods: 'spreadsheet',
  tsv: 'spreadsheet',
  xls: 'spreadsheet',
  xlsx: 'spreadsheet',

  css: 'code',
  go: 'code',
  html: 'code',
  java: 'code',
  js: 'code',
  json: 'code',
  jsx: 'code',
  py: 'code',
  rb: 'code',
  rs: 'code',
  scss: 'code',
  sh: 'code',
  ts: 'code',
  tsx: 'code',
  xml: 'code',
  yaml: 'code',
  yml: 'code',
}

/** Works out which kind a file belongs to. */
export function fileKind(file: FileCandidate): FilePickerKind {
  const type = file.type.toLowerCase()

  // The whole families first: matching on the family covers every image, audio and
  // video format, including the ones no table will ever list.
  if (type.startsWith('image/')) return 'image'
  if (type.startsWith('audio/')) return 'audio'
  if (type.startsWith('video/')) return 'video'

  const byMime = lookup(MIME_KINDS, type)
  if (byMime) return byMime

  // TRAP — the dot must be found PAST the first character and not at it: a file named
  // `.gitignore` has no extension at all, it has a name beginning with a dot.
  const dot = file.name.lastIndexOf('.')
  const extension = dot > 0 ? file.name.slice(dot + 1).toLowerCase() : ''
  return lookup(EXTENSION_KINDS, extension) ?? 'file'
}

/**
 * TRAP — the tables are object literals, so a bare index also answers for what they
 * INHERIT: a file named `x.constructor` would get a function back, and the component would
 * look its icon up with it. Only a table's own keys are kinds.
 */
const lookup = (table: Record<string, FilePickerKind>, key: string): FilePickerKind | undefined =>
  Object.hasOwn(table, key) ? table[key] : undefined
