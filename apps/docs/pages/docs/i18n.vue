<script setup lang="ts">
definePageMeta({ layout: 'docs' })
useHead({ title: 'Localisation (i18n)' })

const frCode = `import { fr, registerMessages, setLocale } from '@vectis/ui'

registerMessages('fr', fr)
setLocale('fr-FR')`

const addCode = `import { registerMessages, setLocale, type VectisMessagesInput } from '@vectis/ui'

const de: VectisMessagesInput = {
  common: { clear: 'Leeren', close: 'Schließen' },
}

registerMessages('de', de)
setLocale('de-DE')`
</script>

<template>
  <h1>Localisation (i18n)</h1>
  <p class="vd-lead">
    No user-facing text is hardcoded in the components: everything comes from a dictionary. The
    design system is English by default and ships French; any other language is added on the
    consumer side.
  </p>
  <p>
    Two things are settled separately: the WORDS come from the dictionary, the FORMATS derive from
    <code>Intl</code> from the locale tag. A locale with no matching dictionary therefore already
    gives correct dates, numbers, first day of week and hour cycle, with the labels left in English
    — a coherent degraded state rather than a bug.
  </p>
  <blockquote>
    The language menu in this site's header does exactly that. Pick Deutsch and the calendars and
    clocks turn German while the labels stay English; the documentation's own prose never moves,
    because it is prose and not a dictionary.
  </blockquote>

  <h2 id="switching-to-french">Switching to French</h2>
  <DocsCode lang="ts" :code="frCode" />
  <p>
    <code>fr</code> is opt-in: not importing it is enough to prune it from the bundle. The argument
    is not its weight — under a kilobyte gzipped — but that enabling the shipped French and adding a
    language the library does not ship are the SAME gesture, rather than two categories of
    dictionary.
  </p>

  <h2 id="adding-a-language">Adding a language</h2>
  <DocsCode lang="ts" :code="addCode" />
  <p>
    A partial dictionary is legitimate: what is missing falls back to English rather than to a key.
    The merge is non-recursive by construction — the dictionary is exactly two levels deep,
    <code>namespace.key</code>, and that is what makes it structurally incapable of descending into
    a parameterised message, which is a function.
  </p>
  <p>
    Parameterised messages are typed TypeScript functions, with no ICU and no plural engine: a
    plural is a ternary inside the function. Both shipped dictionaries are annotated
    <code>VectisMessages</code>, so key and signature parity are guaranteed at compile time rather
    than tested for.
  </p>

  <h2 id="precedence">Precedence</h2>
  <p>
    A <code>text</code> or <code>label</code> prop set on a component stays authoritative. For a
    container's accessible name the chain is <code>aria-labelledby</code> ›
    <code>aria-label</code> › the <code>label</code> prop › the dictionary › English. There is never
    an empty string, never a technical key on screen, and never silence in development when a
    language is missing.
  </p>
  <p>
    Resolution is by LANGUAGE SUBTAG: <code>en-GB</code> and <code>en-US</code> share their words,
    and what separates them comes from <code>Intl</code>.
  </p>

  <h2 id="one-locale-per-process">One locale per process</h2>
  <p>
    The dictionary is module-level state, which is what lets <code>setLocale</code> be called from
    any <code>.ts</code> file and still reach components that are already mounted. The accepted
    limit is the other side of that: multi-locale SSR PER REQUEST is not covered — a single Node
    process serving <code>/fr</code> and <code>/en</code> must pass the text props explicitly.
  </p>
  <p>
    On a prerendered site the same rule takes a milder form, and this one lives with it: the
    artefact is built in English, and a stored preference is applied after hydration rather than
    before it. Applying it earlier would make the client render words the HTML does not contain,
    which is a hydration mismatch.
  </p>
</template>
