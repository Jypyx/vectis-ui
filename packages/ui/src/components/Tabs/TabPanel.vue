<script setup lang="ts">
import { computed, inject } from 'vue'

import { tabsKey } from './context'

/**
 * Panneau d'onglet (role="tabpanel"). Masqué via l'attribut natif `hidden`
 * (pas de v-if : le contenu reste monté, l'état interne est préservé).
 * tabindex=0 : un panneau sans élément focusable reste atteignable au clavier.
 */
interface TabPanelProps {
  /** Valeur du <Tab> associé. */
  value: string
}

const props = defineProps<TabPanelProps>()

defineSlots<{
  default(): unknown
}>()

const tabs = inject(tabsKey)
if (!tabs) throw new Error('<TabPanel> doit être utilisé dans <Tabs>')

const isActive = computed(() => tabs.active.value === props.value)
</script>

<template>
  <div
    :id="tabs.panelId(value)"
    role="tabpanel"
    class="ds-tab-panel"
    :aria-labelledby="tabs.tabId(value)"
    :hidden="!isActive"
    tabindex="0"
  >
    <slot />
  </div>
</template>

<style>
@layer ds.components {
  .ds-tab-panel {
    padding: var(--ds-space-4) var(--ds-space-1);
    font-size: var(--ds-font-size-sm);
    line-height: var(--ds-font-leading-normal);
    color: var(--ds-color-text);
  }

  .ds-tab-panel:focus-visible {
    outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color);
    outline-offset: calc(var(--ds-focus-ring-offset) * -1);
    border-radius: var(--ds-radius-sm);
  }
}
</style>
