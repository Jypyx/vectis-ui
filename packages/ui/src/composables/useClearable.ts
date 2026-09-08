/**
 * The cross that empties a field, shared by VInput and VTextarea.
 *
 * The two halves of it are one decision: WHEN the cross is shown, and what pressing it does.
 * They were written out in both components and had already started to drift — one asked
 * `props.disabled` where the other asked the value resolved against the row it sits in — which
 * is the kind of divergence nothing catches, the cross simply staying visible in a disabled
 * VInputGroup.
 *
 * The focus is the accessibility half and is not optional: the cross VANISHES the instant it
 * empties the field, so without that call the focus would be left on a button that no longer
 * exists and fall back to the top of the document.
 */
import { computed } from 'vue'
import type { ComputedRef, Ref } from 'vue'

interface ClearableOptions {
  /** Whether the field offers a cross at all. */
  clearable: () => boolean
  /**
   * The consumer's EXPLICIT answer to "is there anything to clear?", which holds even on a
   * read-only field: the value of a read-only date or time picker changes through its panel
   * rather than by typing. Left undefined, the field answers for itself.
   */
  clearVisible: () => boolean | undefined
  /** Whether the field is unusable, the row it sits in taken into account. */
  disabled: () => boolean
  /** Whether the field refuses to be typed into. */
  readonly: () => boolean
  /** What the field currently holds, as text. */
  text: () => string
  /** The real control, which the focus goes back to. */
  controlEl: Ref<{ focus: () => void } | null>
  /** Empties the value and tells the consumer. */
  onCleared: () => void
}

export function useClearable(options: ClearableOptions): {
  showClear: ComputedRef<boolean>
  onClear: () => void
} {
  const showClear = computed(() => {
    if (!options.clearable() || options.disabled()) return false
    return options.clearVisible() ?? (!options.readonly() && options.text().length > 0)
  })

  function onClear() {
    options.onCleared()
    options.controlEl.value?.focus()
  }

  return { showClear, onClear }
}
