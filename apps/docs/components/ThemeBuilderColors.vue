<script setup lang="ts">
/** The colour settings: an accent and a base palette, each shown by a swatch. */
import { VSelect } from 'vectis-ui'

import {
  ACCENT_HUES,
  NEUTRAL_HUES,
  ramps,
  type AccentHue,
  type NeutralHue,
} from '~/theme-builder/palettes'

const { t } = useI18n()
const { config } = useThemeBuilder()

const hueItems = (hues: readonly string[]) =>
  hues.map((hue) => ({ value: hue, label: hue.charAt(0).toUpperCase() + hue.slice(1) }))
const accentItems = hueItems(ACCENT_HUES)
const neutralItems = hueItems(NEUTRAL_HUES)
</script>

<template>
  <VSelect v-model="config.colors.accent" :options="accentItems" :label="t('themeBuilder.accent')">
    <template #start>
      <span class="vd-tb-swatch" :style="{ background: ramps[config.colors.accent]['600'] }" />
    </template>
    <template #option="{ option }">
      <span class="vd-tb-option">
        <span
          class="vd-tb-swatch"
          :style="{ background: ramps[option.value as AccentHue]['600'] }"
        />
        {{ option.label }}
      </span>
    </template>
  </VSelect>
  <VSelect
    v-model="config.colors.neutral"
    :options="neutralItems"
    :label="t('themeBuilder.neutral')"
  >
    <template #start>
      <span class="vd-tb-swatch" :style="{ background: ramps[config.colors.neutral]['500'] }" />
    </template>
    <template #option="{ option }">
      <span class="vd-tb-option">
        <span
          class="vd-tb-swatch"
          :style="{ background: ramps[option.value as NeutralHue]['500'] }"
        />
        {{ option.label }}
      </span>
    </template>
  </VSelect>
</template>
