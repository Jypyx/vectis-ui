<script setup lang="ts">
import api from '~/content/api/tooltip'
import TooltipBasic from '~/examples/tooltip/Basic.vue'
import tooltipBasicSource from '~/examples/tooltip/Basic.vue?raw'
import TooltipDelay from '~/examples/tooltip/Delay.vue'
import tooltipDelaySource from '~/examples/tooltip/Delay.vue?raw'
import TooltipDescribing from '~/examples/tooltip/Describing.vue'
import tooltipDescribingSource from '~/examples/tooltip/Describing.vue?raw'
import TooltipEdgeFlipping from '~/examples/tooltip/EdgeFlipping.vue'
import tooltipEdgeFlippingSource from '~/examples/tooltip/EdgeFlipping.vue?raw'
import TooltipPlacements from '~/examples/tooltip/Placements.vue'
import tooltipPlacementsSource from '~/examples/tooltip/Placements.vue?raw'
import TooltipRichContent from '~/examples/tooltip/RichContent.vue'
import tooltipRichContentSource from '~/examples/tooltip/RichContent.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('tooltip')
</script>

<template>
  <h1>{{ t('tooltip.title') }}</h1>
  <DocsProse class="vd-lead" keypath="tooltip.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="tooltipBasicSource">
    <TooltipBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="placements">{{ t('tooltip.examples.placements.title') }}</h3>
  <DocsProse keypath="tooltip.examples.placements.text" />
  <DocsExample :source="tooltipPlacementsSource" stack>
    <TooltipPlacements />
  </DocsExample>

  <h3 id="edge-flipping">{{ t('tooltip.examples.edgeFlipping.title') }}</h3>
  <DocsProse keypath="tooltip.examples.edgeFlipping.text" />
  <DocsExample :source="tooltipEdgeFlippingSource">
    <TooltipEdgeFlipping />
  </DocsExample>

  <h3 id="delay">{{ t('tooltip.examples.delay.title') }}</h3>
  <DocsProse keypath="tooltip.examples.delay.text" />
  <DocsExample :source="tooltipDelaySource">
    <TooltipDelay />
  </DocsExample>

  <h3 id="describing">{{ t('tooltip.examples.describing.title') }}</h3>
  <DocsProse keypath="tooltip.examples.describing.text" />
  <DocsExample :source="tooltipDescribingSource">
    <TooltipDescribing />
  </DocsExample>

  <h3 id="rich-content">{{ t('tooltip.examples.richContent.title') }}</h3>
  <DocsProse keypath="tooltip.examples.richContent.text" />
  <DocsExample :source="tooltipRichContentSource">
    <TooltipRichContent />
  </DocsExample>

  <DocsApi page="tooltip" :api="api" />
</template>
