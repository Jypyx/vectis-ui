<script setup lang="ts">
/**
 * <input type="radio"> natif, rendu remplacé par une pastille stylée (même
 * approche que Checkbox : l'input reste dans l'arbre, seul son rendu est
 * masqué). Le groupe est natif : plusieurs Radio partageant le même `name`
 * (fallthrough) et le même v-model — la navigation flèches est fournie par
 * le navigateur, zéro JS.
 */
interface RadioProps {
  /** Valeur portée par ce bouton, comparée au v-model du groupe. */
  value: string
  size?: 'sm' | 'md' | 'lg'
  /** Force l'état invalide — pose aria-invalid. */
  invalid?: boolean
  disabled?: boolean
}

withDefaults(defineProps<RadioProps>(), {
  size: 'md',
  invalid: false,
  disabled: false,
})

// La racine est un <label> : les attributs natifs (name surtout, pour le
// groupe) doivent atterrir sur l'input.
defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ default: '' })

defineSlots<{
  /** Libellé, cliquable (le <label> englobe tout) */
  default?(): unknown
}>()
</script>

<template>
  <label class="ds-radio" :data-size="size">
    <input
      v-model="model"
      type="radio"
      class="ds-radio-input"
      v-bind="$attrs"
      :value="value"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
    />
    <span class="ds-radio-dot" aria-hidden="true" />
    <span v-if="$slots.default" class="ds-radio-label"><slot /></span>
  </label>
</template>

<style>
@layer ds.components {
  .ds-radio {
    --_box: var(--ds-space-5);
    display: inline-flex;
    align-items: center;
    gap: var(--ds-space-2);
    font-family: var(--ds-font-family-sans);
    font-size: var(--ds-font-size-sm);
    color: var(--ds-color-text);
    cursor: pointer;
  }

  .ds-radio-input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
    margin: 0;
    pointer-events: none;
  }

  /* Pastille : le point intérieur est un box-shadow inset qui grandit */
  .ds-radio-dot {
    width: var(--_box);
    height: var(--_box);
    flex: none;
    background: var(--ds-color-surface);
    border: 1px solid var(--ds-color-border-strong);
    border-radius: var(--ds-radius-full);
    transition:
      border-color var(--ds-duration-fast) var(--ds-ease-default),
      box-shadow var(--ds-duration-fast) var(--ds-ease-default);
  }

  .ds-radio:hover .ds-radio-input:not(:disabled):not(:checked) + .ds-radio-dot {
    border-color: color-mix(in oklab, var(--ds-color-border-strong), var(--ds-color-text) 15%);
  }

  .ds-radio-input:checked + .ds-radio-dot {
    border-color: var(--ds-color-accent);
    box-shadow: inset 0 0 0 calc(var(--_box) * 0.22) var(--ds-color-accent);
  }

  .ds-radio-input:focus-visible + .ds-radio-dot {
    outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color);
    outline-offset: var(--ds-focus-ring-offset);
  }

  .ds-radio-input:user-invalid + .ds-radio-dot,
  .ds-radio-input[aria-invalid='true'] + .ds-radio-dot {
    border-color: var(--ds-color-danger);
  }

  .ds-radio:has(.ds-radio-input:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* --- Tailles --- */
  .ds-radio[data-size='sm'] {
    --_box: var(--ds-space-4);
    font-size: var(--ds-font-size-xs);
  }

  .ds-radio[data-size='lg'] {
    --_box: var(--ds-space-6);
    font-size: var(--ds-font-size-md);
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-radio-dot {
      transition: none;
    }
  }
}
</style>
