<script setup lang="ts">
import { computed, inject, ref, watchEffect } from 'vue'

import { tabsKey } from './context'

/**
 * Panel associated with the tab of the same `value`. It is always rendered and
 * hidden by the native `hidden` attribute when inactive: zero JS, and the
 * content's state (typing in progress, scroll position) survives a tab change.
 */
interface TabPanelProps {
  /** Must match the `value` of a `VTab`. */
  value: string | number
  /** Defers mounting the content until first shown, then keeps it. */
  lazy?: boolean
}

const props = withDefaults(defineProps<TabPanelProps>(), { lazy: false })

defineSlots<{
  /** Panel content */
  default(): unknown
}>()

const tabs = inject(tabsKey, null)

const selected = computed(() => tabs != null && tabs.value === props.value)
const tabId = computed(() => tabs?.tabId(props.value))
const panelId = computed(() => tabs?.panelId(props.value))

/** `lazy`: once revealed, the content stays mounted (no state is lost). */
const revealed = ref(false)
watchEffect(() => {
  if (selected.value) revealed.value = true
})
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
   * Guard: [hidden] comes only from the UA sheet, which the slightest author
   * `display` declaration overrides — including a non-layered consumer style.
   * Specificity (0,2,0), and definitely no !important: VTabs would otherwise be the
   * only component in the DS impossible to override. To set a display on the panel,
   * target .v-tabs-panel:not([hidden]).
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
