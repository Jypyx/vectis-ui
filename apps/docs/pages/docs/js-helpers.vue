<script setup lang="ts">
definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('jsHelpers')

const exportColumns = computed(() => [t('jsHelpers.columnExport'), t('jsHelpers.columnDoes')])

const configCode = `// Configure localisation at application startup.
import { fr, registerMessages, setLocale } from 'vectis-ui'

registerMessages('fr', fr)
setLocale('fr-FR')`

const toastCode = `import { toast } from 'vectis-ui'

// Call from a browser event handler. Render VToaster in the application.
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
      <td><code>registerMessages(lang, messages)</code></td>
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
      <td><code>classIconResolver(options)</code></td>
      <DocsProse tag="td" keypath="jsHelpers.classResolver" />
    </tr>
    <tr>
      <td><code>componentIconResolver(options)</code></td>
      <DocsProse tag="td" keypath="jsHelpers.componentResolver" />
    </tr>
    <tr>
      <td><code>toast(options)</code> · <code>dismissToast(id)</code></td>
      <DocsProse tag="td" keypath="jsHelpers.toast" />
    </tr>
    <tr>
      <td><code>snackbar(options)</code> · <code>dismissSnackbar(id)</code></td>
      <DocsProse tag="td" keypath="jsHelpers.snackbar" />
    </tr>
  </DocsTable>
  <DocsCode lang="ts" :code="configCode" />
  <DocsProse keypath="jsHelpers.moduleState" />
  <DocsCode lang="ts" :code="toastCode" />
  <DocsProse keypath="jsHelpers.types" />

  <h2 id="the-internal-helpers">{{ t('jsHelpers.internalHeading') }}</h2>
  <DocsProse keypath="jsHelpers.internalBody" />

  <h2 id="composables">{{ t('jsHelpers.composablesHeading') }}</h2>
  <DocsProse keypath="jsHelpers.composablesBody" />
</template>
