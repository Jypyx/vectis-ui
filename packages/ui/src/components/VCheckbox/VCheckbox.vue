<script setup lang="ts">
/**
 * A checkbox whose square is drawn by the library rather than by the browser.
 *
 * The real `<input type="checkbox">` is still there, hidden with `opacity: 0` and never
 * removed, so it keeps everything a checkbox is owed — focus, keyboard, form submission,
 * native validity — and the drawn square follows its state in CSS.
 *
 * The root is a container rather than the `<label>` itself, because the hint must sit
 * OUTSIDE the label: whatever a label holds becomes the control's accessible name.
 *
 * Two pieces of JS besides the v-model. `indeterminate`, the third "partially checked" look,
 * exists solely as a DOM property with no HTML attribute to set it from a template. And
 * `readonly` has no native meaning on a checkbox, so refusing the change is ours to do.
 */

import { ref, watchEffect } from 'vue'

import { useFieldIds } from '../../composables/useFieldIds'
import { useRootAttrs } from '../../composables/useRootAttrs'

/** Which side of the box the label sits on. */
export type CheckboxLabelPosition = 'start' | 'end'

interface CheckboxProps {
  /** The text beside the box, which names it. The default slot replaces it. */
  label?: string
  /**
   * A line of help under the label. It is tied to the checkbox for assistive technology,
   * so it is read out after the label rather than as part of it.
   */
  hint?: string
  /**
   * Shows the box as partially checked, a dash instead of a tick. This is what a
   * parent checkbox looks like when some of its children are ticked and others are
   * not; it is a state of its own, not a value the v-model can hold.
   */
  indeterminate?: boolean
  /** Which side of the box the label sits on. */
  labelPosition?: CheckboxLabelPosition
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
  /**
   * Shows the state without allowing it to be changed. The checkbox can still be
   * focused, is announced as read-only and is still submitted with its form; a click
   * or the Space key simply changes nothing.
   */
  readonly?: boolean
}

const props = withDefaults(defineProps<CheckboxProps>(), {
  label: undefined,
  hint: undefined,
  indeterminate: false,
  labelPosition: 'end',
  spread: false,
  invalid: false,
  disabled: false,
  readonly: false,
})

// @a11y
// The root element is a layout box, so the attributes the consumer passes must be
// redirected: `name`, `value`, `required` and the aria-* belong on the input, and left on
// the wrapper they would take part in neither the form nor the accessibility tree.
defineOptions({ inheritAttrs: false })
const { attrs, rootClass, rootStyle, forwardedAttrs } = useRootAttrs()
const { hintId, describedBy } = useFieldIds(attrs, () => !!props.hint)

/**
 * Whether the box is ticked. It starts unticked, and `indeterminate` is a separate prop —
 * the dash is a third appearance, never a third value of this one.
 */
const model = defineModel<boolean>({ default: false })

