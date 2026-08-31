export default {
  title: 'Localisation (i18n)',
  lead: 'No user-facing text is hardcoded in the components: everything comes from a dictionary. The design system is English by default and ships French; any other language is added on the consumer side.',
  split:
    'Two things are settled separately. The WORDS come from the dictionary, the FORMATS derive from <code>Intl</code> from the locale tag. A locale with no matching dictionary therefore already gives correct dates, numbers, first day of week and hour cycle, with the labels left in English. That is a coherent degraded state, not a bug.',

  frenchHeading: 'Changing the language',
  frenchBody:
    'Two calls, and only the first is specific to French: register a dictionary, then name the locale. <code>fr</code> is opt-in, and not importing it is enough to prune it from the bundle. The argument is not its weight, which is under a kilobyte gzipped. It is that enabling the shipped French and adding a language the library does not ship are the SAME gesture, rather than two categories of dictionary.',
  frenchWhere:
    'Both go at module level, in <code>main.ts</code> or in a Nuxt plugin, never inside a <code>setup()</code>. <code>setLocale</code> can be called again at any moment, from anywhere: the dictionary is a reactive reference, so components already on screen re-render with the new words rather than waiting for a navigation.',
  processBody:
    'The state is module-level, which is what makes that possible, and the accepted limit is the other side of it: there is ONE locale per process. Multi-locale SSR per request is not covered, so a single Node process answering in two languages at the same moment has to pass the text props explicitly. A prerender is the case where the limit costs nothing, since routes are rendered one after another: this site sets the locale of the page it is about to render, and every French page here is built with French words in it.',

  addHeading: 'Adding a language',
  addBody:
    'A dictionary of your own is a plain object, and a partial one is legitimate: what is missing falls back to English rather than to a raw key. Register it under its language subtag, then name a locale that carries it.',
  addTyping:
    'Type it as <code>VectisMessagesInput</code> and your editor will list the namespaces, the keys and the parameters of the messages that take them. Those are typed TypeScript functions, with no ICU and no plural engine: a plural is a ternary written inside the function. The merge is non-recursive by construction, since the dictionary is exactly two levels deep, which is what makes it structurally incapable of descending into a function value.',
  precedenceBody:
    'Resolution is by LANGUAGE SUBTAG, so <code>en-GB</code> and <code>en-US</code> share their words and only their formats differ. Above the dictionary sit the props: a <code>text</code> or <code>label</code> set on a component stays authoritative, and for a container’s accessible name the chain is <code>aria-labelledby</code> › <code>aria-label</code> › the <code>label</code> prop › the dictionary › English. There is never an empty string, never a technical key on screen, and never silence in development when a language is missing.',

  demoHeading: 'Words and formats',
  demoBody:
    'The dictionary and the format locale are two settings, and nothing obliges them to agree. <code>setLocale</code> and <code>registerMessages</code> decide the words a component says; the tag, and the <code>locale</code> prop wherever a component takes one, decides what <code>Intl</code> derives from it: the order of the parts of a date, the separator between them, the day a week starts on, twelve hours or twenty-four. An application can run its words in French and its formats in <code>en-CA</code>, or keep English labels while formatting for Germany, and neither choice constrains the other.',
  demoLanguage: 'Language',
  demoFormats: 'Formats',

  keysHeading: 'The dictionary keys',
  keysBody:
    'The 134 keys the library reads, across 22 namespaces, with the English default of each: this is the list to write a dictionary against. Only the namespaces you translate need to be present, and only the keys you have inside them.',
  keysFunctions:
    'Twenty-three of them are parameterised, and a function is what they are. They print no default here because there is nothing useful to show: their parameters are typed by <code>VectisMessages</code>, which your editor spells out at the point of writing the override.',
  keysColumnKey: 'Key',
  keysColumnDefault: 'English default',
}
