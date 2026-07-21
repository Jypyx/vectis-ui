<script setup lang="ts">
/**
 * Interrupteur : <input type="checkbox" role="switch"> natif — sémantique
 * lecteur d'écran correcte (état « activé/désactivé »), clavier et formulaires
 * gratuits. Le rendu track/thumb est du pur CSS piloté par :checked.
 * JS limité au pont v-model.
 */
interface SwitchProps {
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

withDefaults(defineProps<SwitchProps>(), {
  size: 'md',
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
  <label class="ds-switch" :data-size="size">
    <input
      v-model="model"
      type="checkbox"
      role="switch"
      class="ds-switch-input"
      v-bind="$attrs"
      :disabled="disabled"
    />
    <span class="ds-switch-track" aria-hidden="true">
      <span class="ds-switch-thumb" />
    </span>
    <span v-if="$slots.default" class="ds-switch-label"><slot /></span>
  </label>
</template>

<style>
@layer ds.components {
  .ds-switch {
    --_track-w: var(--ds-space-8);
    --_track-h: var(--ds-space-5);
    --_pad: 2px;
    display: inline-flex;
    align-items: center;
    gap: var(--ds-space-2);
    font-family: var(--ds-font-family-sans);
    font-size: var(--ds-font-size-sm);
    color: var(--ds-color-text);
    cursor: pointer;
  }

  .ds-switch-input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
    margin: 0;
    pointer-events: none;
  }

  .ds-switch-track {
    display: inline-flex;
    align-items: center;
    width: var(--_track-w);
    height: var(--_track-h);
    padding: var(--_pad);
    flex: none;
    background: var(--ds-color-border-strong);
    border-radius: var(--ds-radius-full);
    transition: background-color var(--ds-duration-fast) var(--ds-ease-default);
  }

  .ds-switch-thumb {
    width: calc(var(--_track-h) - var(--_pad) * 2);
    height: calc(var(--_track-h) - var(--_pad) * 2);
    background: var(--ds-color-surface);
    border-radius: var(--ds-radius-full);
    box-shadow: var(--ds-shadow-1);
    /* margin-inline plutôt que translateX : le déplacement suit la direction (RTL-safe) */
    transition: margin-inline-start var(--ds-duration-base) var(--ds-ease-default);
  }

  .ds-switch-input:checked + .ds-switch-track {
    background: var(--ds-color-accent);
  }

  .ds-switch-input:checked + .ds-switch-track .ds-switch-thumb {
    margin-inline-start: calc(var(--_track-w) - var(--_track-h));
  }

  .ds-switch:hover .ds-switch-input:not(:disabled):not(:checked) + .ds-switch-track {
    background: color-mix(in oklab, var(--ds-color-border-strong), var(--ds-color-text) 12%);
  }

  .ds-switch-input:focus-visible + .ds-switch-track {
    outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color);
    outline-offset: var(--ds-focus-ring-offset);
  }

  .ds-switch:has(.ds-switch-input:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* --- Tailles --- */
  .ds-switch[data-size='sm'] {
    --_track-w: var(--ds-space-7);
    --_track-h: var(--ds-space-4);
    font-size: var(--ds-font-size-xs);
  }

  .ds-switch[data-size='lg'] {
    --_track-w: var(--ds-space-9);
    --_track-h: var(--ds-space-6);
    font-size: var(--ds-font-size-md);
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-switch-track,
    .ds-switch-thumb {
      transition: none;
    }
  }
}
</style>
