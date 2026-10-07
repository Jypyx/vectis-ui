/**
 * The messages between the builder page and its preview frame. Both are served from the same
 * origin; each side still checks it, since any page can post to a window it holds.
 */
import type { IconLibraryId } from './options'
import type { Scheme } from './model'

const SOURCE = 'vectis-theme-builder'

/** What the frame needs to paint the theme. */
export interface PreviewState {
  /** The stylesheet of every theme token, without its `@import` rules. */
  css: string
  /** Stylesheets to link: fonts, and an icon webfont's CSS. */
  stylesheets: string[]
  icons: IconLibraryId
  scheme: Scheme
}

export type PreviewMessage =
  | { source: typeof SOURCE; type: 'state'; state: PreviewState }
  | { source: typeof SOURCE; type: 'ready' }

export const stateMessage = (state: PreviewState): PreviewMessage => ({
  source: SOURCE,
  type: 'state',
  state,
})

export const readyMessage = (): PreviewMessage => ({ source: SOURCE, type: 'ready' })

/** The message, when the event comes from this origin and carries one of ours. */
export function previewMessage(event: MessageEvent): PreviewMessage | undefined {
  if (event.origin !== window.location.origin) return undefined
  const data = event.data as PreviewMessage | null
  return data?.source === SOURCE ? data : undefined
}
