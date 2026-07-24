import { computed, watchEffect, type ComputedRef, type Ref } from 'vue'

import { useMessages } from '../i18n/state'

/** The least this needs of the real control — the two kinds of field both offer it. */
interface ValidatableControl {
  setCustomValidity: (message: string) => void
}

// @core
/**
 * How much has been typed against how much is allowed: the "12/80" counter under a
 * field, whether the allowance has been passed, and the SOFT limit.
 *
 * A soft limit lets the reader keep typing past the allowance and puts the field in
 * error instead of cutting them off mid-word. That error is declared to the BROWSER
 * rather than invented here, and three things follow from it for free: the field only
 * turns red once the reader has actually interacted with it, exactly as a native error
 * does; the form refuses to submit; and anyone inspecting the field finds the error where
 * they would look for any other. The price is that the component then owns that error
 * outright for as long as the soft limit is on.
 *
 * The effect runs AFTER the render rather than before it, because the reference to the
 * real element is not filled in yet at the earlier point. It does nothing at all during a
 * server render, where there is no element to speak to.
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

  // The dictionary is read INSIDE the effect, which is what makes the error message
  // rewrite itself when the language is changed after the component is on screen. The
  // branches are spelled out rather than written as a ternary so that TypeScript can
  // narrow the limit to a number.
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
