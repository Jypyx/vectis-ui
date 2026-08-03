<script setup lang="ts">
/**
 * Interrupteur : <input type="checkbox" role="switch"> natif — sémantique
 * lecteur d'écran correcte (état « activé/désactivé »), clavier et formulaires
 * gratuits. Le rendu track/thumb est du pur CSS piloté par :checked.
 * JS limité au pont v-model.
 */
interface SwitchProps {
  /** Position du libellé par rapport au switch. */
  labelPosition?: 'start' | 'end'
  /** Écarte libellé et switch aux extrémités (la racine devient block, pleine largeur). */
  spread?: boolean
  disabled?: boolean
}

withDefaults(defineProps<SwitchProps>(), {
  labelPosition: 'end',
  spread: false,
  disabled: false,
})

// La racine est un <label> : les attributs natifs (name, aria-label…)
// doivent atterrir sur l'input.
defineOptions({ inheritAttrs: false })

const model = defineModel<boolean>({ default: false })

defineSlots<{
  /** Libellé, cliquable (le <label> englobe tout) */
  default?(): unknown
}>()
</script>

<template>
  <label class="v-switch" :data-label-position="labelPosition" :data-spread="spread || undefined">
    <input
      v-model="model"
      type="checkbox"
      role="switch"
      class="v-switch-input"
      v-bind="$attrs"
      :disabled="disabled"
    />
    <span class="v-switch-track" aria-hidden="true">
      <span class="v-switch-thumb" />
    </span>
    <span v-if="$slots.default" class="v-switch-label"><slot /></span>
  </label>
</template>

<style>
@layer vectis.components {
  .v-switch {
    --switch-track-w: var(--vectis-control-size-switch-w);
    --switch-track-h: var(--vectis-control-size-switch-h);
    --switch-pad: 2px;
    display: inline-flex;
    align-items: center;
    gap: var(--vectis-space-2);
    font-family: var(--vectis-text-family);
    font-size: var(--vectis-text-label-size);
    color: var(--vectis-color-text);
    cursor: pointer;
  }

  /* L'input est en position: absolute → hors du flux flex, l'ordre visuel ne
     concerne que le track et le libellé */
  .v-switch[data-label-position='start'] {
    flex-direction: row-reverse;
  }

  .v-switch[data-spread] {
    display: flex;
    justify-content: space-between;
  }

  .v-switch-input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
    margin: 0;
    pointer-events: none;
  }

  .v-switch-track {
    display: inline-flex;
    align-items: center;
    width: var(--switch-track-w);
    height: var(--switch-track-h);
    padding: var(--switch-pad);
    flex: none;
    background: var(--vectis-color-border-strong);
    border-radius: var(--vectis-radius-full);
    transition: background-color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-switch-thumb {
    width: calc(var(--switch-track-h) - var(--switch-pad) * 2);
    height: calc(var(--switch-track-h) - var(--switch-pad) * 2);
    background: var(--vectis-color-surface);
    border-radius: var(--vectis-radius-full);
    box-shadow: var(--vectis-shadow-1);
    /* margin-inline plutôt que translateX : le déplacement suit la direction (RTL-safe) */
    transition: margin-inline-start var(--vectis-duration-base) var(--vectis-ease-default);
  }

  .v-switch-input:checked + .v-switch-track {
    background: var(--vectis-color-accent);
  }

  .v-switch-input:checked + .v-switch-track .v-switch-thumb {
    margin-inline-start: calc(var(--switch-track-w) - var(--switch-track-h));
  }

  .v-switch:hover .v-switch-input:not(:disabled):not(:checked) + .v-switch-track {
    background: color-mix(
      in oklab,
      var(--vectis-color-border-strong),
      var(--vectis-color-text) 12%
    );
  }

  .v-switch-input:focus-visible + .v-switch-track {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  /* Disabled : nuances de gris (mêmes tokens que Checkbox/Radio), pas d'opacité.
     Le thumb reprend text-subtle — la couleur de la coche/du point disabled de
     Checkbox/Radio — pour rester visible sur le track gris dans les deux thèmes. */
  .v-switch:has(.v-switch-input:disabled) {
    color: var(--vectis-color-text-subtle);
    cursor: not-allowed;
  }

  .v-switch-input:disabled + .v-switch-track {
    background: var(--vectis-color-surface-muted);
  }

  .v-switch-input:disabled + .v-switch-track .v-switch-thumb {
    background: var(--vectis-color-text-subtle);
    box-shadow: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .v-switch-track,
    .v-switch-thumb {
      transition: none;
    }
  }
}
</style>
