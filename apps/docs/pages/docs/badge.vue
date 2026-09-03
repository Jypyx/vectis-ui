<script setup lang="ts">
import api from '~/content/api/badge'
import BadgeBasic from '~/examples/badge/Basic.vue'
import badgeBasicSource from '~/examples/badge/Basic.vue?raw'
import BadgeBordered from '~/examples/badge/Bordered.vue'
import badgeBorderedSource from '~/examples/badge/Bordered.vue?raw'
import BadgeColors from '~/examples/badge/Colors.vue'
import badgeColorsSource from '~/examples/badge/Colors.vue?raw'
import BadgeCounters from '~/examples/badge/Counters.vue'
import badgeCountersSource from '~/examples/badge/Counters.vue?raw'
import BadgeDot from '~/examples/badge/Dot.vue'
import badgeDotSource from '~/examples/badge/Dot.vue?raw'
import BadgeIcon from '~/examples/badge/Icon.vue'
import badgeIconSource from '~/examples/badge/Icon.vue?raw'
import BadgeInline from '~/examples/badge/Inline.vue'
import badgeInlineSource from '~/examples/badge/Inline.vue?raw'
import BadgeOverlay from '~/examples/badge/Overlay.vue'
import badgeOverlaySource from '~/examples/badge/Overlay.vue?raw'
import BadgeOverlayPosition from '~/examples/badge/OverlayPosition.vue'
import badgeOverlayPositionSource from '~/examples/badge/OverlayPosition.vue?raw'
import BadgeTones from '~/examples/badge/Tones.vue'
import badgeTonesSource from '~/examples/badge/Tones.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('badge.title') })
</script>

<template>
  <h1>{{ t('badge.title') }}</h1>
  <DocsProse class="vd-lead" keypath="badge.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="badgeBasicSource">
    <BadgeBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="tones">{{ t('badge.examples.tones.title') }}</h3>
  <DocsProse keypath="badge.examples.tones.text" />
  <DocsExample :source="badgeTonesSource">
    <BadgeTones />
  </DocsExample>

  <h3 id="custom-colours">{{ t('badge.examples.colors.title') }}</h3>
  <DocsProse keypath="badge.examples.colors.text" />
  <DocsExample :source="badgeColorsSource">
    <BadgeColors />
  </DocsExample>

  <h3 id="counters">{{ t('badge.examples.counters.title') }}</h3>
  <DocsProse keypath="badge.examples.counters.text" />
  <DocsExample :source="badgeCountersSource">
    <BadgeCounters />
  </DocsExample>

  <h3 id="with-an-icon">{{ t('badge.examples.icon.title') }}</h3>
  <DocsProse keypath="badge.examples.icon.text" />
  <DocsExample :source="badgeIconSource">
    <BadgeIcon />
  </DocsExample>

  <h3 id="dot">{{ t('badge.examples.dot.title') }}</h3>
  <DocsProse keypath="badge.examples.dot.text" />
  <DocsExample :source="badgeDotSource">
    <BadgeDot />
  </DocsExample>

  <h3 id="inline">{{ t('badge.examples.inline.title') }}</h3>
  <DocsProse keypath="badge.examples.inline.text" />
  <DocsExample :source="badgeInlineSource">
    <BadgeInline />
  </DocsExample>

  <h3 id="overlay">{{ t('badge.examples.overlay.title') }}</h3>
  <DocsProse keypath="badge.examples.overlay.text" />
  <DocsExample :source="badgeOverlaySource">
    <BadgeOverlay />
  </DocsExample>

  <h3 id="overlay-position">{{ t('badge.examples.overlayPosition.title') }}</h3>
  <DocsProse keypath="badge.examples.overlayPosition.text" />
  <DocsExample :source="badgeOverlayPositionSource">
    <BadgeOverlayPosition />
  </DocsExample>

  <h3 id="bordered">{{ t('badge.examples.bordered.title') }}</h3>
  <DocsProse keypath="badge.examples.bordered.text" />
  <DocsExample :source="badgeBorderedSource">
    <BadgeBordered />
  </DocsExample>

  <DocsApi page="badge" :api="api" />
</template>
