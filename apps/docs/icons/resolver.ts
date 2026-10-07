import { docsIcons, type DocsIconName } from './icons'

import type { IconResolver } from 'vectis-ui'

/**
 * The site's own icons, which the library does not ship. Answering `undefined` is what hands
 * every other name back to the built-in registry; the documented behaviour that makes a
 * PARTIAL mapping legal, and the reason the site does not have to re-list the icons the
 * library already draws.
 */
export const docsIconResolver: IconResolver = (name, context) => {
  const paths = docsIcons[name as DocsIconName] as readonly string[] | undefined
  if (!paths) return undefined
  return { path: (context.filled && paths[1]) || paths[0]! }
}
