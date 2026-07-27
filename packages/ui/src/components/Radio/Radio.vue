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
  /** Position du libellé par rapport à la pastille. */
  labelPosition?: 'start' | 'end'
  /** Écarte libellé et pastille aux extrémités (la racine devient block, pleine largeur). */
  spread?: boolean
  /** Force l'état invalide — pose aria-invalid. */
  invalid?: boolean
  disabled?: boolean
}

withDefaults(defineProps<RadioProps>(), {
  labelPosition: 'end',
  spread: false,
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
  <label class="ds-radio" :data-label-position="labelPosition" :data-spread="spread || undefined">
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
    display: inline-flex;
    align-items: center;
    gap: var(--ds-space-2);
    font-family: var(--ds-text-family);
    font-size: var(--ds-text-label-size);
    color: var(--ds-color-text);
    cursor: pointer;
  }

  /* L'input est en position: absolute → hors du flux flex, l'ordre visuel ne
     concerne que la pastille et le libellé */
  .ds-radio[data-label-position='start'] {
    flex-direction: row-reverse;
  }

  .ds-radio[data-spread] {
    display: flex;
    justify-content: space-between;
  }

  .ds-radio-input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
    margin: 0;
    pointer-events: none;
  }

  /* Pastille : même mécanique que la boîte du Checkbox (fond accent quand
     coché), le point intérieur est un pseudo-élément en currentcolor */
  .ds-radio-dot {
    display: inline-grid;
    place-items: center;
    width: var(--ds-control-size-check);
    height: var(--ds-control-size-check);
    flex: none;
    background: var(--ds-color-surface);
    border: var(--ds-control-border-width) solid var(--ds-color-border-strong);
    border-radius: var(--ds-radius-full);
    color: var(--ds-color-text-on-accent);
    transition:
      background-color var(--ds-duration-fast) var(--ds-ease-default),
      border-color var(--ds-duration-fast) var(--ds-ease-default);
  }

  .ds-radio-dot::before {
    content: '';
    width: var(--ds-control-size-check-dot);
    height: var(--ds-control-size-check-dot);
    border-radius: var(--ds-radius-full);
    background: currentcolor;
    opacity: 0;
    transition: opacity var(--ds-duration-fast) var(--ds-ease-default);
  }

  .ds-radio:hover .ds-radio-input:not(:disabled, :checked) + .ds-radio-dot {
    border-color: color-mix(in oklab, var(--ds-color-border-strong), var(--ds-color-text) 15%);
  }

  .ds-radio-input:checked + .ds-radio-dot {
    background: var(--ds-color-accent);
    border-color: var(--ds-color-accent);
  }

  .ds-radio-input:checked + .ds-radio-dot::before {
    opacity: 1;
  }

  .ds-radio:hover .ds-radio-input:not(:disabled):checked + .ds-radio-dot {
    background: var(--ds-color-accent-hover);
    border-color: var(--ds-color-accent-hover);
  }

  .ds-radio-input:focus-visible + .ds-radio-dot {
    outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color);
    outline-offset: var(--ds-focus-ring-offset);
  }

  .ds-radio-input:user-invalid + .ds-radio-dot,
  .ds-radio-input[aria-invalid='true'] + .ds-radio-dot {
    border-color: var(--ds-color-danger);
  }

  /* Disabled : nuances de gris (mêmes tokens que Button), pas d'opacité */
  .ds-radio:has(.ds-radio-input:disabled) {
    color: var(--ds-color-text-subtle);
    cursor: not-allowed;
  }

  .ds-radio-input:disabled + .ds-radio-dot {
    background: var(--ds-color-surface-muted);
    border-color: var(--ds-color-border);
    color: var(--ds-color-text-subtle);
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-radio-dot,
    .ds-radio-dot::before {
      transition: none;
    }
  }
}
</style>
