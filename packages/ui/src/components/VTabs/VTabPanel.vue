<script setup lang="ts">
/**
 * Keep every panel root mounted for aria-controls. lazy defers its content until first
 * activation, then preserves that content.
 */

import { computed, inject, ref, watch } from 'vue'

import { tabsKey } from './context'
import type { ItemValue } from '../../types'

interface TabPanelProps {
  /** Which tab shows this panel: it must be the `value` of one of them. */
  value: ItemValue
  /**
   * Holds the content back until the panel is first shown, and keeps it from then on.
   * It is for a panel expensive to build; the state it holds is still preserved
   * afterwards.
   */
  lazy?: boolean
}

const props = withDefaults(defineProps<TabPanelProps>(), { lazy: false })

defineSlots<{
  /** What the panel contains. */
  default(): unknown
}>()

const tabs = inject(tabsKey, null)

const selected = computed(() => tabs != null && tabs.value === props.value)
const tabId = computed(() => tabs?.tabId(props.value))
const panelId = computed(() => tabs?.panelId(props.value))

/*
 * Once a deferred panel has been shown it stays built, so nothing it holds is lost. The `&&` is
 * what keeps a panel that is not lazy out of the selection's dependencies: its getter stops at
 * `props.lazy`, so changing tab re-runs nothing for it.
 */
const revealed = ref(false)
watch(
  () => props.lazy && selected.value,
  (shown) => {
    if (shown) revealed.value = true
  },
  { immediate: true },
)
</script>

<template>
  <div
    :id="panelId"
    class="v-tabs-panel"
    role="tabpanel"
    :aria-labelledby="tabId"
    tabindex="0"
    :hidden="!selected"
  >
    <slot v-if="!lazy || revealed" />
  </div>
</template>

<style>
@layer vectis.components {
  /*
   * A guard. The `hidden` attribute only hides an element through the browser's own stylesheet,
   * which ANY author declaration of a display overrides; a consumer's
   * `.v-tabs-panel { display: flex }` included, and it would then reveal every panel at once.
   */
  .v-tabs-panel[hidden] {
    display: none;
  }

  .v-tabs-panel:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }
}
</style>
