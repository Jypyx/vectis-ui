<script setup lang="ts">
// @a11y
/**
 * A label, a hint and an error message around one control of any kind. VField owns no control:
 * it hands the slot the attributes that tie the control to its label and messages, and the
 * consumer binds them. That works the same for a library control, a native element or a
 * third-party component.
 */

import { computed, useId } from 'vue'

import VTypography from '../VTypography/VTypography.vue'
import VFieldAnnouncer from './VFieldAnnouncer.vue'
import VFieldMessage from './VFieldMessage.vue'

import { useFieldIds } from '../../composables/useFieldIds'
import { useRootAttrs } from '../../composables/useRootAttrs'
import { joinIds } from '../../utils/ids'

/** Where the label sits: above the control, or at its start. */
export type FieldLabelPosition = 'top' | 'start'

/**
 * What the slot hands over, to bind on the control with `v-bind`: its id, the references to
 * the hint and the error, `aria-invalid` while there is an error, `required`, `disabled`, and the
 * attributes set on the VField other than `class` and `style`. For a group, `aria-labelledby`
 * replaces the states a group may not carry. A key is absent rather than undefined, so that
 * binding it never cancels a value the control sets itself.
 */
export type FieldControlProps = {
  id: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: 'true'
  required?: true
  disabled?: true
} & Record<string, unknown>

interface FieldProps {
  /** The label, tied to the control so that clicking it focuses the control. */
  label?: string
  /** A line of help under the control, read along with it. */
  hint?: string
  /**
   * A message saying what is wrong with the value, shown in place of the hint so that the field
   * does not grow. It marks the control invalid, is read along with it, and is announced when it
   * appears or changes.
   */
  error?: string
  /**
   * Marks the control as required: an asterisk follows the label, and `required` is handed to
   * the control, which is what assistive technology announces.
   */
  required?: boolean
  /**
   * Marks the control as disabled: the label and the hint grey out, and `disabled` is handed to
   * the control.
   */
  disabled?: boolean
  /** Hides the label visually. It still names the control for assistive technology. */
  hideLabel?: boolean
  /**
   * Where the label sits: above the control (`top`, the default), or at its start, in a column
   * of its own. A start label moves back above the control when there is not room for both.
   */
  labelPosition?: FieldLabelPosition
  /**
   * Names a group of elements rather than one control, such as a row of fields with a `group`
   * role. The label is then plain text that the slot's `aria-labelledby` points at, since a
   * `<label for>` names one element, and the slot hands over neither `aria-invalid`, `required`
   * nor `disabled`, which a group may not carry.
   */
  group?: boolean
}

const props = withDefaults(defineProps<FieldProps>(), {
  label: undefined,
  hint: undefined,
  error: undefined,
  required: false,
  disabled: false,
  hideLabel: false,
  labelPosition: 'top',
  group: false,
})

defineSlots<{
  /** The control. Bind `fieldProps` on it. */
  default(props: { fieldProps: FieldControlProps }): unknown
  /**
   * Content at the end of the hint's line, such as a character counter. Bind `id` on it: it
   * joins the control's `aria-describedby`, after the error and the hint.
   */
  meta?(props: { id: string }): unknown
}>()

defineOptions({ inheritAttrs: false })

const { attrs, rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

const { fieldId, hintId, errorId, describedBy } = useFieldIds(
  attrs,
  () => !!props.hint && !props.error,
  undefined,
  () => !!props.error,
)

const labelId = useId()
const metaId = useId()

const fieldProps = computed<FieldControlProps>(() => {
  const bound: FieldControlProps = { ...forwardedAttrs.value, id: fieldId.value }
  if (describedBy.value) bound['aria-describedby'] = describedBy.value
  if (props.group) {
    // A consumer's `aria-labelledby` or `aria-label` names the group instead: ours would cancel
    // an `aria-label`, `aria-labelledby` winning in the accessible name computation.
    const named = attrs['aria-labelledby'] !== undefined || attrs['aria-label'] !== undefined
    if (props.label && !named) bound['aria-labelledby'] = labelId
    return bound
  }
  if (props.error) bound['aria-invalid'] = 'true'
  if (props.required) bound.required = true
  if (props.disabled) bound.disabled = true
  return bound
})

// Called from the template, where reading `$slots` is reactive, unlike in a computed.
function withMeta(bound: FieldControlProps): FieldControlProps {
  return { ...bound, 'aria-describedby': joinIds(bound['aria-describedby'], metaId) }
}
</script>

<template>
  <div
    class="v-field"
    :class="rootClass"
    :style="rootStyle"
    :data-label-position="labelPosition"
    :data-disabled="disabled ? '' : undefined"
  >
    <VTypography
      v-if="label"
      :id="group ? labelId : undefined"
      :as="group ? 'span' : 'label'"
      variant="label"
      class="v-field-label"
      :class="{ 'v-visually-hidden': hideLabel }"
      :for="group ? undefined : fieldId"
    >
      {{ label }}<span v-if="required" class="v-field-required" aria-hidden="true">*</span>
    </VTypography>
    <div class="v-field-main">
      <slot :field-props="$slots.meta ? withMeta(fieldProps) : fieldProps" />
      <div v-if="error || hint || $slots.meta" class="v-field-meta">
        <VFieldMessage :hint="hint" :error="error" :hint-id="hintId" :error-id="errorId" />
        <slot :id="metaId" name="meta" />
      </div>
      <VFieldAnnouncer :text="error" />
    </div>
  </div>
</template>

<style>
@layer vectis.components {
  .v-field {
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-1);
    font-family: var(--vectis-text-family);
  }

  .v-field-main {
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-1);
    min-inline-size: 0;
  }

  /* Child combinators, so that a disabled field leaves a field nested in it alone. */
  .v-field[data-disabled] > .v-field-label,
  .v-field[data-disabled] > .v-field-main > .v-field-meta > .v-field-hint {
    --typography-color: var(--vectis-color-text-subtle);
  }

  /*
   * Side by side without a container query, as in VCard: the label keeps its basis and the
   * control takes the rest, until the two bases no longer fit on one line and the control wraps
   * under the label. A hidden label is out of the flow, and the control takes the whole line.
   */
  .v-field[data-label-position='start'] {
    flex-flow: row wrap;
    column-gap: var(--vectis-space-4);
  }

  .v-field[data-label-position='start'] > .v-field-label {
    flex: 1 1 var(--vectis-control-size-field-label);
    /* Centres the first line of the label on a medium control, the size forms use most. */
    padding-block-start: calc(
      (
          var(--vectis-control-height-md) - var(--vectis-text-label-size) *
            var(--vectis-text-label-leading)
        ) /
        2
    );
  }

  .v-field[data-label-position='start'] > .v-field-main {
    flex: 999 1 var(--vectis-control-size-field-control-min);
  }
}
</style>
