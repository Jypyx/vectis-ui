export default {
  title: 'JavaScript helpers',
  lead: 'Functions for configuring localisation and icons, and displaying notifications. Import them by name from <code>vectis-ui</code>.',

  exportedHeading: 'Public exports',
  columnExport: 'Export',
  columnDoes: 'Purpose',
  setLocale:
    'Sets the global language and default regional formats. Components with a <code>locale</code> prop can override formats.',
  registerMessages:
    'Registers or updates a language dictionary. Omitted keys retain previous translations, then fall back to English.',
  dictionaries:
    'English and French dictionaries. English is the default; import and register <code>fr</code> to enable French.',
  setIconResolver:
    'Registers the icon resolver. Return <code>undefined</code> to use the imported SVG or ligature fallback.',
  ligatureResolver: 'Creates a resolver that renders icon names with a ligature font.',
  classResolver:
    'Creates a resolver for CSS classes. By default, built-in names without an alias retain their fallback.',
  componentResolver: 'Creates a resolver that maps icon names to Vue components.',
  toast:
    'Adds a toast and returns its ID. <code>dismissToast(id)</code> removes it; omit the ID to remove all toasts. Render <code>VToaster</code> to display them.',
  snackbar:
    'Shows a snackbar and returns its ID, replacing the previous snackbar. <code>dismissSnackbar(id)</code> removes the matching snackbar; omit the ID to remove the current one. Render <code>VSnackbar</code> to display it.',

  moduleState:
    'Locale and icon configuration are shared across the process. Configure them at application startup; for concurrent multilingual SSR, pass text and locale props explicitly. Call <code>toast</code> and <code>snackbar</code> in browser event handlers or <code>onMounted</code> hooks.',
  types:
    'Types are exported alongside the functions, including <code>MessagesInput</code>, <code>IconResolver</code>, <code>ToastOptions</code> and <code>SnackbarOptions</code>. Component pages document their own types.',

  internalHeading: 'Internal helpers',
  internalBody:
    'Date, time, file and text utilities are internal implementation details. They are not public exports.',

  composablesHeading: 'Composables',
  composablesBody:
    'The library’s composables are internal. Use the component props, events and slots documented on each component page.',
}
