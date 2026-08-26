<script setup lang="ts">
import { VChip, VTypography } from '@vectis/ui'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
const { apiColumns } = useDocsTable()
useHead({ title: () => t('chip.title') })

const only3 = ref(false)
const tags = ref(['accessibility', 'tokens'])

const selectCode = `<VChip selectable check v-model:selected="only3">Vue 3 only</VChip>
<VChip dismissible @dismiss="remove('accessibility')">accessibility</VChip>`

const colorCode = `<!-- a tag list out of a database: its colours are DATA,
     not design decisions, so they replace the tone -->
<VChip v-for="tag in tags" :key="tag.id" :color="tag.colour">
  {{ tag.name }}
</VChip>`
</script>

<template>
  <h1>{{ t('chip.title') }}</h1>
  <DocsProse class="vd-lead" keypath="chip.lead" />

  <h2 id="tones-and-variants">{{ t('chip.tonesHeading') }}</h2>
  <DocsProse keypath="chip.tonesBody" />
  <DocsDemo>
    <VChip tone="neutral">Neutral</VChip>
    <VChip tone="accent">Accent</VChip>
    <VChip tone="success">Passing</VChip>
    <VChip tone="warning">Deprecated</VChip>
    <VChip tone="danger">Failing</VChip>
  </DocsDemo>
  <DocsDemo>
    <VChip variant="solid" tone="accent">Solid</VChip>
    <VChip variant="soft" tone="accent">Soft</VChip>
    <VChip variant="outline" tone="accent">Outline</VChip>
    <VChip shape="pill" tone="neutral">Pill</VChip>
    <VChip size="sm" tone="neutral">sm</VChip>
    <VTypography variant="body-sm" as="span" tone="muted">
      {{ t('chip.sizesCaption') }}
    </VTypography>
  </DocsDemo>

  <h2 id="chosen-and-dismissed">{{ t('chip.statesHeading') }}</h2>
  <DocsProse keypath="chip.statesBody" />
  <DocsDemo>
    <VChip v-model:selected="only3" selectable check tone="accent">Vue 3 only</VChip>
    <VChip clickable tone="neutral" icon-start="schedule">Last 7 days</VChip>
    <VChip
      v-for="tag in tags"
      :key="tag"
      dismissible
      tone="neutral"
      @dismiss="tags = tags.filter((entry) => entry !== tag)"
    >
      {{ tag }}
    </VChip>
    <VChip disabled tone="neutral">Archived</VChip>
  </DocsDemo>
  <DocsCode lang="vue" :code="selectCode" />

  <h2 id="a-colour-of-your-own">{{ t('chip.colourHeading') }}</h2>
  <DocsProse keypath="chip.colourBody" />
  <DocsDemo>
    <VChip color="oklch(58% 0.2 25)">coral</VChip>
    <VChip color="oklch(55% 0.14 200)">cyan</VChip>
    <VChip color="oklch(50% 0.16 300)" variant="outline">violet</VChip>
  </DocsDemo>
  <DocsCode lang="vue" :code="colorCode" />

  <h2 id="api">{{ t('chip.apiHeading') }}</h2>
  <DocsTable :columns="apiColumns">
    <tr>
      <td><code>variant</code></td>
      <td><code>'soft' | 'solid' | 'outline'</code></td>
      <td><code>'soft'</code></td>
    </tr>
    <tr>
      <td><code>tone</code></td>
      <td><code>'neutral' | 'accent' | 'danger' | 'success' | 'warning'</code></td>
      <td><code>'neutral'</code></td>
    </tr>
    <tr>
      <td><code>color</code></td>
      <DocsProse tag="td" keypath="chip.apiColor" />
      <td>—</td>
    </tr>
    <tr>
      <td><code>shape</code></td>
      <td><code>'chip' | 'pill'</code></td>
      <td><code>'chip'</code></td>
    </tr>
    <tr>
      <td><code>size</code></td>
      <td><code>'xs' | 'sm'</code></td>
      <td><code>'xs'</code></td>
    </tr>
    <tr>
      <td><code>clickable</code> · <code>selectable</code> · <code>disabled</code></td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>v-model:selected</code></td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>check</code></td>
      <DocsProse tag="td" keypath="chip.apiCheck" />
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>dismissible</code></td>
      <DocsProse tag="td" keypath="chip.apiDismissible" />
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>dismissIcon</code></td>
      <td><code>IconSource</code></td>
      <td><code>'close'</code></td>
    </tr>
  </DocsTable>
  <DocsProse keypath="chip.apiElement" />
</template>
