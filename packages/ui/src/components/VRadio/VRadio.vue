<script setup lang="ts">
/**
 * A radio button whose dot is drawn by the design system, on the same principle as
 * VCheckbox: the real `<input type="radio">` stays in place and only its own drawing
 * is hidden.
 *
 * The group is native as well. Several VRadio sharing the same `name` and the same
 * v-model form one choice, and it is the browser that then makes the arrow keys move
 * between them, that lets only one be selected, and that gives the group a single
 * stop in the tab order. There is no JavaScript here for any of it; the only piece this
 * component writes is the refusal `readonly` asks for, which a radio has no native form of.
 */

import { ref } from 'vue'

import { useFieldIds } from '../../composables/useFieldIds'
import { useRootAttrs } from '../../composables/useRootAttrs'
import type { ItemValue } from '../../types'

/** Which side of the dot the label sits on. */
export type RadioLabelPosition = 'start' | 'end'

interface RadioProps {
  /**
   * What choosing this button means. The group's v-model holds the value of the
   * selected button, so this is what it becomes when this one is picked.
   */
  value: ItemValue
  /** The text beside the dot, which names it. The default slot replaces it. */
  label?: string
  /**
   * A line of help under the label. It is tied to the radio button for assistive
   * technology, so it is read out after the label rather than as part of it.
   */
  hint?: string
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
  /**
   * Shows the selection without allowing it to be changed. The button can still be
   * focused and is still submitted with its form; a click or an arrow key simply selects
   * nothing. Set it on every button of the group.
   */
  readonly?: boolean
}

const props = withDefaults(defineProps<RadioProps>(), {
  label: undefined,
  hint: undefined,
  labelPosition: 'end',
  spread: false,
  invalid: false,
  disabled: false,
  readonly: false,
})

// @a11y — the redirection buys the whole keyboard. Moving between the buttons of a group is
// the browser's job, but it only groups inputs that share a `name` — so redirecting the
// attributes is what makes the arrow keys work at all. The root being a layout box, `name`
// left on it would reach nothing.
defineOptions({ inheritAttrs: false })
const { attrs, rootClass, rootStyle, forwardedAttrs } = useRootAttrs()
const { hintId, describedBy } = useFieldIds(attrs, () => !!props.hint)

/**
 * The value selected in the group, shared by every radio carrying the same `name`. It is
 * empty until one is chosen, and a radio is selected when it matches its own `value`.
 */
const model = defineModel<ItemValue>({ default: '' })

defineSlots<{
  /** The label, when it needs more than the `label` prop's text. It is clickable. */
  default?(): unknown
}>()

const inputEl = ref<HTMLInputElement | null>(null)

// @core
// The native `readonly` attribute does nothing on a radio button. Cancelling the click is
// what refuses the selection: the browser puts the group's previous selection back and fires
// no `change`. It covers the arrow keys too, which select the next button of the group
// through a click the browser dispatches on it — so the focus still moves, the selection
// does not.
//
// No `aria-readonly` goes with it, unlike VCheckbox and VSwitch: ARIA allows it on a
// `radiogroup` and not on a `radio`, and axe fails the page for it.
function refuseWhenReadonly(event: MouseEvent) {
  if (props.readonly) event.preventDefault()
}

// The root is a wrapper, so a template ref on the component reaches the layout box and not
// the control: these two are the way to the real radio button.
defineExpose({
  /** Moves the focus to the real radio button. */
  focus: (options?: FocusOptions) => inputEl.value?.focus(options),
  /** The real `<input type="radio">`, for what `focus` does not cover. */
  el: inputEl,
})
</script>

<template>
  <span
    class="v-radio v-choice"
    :class="rootClass"
    :style="rootStyle"
    :data-label-position="labelPosition"
    :data-spread="spread ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
  >
    <label class="v-choice-row">
      <input
        ref="inputEl"
        v-model="model"
        type="radio"
        class="v-radio-input v-hidden-input"
        :aria-invalid="invalid || undefined"
        v-bind="forwardedAttrs"
        :value="value"
        :disabled="disabled"
        :aria-describedby="describedBy"
        @click="refuseWhenReadonly"
      />
      <span class="v-radio-dot" aria-hidden="true" />
      <span v-if="$slots.default || label" class="v-radio-label v-choice-label">
        <slot>{{ label }}</slot>
      </span>
    </label>
    <span v-if="hint" :id="hintId" class="v-radio-hint v-choice-hint">{{ hint }}</span>
  </span>
