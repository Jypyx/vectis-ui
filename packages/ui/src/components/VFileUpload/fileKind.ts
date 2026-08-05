/**
 * The KIND of a file, as far as an icon is concerned — deliberately coarse: the
 * point is choosing one glyph out of eight, not classifying a MIME registry.
 *
 * Resolved from the MIME type FIRST, then from the extension. That order is the
 * contract: `file.type` is authoritative when the browser filled it, but it is
 * empty far more often than one expects (an extension the OS does not know, some
 * Linux setups) — the same trap `matchesAccept` documents.
 *
 * Pure, no Vue — the `VHotkeys/platform.ts` precedent: a single consumer, so it
 * stays in the component's folder. Promote it the day a second appears.
 *
 * The kind → ICON NAME table is NOT here: it belongs to VFileUpload, which
 * exposes it as the `typeIcons` prop.
 */

export type FileKind =
  'image' | 'pdf' | 'audio' | 'video' | 'archive' | 'spreadsheet' | 'code' | 'file'

/** What the resolver needs of a `File` — so the tests do not have to forge one. */
export interface FileKindCandidate {
  name: string
  type: string
}

const MIME_KINDS: Record<string, FileKind> = {
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

const EXTENSION_KINDS: Record<string, FileKind> = {
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

export function fileKind(file: FileKindCandidate): FileKind {
  const type = file.type.toLowerCase()

  // The families first: `image/*` covers formats no table will ever list.
  if (type.startsWith('image/')) return 'image'
  if (type.startsWith('audio/')) return 'audio'
  if (type.startsWith('video/')) return 'video'

  const byMime = MIME_KINDS[type]
  if (byMime) return byMime

  // `> 0` and not `>= 0`: a `.gitignore` has no extension, it has a name that
  // starts with a dot.
  const dot = file.name.lastIndexOf('.')
  const extension = dot > 0 ? file.name.slice(dot + 1).toLowerCase() : ''
  return EXTENSION_KINDS[extension] ?? 'file'
}
