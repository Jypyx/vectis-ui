/**
 * Share clear-button visibility and activation. Restore field focus because clearing removes
 * the button currently holding it.
 */
import { computed } from 'vue'
import type { ComputedRef, Ref } from 'vue'

interface ClearableOptions {
  /** Whether the field offers a cross at all. */
  clearable: () => boolean
  /**
   * The consumer's EXPLICIT answer to "is there anything to clear?", which holds even on a
   * read-only field: the value of a read-only date or time picker changes through its panel
   * rather than by typing.
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
 * something.
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
