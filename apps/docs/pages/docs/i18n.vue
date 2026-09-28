<script setup lang="ts">
import {
  en as enMessages,
  fr as frMessages,
  setLocale,
  VButton,
  VDateInput,
  VFileInput,
  VMenu,
  VMenuItem,
  VTimeInput,
} from 'vectis-ui'
import { expand_more as expandMoreIcon } from 'vectis-ui/icons'

import type { Messages } from 'vectis-ui'

definePageMeta({ layout: 'docs' })

const { t, locale } = useI18n()
useDocsHead('i18n')

/**
 * The demo's two choices, and why they are two. The FORMATS are the `locale` prop, which takes
 * precedence over the global locale and is scoped to the one field.
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

// The header's own switcher moves the site and the design system, through the Nuxt plugin.
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

const addCode = `import { registerMessages, setLocale, type MessagesInput } from 'vectis-ui'

// Partial is legitimate: what is missing falls back to English.
const de: MessagesInput = {
  common: { clear: 'Leeren', close: 'Schließen' },
  dataTable: { empty: 'Keine Daten' },
}

registerMessages('de', de)
setLocale('de-DE')`

/** The two dictionaries the library ships, and therefore the two this table can show. */
type DictionaryLanguage = 'en' | 'fr'

/**
 * Every parameterised message, written out as it is written in the library: the parameters it
 * takes and the English it builds from them. It is copied by hand, and a default reworded
 * upstream has to be recopied.
 */
type ParameterisedKey = {
  [N in keyof Messages]: {
    [K in keyof Messages[N]]: Messages[N][K] extends (...args: never[]) => unknown
      ? `${N & string}.${K & string}`
      : never
  }[keyof Messages[N]]
}[keyof Messages]

const PARAMETERISED: Record<DictionaryLanguage, Record<ParameterisedKey, string>> = {
  en: {
    'common.remove': '(name) => `Remove ${name}`',
    'pagination.page': '(page) => `Page ${page}`',
    'dataTable.perPageValue': '(label, value) => `${label}: ${value}`',
    'dataTable.selectRow': '(index) => `Select row ${index}`',
    'dataTable.selection': "(count) => `${count} item${count === 1 ? '' : 's'} selected`",
    'dataTable.range': '({ start, end, total }) => `${start}–${end} of ${total}`',
    'inputOTP.slot': '(index, total) => `Character ${index} of ${total}`',
    'slider.rangeStart': '(label) => `${label} (start)`',
    'slider.rangeEnd': '(label) => `${label} (end)`',
    'field.limitExceeded': '(max) => `Exceeds the limit of ${max} characters`',
    'progress.percent': '(percent) => `${percent}%`',
    'hotkeys.label': '(keys) => `Keyboard shortcut: ${keys}`',
    'timePicker.hourValue': "(hour) => `${hour} o'clock`",
    'timePicker.minutesValue': '(minute) => `${minute} minutes`',
    'timeInput.meridiemValue': '(value) => `AM or PM: ${value}`',
    'fileInput.files': "(count) => `${count} file${count === 1 ? '' : 's'}`",
    'carousel.slide': '(index, total) => `${index} of ${total}`',
    'calendar.viewCustom': '(days) => `${days} days`',
    'calendar.moreEvents': '(count) => `+${count} more`',
    'calendar.openDay': '(day) => `Open ${day}`',
    'calendar.movedTo': '(title, when) => `${title} moved to ${when}.`',
  },
  fr: {
    'common.remove': '(name) => `Retirer ${name}`',
    'pagination.page': '(page) => `Page ${page}`',
    'dataTable.perPageValue': '(label, value) => `${label} : ${value}`',
    'dataTable.selectRow': '(index) => `Sélectionner la ligne ${index}`',
    'dataTable.selection':
      "(count) => `${count} élément${count > 1 ? 's' : ''} sélectionné${count > 1 ? 's' : ''}`",
    'dataTable.range': '({ start, end, total }) => `${start}–${end} sur ${total}`',
    'inputOTP.slot': '(index, total) => `Caractère ${index} sur ${total}`',
    'slider.rangeStart': '(label) => `${label} (début)`',
    'slider.rangeEnd': '(label) => `${label} (fin)`',
    'field.limitExceeded': '(max) => `Dépasse la limite de ${max} caractères`',
    /* The escape is the library's own, and it is kept for the same reason it is written that
       way there: the space before a percent sign is a NON-BREAKING one in French, and an
       escape is the only form of it a reader can tell from an ordinary space. */
    'progress.percent': '(percent) => `${percent}\\u00A0%`',
    'hotkeys.label': '(keys) => `Raccourci clavier : ${keys}`',
    'timePicker.hourValue': '(hour) => `${hour} heures`',
    'timePicker.minutesValue': '(minute) => `${minute} minutes`',
    'timeInput.meridiemValue': '(value) => `AM ou PM : ${value}`',
    'fileInput.files': "(count) => `${count} fichier${count > 1 ? 's' : ''}`",
    'carousel.slide': '(index, total) => `${index} sur ${total}`',
    'calendar.viewCustom': '(days) => `${days} jours`',
    'calendar.moreEvents': "(count) => `+${count} autre${count > 1 ? 's' : ''}`",
    'calendar.openDay': '(day) => `Ouvrir le ${day}`',
    'calendar.movedTo': '(title, when) => `${title} déplacé au ${when}.`',
  },
}

/**
 * The whole dictionary, flattened for the reference table at the foot of the page. A
 * parameterised message has no plain default to print, so its row carries the function itself,
 * from the table above: the parameters it takes, and the English it builds with them.
 */
const DICTIONARIES: Record<DictionaryLanguage, Messages> = { en: enMessages, fr: frMessages }

const dictionary = computed(() => {
  const shown: DictionaryLanguage = locale.value === 'fr' ? 'fr' : 'en'
  const namespaces = DICTIONARIES[shown] as unknown as Record<string, Record<string, unknown>>
  const written: Record<string, string> = PARAMETERISED[shown]

  return Object.entries(namespaces).flatMap(([namespace, entries]) =>
    Object.entries(entries).map(([key, value]) => {
      const path = `${namespace}.${key}`
      const fn = typeof value === 'function'
      return { path, parameterised: fn, text: fn ? written[path]! : String(value) }
    }),
  )
})
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
      <td v-if="entry.parameterised">
        <code>{{ entry.text }}</code>
      </td>
      <td v-else>{{ entry.text }}</td>
    </tr>
  </DocsTable>
</template>
