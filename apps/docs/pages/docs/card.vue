<script setup lang="ts">
import api from '~/content/api/card'
import CardBasic from '~/examples/card/Basic.vue'
import cardBasicSource from '~/examples/card/Basic.vue?raw'
import CardDisabled from '~/examples/card/Disabled.vue'
import cardDisabledSource from '~/examples/card/Disabled.vue?raw'
import CardHorizontal from '~/examples/card/Horizontal.vue'
import cardHorizontalSource from '~/examples/card/Horizontal.vue?raw'
import CardLinked from '~/examples/card/Linked.vue'
import cardLinkedSource from '~/examples/card/Linked.vue?raw'
import CardLoading from '~/examples/card/Loading.vue'
import cardLoadingSource from '~/examples/card/Loading.vue?raw'
import CardMedia from '~/examples/card/Media.vue'
import cardMediaSource from '~/examples/card/Media.vue?raw'
import CardSizes from '~/examples/card/Sizes.vue'
import cardSizesSource from '~/examples/card/Sizes.vue?raw'
import CardVariants from '~/examples/card/Variants.vue'
import cardVariantsSource from '~/examples/card/Variants.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('card')
</script>

<template>
  <h1>{{ t('card.title') }}</h1>
  <DocsProse class="vd-lead" keypath="card.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="cardBasicSource">
    <CardBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="variants">{{ t('card.examples.variants.title') }}</h3>
  <DocsProse keypath="card.examples.variants.text" />
  <DocsExample :source="cardVariantsSource">
    <CardVariants />
  </DocsExample>

  <h3 id="sizes">{{ t('card.examples.sizes.title') }}</h3>
  <DocsProse keypath="card.examples.sizes.text" />
  <DocsExample :source="cardSizesSource">
    <CardSizes />
  </DocsExample>

  <h3 id="media">{{ t('card.examples.media.title') }}</h3>
  <DocsProse keypath="card.examples.media.text" />
  <DocsExample :source="cardMediaSource">
    <CardMedia />
  </DocsExample>

  <h3 id="horizontal">{{ t('card.examples.horizontal.title') }}</h3>
  <DocsProse keypath="card.examples.horizontal.text" />
  <DocsExample :source="cardHorizontalSource">
    <CardHorizontal />
  </DocsExample>

  <h3 id="linked-cards">{{ t('card.examples.linked.title') }}</h3>
  <DocsProse keypath="card.examples.linked.text" />
  <DocsExample :source="cardLinkedSource">
    <CardLinked />
  </DocsExample>

  <h3 id="disabled">{{ t('card.examples.disabled.title') }}</h3>
  <DocsProse keypath="card.examples.disabled.text" />
  <DocsExample :source="cardDisabledSource">
    <CardDisabled />
  </DocsExample>

  <h3 id="loading">{{ t('card.examples.loading.title') }}</h3>
  <DocsProse keypath="card.examples.loading.text" />
  <DocsExample :source="cardLoadingSource">
    <CardLoading />
  </DocsExample>

  <DocsApi page="card" :api="api" />
</template>
