export default {
  title: 'Localisation (i18n)',
  lead: 'No user-facing text is hardcoded in the components: everything comes from a dictionary. The design system is English by default and ships French; any other language is added on the consumer side.',
  split:
    'Two things are settled separately: the WORDS come from the dictionary, the FORMATS derive from <code>Intl</code> from the locale tag. A locale with no matching dictionary therefore already gives correct dates, numbers, first day of week and hour cycle, with the labels left in English — a coherent degraded state rather than a bug.',

  demoHeading: 'The split, shown',
  demoBody:
    'The calendar below is given a <code>locale</code> prop, which takes precedence over the global locale. Pick German or Japanese — languages the library ships no dictionary for — and the month name, the weekday initials and the first day of the week all move, while the labels the dictionary owns stay English. That is the degraded state, and it is a usable one.',
  demoLabel: 'Calendar locale',
  demoQuote:
    "The prop is scoped to this one calendar; nothing else on the page changes. That is the difference between a component's <code>locale</code> prop and the global <code>setLocale</code>, which moves module-level state for the whole process.",

  frenchHeading: 'Switching to French',
  frenchBody:
    '<code>fr</code> is opt-in: not importing it is enough to prune it from the bundle. The argument is not its weight — under a kilobyte gzipped — but that enabling the shipped French and adding a language the library does not ship are the SAME gesture, rather than two categories of dictionary.',

  addHeading: 'Adding a language',
  addBody:
    'A partial dictionary is legitimate: what is missing falls back to English rather than to a key. The merge is non-recursive by construction — the dictionary is exactly two levels deep, <code>namespace.key</code>, and that is what makes it structurally incapable of descending into a parameterised message, which is a function.',
  addTyping:
    'Parameterised messages are typed TypeScript functions, with no ICU and no plural engine: a plural is a ternary inside the function. Both shipped dictionaries are annotated <code>VectisMessages</code>, so key and signature parity are guaranteed at compile time rather than tested for.',

  precedenceHeading: 'Precedence',
  precedenceBody:
    'A <code>text</code> or <code>label</code> prop set on a component stays authoritative. For a container’s accessible name the chain is <code>aria-labelledby</code> › <code>aria-label</code> › the <code>label</code> prop › the dictionary › English. There is never an empty string, never a technical key on screen, and never silence in development when a language is missing.',
  precedenceSubtag:
    'Resolution is by LANGUAGE SUBTAG: <code>en-GB</code> and <code>en-US</code> share their words, and what separates them comes from <code>Intl</code>.',

  processHeading: 'One locale per process',
  processBody:
    'The dictionary is module-level state, which is what lets <code>setLocale</code> be called from any <code>.ts</code> file and still reach components that are already mounted. The accepted limit is the other side of that: multi-locale SSR PER REQUEST is not covered — a single Node process serving two languages at once must pass the text props explicitly.',
  processPrerender:
    'Prerendering is the case where that limit costs nothing, and this site is the demonstration. <code>nuxt generate</code> renders its routes one after another in a single process, so a plugin can set the locale of the page it is about to render and no two ever overlap: every French page here is built with French words in it, and served as static HTML. What a server rendering two languages CONCURRENTLY cannot do, a build doing them in sequence can.',
  processQuote:
    'Reach for the text props when one running process must answer in two languages at the same moment. Everywhere else — an application in one language, or a site prerendered in several — <code>setLocale</code> is enough.',
}
