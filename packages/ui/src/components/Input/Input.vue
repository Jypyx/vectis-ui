<script setup lang="ts">
/**
 * <input> natif stylé. JS limité au pont v-model (defineModel).
 * La validation visuelle repose d'abord sur `:user-invalid` (natif, sans JS) ;
 * la prop `invalid` permet de forcer l'état (ex. validation serveur) via
 * aria-invalid. Tous les attributs natifs (type, placeholder, required,
 * minlength…) passent par fallthrough.
 */
interface InputProps {
  size?: 'sm' | 'md' | 'lg'
  /** Force l'état invalide (validation serveur) — pose aria-invalid. */
  invalid?: boolean
  disabled?: boolean
}

withDefaults(defineProps<InputProps>(), {
  size: 'md',
  invalid: false,
  disabled: false,
})

const model = defineModel<string>({ default: '' })
</script>

<template>
  <input
    v-model="model"
    class="ds-input"
    :data-size="size"
    :disabled="disabled"
    :aria-invalid="invalid || undefined"
  />
</template>

<style>
@layer ds.components {
  .ds-input {
    width: 100%;
    height: var(--ds-control-height-md);
    padding-inline: var(--ds-space-3);
    background: var(--ds-color-surface);
    color: var(--ds-color-text);
    border: 1px solid var(--ds-color-border-strong);
    border-radius: var(--ds-radius-interactive);
    font-family: var(--ds-font-family-sans);
    font-size: var(--ds-font-size-sm);
    transition:
      border-color var(--ds-duration-fast) var(--ds-ease-default),
      background-color var(--ds-duration-fast) var(--ds-ease-default);
  }

  .ds-input::placeholder {
    color: var(--ds-color-text-subtle);
  }

  .ds-input:hover:not(:disabled):not(:focus-visible) {
    border-color: color-mix(in oklab, var(--ds-color-border-strong), var(--ds-color-text) 15%);
  }

  .ds-input:focus-visible {
    border-color: var(--ds-color-accent);
    outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color);
    outline-offset: var(--ds-focus-ring-offset);
  }

  /* État invalide : pseudo-classe native d'abord, prop (aria-invalid) ensuite */
  .ds-input:user-invalid,
  .ds-input[aria-invalid='true'] {
    border-color: var(--ds-color-danger);
  }

  .ds-input:user-invalid:focus-visible,
  .ds-input[aria-invalid='true']:focus-visible {
    outline-color: var(--ds-color-danger);
  }

  .ds-input:disabled {
    background: var(--ds-color-surface-muted);
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* --- Tailles --- */
  .ds-input[data-size='sm'] {
    height: var(--ds-control-height-sm);
    padding-inline: var(--ds-space-2);
    font-size: var(--ds-font-size-xs);
  }

  .ds-input[data-size='lg'] {
    height: var(--ds-control-height-lg);
    padding-inline: var(--ds-space-4);
    font-size: var(--ds-font-size-md);
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-input {
      transition: none;
    }
  }
}
</style>
