<script setup lang="ts">
/**
 * Étiquette de statut, purement décorative : HTML + CSS, aucun JS.
 */
interface BadgeProps {
  tone?: 'neutral' | 'accent' | 'danger' | 'success' | 'warning'
  variant?: 'soft' | 'solid' | 'outline'
  size?: 'sm' | 'md'
}

withDefaults(defineProps<BadgeProps>(), {
  tone: 'neutral',
  variant: 'soft',
  size: 'md',
})

defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <span class="ds-badge" :data-tone="tone" :data-variant="variant" :data-size="size">
    <slot />
  </span>
</template>

<style>
@layer ds.components {
  .ds-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--ds-space-1);
    padding: var(--ds-space-1) var(--ds-space-2);
    border: 1px solid transparent;
    border-radius: var(--ds-radius-pill);
    font-family: var(--ds-font-family-sans);
    font-size: var(--ds-font-size-xs);
    font-weight: var(--ds-font-weight-medium);
    line-height: var(--ds-font-leading-none);
  }

  /* --- Tones : variables locales consommées par les variantes --- */
  .ds-badge[data-tone='neutral'] {
    --_solid: var(--ds-color-text-muted);
    --_soft-bg: var(--ds-color-surface-muted);
    --_soft-text: var(--ds-color-text);
    --_border: var(--ds-color-border-strong);
  }

  .ds-badge[data-tone='accent'] {
    --_solid: var(--ds-color-accent);
    --_soft-bg: var(--ds-color-accent-surface);
    --_soft-text: var(--ds-color-accent-text);
    --_border: var(--ds-color-accent-border);
  }

  .ds-badge[data-tone='danger'] {
    --_solid: var(--ds-color-danger);
    --_soft-bg: var(--ds-color-danger-surface);
    --_soft-text: var(--ds-color-danger-text);
    --_border: var(--ds-color-danger-border);
  }

  .ds-badge[data-tone='success'] {
    --_solid: var(--ds-color-success);
    --_soft-bg: var(--ds-color-success-surface);
    --_soft-text: var(--ds-color-success-text);
    --_border: var(--ds-color-success-border);
  }

  .ds-badge[data-tone='warning'] {
    --_solid: var(--ds-color-warning);
    --_soft-bg: var(--ds-color-warning-surface);
    --_soft-text: var(--ds-color-warning-text);
    --_border: var(--ds-color-warning-border);
  }

  /* --- Variantes --- */
  .ds-badge[data-variant='soft'] {
    background: var(--_soft-bg);
    color: var(--_soft-text);
  }

  .ds-badge[data-variant='solid'] {
    background: var(--_solid);
    color: var(--ds-color-text-on-accent);
  }

  .ds-badge[data-variant='outline'] {
    border-color: var(--_border);
    color: var(--_soft-text);
  }

  .ds-badge[data-size='sm'] {
    padding: calc(var(--ds-space-1) / 2) var(--ds-space-2);
  }
}
</style>
