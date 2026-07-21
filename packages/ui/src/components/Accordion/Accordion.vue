<script setup lang="ts">
import { provide, useId } from 'vue'

import { accordionKey } from './context'

/**
 * Accordéon 100 % natif : <details>/<summary>. Le mode exclusif repose sur
 * l'attribut `name` partagé entre items (fourni ici par provide/inject) —
 * aucun JS d'état.
 */
interface AccordionProps {
  /** Un seul item ouvert à la fois (attribut natif <details name>). */
  exclusive?: boolean
}

const props = withDefaults(defineProps<AccordionProps>(), { exclusive: true })

defineSlots<{
  /** Les <AccordionItem> */
  default(): unknown
}>()

const groupName = useId()
provide(accordionKey, {
  get name() {
    return props.exclusive ? groupName : undefined
  },
})
</script>

<template>
  <div class="ds-accordion">
    <slot />
  </div>
</template>

<style>
@layer ds.components {
  .ds-accordion {
    border: 1px solid var(--ds-color-border);
    border-radius: var(--ds-radius-surface);
    background: var(--ds-color-surface-raised);
    font-family: var(--ds-font-family-sans);
    overflow: hidden;
  }
}
</style>
