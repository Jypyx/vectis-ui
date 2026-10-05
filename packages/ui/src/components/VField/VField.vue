<script setup lang="ts">
// @a11y
/**
 * A label, a hint and an error message around one control of any kind. VField owns no control:
 * it hands the slot the attributes that tie the control to its label and messages, and the
 * consumer binds them. That works the same for a library control, a native element or a
 * third-party component.
 */

import { computed } from 'vue'

import VTypography from '../VTypography/VTypography.vue'
import VFieldAnnouncer from './VFieldAnnouncer.vue'

import { useFieldIds } from '../../composables/useFieldIds'
import { useRootAttrs } from '../../composables/useRootAttrs'

/** Where the label sits: above the control, or at its start. */
export type FieldLabelPosition = 'top' | 'start'

/**
 * What the slot hands over, to bind on the control with `v-bind`: its id, the references to
 * the hint and the error, `aria-invalid` while there is an error, `required`, and the attributes
 * set on the VField other than `class` and `style`. A key is absent rather than undefined, so
 * that binding it never cancels a value the control sets itself.
 */
export type FieldControlProps = {
  id: string
  'aria-describedby'?: string
  'aria-invalid'?: 'true'
  required?: true
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
  /** Hides the label visually. It still names the control for assistive technology. */
  hideLabel?: boolean
  /**
   * Where the label sits: above the control (`top`, the default), or at its start, in a column
   * of its own. A start label moves back above the control when there is not room for both.
   */
  labelPosition?: FieldLabelPosition
}

const props = withDefaults(defineProps<FieldProps>(), {
  label: undefined,
  hint: undefined,
  error: undefined,
  required: false,
  hideLabel: false,
  labelPosition: 'top',
})

defineSlots<{
  /** The control. Bind `fieldProps` on it. */
  default(props: { fieldProps: FieldControlProps }): unknown
}>()

defineOptions({ inheritAttrs: false })

const { attrs, rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

const { fieldId, hintId, errorId, describedBy } = useFieldIds(
  attrs,
  () => !!props.hint && !props.error,
  undefined,
  () => !!props.error,
)

const fieldProps = computed<FieldControlProps>(() => {
  const bound: FieldControlProps = { ...forwardedAttrs.value, id: fieldId.value }
  if (describedBy.value) bound['aria-describedby'] = describedBy.value
  if (props.error) bound['aria-invalid'] = 'true'
  if (props.required) bound.required = true
  return bound
})
</script>

<template>
  <div class="v-field" :class="rootClass" :style="rootStyle" :data-label-position="labelPosition">
    <VTypography
      v-if="label"
      as="label"
      variant="label"
      class="v-field-label"
      :class="{ 'v-visually-hidden': hideLabel }"
      :for="fieldId"
    >
      {{ label }}<span v-if="required" class="v-field-required" aria-hidden="true">*</span>
    </VTypography>
    <div class="v-field-main">
      <slot :field-props="fieldProps" />
      <span v-if="error" :id="errorId" class="v-field-error v-field-message">{{ error }}</span>
      <VTypography
        v-else-if="hint"
        :id="hintId"
        variant="caption"
        tone="muted"
        class="v-field-hint"
      >
        {{ hint }}
      </VTypography>
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

  .v-field-required {
    margin-inline-start: var(--vectis-space-1);
    color: var(--vectis-color-danger-text);
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
