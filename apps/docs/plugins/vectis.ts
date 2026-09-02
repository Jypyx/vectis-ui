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
import { fr, registerMessages, setIconResolver, setLocale } from 'vectis-ui'

import { docsIcons, type DocsIconName } from '~/icons/icons'

import type { Ref } from 'vue'

/**
 * The site's six chrome icons, which the library does not ship. Answering `undefined` is
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
 * it here does nothing on its own; it is what makes the `setLocale` below able to do anything.
 */
registerMessages('fr', fr)

/** The BCP 47 tag each route locale hands the library. Formats derive from the tag, so it is a
 *  full one and not the bare subtag: `fr-FR` is what gives French month names and a 24-hour
 *  clock in the date and time demos. */
const TAGS: Record<string, string> = { en: 'en-GB', fr: 'fr-FR' }

/**
 * The design system speaks the language of the page it is on.
 *
 * This is the ONE thing that cannot sit at module level with the two calls above, and the
 * reason is the library's documented limit: `setLocale` moves module-level state, so there is
 * ONE locale per process. The plugin body runs once per render, before the tree is built, so
 * each route sets the locale it is about to be rendered in.
 *
 * That is only correct while no two renders overlap, and nitro prerenders CONCURRENTLY unless
 * told otherwise — hence `nitro.prerender.concurrency: 1` in nuxt.config.ts, which is what
 * makes the sentence above true. Remove it and a French route sets the locale mid-way through
 * an English one: every English page then ships French words, and the build stays green.
 *
 * Move this call out to module level and every prerendered page would carry whichever language
 * happened to be set when the module was first evaluated: English on all fifty-three French
 * pages, with nothing in the build to say so.
 *
 * The `watch` covers the other direction — a client-side switch from the header, where the
 * route changes without the module being re-evaluated.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const locale = (nuxtApp.$i18n as { locale: Ref<string> }).locale

  setLocale(TAGS[locale.value] ?? TAGS.en!)
  watch(locale, (next) => setLocale(TAGS[next] ?? TAGS.en!))
})
