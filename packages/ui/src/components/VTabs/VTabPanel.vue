<script setup lang="ts">
import { computed, inject, ref, watchEffect } from 'vue'

import { tabsKey } from './context'

/**
 * The panel a tab shows, matched to it by the same `value`.
 *
 * Every panel is rendered at all times, and the inactive ones are hidden with the
 * native `hidden` attribute rather than removed. That costs no JavaScript, and it
 * means the state of what they contain survives a change of tab: a half-typed field
 * keeps its text, a scrolled list its position, and a form's fields are still
 * submitted.
 */
interface TabPanelProps {
  /** Which tab shows this panel: it must be the `value` of one of them. */
  value: string | number
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

/** Once a deferred panel has been shown it stays built, so nothing it holds is lost. */
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
   * A guard. The `hidden` attribute only hides an element through the browser's own
   * stylesheet, which ANY author declaration of a display overrides — a consumer's
   * `.v-tabs-panel { display: flex }` included, and it would then reveal every panel
   * at once.
   *
   * It is deliberately left overridable, with no `!important`: that would make this
   * the one component of the design system a consumer could not restyle. To give the
   * panel a display of your own, exclude the hidden ones —
   * `.v-tabs-panel:not([hidden])`.
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
