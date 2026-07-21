<script setup lang="ts">
/**
 * <textarea> natif stylé. JS limité au pont v-model (defineModel).
 * L'auto-agrandissement est du pur CSS (`field-sizing: content`, progressive
 * enhancement) — aucun JS de mesure. Validation : `:user-invalid` natif,
 * prop `invalid` pour forcer (validation serveur).
 */
interface TextareaProps {
  size?: 'sm' | 'md' | 'lg'
  /** Hauteur qui suit le contenu (field-sizing: content ; sans support, textarea classique). */
  autoGrow?: boolean
  /** Force l'état invalide (validation serveur) — pose aria-invalid. */
  invalid?: boolean
  disabled?: boolean
}

withDefaults(defineProps<TextareaProps>(), {
  size: 'md',
  autoGrow: false,
  invalid: false,
  disabled: false,
})

const model = defineModel<string>({ default: '' })
</script>

<template>
  <textarea
    v-model="model"
    class="ds-textarea"
    :data-size="size"
    :data-auto-grow="autoGrow ? '' : undefined"
    :disabled="disabled"
    :aria-invalid="invalid || undefined"
  />
</template>

<style>
@layer ds.components {
  .ds-textarea {
    width: 100%;
    min-height: calc(var(--ds-control-height-md) * 2);
    padding: var(--ds-space-2) var(--ds-space-3);
    background: var(--ds-color-surface);
    color: var(--ds-color-text);
    border: 1px solid var(--ds-color-border-strong);
    border-radius: var(--ds-radius-interactive);
    font-family: var(--ds-font-family-sans);
    font-size: var(--ds-font-size-sm);
    line-height: var(--ds-font-leading-normal);
    resize: vertical;
    transition:
      border-color var(--ds-duration-fast) var(--ds-ease-default),
      background-color var(--ds-duration-fast) var(--ds-ease-default);
  }

  .ds-textarea::placeholder {
    color: var(--ds-color-text-subtle);
  }

  .ds-textarea:hover:not(:disabled):not(:focus-visible) {
    border-color: color-mix(in oklab, var(--ds-color-border-strong), var(--ds-color-text) 15%);
  }

  .ds-textarea:focus-visible {
    border-color: var(--ds-color-accent);
    outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color);
    outline-offset: var(--ds-focus-ring-offset);
  }

  .ds-textarea:user-invalid,
  .ds-textarea[aria-invalid='true'] {
    border-color: var(--ds-color-danger);
  }

  .ds-textarea:user-invalid:focus-visible,
  .ds-textarea[aria-invalid='true']:focus-visible {
    outline-color: var(--ds-color-danger);
  }

  .ds-textarea:disabled {
    background: var(--ds-color-surface-muted);
    opacity: 0.5;
    cursor: not-allowed;
    resize: none;
  }

  /* Auto-grow 100 % CSS : la hauteur suit le contenu (progressive enhancement) */
  .ds-textarea[data-auto-grow] {
    field-sizing: content;
    resize: none;
  }

  /* --- Tailles --- */
  .ds-textarea[data-size='sm'] {
    min-height: calc(var(--ds-control-height-sm) * 2);
    padding: var(--ds-space-1) var(--ds-space-2);
    font-size: var(--ds-font-size-xs);
  }

  .ds-textarea[data-size='lg'] {
    min-height: calc(var(--ds-control-height-lg) * 2);
    padding: var(--ds-space-3) var(--ds-space-4);
    font-size: var(--ds-font-size-md);
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-textarea {
      transition: none;
    }
  }
}
</style>
