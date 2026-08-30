/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm icons  ·  Source: scripts/build-icons.ts
 *
 * Material Symbols Rounded (wght 400 · GRAD 0 · opsz 24)
 * google/material-design-icons @ 528cb964c01fb2b09bc3b9208f82b6d8f8c1c1e2
 * Apache-2.0 licence © Google.
 */

const NAMES = [
  'arrow_downward',
  'arrow_downward_alt',
  'arrow_drop_down',
  'arrow_drop_up',
  'arrow_left_alt',
  'arrow_right_alt',
  'arrow_upward',
  'arrow_upward_alt',
  'attach_file',
  'audio_file',
  'calendar_today',
  'check',
  'check_circle',
  'chevron_left',
  'chevron_right',
  'close',
  'cloud_upload',
  'code',
  'description',
  'error',
  'expand_less',
  'expand_more',
  'folder_zip',
  'image',
  'info',
  'more_horiz',
  'notifications',
  'picture_as_pdf',
  'schedule',
  'search',
  'swap_vert',
  'table_chart',
  'video_file',
  'warning',
] as const

/** The icon names the DS renders itself — the contract of a consumer resolver. */
export type VectisIconName = (typeof NAMES)[number]

/**
 * The names alone, carrying no drawing at all. `classIconResolver` in `strict` mode
 * asks nothing more than "does the design system ship this name?", and a module of
 * its own is what stops a consumer who wired in their OWN icon library from
 * downloading 34 Material paths to answer that one question.
 */
export const builtinIconNames: ReadonlySet<string> = /* @__PURE__ */ new Set(NAMES)
