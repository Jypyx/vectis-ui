<script setup lang="ts">
/** Generate and Reset, at the foot of the settings. */
import { VButton } from 'vectis-ui'

const { t } = useI18n()
const { isDefault, reset } = useThemeBuilder()

/** Reset disables itself, which would drop focus to the page: it moves to Generate instead. */
function onReset(event: MouseEvent) {
  const footer = (event.currentTarget as HTMLElement).parentElement
  reset()
  footer?.querySelector<HTMLElement>('.v-button')?.focus()
}
</script>

<template>
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
