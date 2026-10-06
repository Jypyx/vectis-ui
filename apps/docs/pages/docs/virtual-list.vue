<script setup lang="ts">
import api from '~/content/api/virtual-list'
import VirtualListBasic from '~/examples/virtual-list/Basic.vue'
import virtualListBasicSource from '~/examples/virtual-list/Basic.vue?raw'
import VirtualListFocusableRows from '~/examples/virtual-list/FocusableRows.vue'
import virtualListFocusableRowsSource from '~/examples/virtual-list/FocusableRows.vue?raw'
import VirtualListInfiniteScroll from '~/examples/virtual-list/InfiniteScroll.vue'
import virtualListInfiniteScrollSource from '~/examples/virtual-list/InfiniteScroll.vue?raw'
import VirtualListScrollToIndex from '~/examples/virtual-list/ScrollToIndex.vue'
import virtualListScrollToIndexSource from '~/examples/virtual-list/ScrollToIndex.vue?raw'
import VirtualListVariableHeights from '~/examples/virtual-list/VariableHeights.vue'
import virtualListVariableHeightsSource from '~/examples/virtual-list/VariableHeights.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('virtualList')
</script>

<template>
  <h1>{{ t('virtualList.title') }}</h1>
  <DocsProse class="vd-lead" keypath="virtualList.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="virtualListBasicSource" stack>
    <VirtualListBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="variable-heights">{{ t('virtualList.examples.variableHeights.title') }}</h3>
  <DocsProse keypath="virtualList.examples.variableHeights.text" />
  <DocsExample :source="virtualListVariableHeightsSource" stack>
    <VirtualListVariableHeights />
  </DocsExample>

  <h3 id="scroll-to-index">{{ t('virtualList.examples.scrollToIndex.title') }}</h3>
  <DocsProse keypath="virtualList.examples.scrollToIndex.text" />
  <DocsExample :source="virtualListScrollToIndexSource" stack>
    <VirtualListScrollToIndex />
  </DocsExample>

  <h3 id="infinite-scroll">{{ t('virtualList.examples.infiniteScroll.title') }}</h3>
  <DocsProse keypath="virtualList.examples.infiniteScroll.text" />
  <DocsExample :source="virtualListInfiniteScrollSource" stack>
    <VirtualListInfiniteScroll />
  </DocsExample>

  <h3 id="focusable-rows">{{ t('virtualList.examples.focusableRows.title') }}</h3>
  <DocsProse keypath="virtualList.examples.focusableRows.text" />
  <DocsExample :source="virtualListFocusableRowsSource" stack>
    <VirtualListFocusableRows />
  </DocsExample>

  <DocsApi page="virtual-list" :api="api" />
</template>
