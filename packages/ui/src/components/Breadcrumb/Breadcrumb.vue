<script setup lang="ts">
/**
 * Fil d'Ariane : <nav> + liste ordonnée. Aucun JS ; les séparateurs sont des
 * pseudo-éléments CSS (jamais dans le DOM, donc jamais lus par les lecteurs
 * d'écran).
 */
interface BreadcrumbProps {
  /** Nom accessible de la navigation. */
  label?: string
}

withDefaults(defineProps<BreadcrumbProps>(), { label: "Fil d'Ariane" })

defineSlots<{
  /** Les <BreadcrumbItem> */
  default(): unknown
}>()
</script>

<template>
  <nav class="ds-breadcrumb" :aria-label="label">
    <ol class="ds-breadcrumb-list">
      <slot />
    </ol>
  </nav>
</template>

<style>
@layer ds.components {
  .ds-breadcrumb-list {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--ds-space-2);
    margin: 0;
    padding: 0;
    list-style: none;
    font-family: var(--ds-font-family-sans);
    font-size: var(--ds-font-size-sm);
  }
}
</style>
