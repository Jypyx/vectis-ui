<script setup lang="ts">
/**
 * Switch: a native <input type="checkbox" role="switch"> — correct screen-reader
 * semantics (an on/off state), with keyboard and forms for free. The track/thumb
 * rendering is pure CSS driven by :checked. JS limited to the v-model bridge.
 */
interface SwitchProps {
  /** Position of the label relative to the switch. */
  labelPosition?: 'start' | 'end'
  /** Pushes label and switch to opposite ends (the root becomes block, full width). */
  spread?: boolean
  disabled?: boolean
}

withDefaults(defineProps<SwitchProps>(), {
  labelPosition: 'end',
  spread: false,
  disabled: false,
})

// @a11y
// The root is a <label>: the native attributes (name, aria-label…) must land on the
// input.
defineOptions({ inheritAttrs: false })

const model = defineModel<boolean>({ default: false })

defineSlots<{
  /** Label, clickable (the <label> wraps everything) */
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

  /* The input is position: absolute → outside the flex flow, so the visual order
     concerns only the track and the label */
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
    /* margin-inline rather than translateX: the movement follows the direction (RTL-safe) */
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

  /* Disabled: greys (the same tokens as VCheckbox/VRadio), no opacity. The thumb
     takes text-subtle — the colour of VCheckbox/VRadio's disabled tick and dot — so
     it stays visible on the grey track in both themes. */
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
