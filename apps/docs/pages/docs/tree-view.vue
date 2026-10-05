<script setup lang="ts">
import api from '~/content/api/tree-view'
import TreeViewBasic from '~/examples/tree-view/Basic.vue'
import treeViewBasicSource from '~/examples/tree-view/Basic.vue?raw'
import TreeViewCheckboxes from '~/examples/tree-view/Checkboxes.vue'
import treeViewCheckboxesSource from '~/examples/tree-view/Checkboxes.vue?raw'
import TreeViewEndContent from '~/examples/tree-view/EndContent.vue'
import treeViewEndContentSource from '~/examples/tree-view/EndContent.vue?raw'
import TreeViewLazyLoading from '~/examples/tree-view/LazyLoading.vue'
import treeViewLazyLoadingSource from '~/examples/tree-view/LazyLoading.vue?raw'
import TreeViewLinks from '~/examples/tree-view/Links.vue'
import treeViewLinksSource from '~/examples/tree-view/Links.vue?raw'
import TreeViewSelection from '~/examples/tree-view/Selection.vue'
import treeViewSelectionSource from '~/examples/tree-view/Selection.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('treeView')
</script>

<template>
  <h1>{{ t('treeView.title') }}</h1>
  <DocsProse class="vd-lead" keypath="treeView.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="treeViewBasicSource">
    <TreeViewBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="selection">{{ t('treeView.examples.selection.title') }}</h3>
  <DocsProse keypath="treeView.examples.selection.text" />
  <DocsExample :source="treeViewSelectionSource">
    <TreeViewSelection />
  </DocsExample>

  <h3 id="checkboxes">{{ t('treeView.examples.checkboxes.title') }}</h3>
  <DocsProse keypath="treeView.examples.checkboxes.text" />
  <DocsExample :source="treeViewCheckboxesSource">
    <TreeViewCheckboxes />
  </DocsExample>

  <h3 id="links">{{ t('treeView.examples.links.title') }}</h3>
  <DocsProse keypath="treeView.examples.links.text" />
  <DocsExample :source="treeViewLinksSource">
    <TreeViewLinks />
  </DocsExample>

  <h3 id="lazy-loading">{{ t('treeView.examples.lazyLoading.title') }}</h3>
  <DocsProse keypath="treeView.examples.lazyLoading.text" />
  <DocsExample :source="treeViewLazyLoadingSource">
    <TreeViewLazyLoading />
  </DocsExample>

  <h3 id="end-content">{{ t('treeView.examples.endContent.title') }}</h3>
  <DocsProse keypath="treeView.examples.endContent.text" />
  <DocsExample :source="treeViewEndContentSource">
    <TreeViewEndContent />
  </DocsExample>

  <DocsApi page="tree-view" :api="api" />
</template>
