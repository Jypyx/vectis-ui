export default {
  title: 'Localisation (i18n)',
  lead: 'Vectis UI uses English messages and the <code>en-US</code> locale by default. Register the supplied French dictionary or add your own translations.',
  split:
    'Dictionaries provide interface text. The locale also controls regional formats through <code>Intl</code>. If no dictionary is registered for a language, messages fall back to English while formatting uses the selected locale.',

  frenchHeading: 'Change language',
  frenchBody:
    'Import and register the French dictionary, then select a locale with <code>setLocale</code>:',
  frenchWhere:
    'Register dictionaries when your application starts, in <code>main.ts</code> or a universal Nuxt plugin. Call <code>setLocale</code> to update component messages and default formats without reloading the page.',
  processBody:
    'The locale is shared across the process. For concurrent SSR requests in different languages, pass explicit text and locale props to components. For static generation, render routes sequentially and set the locale before rendering each route.',

  addHeading: 'Add a language',
  addBody:
    'Register a dictionary under its language code, such as <code>de</code>. Partial dictionaries keep previously registered values for omitted keys, then fall back to English.',
  addTyping:
    'Use <code>MessagesInput</code> to check namespace names, keys and message parameters. Dictionaries have two levels: namespace and key.',
  precedenceBody:
    '<code>en-GB</code> and <code>en-US</code> share the <code>en</code> dictionary but use different regional formats. Component text props, such as <code>loadingText</code>, override the corresponding dictionary messages.',

  demoHeading: 'Language and formats',
  demoBody:
    'Use <code>setLocale</code> for the global language and default formats. On components that accept it, the <code>locale</code> prop overrides formats without changing dictionary messages. In this example, choose the language and date/time formats separately.',
  demoLanguage: 'Language',
  demoFormats: 'Formats',

  keysHeading: 'Translation keys',
  keysBody:
    'The table lists the English messages by namespace. Register only the keys you want to translate or override.',
  keysFunctions:
    'Parameterised messages are TypeScript functions, shown with their arguments below. Implement plural rules in these functions.',
  keysColumnKey: 'Key',
  keysColumnDefault: 'English value',
}
