/**
 * The library's own warning applies here in full: a resolver installed client-only makes the
 * browser draw different icons from the ones the server sent, which is a hydration mismatch on
 * every icon on the page. Hence a UNIVERSAL plugin (no `.client` suffix), and hence the calls
 * sitting outside `defineNuxtPlugin`, where they run once when the module is first evaluated.
 */
import { fr, registerMessages, setIconResolver, setLocale } from 'vectis-ui'

import { docsIconResolver } from '~/icons/resolver'

import type { Ref } from 'vue'

setIconResolver(docsIconResolver)

/**
 * The French dictionary is opt-in; importing it is what puts it in the bundle. Registering it
 * here does nothing on its own; it is what makes the `setLocale` below able to do anything.
 */
registerMessages('fr', fr)

/** The BCP 47 tag each route locale hands the library. */
const TAGS: Record<string, string> = { en: 'en-GB', fr: 'fr-FR' }

/** The design system speaks the language of the page it is on. */
export default defineNuxtPlugin((nuxtApp) => {
  const locale = (nuxtApp.$i18n as { locale: Ref<string> }).locale

  setLocale(TAGS[locale.value] ?? TAGS.en!)
  watch(locale, (next) => setLocale(TAGS[next] ?? TAGS.en!))
})
