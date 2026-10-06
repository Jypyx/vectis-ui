<script setup lang="ts">
import api from '~/content/api/resizable'
import ResizableBasic from '~/examples/resizable/Basic.vue'
import resizableBasicSource from '~/examples/resizable/Basic.vue?raw'
import ResizableCollapsible from '~/examples/resizable/Collapsible.vue'
import resizableCollapsibleSource from '~/examples/resizable/Collapsible.vue?raw'
import ResizableLimits from '~/examples/resizable/Limits.vue'
import resizableLimitsSource from '~/examples/resizable/Limits.vue?raw'
import ResizableNested from '~/examples/resizable/Nested.vue'
import resizableNestedSource from '~/examples/resizable/Nested.vue?raw'
import ResizablePersisted from '~/examples/resizable/Persisted.vue'
import resizablePersistedSource from '~/examples/resizable/Persisted.vue?raw'
import ResizableVertical from '~/examples/resizable/Vertical.vue'
import resizableVerticalSource from '~/examples/resizable/Vertical.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('resizable')
</script>

<template>
  <h1>{{ t('resizable.title') }}</h1>
  <DocsProse class="vd-lead" keypath="resizable.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="resizableBasicSource" stack>
    <ResizableBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="vertical">{{ t('resizable.examples.vertical.title') }}</h3>
  <DocsProse keypath="resizable.examples.vertical.text" />
  <DocsExample :source="resizableVerticalSource" stack>
    <ResizableVertical />
  </DocsExample>

  <h3 id="limits">{{ t('resizable.examples.limits.title') }}</h3>
  <DocsProse keypath="resizable.examples.limits.text" />
  <DocsExample :source="resizableLimitsSource" stack>
    <ResizableLimits />
  </DocsExample>

  <h3 id="collapsible">{{ t('resizable.examples.collapsible.title') }}</h3>
  <DocsProse keypath="resizable.examples.collapsible.text" />
  <DocsExample :source="resizableCollapsibleSource" stack>
    <ResizableCollapsible />
  </DocsExample>

  <h3 id="nested">{{ t('resizable.examples.nested.title') }}</h3>
  <DocsProse keypath="resizable.examples.nested.text" />
  <DocsExample :source="resizableNestedSource" stack>
    <ResizableNested />
  </DocsExample>

  <h3 id="persisted">{{ t('resizable.examples.persisted.title') }}</h3>
  <DocsProse keypath="resizable.examples.persisted.text" />
  <DocsExample :source="resizablePersistedSource" stack>
    <ResizablePersisted />
  </DocsExample>

  <DocsApi page="resizable" :api="api" />
</template>
