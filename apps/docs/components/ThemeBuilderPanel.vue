<script setup lang="ts">
/**
 * The builder's settings, then Generate and Reset: a card beside the preview from 1024px, and
 * below it a bottom drawer opened from a bar fixed to the foot of the viewport, always in reach.
 * CSS shows one or the other, so the server renders the right one at every width; the drawer
 * builds its content only when open.
 */
import { VButton, VCard, VDrawer } from 'vectis-ui'

const { t } = useI18n()
</script>

<template>
  <VDrawer side="bottom" size="lg" :title="t('themeBuilder.settings')">
    <template #trigger="{ triggerProps }">
      <div class="vd-tb-bar">
        <VButton
          v-bind="triggerProps"
          icon-start="settings"
          variant="outline"
          tone="neutral"
          full-width
        >
          {{ t('themeBuilder.settings') }}
        </VButton>
      </div>
    </template>
    <ThemeBuilderSettings />
    <template #footer>
      <ThemeBuilderActions />
    </template>
  </VDrawer>

  <VCard variant="outline" class="vd-tb-panel">
    <ThemeBuilderSettings />
    <template #footer>
      <ThemeBuilderActions />
    </template>
  </VCard>
</template>
