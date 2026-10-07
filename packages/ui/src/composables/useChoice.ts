import { ref } from 'vue'

import { useFieldIds } from './useFieldIds'
import { useRootAttrs } from './useRootAttrs'

// @a11y @core
/**
 * The wiring VCheckbox, VRadio and VSwitch share. Their root is a layout box, so every attribute
 * but `class` and `style` goes to the native input, where `name`, `required` and the aria-*
 * take part in the form and the accessibility tree. The hint and the error are referenced from
 * the input rather than nested in its label, so they are read after the name. The component
 * declares `inheritAttrs: false` itself.
 */
export function useChoice(props: { hint?: string; error?: string; readonly: boolean }) {
  const { attrs, rootClass, rootStyle, forwardedAttrs } = useRootAttrs()
  const { hintId, errorId, describedBy } = useFieldIds(
    attrs,
    () => !!props.hint && !props.error,
    undefined,
    () => !!props.error,
  )

  const inputEl = ref<HTMLInputElement | null>(null)

  /**
   * The native `readonly` attribute does nothing on a checkbox or a radio. Cancelling the click
   * refuses the change: the browser puts the previous state back and fires no `change`, so the
   * model never hears of it.
   */
  function refuseWhenReadonly(event: MouseEvent) {
    if (props.readonly) event.preventDefault()
  }

  return {
    rootClass,
    rootStyle,
    forwardedAttrs,
    hintId,
    errorId,
    describedBy,
    inputEl,
    refuseWhenReadonly,
    /** What the component exposes: its root is a layout box, so these reach the real input. */
    exposed: {
      /** Moves the focus to the native input. */
      focus: (options?: FocusOptions) => inputEl.value?.focus(options),
      /** The native input, for what `focus` does not cover. */
      el: inputEl,
    },
  }
}
