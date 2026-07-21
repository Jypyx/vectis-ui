<script setup lang="ts">
import { computed, inject } from 'vue'

import { tabsKey } from './context'

/**
 * Onglet (role="tab") : roving tabindex — seul l'onglet actif est dans
 * l'ordre de tabulation, les flèches naviguent (voir TabList).
 */
interface TabProps {
  /** Valeur reliée au v-model de <Tabs> et au <TabPanel> homonyme. */
  value: string
  disabled?: boolean
}

const props = withDefaults(defineProps<TabProps>(), { disabled: false })

defineSlots<{
  /** Libellé de l'onglet */
  default(): unknown
}>()

const tabs = inject(tabsKey)
if (!tabs) throw new Error('<Tab> doit être utilisé dans <Tabs>')

const isActive = computed(() => tabs.active.value === props.value)
</script>

<template>
  <button
    :id="tabs.tabId(value)"
    type="button"
    role="tab"
    class="ds-tab"
    :aria-selected="isActive"
    :aria-controls="tabs.panelId(value)"
    :tabindex="isActive ? 0 : -1"
    :disabled="disabled"
    @click="tabs.select(value)"
  >
    <slot />
  </button>
</template>

<style>
@layer ds.components {
  .ds-tab {
    padding: var(--ds-space-2) var(--ds-space-3);
    border: none;
    /* le soulignement actif : une bordure toujours présente, transparente au repos
       (pas de décalage de layout au changement d'onglet) */
    border-block-end: 2px solid transparent;
    margin-block-end: -1px;
    background: transparent;
    color: var(--ds-color-text-muted);
    font-size: var(--ds-font-size-sm);
    font-weight: var(--ds-font-weight-medium);
    cursor: pointer;
    transition:
      color var(--ds-duration-fast) var(--ds-ease-default),
      border-color var(--ds-duration-fast) var(--ds-ease-default);
  }

  .ds-tab:hover:not(:disabled) {
    color: var(--ds-color-text);
  }

  .ds-tab[aria-selected='true'] {
    color: var(--ds-color-accent-text);
    border-block-end-color: var(--ds-color-accent);
  }

  .ds-tab:focus-visible {
    outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color);
    outline-offset: calc(var(--ds-focus-ring-offset) * -1);
    border-radius: var(--ds-radius-sm);
  }

  .ds-tab:disabled {
    color: var(--ds-color-text-subtle);
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-tab {
      transition: none;
    }
  }
}
</style>
