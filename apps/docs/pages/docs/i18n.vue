<script setup lang="ts">
import { VCalendar, VToggle, VToggleItem } from '@vectis/ui'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('i18n.title') })

/**
 * The words-versus-formats demo, and the reason it uses the PROP rather than `setLocale`.
 *
 * VCalendar's `locale` prop takes precedence over the global locale and is scoped to the one
 * instance, so the demo can show German or Japanese without moving the module-level state the
 * whole site runs on. Calling `setLocale` here would translate the header, the rail and every
 * other component on the page, and it would stay that way until the reader navigated — a demo
 * that breaks the page around it is not a demo.
 *
 * German and Japanese are the interesting choices precisely because the library ships no
 * dictionary for either: what moves is `Intl`'s doing, what stays is the dictionary's.
 */
const DEMO_LOCALES = ['en-GB', 'fr-FR', 'de-DE', 'ja-JP']

const demoLocale = ref('de-DE')
/** A fixed date, so the demo renders the same month on the server and in the browser. */
const demoDate = ref<string | null>('2026-03-17')

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
  <h1>{{ t('i18n.title') }}</h1>
  <DocsProse class="vd-lead" keypath="i18n.lead" />
  <DocsProse keypath="i18n.split" />

  <h2 id="the-split-shown">{{ t('i18n.demoHeading') }}</h2>
  <DocsProse keypath="i18n.demoBody" />
  <DocsDemo stack>
    <VToggle v-model="demoLocale" :label="t('i18n.demoLabel')" size="sm" mandatory>
      <VToggleItem v-for="tag in DEMO_LOCALES" :key="tag" :value="tag" :label="tag" />
    </VToggle>
    <VCalendar v-model="demoDate" :locale="demoLocale" />
  </DocsDemo>
  <DocsProse tag="blockquote" keypath="i18n.demoQuote" />

  <h2 id="switching-to-french">{{ t('i18n.frenchHeading') }}</h2>
  <DocsCode lang="ts" :code="frCode" />
  <DocsProse keypath="i18n.frenchBody" />

  <h2 id="adding-a-language">{{ t('i18n.addHeading') }}</h2>
  <DocsCode lang="ts" :code="addCode" />
  <DocsProse keypath="i18n.addBody" />
  <DocsProse keypath="i18n.addTyping" />

  <h2 id="precedence">{{ t('i18n.precedenceHeading') }}</h2>
  <DocsProse keypath="i18n.precedenceBody" />
  <DocsProse keypath="i18n.precedenceSubtag" />

  <h2 id="one-locale-per-process">{{ t('i18n.processHeading') }}</h2>
  <DocsProse keypath="i18n.processBody" />
  <DocsProse keypath="i18n.processPrerender" />
  <DocsProse tag="blockquote" keypath="i18n.processQuote" />
</template>
