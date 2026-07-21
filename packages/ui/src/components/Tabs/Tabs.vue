<script setup lang="ts">
import { provide, useId } from 'vue'

import { tabsKey } from './context'

/**
 * Onglets — pattern ARIA tabs complet : il n'existe AUCUNE primitive HTML
 * pour ce composant, le JS est donc structurel (état actif partagé, liaison
 * tab↔panel par IDs, roving focus dans TabList). Activation automatique :
 * déplacer le focus sélectionne.
 */
const active = defineModel<string>({ required: true })

defineSlots<{
  /** <TabList> (avec les <Tab>) puis les <TabPanel> */
  default(): unknown
}>()

const baseId = useId()

provide(tabsKey, {
  active,
  select: (value) => {
    active.value = value
  },
  tabId: (value) => `${baseId}-tab-${value}`,
  panelId: (value) => `${baseId}-panel-${value}`,
})
</script>

<template>
  <div class="ds-tabs">
    <slot />
  </div>
</template>

<style>
@layer ds.components {
  .ds-tabs {
    font-family: var(--ds-font-family-sans);
  }
}
</style>
