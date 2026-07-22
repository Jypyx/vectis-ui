<script setup lang="ts">
/**
 * Chip interactif. Sélectionnable → vrai <button aria-pressed> (toggle
 * clavier gratuit) ; supprimable → second <button> dédié — jamais de bouton
 * imbriqué (HTML invalide). Sans interaction, rendu statique.
 */
interface ChipProps {
  tone?: 'neutral' | 'accent' | 'danger' | 'success' | 'warning'
  size?: 'sm' | 'md'
  /** Toggle : le chip devient un bouton aria-pressed, lié à v-model:selected. */
  selectable?: boolean
  /** Bouton de retrait qui émet `dismiss` (la disparition est au consommateur). */
  dismissible?: boolean
  disabled?: boolean
}

withDefaults(defineProps<ChipProps>(), {
  tone: 'neutral',
  size: 'md',
  selectable: false,
  dismissible: false,
  disabled: false,
})

const selected = defineModel<boolean>('selected', { default: false })

defineEmits<{
  /** Émis au clic sur le bouton de retrait. */
  dismiss: []
}>()

defineSlots<{
  /** Libellé */
  default(): unknown
  /** Icône (aria-hidden conseillé) */
  icon?(): unknown
}>()
</script>

<template>
  <span
    class="ds-chip"
    :data-tone="tone"
    :data-size="size"
    :data-selected="selectable && selected ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
  >
    <button
      v-if="selectable"
      type="button"
      class="ds-chip-action"
      :aria-pressed="selected"
      :disabled="disabled"
      @click="selected = !selected"
    >
      <slot name="icon" />
      <slot />
    </button>
    <span v-else class="ds-chip-action">
      <slot name="icon" />
      <slot />
    </span>
    <button
      v-if="dismissible"
      type="button"
      class="ds-chip-remove"
      aria-label="Retirer"
      :disabled="disabled"
      @click="$emit('dismiss')"
    >
      <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
        <path
          d="M4 4l8 8M12 4l-8 8"
          stroke="currentcolor"
          stroke-width="1.75"
          stroke-linecap="round"
        />
      </svg>
    </button>
  </span>
</template>

<style>
@layer ds.components {
  .ds-chip {
    display: inline-flex;
    align-items: center;
    background: var(--_bg);
    color: var(--_text);
    border: 1px solid var(--_border);
    border-radius: var(--ds-radius-pill);
    font-family: var(--ds-font-family-sans);
    font-size: var(--ds-font-size-xs);
    font-weight: var(--ds-font-weight-medium);
    line-height: var(--ds-font-leading-none);
    transition:
      background-color var(--ds-duration-fast) var(--ds-ease-default),
      border-color var(--ds-duration-fast) var(--ds-ease-default);
  }

  /* --- Tones --- */
  .ds-chip[data-tone='neutral'] {
    --_bg: var(--ds-color-surface-muted);
    --_text: var(--ds-color-text);
    --_border: transparent;
  }

  .ds-chip[data-tone='accent'] {
    --_bg: var(--ds-color-accent-surface);
    --_text: var(--ds-color-accent-text);
    --_border: transparent;
  }

  .ds-chip[data-tone='danger'] {
    --_bg: var(--ds-color-danger-surface);
    --_text: var(--ds-color-danger-text);
    --_border: transparent;
  }

  .ds-chip[data-tone='success'] {
    --_bg: var(--ds-color-success-surface);
    --_text: var(--ds-color-success-text);
    --_border: transparent;
  }

  .ds-chip[data-tone='warning'] {
    --_bg: var(--ds-color-warning-surface);
    --_text: var(--ds-color-warning-text);
    --_border: transparent;
  }

  /* --- État sélectionné : bascule sur l'accent plein --- */
  .ds-chip[data-selected] {
    --_bg: var(--ds-color-accent);
    --_text: var(--ds-color-text-on-accent);
    --_border: transparent;
  }

  .ds-chip-action {
    display: inline-flex;
    align-items: center;
    gap: var(--ds-space-1);
    padding: var(--ds-space-1) var(--ds-space-2);
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    border-radius: inherit;
    cursor: default;
  }

  button.ds-chip-action {
    cursor: pointer;
  }

  button.ds-chip-action:focus-visible {
    outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color);
    outline-offset: var(--ds-focus-ring-offset);
  }

  .ds-chip:has(button.ds-chip-action:hover):not([data-disabled]) {
    background: color-mix(in oklab, var(--_bg), var(--_text) 8%);
  }

  .ds-chip-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--ds-control-action-size-sm);
    height: var(--ds-control-action-size-sm);
    margin-inline: calc(var(--ds-space-1) * -1) var(--ds-space-1);
    border: none;
    background: transparent;
    color: inherit;
    border-radius: var(--ds-radius-full);
    cursor: pointer;
  }

  .ds-chip-remove:hover {
    background: color-mix(in oklab, currentcolor, transparent 85%);
  }

  .ds-chip-remove:focus-visible {
    outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color);
    outline-offset: calc(var(--ds-focus-ring-offset) * -1);
  }

  .ds-chip[data-disabled] {
    opacity: 0.5;
  }

  .ds-chip[data-disabled] button {
    cursor: not-allowed;
  }

  .ds-chip[data-size='sm'] .ds-chip-action {
    padding: calc(var(--ds-space-1) / 2) var(--ds-space-2);
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-chip {
      transition: none;
    }
  }
}
</style>
