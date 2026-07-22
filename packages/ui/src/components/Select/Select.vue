<script setup lang="ts">
/**
 * <select> natif stylé — le picker reste celui de la plateforme (accessible,
 * mobile-friendly), seul le contrôle fermé est habillé. JS limité au pont
 * v-model. Le chevron est un pseudo-élément en currentcolor (pas d'image,
 * donc thémable par tokens) ; l'état disabled du wrapper est dérivé en pur
 * CSS via :has().
 */
interface SelectProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Hauteur réduite de 4px ; padding et typo inchangés. */
  compact?: boolean
  /** Force l'état invalide (validation serveur) — pose aria-invalid. */
  invalid?: boolean
  disabled?: boolean
}

withDefaults(defineProps<SelectProps>(), {
  size: 'md',
  compact: false,
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
  <span class="ds-select ds-control" :data-size="size" :data-compact="compact ? '' : undefined">
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
    inset-inline-end: var(--_control-padding-inline-field);
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

  /* Tailles/compact : variables --_control-* héritées de la racine ds-control
     (styles/control-size.css) ; le padding-end réserve la place du chevron */
  .ds-select-control {
    appearance: none;
    width: 100%;
    height: var(--_control-height);
    padding-inline: var(--_control-padding-inline-field)
      calc(var(--_control-padding-inline-field) + var(--ds-space-5));
    background: var(--ds-color-surface);
    color: var(--ds-color-text);
    border: 1px solid var(--ds-color-border-strong);
    border-radius: var(--ds-radius-interactive);
    font-family: var(--ds-font-family-sans);
    font-size: var(--_control-font-size);
    cursor: pointer;
    text-overflow: ellipsis;
    transition: border-color var(--ds-duration-fast) var(--ds-ease-default);
  }

  .ds-select-control:hover:not(:disabled):not(:focus-visible) {
    border-color: color-mix(in oklab, var(--ds-color-border-strong), var(--ds-color-text) 15%);
  }

  /* Focus « bordure 2px » : bordure 1px + shadow externe 1px de même couleur
     (aligné sur Input/Textarea) ; l'outline transparent est le filet
     forced-colors (Windows High Contrast supprime les box-shadow) */
  .ds-select-control:focus-visible {
    border-color: var(--ds-color-accent);
    box-shadow: 0 0 0 1px var(--ds-color-accent);
    outline: var(--ds-focus-ring-width) solid transparent;
  }

  .ds-select-control:user-invalid,
  .ds-select-control[aria-invalid='true'] {
    border-color: var(--ds-color-danger);
  }

  .ds-select-control:user-invalid:focus-visible,
  .ds-select-control[aria-invalid='true']:focus-visible {
    box-shadow: 0 0 0 1px var(--ds-color-danger);
  }

  .ds-select-control:disabled {
    background: var(--ds-color-surface-muted);
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-select-control {
      transition: none;
    }
  }
}
</style>
