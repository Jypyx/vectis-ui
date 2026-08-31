<script setup lang="ts">
definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('jsHelpers.title') })

/* Two tables, each with its own pair of headings — neither is the API table's Prop/Type/Default. */
const exportColumns = computed(() => [t('jsHelpers.columnExport'), t('jsHelpers.columnDoes')])
const internalColumns = computed(() => [t('jsHelpers.columnModule'), t('jsHelpers.columnInternal')])

const configCode = `// app entry: module level, never inside a setup()
import {
  fr,
  registerMessages,
  setLocale,
  setIconResolver,
  ligatureIconResolver,
} from 'vectis-ui'

registerMessages('fr', fr)
setLocale('fr-FR')
setIconResolver(ligatureIconResolver())`

const toastCode = `import { toast } from 'vectis-ui'

// client-side only: the queue is module state, shared by every
// request a server handles
toast({ message: 'Copied to the clipboard', duration: 1600 })`
</script>

<template>
  <h1>{{ t('jsHelpers.title') }}</h1>
  <DocsProse class="vd-lead" keypath="jsHelpers.lead" />

  <h2 id="what-is-exported">{{ t('jsHelpers.exportedHeading') }}</h2>
  <DocsTable :columns="exportColumns">
    <tr>
      <td><code>setLocale(tag)</code></td>
      <DocsProse tag="td" keypath="jsHelpers.setLocale" />
    </tr>
    <tr>
      <td><code>registerMessages(tag, dict)</code></td>
      <DocsProse tag="td" keypath="jsHelpers.registerMessages" />
    </tr>
    <tr>
      <td><code>en</code> · <code>fr</code></td>
      <DocsProse tag="td" keypath="jsHelpers.dictionaries" />
    </tr>
    <tr>
      <td><code>setIconResolver(fn)</code></td>
      <DocsProse tag="td" keypath="jsHelpers.setIconResolver" />
    </tr>
    <tr>
      <td><code>ligatureIconResolver()</code></td>
      <DocsProse tag="td" keypath="jsHelpers.ligatureResolver" />
    </tr>
    <tr>
      <td><code>classIconResolver()</code></td>
      <DocsProse tag="td" keypath="jsHelpers.classResolver" />
    </tr>
    <tr>
      <td><code>componentIconResolver()</code></td>
      <DocsProse tag="td" keypath="jsHelpers.componentResolver" />
    </tr>
    <tr>
      <td><code>toast(options)</code> · <code>dismissToast(id)</code></td>
      <DocsProse tag="td" keypath="jsHelpers.toast" />
    </tr>
  </DocsTable>
  <DocsCode lang="ts" :code="configCode" />
  <DocsProse keypath="jsHelpers.moduleState" />
  <DocsCode lang="ts" :code="toastCode" />
  <DocsProse keypath="jsHelpers.types" />

  <h2 id="the-internal-helpers">{{ t('jsHelpers.internalHeading') }}</h2>
  <DocsProse keypath="jsHelpers.internalBody" />
  <DocsTable :columns="internalColumns">
    <tr>
      <td><code>utils/date.ts</code></td>
      <td>
        <code>parseISO</code>, <code>formatISO</code>, <code>addDays</code>, <code>addMonths</code>,
        <code>clampISO</code>, <code>isWithin</code>, <code>buildMonthGrid</code>,
        <code>firstDayOfWeekFor</code>, <code>weekdayNames</code>, <code>monthNames</code>,
        <code>formatDisplay</code>, <code>dateMaskFor</code>,
        <code>parseDateMask</code>
      </td>
    </tr>
    <tr>
      <td><code>utils/time.ts</code></td>
      <td>
        <code>parseTime</code>, <code>formatTime</code>, <code>to12h</code>, <code>to24h</code>,
        <code>hourCycleFor</code>, <code>snapMinute</code>, <code>timeList</code>,
        <code>timeToMask</code>, <code>parseTimeMask</code>
      </td>
    </tr>
    <tr>
      <td><code>utils/file.ts</code></td>
      <td><code>matchesAccept</code>, <code>formatBytes</code>, <code>screenFiles</code></td>
    </tr>
    <tr>
      <td><code>utils/text.ts</code> · <code>number.ts</code> · <code>array.ts</code></td>
      <td>
        <code>normalizeText</code>, <code>pad2</code>, <code>digitsOf</code>, <code>clamp</code>,
        <code>toggleValue</code>
      </td>
    </tr>
    <tr>
      <td><code>utils/arrowNav.ts</code> · <code>matcher.ts</code></td>
      <td><code>navigableItems</code>, <code>arrowNavigate</code>, <code>resolveMatcher</code></td>
    </tr>
    <tr>
      <td><code>utils/css.ts</code> · <code>vnode.ts</code> · <code>env.ts</code></td>
      <td><code>px</code>, <code>cssSize</code>, <code>flattenSlot</code>, <code>isDev</code></td>
    </tr>
  </DocsTable>
  <DocsProse tag="blockquote" keypath="jsHelpers.internalQuote" />

  <h2 id="composables">{{ t('jsHelpers.composablesHeading') }}</h2>
  <DocsProse keypath="jsHelpers.composablesBody" />
</template>
