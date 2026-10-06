<script setup lang="ts">
import api from '~/content/api/empty-state'
import EmptyStateBasic from '~/examples/empty-state/Basic.vue'
import emptyStateBasicSource from '~/examples/empty-state/Basic.vue?raw'
import EmptyStateComponents from '~/examples/empty-state/Components.vue'
import emptyStateComponentsSource from '~/examples/empty-state/Components.vue?raw'
import EmptyStateContent from '~/examples/empty-state/Content.vue'
import emptyStateContentSource from '~/examples/empty-state/Content.vue?raw'
import EmptyStateSizes from '~/examples/empty-state/Sizes.vue'
import emptyStateSizesSource from '~/examples/empty-state/Sizes.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('emptyState')
</script>

<template>
  <h1>{{ t('emptyState.title') }}</h1>
  <DocsProse class="vd-lead" keypath="emptyState.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="emptyStateBasicSource">
    <EmptyStateBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="sizes">{{ t('emptyState.examples.sizes.title') }}</h3>
  <DocsProse keypath="emptyState.examples.sizes.text" />
  <DocsExample :source="emptyStateSizesSource" stack>
    <EmptyStateSizes />
  </DocsExample>

  <h3 id="content">{{ t('emptyState.examples.content.title') }}</h3>
  <DocsProse keypath="emptyState.examples.content.text" />
  <DocsExample :source="emptyStateContentSource">
    <EmptyStateContent />
  </DocsExample>

  <h3 id="components">{{ t('emptyState.examples.components.title') }}</h3>
  <DocsProse keypath="emptyState.examples.components.text" />
  <DocsExample :source="emptyStateComponentsSource" stack>
    <EmptyStateComponents />
  </DocsExample>

  <DocsApi page="emptyState" :api="api" />
</template>
