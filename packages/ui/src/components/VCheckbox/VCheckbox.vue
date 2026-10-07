<script setup lang="ts">
/**
 * Retain the native checkbox for focus, forms and validity. Keep hints outside its label and
 * synchronize indeterminate after rendering.
 */

import { watchEffect } from 'vue'

import VFieldAnnouncer from '../VField/VFieldAnnouncer.vue'
import VFieldMessage from '../VField/VFieldMessage.vue'
import VCheckMark from './VCheckMark.vue'

import { useChoice } from '../../composables/useChoice'

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
   * A message saying what is wrong with the value, shown in place of the hint so that the field
   * does not grow. It marks the field invalid, is read along with it, and is announced when it
   * appears or changes.
   */
  error?: string
  /** Shows the box as partially checked, a dash instead of a tick. */
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
  error: undefined,
  indeterminate: false,
  labelPosition: 'end',
  spread: false,
  invalid: false,
  disabled: false,
  readonly: false,
})

defineOptions({ inheritAttrs: false })
const {
  rootClass,
  rootStyle,
  forwardedAttrs,
  hintId,
  errorId,
  describedBy,
  inputEl,
  refuseWhenReadonly,
  exposed,
} = useChoice(props)

/**
 * Whether the box is ticked. It starts unticked. `indeterminate` is a separate prop: the
 * dash is a third appearance, never a third value of this one.
 */
const model = defineModel<boolean>({ default: false })

defineSlots<{
  /** The label, when it needs more than the `label` prop's text. It is clickable. */
  default?(): unknown
}>()

// @ssr @core
// The effect alone is not enough. Activating a checkbox CLEARS the property as part of the
// gesture, and the prop it reads has not moved, so nothing re-runs it and the dash never comes
// back.
function syncIndeterminate() {
  if (inputEl.value) inputEl.value.indeterminate = props.indeterminate
}

watchEffect(syncIndeterminate, { flush: 'post' })

defineExpose(exposed)
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
      <!--
        `aria-describedby` comes after the forwarded attributes, which lets the aggregated list,
        the consumer's references plus the hint, replace theirs.
      -->
      <input
        ref="inputEl"
        v-model="model"
        type="checkbox"
        class="v-checkbox-input v-hidden-input"
        :aria-invalid="invalid || !!error || undefined"
        :aria-readonly="readonly || undefined"
        v-bind="forwardedAttrs"
        :disabled="disabled"
        :aria-describedby="describedBy"
        @click="refuseWhenReadonly"
        @change="syncIndeterminate"
      />
      <VCheckMark />
      <span v-if="$slots.default || label" class="v-checkbox-label v-choice-label">
        <slot>{{ label }}</slot>
      </span>
    </label>
    <VFieldMessage :hint="hint" :error="error" :hint-id="hintId" :error-id="errorId" />
    <VFieldAnnouncer :text="error" />
  </span>
</template>

<style>
@layer vectis.components {
  /*
   * The states below weigh (0,3,0), bar the read-only base at (0,2,0), so their ORDER
   * arbitrates them: checked, read-only, invalid, then disabled last. The two hovers sit at
   * (0,7,0) and therefore beat every one of them on specificity, order or no order; which is
   * why they have to EXCLUDE by hand each state they must not repaint.
   */
  .v-checkbox:not([data-readonly])
    .v-choice-row:hover
    .v-checkbox-input:not(:disabled, :checked, :indeterminate, :user-invalid, [aria-invalid='true'])
    + .v-check-mark {
    border-color: color-mix(
      in oklab,
      var(--vectis-color-border-strong),
      var(--vectis-color-text) 15%
    );
  }

  .v-checkbox-input:is(:checked, :indeterminate) + .v-check-mark {
    background: var(--vectis-color-accent);
    border-color: var(--vectis-color-accent);
  }

  .v-checkbox:not([data-readonly])
    .v-choice-row:hover
    .v-checkbox-input:not(:disabled, :user-invalid, [aria-invalid='true']):is(
      :checked,
      :indeterminate
    )
    + .v-check-mark {
    background: var(--vectis-color-accent-hover);
    border-color: var(--vectis-color-accent-hover);
  }

  /*
   * The mark takes the surface colour, which contrasts with that fill in both themes, where
   * white would vanish against the light grey of the dark theme. `:where()` keeps both rules at
   * the weight of the states they sit between.
   */
  :where(.v-checkbox[data-readonly]) .v-checkbox-input + .v-check-mark {
    background: var(--vectis-color-surface-sunken);
    border-color: var(--vectis-color-border);
  }

  :where(.v-checkbox[data-readonly])
    .v-checkbox-input:is(:checked, :indeterminate)
    + .v-check-mark {
    background: var(--vectis-color-text-muted);
    border-color: var(--vectis-color-text-muted);
    color: var(--vectis-color-surface);
  }

  .v-checkbox-input:user-invalid + .v-check-mark,
  .v-checkbox-input[aria-invalid='true'] + .v-check-mark {
    border-color: var(--vectis-color-danger);
  }

  .v-checkbox-input:disabled + .v-check-mark {
    background: var(--vectis-color-surface-muted);
    border-color: var(--vectis-color-border);
    color: var(--vectis-color-text-subtle);
  }

  /*
   * The two rules below are (0,4,0) and `checked` and `indeterminate` are INDEPENDENT DOM
   * properties, so a box can be both at once. Nothing but the source order decides what such a
   * box shows: the second rule hides the tick and the dash wins.
   */
  .v-checkbox-input:checked + .v-check-mark .v-check-mark-tick {
    opacity: 1;
  }

  .v-checkbox-input:indeterminate + .v-check-mark .v-check-mark-tick {
    opacity: 0;
  }

  .v-checkbox-input:indeterminate + .v-check-mark .v-check-mark-dash {
    opacity: 1;
  }

  @media (forced-colors: active) {
    /*
     * The class is repeated to (0,8,0) so the row's own hover rules, which reach (0,7,0),
     * cannot repaint it: `forced-color-adjust: none` takes the forcing off this element, and a
     * hover left winning would then paint its real grey over the system colour.
     */
    .v-checkbox-input.v-checkbox-input.v-checkbox-input.v-checkbox-input.v-checkbox-input:is(
        :checked,
        :indeterminate
      ):not(:disabled)
      + .v-check-mark {
      forced-color-adjust: none;
      background: Highlight;
      border-color: Highlight;
      color: HighlightText;
    }
  }
}
</style>
