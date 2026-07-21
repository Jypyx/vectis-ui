<script setup lang="ts">
/**
 * <select> natif stylé — le picker reste celui de la plateforme (accessible,
 * mobile-friendly), seul le contrôle fermé est habillé. JS limité au pont
 * v-model. Le chevron est un pseudo-élément en currentcolor (pas d'image,
 * donc thémable par tokens) ; l'état disabled du wrapper est dérivé en pur
 * CSS via :has().
 */
interface SelectProps {
  size?: 'sm' | 'md' | 'lg'
  /** Force l'état invalide (validation serveur) — pose aria-invalid. */
  invalid?: boolean
  disabled?: boolean
}

withDefaults(defineProps<SelectProps>(), {
  size: 'md',
  invalid: false,
  disabled: false,
})

// La racine est un wrapper : les attributs natifs (name, required, aria-*…)
// doivent atterrir sur le <select>, pas sur le <span>.
defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ default: '' })

defineSlots<{
  /** Les <option> / <optgroup> natifs */
  default(): unknown
}>()
</script>

<template>
  <span class="ds-select" :data-size="size">
    <select
      v-model="model"
      class="ds-select-control"
      v-bind="$attrs"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
    >
      <slot />
    </select>
  </span>
</template>

<style>
@layer ds.components {
  .ds-select {
    position: relative;
    display: inline-block;
    width: 100%;
    color: var(--ds-color-text);
  }

  /* Chevron en currentcolor : suit le thème sans image ni JS */
  .ds-select::after {
    content: '';
    position: absolute;
    inset-inline-end: var(--ds-space-3);
    top: 50%;
    translate: 0 -50%;
    width: 0.65em;
    height: 0.4em;
    background: currentcolor;
    clip-path: polygon(0 0, 100% 0, 50% 100%);
    pointer-events: none;
  }

  .ds-select:has(.ds-select-control:disabled) {
    opacity: 0.5;
    color: var(--ds-color-text-muted);
  }

  .ds-select-control {
    appearance: none;
    width: 100%;
    height: var(--ds-control-height-md);
    padding-inline: var(--ds-space-3) var(--ds-space-7);
    background: var(--ds-color-surface);
    color: var(--ds-color-text);
    border: 1px solid var(--ds-color-border-strong);
    border-radius: var(--ds-radius-interactive);
    font-family: var(--ds-font-family-sans);
    font-size: var(--ds-font-size-sm);
    cursor: pointer;
    text-overflow: ellipsis;
    transition: border-color var(--ds-duration-fast) var(--ds-ease-default);
  }

  .ds-select-control:hover:not(:disabled):not(:focus-visible) {
    border-color: color-mix(in oklab, var(--ds-color-border-strong), var(--ds-color-text) 15%);
  }

  .ds-select-control:focus-visible {
    border-color: var(--ds-color-accent);
    outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color);
    outline-offset: var(--ds-focus-ring-offset);
  }

  .ds-select-control:user-invalid,
  .ds-select-control[aria-invalid='true'] {
    border-color: var(--ds-color-danger);
  }

  .ds-select-control:user-invalid:focus-visible,
  .ds-select-control[aria-invalid='true']:focus-visible {
    outline-color: var(--ds-color-danger);
  }

  .ds-select-control:disabled {
    background: var(--ds-color-surface-muted);
    cursor: not-allowed;
  }

  /* --- Tailles --- */
  .ds-select[data-size='sm'] .ds-select-control {
    height: var(--ds-control-height-sm);
    padding-inline: var(--ds-space-2) var(--ds-space-6);
    font-size: var(--ds-font-size-xs);
  }

  .ds-select[data-size='lg'] .ds-select-control {
    height: var(--ds-control-height-lg);
    padding-inline: var(--ds-space-4) var(--ds-space-8);
    font-size: var(--ds-font-size-md);
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-select-control {
      transition: none;
    }
  }
}
</style>
