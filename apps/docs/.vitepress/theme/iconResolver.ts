import type { IconRender, IconResolver } from '@vectis/ui'

import { DOCS_ICON_VIEW_BOX, docsIcons } from './icons'

/**
 * The docs' icon resolver — a PARTIAL one, which is the whole point.
 *
 * `setIconResolver` sits ahead of the library's built-in registry in VIcon's resolution
 * order, and a resolver returning `undefined` hands the request back to it. So this
 * answers for the six names the chrome needs and the registry does not carry, and the
 * other thirty keep coming from the library — no per-name aliasing, no duplicated paths.
 *
 * The `viewBox` is passed explicitly even though it matches VIcon's default: these paths
 * are generated from the same grid as the library's, and stating it is what would make a
 * future grid change fail visibly here rather than silently draw outside the frame.
 */
export const docsIconResolver: IconResolver = (name): IconRender | undefined => {
  const path = (docsIcons as Record<string, string | undefined>)[name]
  return path === undefined ? undefined : { path, viewBox: DOCS_ICON_VIEW_BOX }
}
