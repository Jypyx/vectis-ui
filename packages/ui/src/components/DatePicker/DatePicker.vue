<script setup lang="ts">
/**
 * <input type="date"> natif stylé — conforme au principe « éléments de
 * formulaire natifs stylés plutôt que réimplémentés » : clavier, localisation,
 * picker mobile, min/max et validation gratuits. Le panneau calendrier reste
 * celui de la plateforme (non thémable — compromis assumé, documenté dans le
 * README ; un calendrier custom pourra être ajouté si le theming du panneau
 * devient nécessaire). JS limité au pont v-model. min/max/required passent
 * par fallthrough.
 */
interface DatePickerProps {
  /** Granularité native. */
  type?: 'date' | 'datetime-local' | 'time' | 'month' | 'week'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Hauteur réduite de 4px ; padding et typo inchangés. */
  compact?: boolean
  /** Force l'état invalide (validation serveur) — pose aria-invalid. */
  invalid?: boolean
  disabled?: boolean
}

withDefaults(defineProps<DatePickerProps>(), {
  type: 'date',
  size: 'md',
  compact: false,
  invalid: false,
  disabled: false,
})

/** Valeur ISO native (`2026-07-21`, `2026-07-21T14:30`…). */
const model = defineModel<string>({ default: '' })
</script>

<template>
  <input
    v-model="model"
    :type="type"
    class="ds-datepicker ds-control"
    :data-size="size"
    :data-compact="compact ? '' : undefined"
    :disabled="disabled"
    :aria-invalid="invalid || undefined"
  />
</template>

<style>
@layer ds.components {
  /* Tailles/compact : variables --_control-* posées par la classe partagée
     ds-control (styles/control-size.css) sur ce même élément */
  .ds-datepicker {
    width: 100%;
    height: var(--_control-height);
    padding-inline: var(--_control-padding-inline-field);
    background: var(--ds-color-surface);
    color: var(--ds-color-text);
    border: 1px solid var(--ds-color-border-strong);
    border-radius: var(--ds-radius-interactive);
    font-family: var(--ds-font-family-sans);
    font-size: var(--_control-font-size);
    transition: border-color var(--ds-duration-fast) var(--ds-ease-default);
  }

  /* l'icône calendrier suit le thème via color-scheme (tokens) ; on ajuste
     juste son affordance */
  .ds-datepicker::-webkit-calendar-picker-indicator {
    cursor: pointer;
    opacity: 0.6;
    transition: opacity var(--ds-duration-fast) var(--ds-ease-default);
  }

  .ds-datepicker::-webkit-calendar-picker-indicator:hover {
    opacity: 1;
  }

  .ds-datepicker:hover:not(:disabled):not(:focus-visible) {
    border-color: color-mix(in oklab, var(--ds-color-border-strong), var(--ds-color-text) 15%);
  }

  /* Focus « bordure 2px » : bordure 1px + shadow externe 1px de même couleur
     (aligné sur Input/Textarea) ; l'outline transparent est le filet
     forced-colors (Windows High Contrast supprime les box-shadow) */
  .ds-datepicker:focus-visible {
    border-color: var(--ds-color-accent);
    box-shadow: 0 0 0 1px var(--ds-color-accent);
    outline: var(--ds-focus-ring-width) solid transparent;
  }

  .ds-datepicker:user-invalid,
  .ds-datepicker[aria-invalid='true'] {
    border-color: var(--ds-color-danger);
  }

  .ds-datepicker:user-invalid:focus-visible,
  .ds-datepicker[aria-invalid='true']:focus-visible {
    box-shadow: 0 0 0 1px var(--ds-color-danger);
  }

  .ds-datepicker:disabled {
    background: var(--ds-color-surface-muted);
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-datepicker {
      transition: none;
    }
  }
}
</style>
