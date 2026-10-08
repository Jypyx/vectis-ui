<script setup lang="ts">
/** The builder's settings card: colours, typography, icons and radii, then Generate and Reset. */
import {
  VAccordion,
  VAccordionItem,
  VButton,
  VCard,
  VSelect,
  VSlider,
  VToggle,
  VToggleItem,
  VTypography,
} from 'vectis-ui'
import type { SelectItem } from 'vectis-ui'

import {
  BASE_SIZES,
  BODY_FONTS,
  CODE_FONTS,
  HEADING_FONTS,
  ICON_LIBRARIES,
  RADIUS_PRESETS,
  RADIUS_ROLES,
  type FontOption,
  type IconLibrary,
  type RadiusPresetId,
} from '~/theme-builder/options'

const { t } = useI18n()
const { config, isDefault, reset, setRadiusMode } = useThemeBuilder()

/** System stacks first, then the Google Fonts families. */
function fontItems(list: FontOption[]): SelectItem[] {
  const option = (font: FontOption) => ({ value: font.id, label: font.label })
  return [
    {
      label: t('themeBuilder.fontGroups.system'),
      options: list.filter((f) => !f.google).map(option),
    },
    {
      label: t('themeBuilder.fontGroups.google'),
      options: list.filter((f) => f.google).map(option),
    },
  ]
}

const headingItems = computed(() => fontItems(HEADING_FONTS))
const bodyItems = computed(() => fontItems(BODY_FONTS))
const codeItems = computed(() => fontItems(CODE_FONTS))

const ICON_GROUPS: { key: string; kinds: IconLibrary['kind'][] }[] = [
  { key: 'material', kinds: ['builtin', 'ligature'] },
  { key: 'components', kinds: ['component'] },
  { key: 'webfonts', kinds: ['class'] },
]
const iconItems = computed<SelectItem[]>(() =>
  ICON_GROUPS.map((group) => ({
    label: t(`themeBuilder.iconGroups.${group.key}`),
    options: ICON_LIBRARIES.filter((library) => group.kinds.includes(library.kind)).map(
      (library) => ({ value: library.id, label: library.label }),
    ),
  })),
)

const radiusMode = computed({
  get: () => config.value.radius.mode,
  set: setRadiusMode,
})
const radiusPresets = Object.keys(RADIUS_PRESETS) as RadiusPresetId[]

/** Reset disables itself, which would drop focus to the page: it moves to Generate instead. */
function onReset(event: MouseEvent) {
  const footer = (event.currentTarget as HTMLElement).parentElement
  reset()
  footer?.querySelector<HTMLElement>('.v-button')?.focus()
}
</script>

<template>
  <VCard variant="outline" class="vd-tb-panel">
    <VAccordion multiple variant="flat">
      <VAccordionItem :title="t('themeBuilder.colors')" default-open>
        <ThemeBuilderColors />
      </VAccordionItem>

      <VAccordionItem :title="t('themeBuilder.typography')" default-open>
        <div class="vd-tb-stack">
          <VSelect
            v-model="config.fonts.heading"
            :options="headingItems"
            :label="t('themeBuilder.headingFont')"
            size="sm"
          />
          <VSelect
            v-model="config.fonts.body"
            :options="bodyItems"
            :label="t('themeBuilder.bodyFont')"
            size="sm"
          />
          <VSelect
            v-model="config.fonts.code"
            :options="codeItems"
            :label="t('themeBuilder.codeFont')"
            size="sm"
          />
          <div class="vd-tb-field">
            <VTypography variant="label" as="span" aria-hidden="true">
              {{ t('themeBuilder.baseSize') }}
            </VTypography>
            <VToggle
              v-model="config.baseSize"
              :label="t('themeBuilder.baseSize')"
              mandatory
              full-width
              size="sm"
            >
              <VToggleItem
                v-for="size in BASE_SIZES"
                :key="size"
                :value="size"
                :label="`${size}px`"
              />
            </VToggle>
            <VTypography variant="caption" tone="muted">{{
              t('themeBuilder.baseSizeHint')
            }}</VTypography>
          </div>
        </div>
      </VAccordionItem>

      <VAccordionItem :title="t('themeBuilder.icons')" default-open>
        <VSelect
          v-model="config.icons"
          :options="iconItems"
          :label="t('themeBuilder.iconLibrary')"
          size="sm"
        />
      </VAccordionItem>

      <VAccordionItem :title="t('themeBuilder.radius')" default-open>
        <div class="vd-tb-stack">
          <VToggle
            v-model="radiusMode"
            :label="t('themeBuilder.radiusMode')"
            mandatory
            full-width
            size="sm"
          >
            <VToggleItem value="preset" :label="t('themeBuilder.preset')" />
            <VToggleItem value="custom" :label="t('themeBuilder.custom')" />
          </VToggle>
          <VToggle
            v-if="radiusMode === 'preset'"
            v-model="config.radius.preset"
            :label="t('themeBuilder.radius')"
            mandatory
            detached
            size="sm"
            class="vd-tb-swatches"
          >
            <VToggleItem
              v-for="preset in radiusPresets"
              :key="preset"
              :value="preset"
              :label="t(`themeBuilder.radiusPresets.${preset}`)"
            >
              <template #start>
                <span
                  class="vd-tb-corner"
                  :style="{ borderStartStartRadius: `${RADIUS_PRESETS[preset].surface}px` }"
                />
              </template>
            </VToggleItem>
          </VToggle>
          <template v-else>
            <VSlider
              v-for="role in RADIUS_ROLES"
              :key="role"
              v-model="config.radius.custom[role]"
              :min="0"
              :max="32"
              :label="`${t(`themeBuilder.radiusRoles.${role}`)} (px)`"
              size="sm"
            />
          </template>
        </div>
      </VAccordionItem>
    </VAccordion>

    <template #footer>
      <ThemeBuilderGenerate />
      <VButton
        variant="ghost"
        tone="neutral"
        size="sm"
        full-width
        :disabled="isDefault"
        :aria-label="t('themeBuilder.resetLabel')"
        @click="onReset"
      >
        {{ t('themeBuilder.reset') }}
      </VButton>
    </template>
  </VCard>
</template>
