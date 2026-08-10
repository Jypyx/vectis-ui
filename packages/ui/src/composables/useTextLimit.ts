import { computed, watchEffect, type ComputedRef, type Ref } from 'vue'

import { useMessages } from '../i18n/state'

/** Minimal contract of the native control: both `<input>` and `<textarea>` expose it. */
interface ValidatableControl {
  setCustomValidity: (message: string) => void
}

// @core
/**
 * Typed length vs `maxlength`: the counter text, the overflow and the **soft
 * limit**.
 *
 * Soft limit = typing is not blocked, the field goes into error. It goes through
 * `setCustomValidity` rather than a custom event: the red only appears after
 * interaction (`:user-invalid`, the same timing as native), submission is
 * blocked, and the state is readable through the standard `el.validity` API. The
 * component therefore OWNS the custom validity for as long as `softLimit` is on.
 *
 * `flush: 'post'`: the template ref is not set yet in `pre` flush. Inert on the
 * server, where the ref stays null.
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

  // The dictionary read is INSIDE the effect, so the validation message rewrites
  // itself if `setLocale` is called after mount. `if/else` rather than a ternary,
  // so that TS narrows `limit` to `number`.
  watchEffect(
    () => {
      const el = options.el.value
      if (!el) return
      const limit = max.value
      if (options.softLimit() && limit != null && length.value > limit) {
        el.setCustomValidity(m.value.field.limitExceeded(limit))
      } else {
        el.setCustomValidity('')
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
