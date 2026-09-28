import { computed, watchEffect, type ComputedRef, type Ref } from 'vue'

import { useMessages } from '../i18n/state'

/** The least this needs of the real control; the two kinds of field both offer it. */
interface ValidatableControl {
  setCustomValidity: (message: string) => void
}

// @core
/**
 * How much has been typed against how much is allowed: the "12/80" counter under a field,
 * whether the allowance has been passed, and the SOFT limit. A soft limit lets the reader keep
 * typing past the allowance and puts the field in error instead of cutting them off mid-word.
 */
export function useTextLimit(options: {
  el: Ref<ValidatableControl | null>
  text: () => string
  maxlength: () => number | undefined
  softLimit: () => boolean
}): { counterText: ComputedRef<string>; over: ComputedRef<boolean> } {
  const length = computed(() => options.text().length)
  const max = computed(() => options.maxlength())
  const m = useMessages()

  // Without it the effect would clear the validity on every re-run, erasing a consumer's own
  // `setCustomValidity` the moment an unrelated prop such as `maxlength` changed, and letting
  // the form submit.
  let owned = false

  // The dictionary is read INSIDE the effect, which makes the error message rewrite itself when
  // the language is changed after the component is on screen. The branches are spelled out
  // rather than written as a ternary so that TypeScript can narrow the limit to a number.
  watchEffect(
    () => {
      const el = options.el.value
      if (!el) return
      const limit = max.value
      if (options.softLimit() && limit != null && length.value > limit) {
        el.setCustomValidity(m.value.field.limitExceeded(limit))
        owned = true
      } else if (owned) {
        el.setCustomValidity('')
        owned = false
      }
    },
    { flush: 'post' },
  )

  return {
    counterText: computed(() =>
      max.value != null ? `${length.value}/${max.value}` : `${length.value}`,
    ),
    over: computed(() => max.value != null && length.value > max.value),
  }
}
