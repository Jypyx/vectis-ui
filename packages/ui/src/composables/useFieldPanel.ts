import { provide, ref, useId } from 'vue'
import type { Ref } from 'vue'

import { NO_BUTTON_GROUP, buttonGroupKey } from '../components/VButton/context'
import { useFocusoutDismiss } from './useFocusoutDismiss'

/** The least this needs of the field: something it can put the focus back on. */
interface FocusableField {
  focus: () => void
}

/** The least this needs of the panel: something it can open and close. */
interface PanelControl {
  show: () => void
  close: () => void
}

export interface UseFieldPanelOptions {
  /** The component's root, against which "the focus has left" is judged. */
  rootEl: Ref<HTMLElement | null>
  /** The panel to open and close. */
  panelRef: Ref<PanelControl | null>
  /** The field the focus returns to. */
  field: Ref<FocusableField | null>
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
   * Whether focusing the field opens the panel. It does not by default.
   *
   * A field one TYPES into says yes, and its panel then opens WITHOUT taking the caret, so
   * typing carries on and the down arrow remains the one explicit way in. A click on such a
   * field leaves the focus where it is for the same reason.
   */
  openOnFocus?: () => boolean
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
  const openOnFocus = () => options.openOnFocus?.() ?? false

  /** The id the panel carries, for the field's `aria-controls`. */
  const panelId = useId()

  // @core
  // TRAP — this stops a VButtonGroup's or a VInputGroup's row context at the field's
  // boundary. The picker in the panel sizes its own buttons — VDatePicker writes `size="sm"`
  // on its navigation, VTimePicker `size="lg"` on its hour and minute cells — and a group
  // WINS over a button's prop: without this line a VInputGroup would resize them to its own
  // height, which only shows once the panel is open and nothing in the sheet or the template
  // would say why. It is the JS counterpart of the `.v-overlay` guard every VButtonGroup
  // selector carries — a floating panel is not a segment of the row that opened it.
  provide(buttonGroupKey, NO_BUTTON_GROUP)

  function openPanel(moveFocus = !openOnFocus()) {
    if (options.disabled() || open.value) return
    options.onOpen?.()
    options.panelRef.value?.show()
    // @a11y
    // A `manual` popover moves focus nowhere, so it is moved by hand — a frame later,
    // the panel not being painted yet, and nothing invisible can take focus.
    if (moveFocus) requestAnimationFrame(() => options.focusInPanel())
  }

  /** Closes the panel and leaves the focus where it is: the focus has already gone elsewhere. */
  function closePanel() {
    if (!open.value) return
    options.panelRef.value?.close()
    options.onClose?.()
  }

  // @a11y
  /*
   * TRAP — handing the focus back to the field is what makes a field that opens ON FOCUS
   * reopen the panel that was just closed: the two would chase each other and the panel
   * would never close. The lock covers the focus call, which is synchronous.
   *
   * EVERY focus this shell or a component gives the field must go through `focusField`,
   * `closeAndFocus` included. Focusing the field directly brings the loop straight back.
   */
  let refocusing = false

  /**
   * Puts the focus on the field without opening the panel.
   *
   * A component emptying its value calls it BEFORE the field focuses itself, and that order
   * is the point: focusing an element that already has the focus emits no event at all, so
   * the field's own call that follows is inert and the panel stays shut.
   */
  function focusField() {
    refocusing = true
    options.field.value?.focus()
    refocusing = false
  }

  /** Closes the panel and hands the focus back to the field, under the lock above. */
  function closeAndFocus() {
    if (!open.value) return
    closePanel()
    focusField()
  }

  /** The field's focus handler: opens the panel on a field that asks for it. */
  function onFieldFocus() {
    if (refocusing || !openOnFocus()) return
    openPanel(false)
  }

  /**
   * The icon at the end of the field. Clicking it is an explicit request for the panel, and
   * the focus has already left the field for the button — so carrying it into the panel is
   * right whatever `openOnFocus` says.
   */
  function toggleFromIcon() {
    if (open.value) closeAndFocus()
    else openPanel(true)
  }

  function onControlClick(event: MouseEvent) {
    // A click on one of the field's own buttons is that button's business: reacting here
    // too would open the panel the clear cross has just given a reason to close.
    if ((event.target as HTMLElement).closest('.v-input-action')) return
    openPanel()
  }

  // @a11y
  const onFocusout = useFocusoutDismiss(options.rootEl, closePanel)

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
        closeAndFocus()
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
      // Opened from the KEYBOARD the panel always takes focus, whatever `openOnFocus` says:
      // otherwise ArrowDown opens a panel the keyboard cannot reach.
      openPanel(true)
    }
  }

  return {
    open,
    panelId,
    openPanel,
    closePanel,
    closeAndFocus,
    focusField,
    onFieldFocus,
    toggleFromIcon,
    onControlClick,
    onFocusout,
    onKeydown,
    onPanelMousedown,
  }
}
