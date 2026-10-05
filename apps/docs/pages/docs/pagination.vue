<script setup lang="ts">
import api from '~/content/api/pagination'
import PaginationAlignment from '~/examples/pagination/Alignment.vue'
import paginationAlignmentSource from '~/examples/pagination/Alignment.vue?raw'
import PaginationBasic from '~/examples/pagination/Basic.vue'
import paginationBasicSource from '~/examples/pagination/Basic.vue?raw'
import PaginationControls from '~/examples/pagination/Controls.vue'
import paginationControlsSource from '~/examples/pagination/Controls.vue?raw'
import PaginationDetached from '~/examples/pagination/Detached.vue'
import paginationDetachedSource from '~/examples/pagination/Detached.vue?raw'
import PaginationEdgeControls from '~/examples/pagination/EdgeControls.vue'
import paginationEdgeControlsSource from '~/examples/pagination/EdgeControls.vue?raw'
import PaginationElevated from '~/examples/pagination/Elevated.vue'
import paginationElevatedSource from '~/examples/pagination/Elevated.vue?raw'
import PaginationLength from '~/examples/pagination/Length.vue'
import paginationLengthSource from '~/examples/pagination/Length.vue?raw'
import PaginationLinks from '~/examples/pagination/Links.vue'
import paginationLinksSource from '~/examples/pagination/Links.vue?raw'
import PaginationSelectedVariants from '~/examples/pagination/SelectedVariants.vue'
import paginationSelectedVariantsSource from '~/examples/pagination/SelectedVariants.vue?raw'
import PaginationSizes from '~/examples/pagination/Sizes.vue'
import paginationSizesSource from '~/examples/pagination/Sizes.vue?raw'
import PaginationStates from '~/examples/pagination/States.vue'
import paginationStatesSource from '~/examples/pagination/States.vue?raw'
import PaginationTotalVisible from '~/examples/pagination/TotalVisible.vue'
import paginationTotalVisibleSource from '~/examples/pagination/TotalVisible.vue?raw'
import PaginationUnreachablePages from '~/examples/pagination/UnreachablePages.vue'
import paginationUnreachablePagesSource from '~/examples/pagination/UnreachablePages.vue?raw'
import PaginationVariantsAndTones from '~/examples/pagination/VariantsAndTones.vue'
import paginationVariantsAndTonesSource from '~/examples/pagination/VariantsAndTones.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('pagination')
</script>

<template>
  <h1>{{ t('pagination.title') }}</h1>
  <DocsProse class="vd-lead" keypath="pagination.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="paginationBasicSource" stack>
    <PaginationBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="variants-and-tones">{{ t('pagination.examples.variantsAndTones.title') }}</h3>
  <DocsProse keypath="pagination.examples.variantsAndTones.text" />
  <DocsExample :source="paginationVariantsAndTonesSource" stack>
    <PaginationVariantsAndTones />
  </DocsExample>

  <h3 id="selected-variants">{{ t('pagination.examples.selectedVariants.title') }}</h3>
  <DocsProse keypath="pagination.examples.selectedVariants.text" />
  <DocsExample :source="paginationSelectedVariantsSource" stack>
    <PaginationSelectedVariants />
  </DocsExample>

  <h3 id="detached">{{ t('pagination.examples.detached.title') }}</h3>
  <DocsProse keypath="pagination.examples.detached.text" />
  <DocsExample :source="paginationDetachedSource" stack>
    <PaginationDetached />
  </DocsExample>

  <h3 id="elevated">{{ t('pagination.examples.elevated.title') }}</h3>
  <DocsProse keypath="pagination.examples.elevated.text" />
  <DocsExample :source="paginationElevatedSource" stack>
    <PaginationElevated />
  </DocsExample>

  <h3 id="sizes">{{ t('pagination.examples.sizes.title') }}</h3>
  <DocsProse keypath="pagination.examples.sizes.text" />
  <DocsExample :source="paginationSizesSource" stack>
    <PaginationSizes />
  </DocsExample>

  <h3 id="length">{{ t('pagination.examples.length.title') }}</h3>
  <DocsProse keypath="pagination.examples.length.text" />
  <DocsExample :source="paginationLengthSource" stack>
    <PaginationLength />
  </DocsExample>

  <h3 id="total-visible">{{ t('pagination.examples.totalVisible.title') }}</h3>
  <DocsProse keypath="pagination.examples.totalVisible.text" />
  <DocsExample :source="paginationTotalVisibleSource" stack>
    <PaginationTotalVisible />
  </DocsExample>

  <h3 id="controls">{{ t('pagination.examples.controls.title') }}</h3>
  <DocsProse keypath="pagination.examples.controls.text" />
  <DocsExample :source="paginationControlsSource" stack>
    <PaginationControls />
  </DocsExample>

  <h3 id="edge-controls">{{ t('pagination.examples.edgeControls.title') }}</h3>
  <DocsProse keypath="pagination.examples.edgeControls.text" />
  <DocsExample :source="paginationEdgeControlsSource" stack>
    <PaginationEdgeControls />
  </DocsExample>

  <h3 id="unreachable-pages">{{ t('pagination.examples.unreachablePages.title') }}</h3>
  <DocsProse keypath="pagination.examples.unreachablePages.text" />
  <DocsExample :source="paginationUnreachablePagesSource" stack>
    <PaginationUnreachablePages />
  </DocsExample>

  <h3 id="links">{{ t('pagination.examples.links.title') }}</h3>
  <DocsProse keypath="pagination.examples.links.text" />
  <DocsExample :source="paginationLinksSource" stack>
    <PaginationLinks />
  </DocsExample>

  <h3 id="states">{{ t('pagination.examples.states.title') }}</h3>
  <DocsProse keypath="pagination.examples.states.text" />
  <DocsExample :source="paginationStatesSource" stack>
    <PaginationStates />
  </DocsExample>

  <h3 id="alignment">{{ t('pagination.examples.alignment.title') }}</h3>
  <DocsProse keypath="pagination.examples.alignment.text" />
  <DocsExample :source="paginationAlignmentSource" stack>
    <PaginationAlignment />
  </DocsExample>

  <DocsApi page="pagination" :api="api" />
</template>
