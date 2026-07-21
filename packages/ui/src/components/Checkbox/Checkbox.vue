<script setup lang="ts">
import { ref, watchEffect } from 'vue'

/**
 * <input type="checkbox"> natif, visuellement remplacé par une boîte stylée :
 * l'input reste dans l'arbre (focus, clavier, formulaires, :user-invalid),
 * seul son rendu est masqué. Toute la logique d'état est native ; le seul JS
 * au-delà du pont v-model est `indeterminate`, qui n'existe qu'en propriété
 * DOM (aucun attribut HTML équivalent).
 */
interface CheckboxProps {
  size?: 'sm' | 'md' | 'lg'
  /** État visuel « partiellement coché » (listes imbriquées). */
  indeterminate?: boolean
  /** Force l'état invalide — pose aria-invalid. */
  invalid?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<CheckboxProps>(), {
  size: 'md',
  indeterminate: false,
  invalid: false,
  disabled: false,
})

// La racine est un <label> : les attributs natifs (name, value, required,
// aria-*…) doivent atterrir sur l'input.
defineOptions({ inheritAttrs: false })

const model = defineModel<boolean>({ default: false })

defineSlots<{
  /** Libellé, cliquable (le <label> englobe tout) */
  default?(): unknown
}>()

const inputEl = ref<HTMLInputElement | null>(null)

// SSR-safe : inputEl est null côté serveur, l'effet ne fait rien.
// flush: 'post' → l'effet tourne après la mise à jour du DOM, quand la ref
// template est posée.
watchEffect(
  () => {
    if (inputEl.value) inputEl.value.indeterminate = props.indeterminate
  },
  { flush: 'post' },
)
</script>

<template>
  <label class="ds-checkbox" :data-size="size">
    <input
      ref="inputEl"
      v-model="model"
      type="checkbox"
      class="ds-checkbox-input"
      v-bind="$attrs"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
    />
    <span class="ds-checkbox-box" aria-hidden="true">
      <svg class="ds-checkbox-mark" viewBox="0 0 12 12">
        <path
          class="ds-checkbox-mark-check"
          d="M2.5 6.5l2.5 2.5 4.5-5.5"
          fill="none"
          stroke="currentcolor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          class="ds-checkbox-mark-dash"
          d="M3 6h6"
          fill="none"
          stroke="currentcolor"
          stroke-width="1.75"
          stroke-linecap="round"
        />
      </svg>
    </span>
    <span v-if="$slots.default" class="ds-checkbox-label"><slot /></span>
  </label>
</template>

<style>
@layer ds.components {
  .ds-checkbox {
    --_box: var(--ds-space-5);
    display: inline-flex;
    align-items: center;
    gap: var(--ds-space-2);
    font-family: var(--ds-font-family-sans);
    font-size: var(--ds-font-size-sm);
    color: var(--ds-color-text);
    cursor: pointer;
  }

  /* L'input reste focusable et soumis au formulaire ; seul son rendu disparaît */
  .ds-checkbox-input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
    margin: 0;
    pointer-events: none;
  }

  .ds-checkbox-box {
    display: inline-grid;
    place-items: center;
    width: var(--_box);
    height: var(--_box);
    flex: none;
    background: var(--ds-color-surface);
    border: 1px solid var(--ds-color-border-strong);
    border-radius: var(--ds-radius-sm);
    color: var(--ds-color-text-on-accent);
    transition:
      background-color var(--ds-duration-fast) var(--ds-ease-default),
      border-color var(--ds-duration-fast) var(--ds-ease-default);
  }

  .ds-checkbox-mark {
    width: calc(var(--_box) * 0.7);
    height: calc(var(--_box) * 0.7);
  }

  .ds-checkbox-mark-check,
  .ds-checkbox-mark-dash {
    opacity: 0;
    transition: opacity var(--ds-duration-fast) var(--ds-ease-default);
  }

  .ds-checkbox:hover .ds-checkbox-input:not(:disabled):not(:checked) + .ds-checkbox-box {
    border-color: color-mix(in oklab, var(--ds-color-border-strong), var(--ds-color-text) 15%);
  }

  .ds-checkbox-input:checked + .ds-checkbox-box,
  .ds-checkbox-input:indeterminate + .ds-checkbox-box {
    background: var(--ds-color-accent);
    border-color: var(--ds-color-accent);
  }

  .ds-checkbox-input:checked + .ds-checkbox-box .ds-checkbox-mark-check {
    opacity: 1;
  }

  .ds-checkbox-input:indeterminate + .ds-checkbox-box .ds-checkbox-mark-check {
    opacity: 0;
  }

  .ds-checkbox-input:indeterminate + .ds-checkbox-box .ds-checkbox-mark-dash {
    opacity: 1;
  }

  .ds-checkbox-input:focus-visible + .ds-checkbox-box {
    outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color);
    outline-offset: var(--ds-focus-ring-offset);
  }

  .ds-checkbox-input:user-invalid + .ds-checkbox-box,
  .ds-checkbox-input[aria-invalid='true'] + .ds-checkbox-box {
    border-color: var(--ds-color-danger);
  }

  .ds-checkbox:has(.ds-checkbox-input:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* --- Tailles --- */
  .ds-checkbox[data-size='sm'] {
    --_box: var(--ds-space-4);
    font-size: var(--ds-font-size-xs);
  }

  .ds-checkbox[data-size='lg'] {
    --_box: var(--ds-space-6);
    font-size: var(--ds-font-size-md);
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-checkbox-box,
    .ds-checkbox-mark-check,
    .ds-checkbox-mark-dash {
      transition: none;
    }
  }
}
</style>
