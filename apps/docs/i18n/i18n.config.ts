/**
 * vue-i18n's own options — and the one decision that matters here: the messages are PLAIN TEXT.
 *
 * By default vue-i18n compiles every message through its own little language, in which `@` opens
 * a linked-message reference, `{…}` an interpolation and `|` a plural branch. That language is
 * useless to this site — nothing here interpolates, and the library's own dictionary settled the
 * same question the same way, with typed TypeScript functions instead of ICU — while its three
 * sigils are ordinary characters in technical prose. The cost is not theoretical:
 *
 *   - `<code>@import</code>` on the Font family page is an unterminated linked reference, and it
 *     threw at RENDER time. On a prerendered site that is not a warning in a console, it is a
 *     500 during `nuxt generate` and a page missing from the artefact.
 *   - `<code>{ src }</code>` on the Iconography page compiles cleanly and renders as NOTHING,
 *     vue-i18n reading it as a placeholder for a parameter no one passed. Silent, and worse.
 *
 * Replacing the compiler with one that hands the string back is what removes both, permanently
 * and for every message written from now on: a translator can put an `@`, a brace or a pipe in a
 * sentence without knowing any of this exists. The trade is that a message can no longer carry a
 * parameter — if one ever needs to, write it as a TypeScript function in the catalogue and call
 * it, the way the design system does.
 */
export default defineI18nConfig(() => ({
  legacy: false,

  messageCompiler: (message) => () => (typeof message === 'string' ? message : String(message)),

  /*
   * The prose carries its own inline markup (`<code>`, `<strong>`), which `DocsProse` renders.
   * vue-i18n's warning exists for consumers who interpolate user input into a message; this
   * catalogue is authored constants only, so the warning would fire on nearly every string and
   * report nothing.
   */
  warnHtmlMessage: false,
}))
