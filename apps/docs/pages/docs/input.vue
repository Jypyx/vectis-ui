<script setup lang="ts">
import { VInput } from 'vectis-ui'
import { search as searchIcon } from 'vectis-ui/icons'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
const { apiColumns } = useDocsTable()
useHead({ title: () => t('input.title') })

const name = ref('Vectis')

const anatomyCode = `<VInput
  v-model="name"
  label="Project name"
  hint="Shown in the sidebar and in the URL"
  clearable
  counter
  :maxlength="32"
/>`

const softCode = `<!-- the reader may type past 40; the field then goes into
     error through setCustomValidity, rather than silently
     refusing the keystroke -->
<VInput v-model="summary" :maxlength="40" soft-limit counter />`
</script>

<template>
  <h1>{{ t('input.title') }}</h1>
  <DocsProse class="vd-lead" keypath="input.lead" />
  <DocsProse keypath="input.validation" />

  <h2 id="anatomy">{{ t('input.anatomyHeading') }}</h2>
  <DocsDemo stack>
    <VInput
      v-model="name"
      label="Project name"
      hint="Shown in the sidebar and in the URL"
      placeholder="my-project"
      clearable
      counter
      :maxlength="32"
    />
    <VInput label="Search the registry" :icon-start="searchIcon" placeholder="Package name" />
  </DocsDemo>
  <DocsProse keypath="input.anatomyBody" />
  <DocsCode lang="vue" :code="anatomyCode" />
  <DocsProse keypath="input.anatomyModel" />

  <h2 id="sizes-and-density">{{ t('input.sizesHeading') }}</h2>
  <DocsProse keypath="input.sizesBody" />
  <DocsDemo>
    <VInput size="sm" placeholder="sm · 32px" />
    <VInput size="md" placeholder="md · 40px" />
    <VInput size="lg" placeholder="lg · 48px" />
  </DocsDemo>

  <h2 id="states">{{ t('input.statesHeading') }}</h2>
  <DocsDemo>
    <VInput
      model-value="taken@example.com"
      label="Server-side rule"
      invalid
      hint="This address is already registered"
    />
    <VInput model-value="vectis-ui" label="Read only" readonly />
    <VInput label="Disabled" placeholder="Unavailable" disabled />
    <VInput model-value="vectis" label="Checking" loading />
  </DocsDemo>
  <DocsProse keypath="input.statesBody" />

  <h2 id="limits">{{ t('input.limitsHeading') }}</h2>
  <DocsProse keypath="input.limitsBody" />
  <DocsCode lang="vue" :code="softCode" />

  <h2 id="api">{{ t('input.apiHeading') }}</h2>
  <DocsTable :columns="apiColumns">
    <tr>
      <td><code>v-model</code></td>
      <td><code>string | number</code></td>
      <td><code>''</code></td>
    </tr>
    <tr>
      <td><code>size</code></td>
      <td><code>'sm' | 'md' | 'lg'</code></td>
      <td><code>'md'</code></td>
    </tr>
    <tr>
      <td><code>type</code></td>
      <td><code>'text' | 'email' | 'number' | 'password' | 'search' | 'tel' | 'url'</code></td>
      <td><code>'text'</code></td>
    </tr>
    <tr>
      <td><code>label</code> · <code>hint</code></td>
      <td><code>string</code></td>
      <td>—</td>
    </tr>
    <tr>
      <td><code>iconStart</code> · <code>iconEnd</code></td>
      <DocsProse tag="td" keypath="input.apiIcons" />
      <td>—</td>
    </tr>
    <tr>
      <td><code>iconStartLabel</code> · <code>iconEndLabel</code></td>
      <DocsProse tag="td" keypath="input.apiIconLabels" />
      <td>—</td>
    </tr>
    <tr>
      <td><code>clearable</code> · <code>counter</code> · <code>loading</code></td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>clearVisible</code></td>
      <DocsProse tag="td" keypath="input.apiClearVisible" />
      <td>—</td>
    </tr>
    <tr>
      <td><code>maxlength</code></td>
      <td><code>number</code></td>
      <td>—</td>
    </tr>
    <tr>
      <td><code>softLimit</code></td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td>
        <code>invalid</code> · <code>disabled</code> · <code>readonly</code> · <code>compact</code>
      </td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
  </DocsTable>
  <DocsProse keypath="input.apiBody" />
  <DocsProse tag="blockquote" keypath="input.apiQuote" />
</template>
