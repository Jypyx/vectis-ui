<script setup lang="ts">
/** The builder's settings: colours, typography, icons and radius. */
import { VCombobox, VSelect } from 'vectis-ui'
import type { SelectItem } from 'vectis-ui'

import { CODE_FONTS, TEXT_FONTS, type FontOption } from '~/theme-builder/fonts'
import {
  BASE_SIZES,
  ICON_LIBRARIES,
  RADIUS_PRESETS,
  type IconLibrary,
  type RadiusPresetId,
} from '~/theme-builder/options'

const { t } = useI18n()
const { config } = useThemeBuilder()

/** The system stack, which every list starts with, then the Google Fonts families in a group. */
function fontItems([system, ...google]: FontOption[]): SelectItem[] {
  return [
    { value: system!.id, label: t('themeBuilder.systemFont') },
    {
      label: t('themeBuilder.googleFonts'),
      options: google.map((font) => ({ value: font.id, label: font.label })),
    },
  ]
}

const textItems = computed(() => fontItems(TEXT_FONTS))
const codeItems = computed(() => fontItems(CODE_FONTS))

const sizeItems = BASE_SIZES.map((size) => ({ value: size, label: `${size}px` }))

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

const radiusItems = computed(() =>
  (Object.keys(RADIUS_PRESETS) as RadiusPresetId[]).map((preset) => ({
    value: preset,
    label: t(`themeBuilder.radiusPresets.${preset}`),
  })),
)
</script>

<template>
  <div class="vd-tb-stack">
    <ThemeBuilderColors />
    <VCombobox
      v-model="config.fonts.heading"
      :options="textItems"
      :label="t('themeBuilder.headingFont')"
      virtual
    />
    <VCombobox
      v-model="config.fonts.body"
      :options="textItems"
      :label="t('themeBuilder.bodyFont')"
      virtual
    />
    <VCombobox
      v-model="config.fonts.code"
      :options="codeItems"
      :label="t('themeBuilder.codeFont')"
      virtual
    />
    <VSelect v-model="config.baseSize" :options="sizeItems" :label="t('themeBuilder.baseSize')" />
    <VSelect v-model="config.icons" :options="iconItems" :label="t('themeBuilder.iconLibrary')" />
    <VSelect v-model="config.radius" :options="radiusItems" :label="t('themeBuilder.radius')" />
  </div>
</template>
