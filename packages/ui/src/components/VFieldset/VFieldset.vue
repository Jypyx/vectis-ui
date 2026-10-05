<script setup lang="ts">
// @a11y
/**
 * A native `<fieldset>`, named by its `<legend>`: a group of radios, checkboxes or related
 * fields announced as one. The hint and the error describe the group; `aria-invalid` is not
 * allowed on a group, so the invalid state reaches the controls through the slot.
 */

import { useAttrs } from 'vue'

import VFieldAnnouncer from '../VField/VFieldAnnouncer.vue'
import VTypography from '../VTypography/VTypography.vue'

import { useFieldIds } from '../../composables/useFieldIds'

/** How the controls of the group are laid out: in a column, or in a wrapping row. */
export type FieldsetOrientation = 'vertical' | 'horizontal'

interface FieldsetProps {
  /** The legend, which names the group for assistive technology. */
  legend?: string
  /** A line of help under the group, read along with its name. */
  hint?: string
  /**
   * A message saying what is wrong with the group, shown in place of the hint and read along
   * with its name. It is announced when it appears or changes, and the slot's `invalid` turns
   * true.
   */
  error?: string
  /**
   * Marks the group as required: an asterisk follows the legend, and the slot's `required`
   * turns true, to be set on the controls.
   */
  required?: boolean
  /** Hides the legend visually. It still names the group for assistive technology. */
  hideLegend?: boolean
  /** Lays the controls out in a column (`vertical`, the default) or in a wrapping row. */
  orientation?: FieldsetOrientation
}

const props = withDefaults(defineProps<FieldsetProps>(), {
  legend: undefined,
  hint: undefined,
  error: undefined,
  required: false,
  hideLegend: false,
  orientation: 'vertical',
})

defineSlots<{
  /**
   * The controls of the group. `invalid` is true while there is an error, and `required`
   * repeats the prop: bind them on the controls.
   */
  default(props: { invalid: boolean; required: boolean }): unknown
}>()

// The consumer's `aria-describedby` is merged with the hint and error references, and the
// merged list is bound after the other attributes, which fallthrough would overwrite.
defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

const { hintId, errorId, describedBy } = useFieldIds(
  attrs,
  () => !!props.hint && !props.error,
  undefined,
  () => !!props.error,
)
</script>

<template>
  <fieldset
    v-bind="attrs"
    class="v-fieldset"
    :aria-describedby="describedBy"
    :data-orientation="orientation"
  >
    <legend v-if="legend" class="v-fieldset-legend" :class="{ 'v-visually-hidden': hideLegend }">
      {{ legend }}<span v-if="required" class="v-fieldset-required" aria-hidden="true">*</span>
    </legend>
    <div class="v-fieldset-body">
      <slot :invalid="!!error" :required="required" />
    </div>
    <span v-if="error" :id="errorId" class="v-field-error v-fieldset-error">{{ error }}</span>
    <VTypography
      v-else-if="hint"
      :id="hintId"
      variant="caption"
      tone="muted"
      class="v-fieldset-hint"
    >
      {{ hint }}
    </VTypography>
    <VFieldAnnouncer :text="error" />
  </fieldset>
</template>

<style>
@layer vectis.components {
  .v-fieldset {
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-1);
    min-inline-size: 0;
    margin: 0;
    padding: 0;
    border: 0;
    font-family: var(--vectis-text-family);
  }

  /* A rendered legend is not a flex item of its fieldset, so the gap misses it: a margin. */
  .v-fieldset-legend {
    margin-block-end: var(--vectis-space-2);
    padding: 0;
    color: var(--vectis-color-text);
    font-size: var(--vectis-text-label-size);
    font-weight: var(--vectis-text-label-weight);
    line-height: var(--vectis-text-label-leading);
  }

  .v-fieldset-required {
    margin-inline-start: var(--vectis-space-1);
    color: var(--vectis-color-danger-text);
  }

  .v-fieldset-body {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--vectis-space-2);
  }

  .v-fieldset[data-orientation='horizontal'] > .v-fieldset-body {
    flex-flow: row wrap;
    column-gap: var(--vectis-space-4);
  }
}
</style>
