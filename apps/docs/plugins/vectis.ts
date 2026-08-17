/**
 * Wires the two pieces of design-system configuration this site needs, and does it at
 * MODULE level rather than inside the plugin's body.
 *
 * Both `setIconResolver` and `registerMessages` write module-level state in the library —
 * configuration, identical for every request a process handles. The library's own warning
 * applies here in full: a resolver installed client-only makes the browser draw different
 * icons from the ones the server sent, which is a hydration mismatch on every icon on the
 * page. Hence a UNIVERSAL plugin (no `.client` suffix), and hence the calls sitting outside
 * `defineNuxtPlugin`, where they run once when the module is first evaluated.
 */
import { fr, registerMessages, setIconResolver } from '@vectis/ui'

import { docsIcons, type DocsIconName } from '~/icons/icons'

/**
 * The site's five chrome icons, which the library does not ship. Answering `undefined` is
 * what hands every other name back to the built-in registry — the documented behaviour that
 * makes a PARTIAL mapping legal, and the reason this file does not have to re-list the
 * thirty-four icons the library already draws.
 *
 * No `viewBox` is returned: these come from the same Material Symbols export grid as the
 * library's own registry, which is exactly the case `{ path }` alone describes.
 */
setIconResolver((name, context) => {
  const paths = docsIcons[name as DocsIconName] as readonly string[] | undefined
  if (!paths) return undefined
  return { path: (context.filled && paths[1]) || paths[0]! }
})

/**
 * The French dictionary is opt-in — importing it is what puts it in the bundle. Registering
 * it here does nothing until the header's language menu calls `setLocale`; it only makes
 * that switch possible.
 */
registerMessages('fr', fr)

export default defineNuxtPlugin(() => {})
