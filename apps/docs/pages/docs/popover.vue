<script setup lang="ts">
import api from '~/content/api/popover'
import PopoverAnchor from '~/examples/popover/Anchor.vue'
import popoverAnchorSource from '~/examples/popover/Anchor.vue?raw'
import PopoverBasic from '~/examples/popover/Basic.vue'
import popoverBasicSource from '~/examples/popover/Basic.vue?raw'
import PopoverInteractiveContent from '~/examples/popover/InteractiveContent.vue'
import popoverInteractiveContentSource from '~/examples/popover/InteractiveContent.vue?raw'
import PopoverMatchTrigger from '~/examples/popover/MatchTrigger.vue'
import popoverMatchTriggerSource from '~/examples/popover/MatchTrigger.vue?raw'
import PopoverModes from '~/examples/popover/Modes.vue'
import popoverModesSource from '~/examples/popover/Modes.vue?raw'
import PopoverPlacements from '~/examples/popover/Placements.vue'
import popoverPlacementsSource from '~/examples/popover/Placements.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('popover')
</script>

<template>
  <h1>{{ t('popover.title') }}</h1>
  <DocsProse class="vd-lead" keypath="popover.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="popoverBasicSource">
    <PopoverBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="placements">{{ t('popover.examples.placements.title') }}</h3>
  <DocsProse keypath="popover.examples.placements.text" />
  <DocsExample :source="popoverPlacementsSource" stack>
    <PopoverPlacements />
  </DocsExample>

  <h3 id="interactive-content">{{ t('popover.examples.interactiveContent.title') }}</h3>
  <DocsProse keypath="popover.examples.interactiveContent.text" />
  <DocsExample :source="popoverInteractiveContentSource" stack>
    <PopoverInteractiveContent />
  </DocsExample>

  <h3 id="modes">{{ t('popover.examples.modes.title') }}</h3>
  <DocsProse keypath="popover.examples.modes.text" />
  <DocsExample :source="popoverModesSource" stack>
    <PopoverModes />
  </DocsExample>

  <h3 id="match-trigger">{{ t('popover.examples.matchTrigger.title') }}</h3>
  <DocsProse keypath="popover.examples.matchTrigger.text" />
  <DocsExample :source="popoverMatchTriggerSource" stack>
    <PopoverMatchTrigger />
  </DocsExample>

  <h3 id="anchor">{{ t('popover.examples.anchor.title') }}</h3>
  <DocsProse keypath="popover.examples.anchor.text" />
  <DocsExample :source="popoverAnchorSource" stack>
    <PopoverAnchor />
  </DocsExample>

  <DocsApi page="popover" :api="api" />
</template>
