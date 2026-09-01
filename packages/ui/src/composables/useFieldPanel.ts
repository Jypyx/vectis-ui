import { ref } from 'vue'
import type { Ref } from 'vue'

import { useFocusoutDismiss } from './useFocusoutDismiss'

/** The least this needs of the field: something it can put the focus back on. */
interface FocusableField {
  focus: () => void
}

/** The least this needs of the panel: something it can open and close. */
interface PanelControl {
  show: () => void
  hide: () => void
}

export interface UseFieldPanelOptions {
  /** The component's root, against which "the focus has left" is judged. */
  rootEl: Ref<HTMLElement | null>
  /** The panel to open and close. */
  panelRef: Ref<PanelControl | null>
  /** The field the focus returns to. */
  fieldEl: Ref<FocusableField | null>
  /**
   * Whether opening is refused. It is the SINGLE cut-off point: every route in passes
   * through it, so a component never has to repeat the condition per handler.
   */
  disabled: () => boolean
  /** Moves the focus INTO the open panel — where in it is the component's business. */
  focusInPanel: () => void
  /** What the component needs to do as the panel opens: prepare a draft, reset a step. */
  onOpen?: () => void
  /** What it needs to do as the panel closes: clear an announcement, for instance. */
  onClose?: () => void
  /**
   * Whether the focus should enter the panel when it opens. It does by default.
   *
   * A field one TYPES into says no: its panel opens without taking the caret, so typing
   * carries on and the down arrow remains the one explicit way in.
   */
  focusOnOpen?: () => boolean
}

// @a11y @keyboard @core
/**
 * The "field + `VPopover` in `mode="manual"`" shell of VDateInput and VTimeInput.
 *
 * A `manual` popover does nothing on its own: no light dismiss, no focus move, no focus
 * return. This is exactly that minimum; what is particular to either component arrives
 * through `onOpen`/`onClose`.
 *
 * TRAP — the panel is WRITTEN imperatively and READ back by model. Bind `open` as
 * `v-model:open` so the DOM feeds it, but the write must stay synchronous: the `rAF` that
 * moves focus assumes the panel is already open when it is armed, and the model would put
 * a tick in between.
 */
export function useFieldPanel(options: UseFieldPanelOptions) {
  const open = ref(false)

  function openPanel(moveFocus = options.focusOnOpen?.() ?? true) {
    if (options.disabled() || open.value) return
    options.onOpen?.()
    options.panelRef.value?.show()
    // @a11y
    // A `manual` popover moves focus nowhere, so it is moved by hand — a frame later,
    // the panel not being painted yet, and nothing invisible can take focus.
    if (moveFocus) requestAnimationFrame(() => options.focusInPanel())
  }

  function closePanel(refocus = false) {
    if (!open.value) return
    options.panelRef.value?.hide()
    options.onClose?.()
    if (refocus) options.fieldEl.value?.focus()
  }

  function onControlClick(event: MouseEvent) {
    // A click on one of the field's own buttons is that button's business: reacting here
    // too would open the panel the clear cross has just given a reason to close.
    if ((event.target as HTMLElement).closest('.v-input-action')) return
    if (options.disabled()) return
    openPanel()
  }

  // @a11y
  const onFocusout = useFocusoutDismiss(options.rootEl, () => closePanel(false))

  // @a11y
  /*
   * TRAP — clicking a non-focusable pixel of the panel (padding, the gutter between cells)
   * hands focus back to `<body>`. `onFocusout` above then fires with a null `relatedTarget`,
   * reads it as an exit — rightly — and closes a panel the reader has just clicked.
   *
   * The filter is essential: VCombobox's unconditional `preventDefault` is safe there
   * because focus never leaves its field, but here it would rob the days and the navigation
   * arrows of focus and desynchronize VDatePicker's roving.
   *
   * Invisible in jsdom, where clicking moves no focus — the `ClicDansLeVide` play functions
   * of both components cover it.
   */
  function onPanelMousedown(event: MouseEvent) {
    const target = event.target as HTMLElement | null
    if (!target?.closest('button, a, input, select, textarea, [tabindex]')) event.preventDefault()
  }

  // @keyboard @a11y
  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (open.value) {
        event.preventDefault()
        closePanel(true)
      }
      return
    }
    // TRAP — a key already consumed INSIDE the panel is ignored. An Enter that selected a
    // day has just CLOSED the panel, and without the guard would reopen it as it bubbles.
    if (
      (event.key === 'ArrowDown' || event.key === 'Enter') &&
      !open.value &&
      !event.defaultPrevented
    ) {
      event.preventDefault()
      // Opened from the KEYBOARD the panel always takes focus, whatever `focusOnOpen` says:
      // otherwise ArrowDown opens a panel the keyboard cannot reach.
      openPanel(true)
    }
  }

  return {
    open,
    openPanel,
    closePanel,
    onControlClick,
    onFocusout,
    onKeydown,
    onPanelMousedown,
  }
}
