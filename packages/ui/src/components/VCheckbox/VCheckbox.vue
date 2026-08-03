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
  /** État visuel « partiellement coché » (listes imbriquées). */
  indeterminate?: boolean
  /** Position du libellé par rapport à la boîte. */
  labelPosition?: 'start' | 'end'
  /** Écarte libellé et boîte aux extrémités (la racine devient block, pleine largeur). */
  spread?: boolean
  /** Force l'état invalide — pose aria-invalid. */
  invalid?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<CheckboxProps>(), {
  indeterminate: false,
  labelPosition: 'end',
  spread: false,
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
  <label class="v-checkbox" :data-label-position="labelPosition" :data-spread="spread || undefined">
    <input
      ref="inputEl"
      v-model="model"
      type="checkbox"
      class="v-checkbox-input"
      v-bind="$attrs"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
    />
    <span class="v-checkbox-box" aria-hidden="true">
      <svg class="v-checkbox-mark" viewBox="0 0 12 12">
        <path
          class="v-checkbox-mark-check"
          d="M2.5 6.5l2.5 2.5 4.5-5.5"
          fill="none"
          stroke="currentcolor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          class="v-checkbox-mark-dash"
          d="M3 6h6"
          fill="none"
          stroke="currentcolor"
          stroke-width="1.75"
          stroke-linecap="round"
        />
      </svg>
    </span>
    <span v-if="$slots.default" class="v-checkbox-label"><slot /></span>
  </label>
</template>

<style>
@layer vectis.components {
  .v-checkbox {
    display: inline-flex;
    align-items: center;
    gap: var(--vectis-space-2);
    font-family: var(--vectis-text-family);
    font-size: var(--vectis-text-label-size);
    color: var(--vectis-color-text);
    cursor: pointer;
  }

  /* L'input est en position: absolute → hors du flux flex, l'ordre visuel ne
     concerne que la boîte et le libellé */
  .v-checkbox[data-label-position='start'] {
    flex-direction: row-reverse;
  }

  .v-checkbox[data-spread] {
    display: flex;
    justify-content: space-between;
  }

  /* L'input reste focusable et soumis au formulaire ; seul son rendu disparaît */
  .v-checkbox-input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
    margin: 0;
    pointer-events: none;
  }

  .v-checkbox-box {
    display: inline-grid;
    place-items: center;
    width: var(--vectis-control-size-check);
    height: var(--vectis-control-size-check);
    flex: none;
    background: var(--vectis-color-surface);
    border: var(--vectis-control-border-width) solid var(--vectis-color-border-strong);
    border-radius: var(--vectis-radius-sm);
    color: var(--vectis-color-text-on-accent);
    transition:
      background-color var(--vectis-duration-fast) var(--vectis-ease-default),
      border-color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-checkbox-mark {
    width: var(--vectis-control-size-check-mark);
    height: var(--vectis-control-size-check-mark);
  }

  .v-checkbox-mark-check,
  .v-checkbox-mark-dash {
    opacity: 0;
    transition: opacity var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-checkbox:hover .v-checkbox-input:not(:disabled, :checked, :indeterminate) + .v-checkbox-box {
    border-color: color-mix(
      in oklab,
      var(--vectis-color-border-strong),
      var(--vectis-color-text) 15%
    );
  }

  .v-checkbox-input:checked + .v-checkbox-box,
  .v-checkbox-input:indeterminate + .v-checkbox-box {
    background: var(--vectis-color-accent);
    border-color: var(--vectis-color-accent);
  }

  .v-checkbox:hover
    .v-checkbox-input:not(:disabled):is(:checked, :indeterminate)
    + .v-checkbox-box {
    background: var(--vectis-color-accent-hover);
    border-color: var(--vectis-color-accent-hover);
  }

  .v-checkbox-input:checked + .v-checkbox-box .v-checkbox-mark-check {
    opacity: 1;
  }

  .v-checkbox-input:indeterminate + .v-checkbox-box .v-checkbox-mark-check {
    opacity: 0;
  }

  .v-checkbox-input:indeterminate + .v-checkbox-box .v-checkbox-mark-dash {
    opacity: 1;
  }

  .v-checkbox-input:focus-visible + .v-checkbox-box {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  .v-checkbox-input:user-invalid + .v-checkbox-box,
  .v-checkbox-input[aria-invalid='true'] + .v-checkbox-box {
    border-color: var(--vectis-color-danger);
  }

  /* Disabled : nuances de gris (mêmes tokens que VButton), pas d'opacité */
  .v-checkbox:has(.v-checkbox-input:disabled) {
    color: var(--vectis-color-text-subtle);
    cursor: not-allowed;
  }

  .v-checkbox-input:disabled + .v-checkbox-box {
    background: var(--vectis-color-surface-muted);
    border-color: var(--vectis-color-border);
    color: var(--vectis-color-text-subtle);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-checkbox-box,
    .v-checkbox-mark-check,
    .v-checkbox-mark-dash {
      transition: none;
    }
  }
}
</style>
