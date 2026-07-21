<script setup lang="ts">
import { ref } from 'vue'

/**
 * Barre d'onglets (role="tablist") : porte la navigation clavier du pattern
 * ARIA tabs — flèches avec bouclage, Home/End. Activation automatique.
 */
defineSlots<{
  /** Les <Tab> */
  default(): unknown
}>()

const listEl = ref<HTMLElement | null>(null)

function onKeydown(event: KeyboardEvent) {
  if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return
  const list = listEl.value
  if (!list) return
  event.preventDefault()
  const tabs = [...list.querySelectorAll<HTMLElement>('[role="tab"]:not(:disabled)')]
  if (tabs.length === 0) return
  const current = tabs.indexOf(document.activeElement as HTMLElement)
  const next =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? tabs.length - 1
        : event.key === 'ArrowRight'
          ? (current + 1) % tabs.length
          : (current - 1 + tabs.length) % tabs.length
  // activation automatique : focus + clic (le clic déclenche select du Tab)
  tabs[next]?.focus()
  tabs[next]?.click()
}
</script>

<template>
  <div ref="listEl" role="tablist" class="ds-tablist" @keydown="onKeydown">
    <slot />
  </div>
</template>

<style>
@layer ds.components {
  .ds-tablist {
    display: flex;
    gap: var(--ds-space-1);
    border-block-end: 1px solid var(--ds-color-border);
  }
}
</style>
