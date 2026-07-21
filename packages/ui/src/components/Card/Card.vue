<script setup lang="ts">
/**
 * Conteneur de surface : HTML + CSS, aucun JS.
 */
interface CardProps {
  variant?: 'outline' | 'raised'
}

withDefaults(defineProps<CardProps>(), { variant: 'outline' })

defineSlots<{
  /** Corps de la carte */
  default(): unknown
  /** En-tête (titre, actions) */
  header?(): unknown
  /** Pied (actions, métadonnées) */
  footer?(): unknown
}>()
</script>

<template>
  <div class="ds-card" :data-variant="variant">
    <header v-if="$slots.header" class="ds-card-header">
      <slot name="header" />
    </header>
    <div class="ds-card-body">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="ds-card-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<style>
@layer ds.components {
  .ds-card {
    background: var(--ds-color-surface-raised);
    color: var(--ds-color-text);
    border: 1px solid var(--ds-color-border);
    border-radius: var(--ds-radius-surface);
    font-family: var(--ds-font-family-sans);
    overflow: hidden;
  }

  .ds-card[data-variant='raised'] {
    box-shadow: var(--ds-shadow-2);
  }

  .ds-card-header {
    display: flex;
    align-items: center;
    gap: var(--ds-space-3);
    padding: var(--ds-space-4) var(--ds-space-5);
    border-block-end: 1px solid var(--ds-color-border);
    font-weight: var(--ds-font-weight-semibold);
  }

  .ds-card-body {
    padding: var(--ds-space-5);
    font-size: var(--ds-font-size-sm);
    line-height: var(--ds-font-leading-normal);
  }

  .ds-card-footer {
    display: flex;
    align-items: center;
    gap: var(--ds-space-2);
    padding: var(--ds-space-4) var(--ds-space-5);
    border-block-start: 1px solid var(--ds-color-border);
    background: var(--ds-color-surface-sunken);
  }
}
</style>
