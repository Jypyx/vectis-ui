<script setup lang="ts">
import api from '~/content/api/hover-card'
import HoverCardBasic from '~/examples/hover-card/Basic.vue'
import hoverCardBasicSource from '~/examples/hover-card/Basic.vue?raw'
import HoverCardDelays from '~/examples/hover-card/Delays.vue'
import hoverCardDelaysSource from '~/examples/hover-card/Delays.vue?raw'
import HoverCardInteractiveContent from '~/examples/hover-card/InteractiveContent.vue'
import hoverCardInteractiveContentSource from '~/examples/hover-card/InteractiveContent.vue?raw'
import HoverCardInText from '~/examples/hover-card/InText.vue'
import hoverCardInTextSource from '~/examples/hover-card/InText.vue?raw'
import HoverCardLoadOnOpen from '~/examples/hover-card/LoadOnOpen.vue'
import hoverCardLoadOnOpenSource from '~/examples/hover-card/LoadOnOpen.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('hoverCard')
</script>

<template>
  <h1>{{ t('hoverCard.title') }}</h1>
  <DocsProse class="vd-lead" keypath="hoverCard.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="hoverCardBasicSource">
    <HoverCardBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="in-text">{{ t('hoverCard.examples.inText.title') }}</h3>
  <DocsProse keypath="hoverCard.examples.inText.text" />
  <DocsExample :source="hoverCardInTextSource">
    <HoverCardInText />
  </DocsExample>

  <h3 id="delays">{{ t('hoverCard.examples.delays.title') }}</h3>
  <DocsProse keypath="hoverCard.examples.delays.text" />
  <DocsExample :source="hoverCardDelaysSource">
    <HoverCardDelays />
  </DocsExample>

  <h3 id="interactive-content">{{ t('hoverCard.examples.interactiveContent.title') }}</h3>
  <DocsProse keypath="hoverCard.examples.interactiveContent.text" />
  <DocsExample :source="hoverCardInteractiveContentSource">
    <HoverCardInteractiveContent />
  </DocsExample>

  <h3 id="load-on-open">{{ t('hoverCard.examples.loadOnOpen.title') }}</h3>
  <DocsProse keypath="hoverCard.examples.loadOnOpen.text" />
  <DocsExample :source="hoverCardLoadOnOpenSource">
    <HoverCardLoadOnOpen />
  </DocsExample>

  <DocsApi page="hoverCard" :api="api" />
</template>
