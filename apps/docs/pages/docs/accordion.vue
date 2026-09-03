<script setup lang="ts">
import api from '~/content/api/accordion'
import AccordionBasic from '~/examples/accordion/Basic.vue'
import accordionBasicSource from '~/examples/accordion/Basic.vue?raw'
import AccordionCompact from '~/examples/accordion/Compact.vue'
import accordionCompactSource from '~/examples/accordion/Compact.vue?raw'
import AccordionDisabled from '~/examples/accordion/Disabled.vue'
import accordionDisabledSource from '~/examples/accordion/Disabled.vue?raw'
import AccordionExclusive from '~/examples/accordion/Exclusive.vue'
import accordionExclusiveSource from '~/examples/accordion/Exclusive.vue?raw'
import AccordionIcons from '~/examples/accordion/Icons.vue'
import accordionIconsSource from '~/examples/accordion/Icons.vue?raw'
import AccordionSubtitles from '~/examples/accordion/Subtitles.vue'
import accordionSubtitlesSource from '~/examples/accordion/Subtitles.vue?raw'
import AccordionVariants from '~/examples/accordion/Variants.vue'
import accordionVariantsSource from '~/examples/accordion/Variants.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('accordion.title') })
</script>

<template>
  <h1>{{ t('accordion.title') }}</h1>
  <DocsProse class="vd-lead" keypath="accordion.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="accordionBasicSource" stack>
    <AccordionBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="variants">{{ t('accordion.examples.variants.title') }}</h3>
  <DocsProse keypath="accordion.examples.variants.text" />
  <DocsExample :source="accordionVariantsSource" stack>
    <AccordionVariants />
  </DocsExample>

  <h3 id="one-section-at-a-time">{{ t('accordion.examples.exclusive.title') }}</h3>
  <DocsProse keypath="accordion.examples.exclusive.text" />
  <DocsExample :source="accordionExclusiveSource" stack>
    <AccordionExclusive />
  </DocsExample>

  <h3 id="subtitles-and-icons">{{ t('accordion.examples.subtitles.title') }}</h3>
  <DocsProse keypath="accordion.examples.subtitles.text" />
  <DocsExample :source="accordionSubtitlesSource" stack>
    <AccordionSubtitles />
  </DocsExample>

  <h3 id="compact">{{ t('accordion.examples.compact.title') }}</h3>
  <DocsProse keypath="accordion.examples.compact.text" />
  <DocsExample :source="accordionCompactSource" stack>
    <AccordionCompact />
  </DocsExample>

  <h3 id="expand-and-collapse-icons">{{ t('accordion.examples.icons.title') }}</h3>
  <DocsProse keypath="accordion.examples.icons.text" />
  <DocsExample :source="accordionIconsSource" stack>
    <AccordionIcons />
  </DocsExample>

  <h3 id="disabled-sections">{{ t('accordion.examples.disabled.title') }}</h3>
  <DocsProse keypath="accordion.examples.disabled.text" />
  <DocsExample :source="accordionDisabledSource" stack>
    <AccordionDisabled />
  </DocsExample>

  <DocsApi page="accordion" :api="api" />
</template>
