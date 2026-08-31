<script setup lang="ts">
import {
  en as enMessages,
  setLocale,
  VButton,
  VDateInput,
  VFileInput,
  VMenu,
  VMenuItem,
  VTimeInput,
} from 'vectis-ui'
import { expand_more as expandMoreIcon } from 'vectis-ui/icons'

definePageMeta({ layout: 'docs' })

const { t, locale } = useI18n()
useHead({ title: () => t('i18n.title') })

/**
 * The demo's two choices, and why they are two.
 *
 * The LANGUAGE picks the dictionary, and there is no way to do that for one component: the
 * dictionary is module-level state, so the button really does call `setLocale` and really does
 * move the whole page, the header included. That is the honest demonstration of the limit this
 * page describes, and the page puts the site's own language back when the reader leaves it.
 *
 * The FORMATS are the `locale` prop, which takes precedence over the global locale and is
 * scoped to the one field. German and Japanese are on the list because the library ships no
 * dictionary for either: what moves under them is `Intl`'s doing, what stays is the
 * dictionary's.
 *
 * The file field is in the demo for one reason: it is the only one of the three with a
 * dictionary word ON SCREEN while nothing is open. Its placeholder is `fileInput.placeholder`,
 * so the language button moves it in place, where the date and time fields keep their words
 * inside panels a reader has to open.
 */
const LANGUAGES = [
  { value: 'en-GB', label: 'English' },
  { value: 'fr-FR', label: 'Français' },
]

const FORMAT_LOCALES = ['en-US', 'en-GB', 'fr-FR', 'de-DE', 'ja-JP']

/** The tag the site itself runs on, and the one to go back to. */
const siteTag = computed(() => (locale.value === 'fr' ? 'fr-FR' : 'en-GB'))

/* A COMPLETE tag, never a bare subtag: the dictionary is chosen on the language alone, but
   the same value is what a component falls back on for its formats, where the country decides
   the hour cycle and the first day of the week. */
const language = ref<string>(siteTag.value)
const formats = ref('en-US')

const languageLabel = computed(
  () => LANGUAGES.find((entry) => entry.value === language.value)?.label ?? LANGUAGES[0]!.label,
)

function chooseLanguage(value: string) {
  language.value = value
  setLocale(value)
}

// The header's own switcher moves the site AND the design system, through the Nuxt plugin.
// Following it here is what stops the button from naming a language the components no longer
// speak.
watch(siteTag, (next) => {
  language.value = next
})

onBeforeUnmount(() => setLocale(siteTag.value))

/** Fixed values, so the fields render the same text on the server and in the browser. */
const demoDate = ref<string | null>('2026-03-17')
const demoTime = ref<string | null>('14:30')
const demoFiles = ref<File[]>([])

const frCode = `import { fr, registerMessages, setLocale } from 'vectis-ui'

registerMessages('fr', fr)
setLocale('fr-FR')`

const addCode = `import { registerMessages, setLocale, type VectisMessagesInput } from 'vectis-ui'

// Partial is legitimate: what is missing falls back to English.
const de: VectisMessagesInput = {
  common: { clear: 'Leeren', close: 'Schließen' },
  dataTable: { empty: 'Keine Daten' },
}

registerMessages('de', de)
setLocale('de-DE')`

/**
 * The whole dictionary, flattened for the reference table at the foot of the page.
 *
 * Read from the shipped `en` rather than transcribed, so a key added upstream appears here
 * with nothing to remember. Declaration order is kept: it groups a namespace's keys the way
 * they are used, where alphabetical order would scatter them, and `Object.keys` gives the same
 * order in Node and in the browser, so hydration has nothing to disagree about.
 *
 * A function value prints no default. Its parameters are typed by `VectisMessages`, which an
 * editor shows at the point of writing the override, and there is nothing useful to print for
 * them here.
 */
const namespaces = enMessages as unknown as Record<string, Record<string, unknown>>

const dictionary = Object.entries(namespaces).flatMap(([namespace, entries]) =>
  Object.entries(entries).map(([key, value]) => ({
    path: `${namespace}.${key}`,
    text: typeof value === 'function' ? null : String(value),
  })),
)
</script>

<template>
  <h1>{{ t('i18n.title') }}</h1>
  <DocsProse class="vd-lead" keypath="i18n.lead" />
  <DocsProse keypath="i18n.split" />

  <h2 id="changing-the-language">{{ t('i18n.frenchHeading') }}</h2>
  <DocsProse keypath="i18n.frenchBody" />
  <DocsCode lang="ts" :code="frCode" />
  <DocsProse keypath="i18n.frenchWhere" />
  <DocsProse keypath="i18n.processBody" />

  <h2 id="adding-a-language">{{ t('i18n.addHeading') }}</h2>
  <DocsProse keypath="i18n.addBody" />
  <DocsCode lang="ts" :code="addCode" />
  <DocsProse keypath="i18n.addTyping" />
  <DocsProse keypath="i18n.precedenceBody" />

  <h2 id="words-and-formats">{{ t('i18n.demoHeading') }}</h2>
  <DocsProse keypath="i18n.demoBody" />
  <DocsDemo>
    <VMenu placement="bottom-start" size="sm" width="max-content">
      <template #trigger="{ triggerProps }">
        <VButton
          v-bind="triggerProps"
          variant="outline"
          tone="neutral"
          size="sm"
          :icon-end="expandMoreIcon"
        >
          {{ t('i18n.demoLanguage') }}: {{ languageLabel }}
        </VButton>
      </template>
      <VMenuItem
        v-for="entry in LANGUAGES"
        :key="entry.value"
        :label="entry.label"
        :selected="language === entry.value"
        @click="chooseLanguage(entry.value)"
      />
    </VMenu>

    <VMenu placement="bottom-start" size="sm" width="max-content">
      <template #trigger="{ triggerProps }">
        <VButton
          v-bind="triggerProps"
          variant="outline"
          tone="neutral"
          size="sm"
          :icon-end="expandMoreIcon"
        >
          {{ t('i18n.demoFormats') }}: {{ formats }}
        </VButton>
      </template>
      <VMenuItem
        v-for="tag in FORMAT_LOCALES"
        :key="tag"
        :label="tag"
        :selected="formats === tag"
        @click="formats = tag"
      />
    </VMenu>

    <VDateInput v-model="demoDate" :locale="formats" label="Delivery date" show-picker />
    <VTimeInput v-model="demoTime" :locale="formats" label="Delivery time" show-picker />
    <VFileInput v-model="demoFiles" label="Attachment" />
  </DocsDemo>

  <h2 id="dictionary-keys">{{ t('i18n.keysHeading') }}</h2>
  <DocsProse keypath="i18n.keysBody" />
  <DocsProse keypath="i18n.keysFunctions" />
  <DocsTable :columns="[t('i18n.keysColumnKey'), t('i18n.keysColumnDefault')]">
    <tr v-for="entry in dictionary" :key="entry.path">
      <td>
        <code>{{ entry.path }}</code>
      </td>
      <td v-if="entry.text !== null">{{ entry.text }}</td>
      <td v-else><code>(…) =&gt; string</code></td>
    </tr>
  </DocsTable>
</template>
