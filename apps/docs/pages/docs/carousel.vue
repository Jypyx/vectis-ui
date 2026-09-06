<script setup lang="ts">
import api from '~/content/api/carousel'
import CarouselAutoplay from '~/examples/carousel/Autoplay.vue'
import carouselAutoplaySource from '~/examples/carousel/Autoplay.vue?raw'
import CarouselBasic from '~/examples/carousel/Basic.vue'
import carouselBasicSource from '~/examples/carousel/Basic.vue?raw'
import CarouselCustomIcons from '~/examples/carousel/CustomIcons.vue'
import carouselCustomIconsSource from '~/examples/carousel/CustomIcons.vue?raw'
import CarouselEffects from '~/examples/carousel/Effects.vue'
import carouselEffectsSource from '~/examples/carousel/Effects.vue?raw'
import CarouselItemsPerView from '~/examples/carousel/ItemsPerView.vue'
import carouselItemsPerViewSource from '~/examples/carousel/ItemsPerView.vue?raw'
import CarouselJumps from '~/examples/carousel/Jumps.vue'
import carouselJumpsSource from '~/examples/carousel/Jumps.vue?raw'
import CarouselLoop from '~/examples/carousel/Loop.vue'
import carouselLoopSource from '~/examples/carousel/Loop.vue?raw'
import CarouselOrientation from '~/examples/carousel/Orientation.vue'
import carouselOrientationSource from '~/examples/carousel/Orientation.vue?raw'
import CarouselPeek from '~/examples/carousel/Peek.vue'
import carouselPeekSource from '~/examples/carousel/Peek.vue?raw'
import CarouselPlacements from '~/examples/carousel/Placements.vue'
import carouselPlacementsSource from '~/examples/carousel/Placements.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('carousel')
</script>

<template>
  <h1>{{ t('carousel.title') }}</h1>
  <DocsProse class="vd-lead" keypath="carousel.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="carouselBasicSource" stack>
    <CarouselBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="items-per-view">{{ t('carousel.examples.itemsPerView.title') }}</h3>
  <DocsProse keypath="carousel.examples.itemsPerView.text" />
  <DocsExample :source="carouselItemsPerViewSource" stack>
    <CarouselItemsPerView />
  </DocsExample>

  <h3 id="peek">{{ t('carousel.examples.peek.title') }}</h3>
  <DocsProse keypath="carousel.examples.peek.text" />
  <DocsExample :source="carouselPeekSource" stack>
    <CarouselPeek />
  </DocsExample>

  <h3 id="effects">{{ t('carousel.examples.effects.title') }}</h3>
  <DocsProse keypath="carousel.examples.effects.text" />
  <DocsExample :source="carouselEffectsSource" stack>
    <CarouselEffects />
  </DocsExample>

  <h3 id="orientation">{{ t('carousel.examples.orientation.title') }}</h3>
  <DocsProse keypath="carousel.examples.orientation.text" />
  <DocsExample :source="carouselOrientationSource" stack>
    <CarouselOrientation />
  </DocsExample>

  <h3 id="custom-icons">{{ t('carousel.examples.customIcons.title') }}</h3>
  <DocsProse keypath="carousel.examples.customIcons.text" />
  <DocsExample :source="carouselCustomIconsSource" stack>
    <CarouselCustomIcons />
  </DocsExample>

  <h3 id="placements">{{ t('carousel.examples.placements.title') }}</h3>
  <DocsProse keypath="carousel.examples.placements.text" />
  <DocsExample :source="carouselPlacementsSource" stack>
    <CarouselPlacements />
  </DocsExample>

  <h3 id="jumps">{{ t('carousel.examples.jumps.title') }}</h3>
  <DocsProse keypath="carousel.examples.jumps.text" />
  <DocsExample :source="carouselJumpsSource" stack>
    <CarouselJumps />
  </DocsExample>

  <h3 id="loop">{{ t('carousel.examples.loop.title') }}</h3>
  <DocsProse keypath="carousel.examples.loop.text" />
  <DocsExample :source="carouselLoopSource" stack>
    <CarouselLoop />
  </DocsExample>

  <h3 id="autoplay">{{ t('carousel.examples.autoplay.title') }}</h3>
  <DocsProse keypath="carousel.examples.autoplay.text" />
  <DocsExample :source="carouselAutoplaySource" stack>
    <CarouselAutoplay />
  </DocsExample>

  <DocsApi page="carousel" :api="api" />
</template>
