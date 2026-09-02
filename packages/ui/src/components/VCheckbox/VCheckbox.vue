<script setup lang="ts">
/**
 * A checkbox whose square is drawn by the library rather than by the browser.
 *
 * The real `<input type="checkbox">` is still there, hidden with `opacity: 0` and never
 * removed, so it keeps everything a checkbox is owed — focus, keyboard, form submission,
 * native validity — and the drawn square follows its state in CSS.
 *
 * The only JS besides the v-model is `indeterminate`, the third "partially checked" look: it
 * exists solely as a DOM property, with no HTML attribute to set it from a template.
 */

import { ref, watchEffect } from 'vue'

interface CheckboxProps {
  /**
   * Shows the box as partially checked, a dash instead of a tick. This is what a
   * parent checkbox looks like when some of its children are ticked and others are
   * not; it is a state of its own, not a value the v-model can hold.
   */
  indeterminate?: boolean
  /** Which side of the box the label sits on. */
  labelPosition?: 'start' | 'end'
  /**
   * Pushes the label and the box to opposite ends of the line, the row taking the
   * full width available. This is the usual shape for a list of settings.
   */
  spread?: boolean
  /**
   * Marks the field as invalid, which colours the box and tells assistive technology
   * so. Use it for a rule the browser cannot check by itself; native validity is
   * already handled without it.
   */
  invalid?: boolean
  /** Makes the checkbox unusable, greyed out through the colour tokens. */
  disabled?: boolean
}

const props = withDefaults(defineProps<CheckboxProps>(), {
  indeterminate: false,
  labelPosition: 'end',
  spread: false,
  invalid: false,
  disabled: false,
})

// @a11y
// The root element is the <label>, so the attributes the consumer passes must be
// redirected: `name`, `value`, `required` and the aria-* belong on the input, and
// left on the label they would take part in neither the form nor the accessibility
// tree.
defineOptions({ inheritAttrs: false })

/**
 * Whether the box is ticked. It starts unticked, and `indeterminate` is a separate prop —
 * the dash is a third appearance, never a third value of this one.
 */
const model = defineModel<boolean>({ default: false })

defineSlots<{
  /** The label. It is clickable, the whole component being wrapped in a `<label>`. */
  default?(): unknown
}>()

const inputEl = ref<HTMLInputElement | null>(null)

// @ssr @core
// On the server there is no element, so the effect simply does nothing. The
// `flush: 'post'` is load-bearing: it makes the effect run AFTER the DOM has been
// updated, and on the very first pass the template ref is not filled in before
// that — in the default timing the property would be written to nothing at all.
watchEffect(
  () => {
    if (inputEl.value) inputEl.value.indeterminate = props.indeterminate
  },
  { flush: 'post' },
)
</script>

<template>
  <label class="v-checkbox" :data-label-position="labelPosition" :data-spread="spread || undefined">
    <input
      ref="inputEl"
      v-model="model"
      type="checkbox"
      class="v-checkbox-input"
      v-bind="$attrs"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
    />
    <span class="v-checkbox-box" aria-hidden="true">
      <svg class="v-checkbox-mark" viewBox="0 0 12 12">
        <path
          class="v-checkbox-mark-check"
          d="M2.5 6.5l2.5 2.5 4.5-5.5"
          fill="none"
          stroke="currentcolor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          class="v-checkbox-mark-dash"
          d="M3 6h6"
          fill="none"
          stroke="currentcolor"
          stroke-width="1.75"
          stroke-linecap="round"
        />
      </svg>
    </span>
    <span v-if="$slots.default" class="v-checkbox-label"><slot /></span>
  </label>
</template>

<style>
@layer vectis.components {
  .v-checkbox {
    display: inline-flex;
    align-items: center;
    gap: var(--vectis-space-2);
    font-family: var(--vectis-text-family);
    font-size: var(--vectis-text-label-size);
    color: var(--vectis-color-text);
    cursor: pointer;
  }

  /* The input is taken out of the flow by its absolute position, so reversing the
     row only ever swaps the box and the label. */
  .v-checkbox[data-label-position='start'] {
    flex-direction: row-reverse;
  }

  .v-checkbox[data-spread] {
    display: flex;
    justify-content: space-between;
  }

  /* Hidden with `opacity` and never with `display: none`, which would take the input
     out of the tab order and out of the form. It stays focusable and submitted; only
     the browser's own drawing of it disappears. */
  .v-checkbox-input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
    margin: 0;
    pointer-events: none;
  }

  .v-checkbox-box {
    display: inline-grid;
    place-items: center;
    width: var(--vectis-control-size-check);
    height: var(--vectis-control-size-check);
    flex: none;
    background: transparent;
    border: var(--vectis-control-border-width) solid var(--vectis-color-border-strong);
    border-radius: var(--vectis-radius-sm);
    color: var(--vectis-color-text-on-accent);
    transition:
      background-color var(--vectis-duration-fast) var(--vectis-ease-default),
      border-color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-checkbox-mark {
    width: var(--vectis-control-size-check-mark);
    height: var(--vectis-control-size-check-mark);
  }

  .v-checkbox-mark-check,
  .v-checkbox-mark-dash {
    opacity: 0;
    transition: opacity var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-checkbox:hover .v-checkbox-input:not(:disabled, :checked, :indeterminate) + .v-checkbox-box {
    border-color: color-mix(
      in oklab,
      var(--vectis-color-border-strong),
      var(--vectis-color-text) 15%
    );
  }

  .v-checkbox-input:checked + .v-checkbox-box,
  .v-checkbox-input:indeterminate + .v-checkbox-box {
    background: var(--vectis-color-accent);
    border-color: var(--vectis-color-accent);
  }

  .v-checkbox:hover
    .v-checkbox-input:not(:disabled):is(:checked, :indeterminate)
    + .v-checkbox-box {
    background: var(--vectis-color-accent-hover);
    border-color: var(--vectis-color-accent-hover);
  }

  /*
     TRAP — the two rules below are (0,4,0) and `checked` and `indeterminate` are
     INDEPENDENT DOM properties, so a box can be both at once. Nothing but the source
     order decides what such a box shows: the second rule hides the tick and the dash
     wins. Swap them, or slip a rule between them, and a checked-and-indeterminate box
     shows the tick with nothing in the console to say why — and this component is the
     one that sets `indeterminate` by hand, so it is the one that can reach that state. */
  .v-checkbox-input:checked + .v-checkbox-box .v-checkbox-mark-check {
    opacity: 1;
  }

  .v-checkbox-input:indeterminate + .v-checkbox-box .v-checkbox-mark-check {
    opacity: 0;
  }

  .v-checkbox-input:indeterminate + .v-checkbox-box .v-checkbox-mark-dash {
    opacity: 1;
  }

  .v-checkbox-input:focus-visible + .v-checkbox-box {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  .v-checkbox-input:user-invalid + .v-checkbox-box,
  .v-checkbox-input[aria-invalid='true'] + .v-checkbox-box {
    border-color: var(--vectis-color-danger);
  }

  /* A disabled checkbox greys out through the colour tokens, the same ones VButton
     uses, and never through opacity. */
  .v-checkbox:has(.v-checkbox-input:disabled) {
    color: var(--vectis-color-text-subtle);
    cursor: not-allowed;
  }

  .v-checkbox-input:disabled + .v-checkbox-box {
    background: var(--vectis-color-surface-muted);
    border-color: var(--vectis-color-border);
    color: var(--vectis-color-text-subtle);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-checkbox-box,
    .v-checkbox-mark-check,
    .v-checkbox-mark-dash {
      transition: none;
    }
  }
}
</style>
