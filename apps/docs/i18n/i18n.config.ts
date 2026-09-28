/**
 * Replacing the compiler with one that hands the string back is what removes both, permanently
 * and for every message written from now on: a translator can put an `@`, a brace or a pipe in
 * a sentence without knowing any of this exists.
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
