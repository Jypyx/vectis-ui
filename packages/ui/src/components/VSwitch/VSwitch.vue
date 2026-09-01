<script setup lang="ts">
/**
 * A switch, for a setting that takes effect at once — where a checkbox states an
 * intention to be confirmed later.
 *
 * Underneath it is a native checkbox marked `role="switch"`, so a screen reader
 * announces it as on or off rather than as ticked, and the keyboard and the form
 * behaviour come along for free. The track and the moving thumb are pure CSS,
 * following the input's checked state; the only JavaScript is the v-model.
 */
interface SwitchProps {
  /** Which side of the switch the label sits on. */
  labelPosition?: 'start' | 'end'
  /**
   * Pushes the label and the switch to opposite ends of the line, the row taking the
   * full width available — the usual shape for a list of settings.
   */
  spread?: boolean
  /** Makes the switch unusable, greyed out through the colour tokens. */
  disabled?: boolean
}

withDefaults(defineProps<SwitchProps>(), {
  labelPosition: 'end',
  spread: false,
  disabled: false,
})

// @a11y
// The root element is the <label>, so the attributes the consumer passes have to be
// redirected onto the input: `name` for the form, and the aria-* for the element
// that actually carries the switch role.
defineOptions({ inheritAttrs: false })

/** Whether the switch is on. It starts off. */
const model = defineModel<boolean>({ default: false })

defineSlots<{
  /** The label. It is clickable, the whole component being wrapped in a `<label>`. */
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

  /* The input is taken out of the flow by its absolute position, so reversing the
     row only ever swaps the track and the label. */
  .v-switch[data-label-position='start'] {
    flex-direction: row-reverse;
  }

  .v-switch[data-spread] {
    display: flex;
    justify-content: space-between;
  }

  /* Hidden with `opacity` and never with `display: none`, which would take the input
     out of the tab order and out of the form. */
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
    box-shadow: var(--vectis-shadow-xs);
    /* The thumb travels through `margin-inline-start` rather than a translation,
       because a logical property follows the reading direction: in a right-to-left
       page the thumb then moves leftwards on its own, where a translateX would have
       to be mirrored by a second rule. */
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

  /* A disabled switch greys out through the colour tokens, the same ones VCheckbox
     and VRadio use, and never through opacity. The thumb takes text-subtle — the
     colour their disabled tick and dot take — which is what keeps it visible against
     the grey track in both themes. */
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
