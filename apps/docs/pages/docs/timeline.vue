<script setup lang="ts">
import api from '~/content/api/timeline'
import TimelineAlternate from '~/examples/timeline/Alternate.vue'
import timelineAlternateSource from '~/examples/timeline/Alternate.vue?raw'
import TimelineBasic from '~/examples/timeline/Basic.vue'
import timelineBasicSource from '~/examples/timeline/Basic.vue?raw'
import TimelineDates from '~/examples/timeline/Dates.vue'
import timelineDatesSource from '~/examples/timeline/Dates.vue?raw'
import TimelineHorizontal from '~/examples/timeline/Horizontal.vue'
import timelineHorizontalSource from '~/examples/timeline/Horizontal.vue?raw'
import TimelineMarkers from '~/examples/timeline/Markers.vue'
import timelineMarkersSource from '~/examples/timeline/Markers.vue?raw'
import TimelineSplit from '~/examples/timeline/Split.vue'
import timelineSplitSource from '~/examples/timeline/Split.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('timeline')
</script>

<template>
  <h1>{{ t('timeline.title') }}</h1>
  <DocsProse class="vd-lead" keypath="timeline.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="timelineBasicSource" stack>
    <TimelineBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="split">{{ t('timeline.examples.split.title') }}</h3>
  <DocsProse keypath="timeline.examples.split.text" />
  <DocsExample :source="timelineSplitSource" stack>
    <TimelineSplit />
  </DocsExample>

  <h3 id="alternate">{{ t('timeline.examples.alternate.title') }}</h3>
  <DocsProse keypath="timeline.examples.alternate.text" />
  <DocsExample :source="timelineAlternateSource" stack>
    <TimelineAlternate />
  </DocsExample>

  <h3 id="horizontal">{{ t('timeline.examples.horizontal.title') }}</h3>
  <DocsProse keypath="timeline.examples.horizontal.text" />
  <DocsExample :source="timelineHorizontalSource" stack>
    <TimelineHorizontal />
  </DocsExample>

  <h3 id="markers">{{ t('timeline.examples.markers.title') }}</h3>
  <DocsProse keypath="timeline.examples.markers.text" />
  <DocsExample :source="timelineMarkersSource" stack>
    <TimelineMarkers />
  </DocsExample>

  <h3 id="dates">{{ t('timeline.examples.dates.title') }}</h3>
  <DocsProse keypath="timeline.examples.dates.text" />
  <DocsExample :source="timelineDatesSource" stack>
    <TimelineDates />
  </DocsExample>

  <DocsApi page="timeline" :api="api" />
</template>
