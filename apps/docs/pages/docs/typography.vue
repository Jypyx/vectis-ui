<script setup lang="ts">
import api from '~/content/api/typography'
import TypographyBasic from '~/examples/typography/Basic.vue'
import typographyBasicSource from '~/examples/typography/Basic.vue?raw'
import TypographyParagraph from '~/examples/typography/Paragraph.vue'
import typographyParagraphSource from '~/examples/typography/Paragraph.vue?raw'
import TypographyTags from '~/examples/typography/Tags.vue'
import typographyTagsSource from '~/examples/typography/Tags.vue?raw'
import TypographyTones from '~/examples/typography/Tones.vue'
import typographyTonesSource from '~/examples/typography/Tones.vue?raw'
import TypographyTruncate from '~/examples/typography/Truncate.vue'
import typographyTruncateSource from '~/examples/typography/Truncate.vue?raw'
import TypographyVariants from '~/examples/typography/Variants.vue'
import typographyVariantsSource from '~/examples/typography/Variants.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('typography')
</script>

<template>
  <h1>{{ t('typography.title') }}</h1>
  <DocsProse class="vd-lead" keypath="typography.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="typographyBasicSource">
    <TypographyBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="variants">{{ t('typography.examples.variants.title') }}</h3>
  <DocsProse keypath="typography.examples.variants.text" />
  <DocsExample :source="typographyVariantsSource" stack>
    <TypographyVariants />
  </DocsExample>

  <h3 id="tones">{{ t('typography.examples.tones.title') }}</h3>
  <DocsProse keypath="typography.examples.tones.text" />
  <DocsExample :source="typographyTonesSource" stack>
    <TypographyTones />
  </DocsExample>

  <h3 id="tags">{{ t('typography.examples.tags.title') }}</h3>
  <DocsProse keypath="typography.examples.tags.text" />
  <DocsExample :source="typographyTagsSource" stack>
    <TypographyTags />
  </DocsExample>

  <h3 id="truncate">{{ t('typography.examples.truncate.title') }}</h3>
  <DocsProse keypath="typography.examples.truncate.text" />
  <DocsExample :source="typographyTruncateSource" stack>
    <TypographyTruncate />
  </DocsExample>

  <h3 id="paragraph">{{ t('typography.examples.paragraph.title') }}</h3>
  <DocsProse keypath="typography.examples.paragraph.text" />
  <DocsExample :source="typographyParagraphSource" stack>
    <TypographyParagraph />
  </DocsExample>

  <DocsApi page="typography" :api="api" />
</template>
