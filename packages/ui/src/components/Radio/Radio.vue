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
    gap: var(--vectis-space-2);
    font-family: var(--vectis-text-family);
    font-size: var(--vectis-text-label-size);
    color: var(--vectis-color-text);
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
    width: var(--vectis-control-size-check);
    height: var(--vectis-control-size-check);
    flex: none;
    background: var(--vectis-color-surface);
    border: var(--vectis-control-border-width) solid var(--vectis-color-border-strong);
    border-radius: var(--vectis-radius-full);
    color: var(--vectis-color-text-on-accent);
    transition:
      background-color var(--vectis-duration-fast) var(--vectis-ease-default),
      border-color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .ds-radio-dot::before {
    content: '';
    width: var(--vectis-control-size-check-dot);
    height: var(--vectis-control-size-check-dot);
    border-radius: var(--vectis-radius-full);
    background: currentcolor;
    opacity: 0;
    transition: opacity var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .ds-radio:hover .ds-radio-input:not(:disabled, :checked) + .ds-radio-dot {
    border-color: color-mix(
      in oklab,
      var(--vectis-color-border-strong),
      var(--vectis-color-text) 15%
    );
  }

  .ds-radio-input:checked + .ds-radio-dot {
    background: var(--vectis-color-accent);
    border-color: var(--vectis-color-accent);
  }

  .ds-radio-input:checked + .ds-radio-dot::before {
    opacity: 1;
  }

  .ds-radio:hover .ds-radio-input:not(:disabled):checked + .ds-radio-dot {
    background: var(--vectis-color-accent-hover);
    border-color: var(--vectis-color-accent-hover);
  }

  .ds-radio-input:focus-visible + .ds-radio-dot {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  .ds-radio-input:user-invalid + .ds-radio-dot,
  .ds-radio-input[aria-invalid='true'] + .ds-radio-dot {
    border-color: var(--vectis-color-danger);
  }

  /* Disabled : nuances de gris (mêmes tokens que Button), pas d'opacité */
  .ds-radio:has(.ds-radio-input:disabled) {
    color: var(--vectis-color-text-subtle);
    cursor: not-allowed;
  }

  .ds-radio-input:disabled + .ds-radio-dot {
    background: var(--vectis-color-surface-muted);
    border-color: var(--vectis-color-border);
    color: var(--vectis-color-text-subtle);
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-radio-dot,
    .ds-radio-dot::before {
      transition: none;
    }
  }
}
</style>