</template>

<style>
@layer vectis.components {
  /* The dot works exactly like VCheckbox's box, the accent filling it once the input is
     checked, with the small inner disc drawn as a pseudo-element in currentcolor so it
     follows whatever colour the state gives the ring's content. */
  .v-radio-dot {
    display: inline-grid;
    place-items: center;
    width: var(--vectis-control-size-check);
    height: var(--vectis-control-size-check);
    background: transparent;
    border: var(--vectis-control-border-width) solid var(--vectis-color-border-strong);
    border-radius: var(--vectis-radius-pill);
    color: var(--vectis-color-text-on-accent);
    transition:
      background-color var(--vectis-duration-fast) var(--vectis-ease-default),
      border-color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-radio-dot::before {
    content: '';
    width: var(--vectis-control-size-check-dot);
    height: var(--vectis-control-size-check-dot);
    border-radius: var(--vectis-radius-pill);
    background: currentcolor;
    opacity: 0;
    transition: opacity var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-radio-input:checked + .v-radio-dot::before {
    opacity: 1;
  }

  /* The state painting, rule for rule the same as VCheckbox's with its own classes: keep the
     two ALIGNED. The states below weigh (0,3,0), bar the read-only base at (0,2,0), so their
     ORDER arbitrates them: checked, read-only, invalid, then disabled last.

     The two hovers sit at (0,7,0) and therefore beat every one of them on specificity, order
     or no order — which is why they have to EXCLUDE by hand each state they must not repaint.
     Forgetting the invalid pair is what once rubbed the danger border out under the pointer,
     on a control whose whole point at that moment is to look wrong. */
  .v-radio:not([data-readonly])
    .v-choice-row:hover
    .v-radio-input:not(:disabled, :checked, :user-invalid, [aria-invalid='true'])
    + .v-radio-dot {
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

  .v-radio:not([data-readonly])
    .v-choice-row:hover
    .v-radio-input:not(:disabled, :user-invalid, [aria-invalid='true']):checked
    + .v-radio-dot {
    background: var(--vectis-color-accent-hover);
    border-color: var(--vectis-color-accent-hover);
  }

  /* Read-only sinks like a read-only field, and a selected control trades the accent for the
     muted text colour: still plainly on, no longer inviting a click. The inner disc takes the
     surface colour, which contrasts with that fill in both themes, where white would vanish
     against the light grey of the dark theme. `:where()` keeps both rules at the weight of
     the states they sit between. */
  :where(.v-radio[data-readonly]) .v-radio-input + .v-radio-dot {
    background: var(--vectis-color-surface-sunken);
    border-color: var(--vectis-color-border);
  }

  :where(.v-radio[data-readonly]) .v-radio-input:checked + .v-radio-dot {
    background: var(--vectis-color-text-muted);
    border-color: var(--vectis-color-text-muted);
    color: var(--vectis-color-surface);
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

  @media (forced-colors: active) {
    /* Windows forced colors erase every author colour: a `background` becomes `Canvas` and a
     `border-color` becomes `CanvasText`, so a selected radio loses its inner disc outright, that disc being
     a `background` on a `background` where a checkbox has a `stroke` that survives. The system
     Highlight pair is what says "selected" here, as it does on a pressed VToggleItem, a
     selected VChip and the current VPagination page.

     The class is repeated to (0,8,0) so the row's own hover rules, which reach (0,7,0),
     cannot repaint it: `forced-color-adjust: none` takes the forcing off this element, and
     a hover left winning would then paint its REAL grey over the system colour. */
    .v-radio-input.v-radio-input.v-radio-input.v-radio-input.v-radio-input:checked:not(:disabled)
      + .v-radio-dot {
      forced-color-adjust: none;
      background: Highlight;
      border-color: Highlight;
      color: HighlightText;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .v-radio-dot,
    .v-radio-dot::before {
      transition: none;
    }
  }
}
</style>
