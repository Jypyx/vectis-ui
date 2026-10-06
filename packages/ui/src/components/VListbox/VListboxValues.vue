<script setup lang="ts">
/**
 * Render the values of a multiple VCombobox or VSelect inside its field: one chip each, or their
 * labels on one line, with the values beyond `max` summed up as "+X" while the field is folded.
 * It renders siblings rather than a wrapper, so the chips wrap as items of the field itself.
 */
import { computed } from 'vue'

import VChip from '../VChip/VChip.vue'
import type { ChipScale } from '../../utils/chip'
import type {
  ItemValue,
  ListboxChipSlotProps,
  ListboxOption,
  ListboxOverflowSlotProps,
} from '../../types'
import { useMessages } from '../../i18n/state'

interface ListboxValuesProps {
  /** Every chosen value, in order. */
  values: ItemValue[]
  /** One chip per value, or the labels joined by commas. */
  display: 'chip' | 'text'
  /** How many values to show while folded; 0 or none shows them all. */
  max?: number
  /** Whether the field is folded, the only state in which `max` applies. */
  collapsed?: boolean
  /** Rephrases the "+X". */
  overflowText?: (count: number) => string
  /** The chips' scale inside the field. */
  scale: ChipScale
  /** Whether each chip offers a cross. */
  removable?: boolean
  /** Greys the chips out. */
  disabled?: boolean
  /** Hides the line of labels from assistive technology, for a field that speaks its value. */
  hideText?: boolean
  /** The label of a value. */
  labelOf: (value: ItemValue) => string
  /** The option holding a value. */
  optionOf: (value: ItemValue) => ListboxOption | undefined
}

const props = withDefaults(defineProps<ListboxValuesProps>(), {
  max: undefined,
  collapsed: false,
  overflowText: undefined,
  removable: false,
  disabled: false,
  hideText: false,
})

const emit = defineEmits<{
  /** A chip's cross was pressed. */
  remove: [value: ItemValue]
}>()

defineSlots<{
  /** Replaces the chip standing for one value. */
  chip?(props: ListboxChipSlotProps): unknown
  /** Replaces the "+X" standing for the values beyond `max`. */
  overflow?(props: ListboxOverflowSlotProps): unknown
}>()

const m = useMessages()

// Unfolded, the reader is working on the selection, and every value must be there to be seen
// and taken back. `max: 0` means no limit, as on VAvatarGroup: a truthiness test, never
// `!= null`, which would hide every value.
const shown = computed(() =>
  props.collapsed && props.max ? props.values.slice(0, props.max) : props.values,
)
const overflowCount = computed(() => props.values.length - shown.value.length)

// Digits and a plus sign stay out of the dictionary, as VAvatarGroup's "+N" does: rephrasing
// goes through `overflowText` or the `#overflow` slot.
const overflowLabel = computed(() =>
  props.overflowText ? props.overflowText(overflowCount.value) : `+${overflowCount.value}`,
)

// The comma is universal punctuation rather than a word, so it stays out of the dictionary,
// as in VFileInput's own text display.
const text = computed(() =>
  props.display === 'text' ? shown.value.map(props.labelOf).join(', ') : '',
)
</script>

<template>
  <span v-if="text" class="v-listbox-text" :aria-hidden="hideText ? 'true' : undefined">{{
    text
  }}</span>
  <!-- A box of its own beside the line rather than the end of it: the labels are what the
       ellipsis cuts, and the count of what they do not show must survive it. -->
  <span
    v-if="display === 'text' && overflowCount > 0"
    class="v-listbox-overflow"
    :aria-hidden="hideText ? 'true' : undefined"
  >
    <slot name="overflow" :count="overflowCount" :size="scale.size" :compact="scale.compact">{{
      overflowLabel
    }}</slot>
  </span>
  <template v-for="value in display === 'chip' ? shown : []" :key="value">
    <slot
      name="chip"
      :value="value"
      :option="optionOf(value)"
      :label="labelOf(value)"
      :remove="() => emit('remove', value)"
      :size="scale.size"
      :compact="scale.compact"
    >
      <VChip
        tone="accent"
        :size="scale.size"
        :compact="scale.compact"
        :dismissible="removable && !disabled"
        :dismiss-label="m.common.remove(labelOf(value))"
        :disabled="disabled"
        @dismiss="emit('remove', value)"
        >{{ labelOf(value) }}</VChip
      >
    </slot>
  </template>
  <!-- Not wrapped, unlike the text display's counter: a box around an inline-flex chip opens a
       line box, whose strut makes the field taller than its chips. Neutral and not dismissible,
       so it reads as a summary rather than one more value. -->
  <slot
    v-if="display === 'chip' && overflowCount > 0"
    name="overflow"
    :count="overflowCount"
    :size="scale.size"
    :compact="scale.compact"
  >
    <VChip
      class="v-listbox-overflow-chip"
      tone="neutral"
      :size="scale.size"
      :compact="scale.compact"
      :disabled="disabled"
      >{{ overflowLabel }}</VChip
    >
  </slot>
</template>

<style>
@layer vectis.components {
  /*
   * The line shrinks before anything else in the field, and the zero minimum is what lets it:
   * an unbroken line otherwise has the whole of its text as its minimum width.
   */
  .v-listbox-text {
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* The "+X" after a line of text never shrinks: the line gives way instead. */
  .v-listbox-overflow {
    flex: none;
    white-space: nowrap;
    color: var(--vectis-color-text-muted);
  }
}
</style>