defineSlots<{
  /** The label, when it needs more than the `label` prop's text. It is clickable. */
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

// @core
// The native `readonly` attribute does nothing on a checkbox. Cancelling the click is what
// refuses the change: the browser then puts `checked` AND `indeterminate` back as they were
// and fires no `change`, so the v-model never hears of it. It covers the Space key, which a
// checkbox turns into a click, and a click on the label, which is forwarded to the input.
function refuseWhenReadonly(event: MouseEvent) {
  if (props.readonly) event.preventDefault()
}

// The root is a wrapper, so a template ref on the component reaches the layout box and not
// the control: these two are the way to the real checkbox.
defineExpose({
  /** Moves the focus to the real checkbox. */
  focus: (options?: FocusOptions) => inputEl.value?.focus(options),
  /** The real `<input type="checkbox">`, for what `focus` does not cover. */
  el: inputEl,
})
</script>

<template>
  <span
    class="v-checkbox v-choice"
    :class="rootClass"
    :style="rootStyle"
    :data-label-position="labelPosition"
    :data-spread="spread ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
  >
    <label class="v-choice-row">
      <!-- `aria-describedby` comes AFTER the forwarded attributes, which is what lets the
           aggregated list, the consumer's references plus the hint, replace theirs. -->
      <input
        ref="inputEl"
        v-model="model"
        type="checkbox"
        class="v-checkbox-input v-hidden-input"
        :aria-invalid="invalid || undefined"
        :aria-readonly="readonly || undefined"
        v-bind="forwardedAttrs"
        :disabled="disabled"
        :aria-describedby="describedBy"
        @click="refuseWhenReadonly"
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
      <span v-if="$slots.default || label" class="v-checkbox-label v-choice-label">
        <slot>{{ label }}</slot>
      </span>
    </label>
    <span v-if="hint" :id="hintId" class="v-checkbox-hint v-choice-hint">{{ hint }}</span>
  </span>
</template>

<style>
@layer vectis.components {
  /* The corner follows the control radius, capped at a QUARTER of the box rather than at
     the half a row takes. A pill override on --vectis-radius-interactive would otherwise
     turn the box into a disc, and a round checkbox reads as a radio. */
  .v-checkbox-box {
    display: inline-grid;
    place-items: center;
    width: var(--vectis-control-size-check);
    height: var(--vectis-control-size-check);
    background: transparent;
    border: var(--vectis-control-border-width) solid var(--vectis-color-border-strong);
    border-radius: min(
      var(--vectis-radius-interactive),
      calc(var(--vectis-control-size-check) / 4)
    );
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

  /* The state painting, rule for rule the same as VRadio's with its own classes: keep the
     two ALIGNED. Every state below but the hovers weighs (0,3,0), so their ORDER arbitrates
     them: checked, read-only, invalid, then disabled last. The two hovers exclude every state
     they must not repaint, so no order argument reaches them. */
  .v-checkbox:not([data-readonly])
    .v-choice-row:hover
    .v-checkbox-input:not(:disabled, :checked, :indeterminate)
    + .v-checkbox-box {
    border-color: color-mix(
      in oklab,
      var(--vectis-color-border-strong),
      var(--vectis-color-text) 15%
    );
  }

  .v-checkbox-input:is(:checked, :indeterminate) + .v-checkbox-box {
    background: var(--vectis-color-accent);
    border-color: var(--vectis-color-accent);
  }

  .v-checkbox:not([data-readonly])
    .v-choice-row:hover
    .v-checkbox-input:not(:disabled):is(:checked, :indeterminate)
    + .v-checkbox-box {
    background: var(--vectis-color-accent-hover);
    border-color: var(--vectis-color-accent-hover);
  }

  /* Read-only sinks like a read-only field, and a selected control trades the accent for the
     muted text colour: still plainly on, no longer inviting a click. The mark takes the
     surface colour, which contrasts with that fill in both themes, where white would vanish
     against the light grey of the dark theme. `:where()` keeps both rules at the weight of
     the states they sit between. */
  :where(.v-checkbox[data-readonly]) .v-checkbox-input + .v-checkbox-box {
    background: var(--vectis-color-surface-sunken);
    border-color: var(--vectis-color-border);
  }

  :where(.v-checkbox[data-readonly])
    .v-checkbox-input:is(:checked, :indeterminate)
    + .v-checkbox-box {
    background: var(--vectis-color-text-muted);
    border-color: var(--vectis-color-text-muted);
    color: var(--vectis-color-surface);
  }

  .v-checkbox-input:user-invalid + .v-checkbox-box,
  .v-checkbox-input[aria-invalid='true'] + .v-checkbox-box {
    border-color: var(--vectis-color-danger);
  }

  .v-checkbox-input:disabled + .v-checkbox-box {
    background: var(--vectis-color-surface-muted);
    border-color: var(--vectis-color-border);
    color: var(--vectis-color-text-subtle);
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

  @media (prefers-reduced-motion: reduce) {
    .v-checkbox-box,
    .v-checkbox-mark-check,
    .v-checkbox-mark-dash {
      transition: none;
    }
  }
}
</style>
