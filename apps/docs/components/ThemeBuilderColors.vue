<script setup lang="ts">
/** The colour settings: two preset lists, or one base colour per group and scheme. */
import { VToggle, VToggleItem, VTypography } from 'vectis-ui'

import { ACCENT_HUES, NEUTRAL_HUES, ramps } from '~/theme-builder/palettes'
import { COLOR_GROUPS, contrastIssues } from '~/theme-builder/model'

const { t } = useI18n()
const { config, setColorMode } = useThemeBuilder()

const mode = computed({
  get: () => config.value.colors.mode,
  set: setColorMode,
})

const capitalised = (hue: string) => hue.charAt(0).toUpperCase() + hue.slice(1)

const issues = computed(() => contrastIssues(config.value))
</script>

<template>
  <div class="vd-tb-stack">
    <VToggle v-model="mode" :label="t('themeBuilder.colorMode')" mandatory full-width size="sm">
      <VToggleItem value="preset" :label="t('themeBuilder.preset')" />
      <VToggleItem value="custom" :label="t('themeBuilder.custom')" />
    </VToggle>

    <template v-if="mode === 'preset'">
      <div class="vd-tb-field">
        <VTypography variant="label" as="span" aria-hidden="true">
          {{ t('themeBuilder.accent') }}
        </VTypography>
        <VToggle
          v-model="config.colors.accent"
          :label="t('themeBuilder.accent')"
          mandatory
          detached
          size="sm"
          class="vd-tb-swatches"
        >
          <VToggleItem v-for="hue in ACCENT_HUES" :key="hue" :value="hue" :label="capitalised(hue)">
            <template #start>
              <span class="vd-tb-swatch" :style="{ background: ramps[hue]['600'] }" />
            </template>
          </VToggleItem>
        </VToggle>
      </div>
      <div class="vd-tb-field">
        <VTypography variant="label" as="span" aria-hidden="true">
          {{ t('themeBuilder.neutral') }}
        </VTypography>
        <VToggle
          v-model="config.colors.neutral"
          :label="t('themeBuilder.neutral')"
          mandatory
          detached
          size="sm"
          class="vd-tb-swatches"
        >
          <VToggleItem
            v-for="hue in NEUTRAL_HUES"
            :key="hue"
            :value="hue"
            :label="capitalised(hue)"
          >
            <template #start>
              <span class="vd-tb-swatch" :style="{ background: ramps[hue]['500'] }" />
            </template>
          </VToggleItem>
        </VToggle>
      </div>
    </template>

    <template v-else>
      <ThemeBuilderCustomGroup
        v-for="group in COLOR_GROUPS"
        :key="group"
        :group="group"
        :issues="issues.filter((issue) => issue.group === group)"
      />
    </template>
  </div>
</template>
