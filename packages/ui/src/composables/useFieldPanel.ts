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
 * The shell shared by the date and the time picker: a field, and a panel below it that
 * nothing dismisses by itself. Neither component owns this — it belongs to both.
 *
 * A panel of that kind does NOTHING on its own: it does not close on a click outside, does
 * not take the focus, and does not hand it back. What follows is exactly that minimum,
 * and nothing more; whatever is particular to one component arrives through the three
 * callbacks above.
 *
 * TRAP — the panel is WRITTEN to directly and READ back through a model. The state here is
 * meant to be bound to the panel, which feeds it from its own events, but the opening
 * itself must stay synchronous: the frame scheduled to move the focus assumes the panel is
 * already open by the time it runs, and going through the model would put a tick in
 * between.
 */
export function useFieldPanel(options: UseFieldPanelOptions) {
  const open = ref(false)

  function openPanel(moveFocus = options.focusOnOpen?.() ?? true) {
    if (options.disabled() || open.value) return
    options.onOpen?.()
    options.panelRef.value?.show()
    // @a11y
    // The focus has to be moved by hand — the platform moves it into no panel of this
    // kind. It waits a frame because the panel has not been painted by the time it is
    // asked to open, and nothing invisible can take the focus.
    if (moveFocus) requestAnimationFrame(() => options.focusInPanel())
  }

  function closePanel(refocus = false) {
    if (!open.value) return
    options.panelRef.value?.hide()
    options.onClose?.()
    if (refocus) options.fieldEl.value?.focus()
  }

  function onControlClick(event: MouseEvent) {
    // A click on one of the field's own buttons — the clear cross, an icon — is left to
    // that button's handler: reacting here as well would open the panel the cross has
    // just given a reason to close.
    if ((event.target as HTMLElement).closest('.v-input-action')) return
    if (options.disabled()) return
    openPanel()
  }

  // @a11y
  /**
   * Closes as soon as the focus leaves the component — the panel included, which is a
   * descendant of it even while floating above the page.
   */
  const onFocusout = useFocusoutDismiss(options.rootEl, () => closePanel(false))

  // @a11y
  /*
   * TRAP — clicking a part of the panel that cannot take focus (its padding, the gutter
   * between two cells, the empty space in a navigation bar) makes the browser take the
   * focus off whatever had it and hand it back to the page body. The handler above then
   * sees the focus leave with nowhere to go, reads it as an exit — rightly — and closes a
   * panel the reader has just clicked on.
   *
   * So the focus is held in place, but ONLY outside things that can take it. An
   * unconditional cancellation, as VCombobox uses — where the focus never leaves the field
   * anyway — would here rob the days and the navigation arrows of the focus, and leave the
   * calendar's keyboard pointing at nothing.
   *
   * None of this is visible in the unit tests, where clicking moves no focus; browser tests
   * cover it.
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
    // TRAP — a key already consumed INSIDE the panel is ignored here. An Enter that
    // selected a day or confirmed the dial has just CLOSED the panel, and without this
    // guard it would reopen it immediately as it travels up to the root.
    if (
      (event.key === 'ArrowDown' || event.key === 'Enter') &&
      !open.value &&
      !event.defaultPrevented
    ) {
      event.preventDefault()
      // Opened from the KEYBOARD, the panel always takes the focus, whatever the component
      // asked for: otherwise the down arrow would open a panel the keyboard could not
      // reach.
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
