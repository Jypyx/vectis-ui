<script setup lang="ts">
/**
 * A radio button whose dot is drawn by the design system, on the same principle as
 * VCheckbox: the real `<input type="radio">` stays in place and only its own drawing
 * is hidden.
 *
 * The group is native as well. Several VRadio sharing the same `name` and the same
 * v-model form one choice, and it is the browser that then makes the arrow keys move
 * between them, that lets only one be selected, and that gives the group a single
 * stop in the tab order. There is no JavaScript here for any of it.
 */
/** Which side of the dot the label sits on. */
export type RadioLabelPosition = 'start' | 'end'

interface RadioProps {
  /**
   * What choosing this button means. The group's v-model holds the value of the
   * selected button, so this is what it becomes when this one is picked.
   */
  value: string
  /** Which side of the dot the label sits on. */
  labelPosition?: RadioLabelPosition
  /**
   * Pushes the label and the dot to opposite ends of the line, the row taking the
   * full width available.
   */
  spread?: boolean
  /**
   * Marks the field as invalid, which colours the dot and tells assistive technology
   * so. It is for a rule the browser cannot check by itself.
   */
  invalid?: boolean
  /** Makes this choice unusable, greyed out through the colour tokens. */
  disabled?: boolean
}

withDefaults(defineProps<RadioProps>(), {
  labelPosition: 'end',
  spread: false,
  invalid: false,
  disabled: false,
})

// @a11y — the component's ONLY behavioural decision, and it buys the whole keyboard.
// Moving between the buttons of a group is the browser's job, but it only groups
// inputs that share a `name` — so redirecting the attributes is what makes the arrow
// keys work at all. The root being the <label>, `name` left on it would reach
// nothing.
defineOptions({ inheritAttrs: false })

/**
 * The value selected in the group, shared by every radio carrying the same `name`. It is
 * empty until one is chosen, and a radio is selected when it matches its own `value`.
 */
const model = defineModel<string>({ default: '' })

defineSlots<{
  /** The label. It is clickable, the whole component being wrapped in a `<label>`. */
  default?(): unknown
}>()
</script>

<template>
  <label
    class="v-radio v-choice"
    :data-label-position="labelPosition"
    :data-spread="spread || undefined"
  >
    <input
      v-model="model"
      type="radio"
      class="v-radio-input v-hidden-input"
      v-bind="$attrs"
      :value="value"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
    />
    <span class="v-radio-dot" aria-hidden="true" />
    <span v-if="$slots.default" class="v-radio-label"><slot /></span>
  </label>
</template>

<style>
@layer vectis.components {
  /* The dot works exactly like VCheckbox's box — the accent colour fills it once the
     input is checked — with the small inner disc drawn as a pseudo-element in
     currentcolor, so it follows whatever colour the ring takes. */
  .v-radio-dot {
    display: inline-grid;
    place-items: center;
    width: var(--vectis-control-size-check);
    height: var(--vectis-control-size-check);
    flex: none;
    background: transparent;
    border: var(--vectis-control-border-width) solid var(--vectis-color-border-strong);
    border-radius: var(--vectis-radius-full);
    color: var(--vectis-color-text-on-accent);
    transition:
      background-color var(--vectis-duration-fast) var(--vectis-ease-default),
      border-color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-radio-dot::before {
    content: '';
    width: var(--vectis-control-size-check-dot);
    height: var(--vectis-control-size-check-dot);
    border-radius: var(--vectis-radius-full);
    background: currentcolor;
    opacity: 0;
    transition: opacity var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-radio:hover .v-radio-input:not(:disabled, :checked) + .v-radio-dot {
    border-color: color-mix(
      in oklab,
      var(--vectis-color-border-strong),
      var(--vectis-color-text) 15%
    );
  }

  .v-radio-input:checked + .v-radio-dot {
    background: var(--vectis-color-accent);
    border-color: var(--vectis-color-accent);
  }

  .v-radio-input:checked + .v-radio-dot::before {
    opacity: 1;
  }

  .v-radio:hover .v-radio-input:not(:disabled):checked + .v-radio-dot {
    background: var(--vectis-color-accent-hover);
    border-color: var(--vectis-color-accent-hover);
  }

  .v-radio-input:focus-visible + .v-radio-dot {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  .v-radio-input:user-invalid + .v-radio-dot,
  .v-radio-input[aria-invalid='true'] + .v-radio-dot {
    border-color: var(--vectis-color-danger);
  }

  .v-radio-input:disabled + .v-radio-dot {
    background: var(--vectis-color-surface-muted);
    border-color: var(--vectis-color-border);
    color: var(--vectis-color-text-subtle);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-radio-dot,
    .v-radio-dot::before {
      transition: none;
    }
  }
}
</style>
