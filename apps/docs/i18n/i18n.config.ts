/** Keep authored strings literal, including @, braces and pipes. */
export default defineI18nConfig(() => ({
  legacy: false,

  messageCompiler: (message) => () => (typeof message === 'string' ? message : String(message)),

  // Inline HTML is authored in the catalogue and rendered through DocsProse.
  warnHtmlMessage: false,
}))
