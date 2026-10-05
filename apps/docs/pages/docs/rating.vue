<script setup lang="ts">
import api from '~/content/api/rating'
import RatingBasic from '~/examples/rating/Basic.vue'
import ratingBasicSource from '~/examples/rating/Basic.vue?raw'
import RatingClearable from '~/examples/rating/Clearable.vue'
import ratingClearableSource from '~/examples/rating/Clearable.vue?raw'
import RatingReadonly from '~/examples/rating/Readonly.vue'
import ratingReadonlySource from '~/examples/rating/Readonly.vue?raw'
import RatingSizes from '~/examples/rating/Sizes.vue'
import ratingSizesSource from '~/examples/rating/Sizes.vue?raw'
import RatingTones from '~/examples/rating/Tones.vue'
import ratingTonesSource from '~/examples/rating/Tones.vue?raw'
import RatingValidation from '~/examples/rating/Validation.vue'
import ratingValidationSource from '~/examples/rating/Validation.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('rating')
</script>

<template>
  <h1>{{ t('rating.title') }}</h1>
  <DocsProse class="vd-lead" keypath="rating.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="ratingBasicSource">
    <RatingBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="clearable">{{ t('rating.examples.clearable.title') }}</h3>
  <DocsProse keypath="rating.examples.clearable.text" />
  <DocsExample :source="ratingClearableSource">
    <RatingClearable />
  </DocsExample>

  <h3 id="read-only">{{ t('rating.examples.readonly.title') }}</h3>
  <DocsProse keypath="rating.examples.readonly.text" />
  <DocsExample :source="ratingReadonlySource">
    <RatingReadonly />
  </DocsExample>

  <h3 id="sizes">{{ t('rating.examples.sizes.title') }}</h3>
  <DocsProse keypath="rating.examples.sizes.text" />
  <DocsExample :source="ratingSizesSource">
    <RatingSizes />
  </DocsExample>

  <h3 id="tones">{{ t('rating.examples.tones.title') }}</h3>
  <DocsProse keypath="rating.examples.tones.text" />
  <DocsExample :source="ratingTonesSource">
    <RatingTones />
  </DocsExample>

  <h3 id="validation">{{ t('rating.examples.validation.title') }}</h3>
  <DocsProse keypath="rating.examples.validation.text" />
  <DocsExample :source="ratingValidationSource">
    <RatingValidation />
  </DocsExample>

  <DocsApi page="rating" :api="api" />
</template>
