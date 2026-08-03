import { ref } from 'vue'
import type { Ref } from 'vue'

import { useFocusoutDismiss } from './useFocusoutDismiss'

/** Minimal contract of the inner field: VDatePicker/VTimePicker expose a `VInput`. */
interface FocusableField {
  focus: () => void
}

/** Minimal contract of the panel: VDatePicker/VTimePicker render a `VPopover`. */
interface PanelControl {
  show: () => void
  hide: () => void
}

export interface UseFieldPanelOptions {
  rootEl: Ref<HTMLElement | null>
  panelRef: Ref<PanelControl | null>
  fieldEl: Ref<FocusableField | null>
  disabled: () => boolean
  /** Moves focus INTO the open panel (called under `requestAnimationFrame`). */
  focusInPanel: () => void
  /** Opening prologue (initializing a draft, resetting a step…). */
  onOpen?: () => void
  /** Closing epilogue (clearing a live region…). */
  onClose?: () => void
  /**
   * Should focus enter the panel on opening? Default: yes. A TYPING field
   * (VDatePicker `mode="input"`) opens its panel without moving the caret: the
   * keyboard keeps writing in the field, and the down arrow stays the only
   * explicit route to the panel.
   */
  focusOnOpen?: () => boolean
}

/**
 * The "field + floating `mode="manual"` panel" shell, shared by VDatePicker and
 * VTimePicker. Neither of them owns it.
 *
 * A `manual` popover does NOTHING on its own: no light dismiss, no focus move, no
 * focus return to the trigger. Everything below is that minimum and nothing more
 * — behaviour specific to each component goes through
 * `onOpen`/`onClose`/`focusInPanel`.
 *
 * The panel is WRITTEN imperatively (VPopover's `show`/`hide`) and READ by model:
 * `open` is to be bound as `v-model:open` on the VPopover, which feeds it from DOM
 * events. The write must stay synchronous — the `rAF` that moves focus assumes the
 * panel is already open when it is armed; going through the model would insert a
 * tick.
 */
export function useFieldPanel(options: UseFieldPanelOptions) {
  const open = ref(false)

  function openPanel(moveFocus = options.focusOnOpen?.() ?? true) {
    if (options.disabled() || open.value) return
    options.onOpen?.()
    options.panelRef.value?.show()
    // DOM focus has to be moved by hand: the platform does not do it for a
    // `manual` popover. rAF: the panel is not painted yet when show() returns.
    if (moveFocus) requestAnimationFrame(() => options.focusInPanel())
  }

  function closePanel(refocus = false) {
    if (!open.value) return
    options.panelRef.value?.hide()
    options.onClose?.()
    if (refocus) options.fieldEl.value?.focus()
  }

  function onControlClick(event: MouseEvent) {
    // click on an internal button (cross/icon): let its own handler act
    if ((event.target as HTMLElement).closest('.v-input-action')) return
    if (options.disabled()) return
    openPanel()
  }

  /** Closes when focus leaves the component (panel included, a DOM descendant). */
  const onFocusout = useFocusoutDismiss(options.rootEl, () => closePanel(false))

  /*
   * Click on a NON-interactive area of the panel (padding, the gutter between
   * cells, the navigation bar outside its buttons): the browser removes focus from
   * the current element and hands it back to <body>. The `focusout` then reaches
   * the root with a null `relatedTarget` — which `useFocusoutDismiss` rightly
   * reads as an exit — and closes a panel that was just clicked.
   *
   * So focus is kept in place, but ONLY outside interactive elements: an
   * unconditional `preventDefault` (VCombobox's, whose focus never leaves the
   * field) would rob the days and the navigation arrows of focus, and
   * desynchronize VCalendar's roving tabindex.
   *
   * Invisible in jsdom, which does not simulate focus on click: covered by play
   * functions.
   */
  function onPanelMousedown(event: MouseEvent) {
    const target = event.target as HTMLElement | null
    if (!target?.closest('button, a, input, select, textarea, [tabindex]')) event.preventDefault()
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (open.value) {
        event.preventDefault()
        closePanel(true)
      }
      return
    }
    // `defaultPrevented`: an Enter already consumed INSIDE the panel (selecting a
    // day, committing the dial) has just closed it — without this guard it would
    // reopen it straight away as it bubbles up to the root.
    if (
      (event.key === 'ArrowDown' || event.key === 'Enter') &&
      !open.value &&
      !event.defaultPrevented
    ) {
      event.preventDefault()
      // KEYBOARD opening: focus always follows, whatever `focusOnOpen` says —
      // otherwise the down arrow would open a panel nothing could reach.
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
