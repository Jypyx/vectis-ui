<script setup lang="ts">
import api from '~/content/api/skeleton-loader'
import SkeletonLoaderAnimations from '~/examples/skeleton-loader/Animations.vue'
import skeletonLoaderAnimationsSource from '~/examples/skeleton-loader/Animations.vue?raw'
import SkeletonLoaderAnnouncing from '~/examples/skeleton-loader/Announcing.vue'
import skeletonLoaderAnnouncingSource from '~/examples/skeleton-loader/Announcing.vue?raw'
import SkeletonLoaderBasic from '~/examples/skeleton-loader/Basic.vue'
import skeletonLoaderBasicSource from '~/examples/skeleton-loader/Basic.vue?raw'
import SkeletonLoaderColour from '~/examples/skeleton-loader/Colour.vue'
import skeletonLoaderColourSource from '~/examples/skeleton-loader/Colour.vue?raw'
import SkeletonLoaderParagraph from '~/examples/skeleton-loader/Paragraph.vue'
import skeletonLoaderParagraphSource from '~/examples/skeleton-loader/Paragraph.vue?raw'
import SkeletonLoaderReplacing from '~/examples/skeleton-loader/Replacing.vue'
import skeletonLoaderReplacingSource from '~/examples/skeleton-loader/Replacing.vue?raw'
import SkeletonLoaderShapes from '~/examples/skeleton-loader/Shapes.vue'
import skeletonLoaderShapesSource from '~/examples/skeleton-loader/Shapes.vue?raw'
import SkeletonLoaderSilhouettes from '~/examples/skeleton-loader/Silhouettes.vue'
import skeletonLoaderSilhouettesSource from '~/examples/skeleton-loader/Silhouettes.vue?raw'
import SkeletonLoaderSizes from '~/examples/skeleton-loader/Sizes.vue'
import skeletonLoaderSizesSource from '~/examples/skeleton-loader/Sizes.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('skeletonLoader')
</script>

<template>
  <h1>{{ t('skeletonLoader.title') }}</h1>
  <DocsProse class="vd-lead" keypath="skeletonLoader.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="skeletonLoaderBasicSource" stack>
    <SkeletonLoaderBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="shapes">{{ t('skeletonLoader.examples.shapes.title') }}</h3>
  <DocsProse keypath="skeletonLoader.examples.shapes.text" />
  <DocsExample :source="skeletonLoaderShapesSource" stack>
    <SkeletonLoaderShapes />
  </DocsExample>

  <h3 id="sizes">{{ t('skeletonLoader.examples.sizes.title') }}</h3>
  <DocsProse keypath="skeletonLoader.examples.sizes.text" />
  <DocsExample :source="skeletonLoaderSizesSource" stack>
    <SkeletonLoaderSizes />
  </DocsExample>

  <h3 id="paragraph">{{ t('skeletonLoader.examples.paragraph.title') }}</h3>
  <DocsProse keypath="skeletonLoader.examples.paragraph.text" />
  <DocsExample :source="skeletonLoaderParagraphSource" stack>
    <SkeletonLoaderParagraph />
  </DocsExample>

  <h3 id="silhouettes">{{ t('skeletonLoader.examples.silhouettes.title') }}</h3>
  <DocsProse keypath="skeletonLoader.examples.silhouettes.text" />
  <DocsExample :source="skeletonLoaderSilhouettesSource" stack>
    <SkeletonLoaderSilhouettes />
  </DocsExample>

  <h3 id="animations">{{ t('skeletonLoader.examples.animations.title') }}</h3>
  <DocsProse keypath="skeletonLoader.examples.animations.text" />
  <DocsExample :source="skeletonLoaderAnimationsSource" stack>
    <SkeletonLoaderAnimations />
  </DocsExample>

  <h3 id="colour">{{ t('skeletonLoader.examples.colour.title') }}</h3>
  <DocsProse keypath="skeletonLoader.examples.colour.text" />
  <DocsExample :source="skeletonLoaderColourSource" stack>
    <SkeletonLoaderColour />
  </DocsExample>

  <h3 id="replacing">{{ t('skeletonLoader.examples.replacing.title') }}</h3>
  <DocsProse keypath="skeletonLoader.examples.replacing.text" />
  <DocsExample :source="skeletonLoaderReplacingSource" stack>
    <SkeletonLoaderReplacing />
  </DocsExample>

  <h3 id="announcing">{{ t('skeletonLoader.examples.announcing.title') }}</h3>
  <DocsProse keypath="skeletonLoader.examples.announcing.text" />
  <DocsExample :source="skeletonLoaderAnnouncingSource" stack>
    <SkeletonLoaderAnnouncing />
  </DocsExample>

  <DocsApi page="skeletonLoader" :api="api" />
</template>
