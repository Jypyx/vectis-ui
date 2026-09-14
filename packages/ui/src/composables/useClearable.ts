/**
 * The cross that empties a field, shared by VInput and VTextarea — and, through
 * `canClear`, the answer the fields composed on top of VInput give it.
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

/**
 * Whether a field offers its cross: it asks for one, it can be used and changed, and it holds
 * something. The fields composed on top of VInput — VCombobox, VDateInput, VTimeInput,
 * VFileInput — hold their value somewhere other than the text, so they work out `filled`
 * themselves and hand VInput the result as `clearVisible`; the other terms are the same for
 * every field and are written here once.
 *
 * `disabled` is passed apart from the props because it is the value RESOLVED against the row
 * the field sits in, which the prop alone is not.
 */
export function canClear(
  props: { clearable: boolean; readonly: boolean },
  disabled: boolean,
  filled: boolean,
): boolean {
  return props.clearable && !disabled && !props.readonly && filled
}

export function useClearable(options: ClearableOptions): {
  showClear: ComputedRef<boolean>
  onClear: () => void
} {
  // An explicit `clearVisible` replaces the read-only and the content terms together: a
  // composed field has already asked both through `canClear`.
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
