import { computed, onBeforeUnmount, provide, ref, useId, watch } from 'vue'
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
  /** Moves the focus INTO the open panel: where in it is the component's business. */
  focusInPanel: () => void
  /** What the component needs to do as the panel opens: prepare a draft, reset a step. */
  onOpen?: () => void
  /** What it needs to do as the panel closes: clear an announcement, for instance. */
  onClose?: () => void
  /** Whether focusing the field opens the panel. It does not by default. */
  openOnFocus?: () => boolean
}

// @a11y @keyboard @core
/**
 * The panel is written imperatively and read back by model. Bind `open` as `v-model:open` so
 * the DOM feeds it, but the write must stay synchronous: the `rAF` that moves focus assumes the
 * panel is already open when it is armed, and the model would put a tick in between.
 */
export function useFieldPanel(options: UseFieldPanelOptions) {
  const open = ref(false)
  const openOnFocus = () => options.openOnFocus?.() ?? false

  /** The id the panel carries, for the field's `aria-controls`. */
  const panelId = useId()

  // @core
  // Stop row contexts at the field boundary so the picker keeps its own button sizes instead of
  // inheriting the enclosing input group's shape.
  provide(buttonGroupKey, NO_BUTTON_GROUP)

  /*
   * The frame the focus is moved in, kept so it can be called off. A panel closed inside that
   * frame (Escape at once, the field disabled, a consumer closing it) would otherwise have the
   * focus pulled into it once shut, taken from the field it had just been handed back to.
   */
  let focusFrame = 0

  function cancelFocusFrame() {
    if (focusFrame) cancelAnimationFrame(focusFrame)
    focusFrame = 0
  }

  function openPanel(moveFocus = !openOnFocus()) {
    if (options.disabled() || open.value) return
    options.onOpen?.()
    options.panelRef.value?.show()
    // @a11y
    // A `manual` popover moves focus nowhere, so it is moved by hand; a frame later, the panel
    // not being painted yet, and nothing invisible can take focus.
    if (moveFocus) {
      cancelFocusFrame()
      focusFrame = requestAnimationFrame(() => {
        focusFrame = 0
        options.focusInPanel()
      })
    }
  }

  /** Closes the panel and leaves the focus where it is: the focus has already gone elsewhere. */
  function closePanel() {
    cancelFocusFrame()
    if (!open.value) return
    options.panelRef.value?.close()
    options.onClose?.()
  }

  onBeforeUnmount(cancelFocusFrame)

  // @core
  // A panel refused WHILE it is open (the field turned read-only or disabled, the picker
  // switched off) is unmounted by its `v-if`, and an unmounted popover sends no `toggle` to
  // bring `open` back down. The model then stays true, and the next time the panel is mounted
  // VPopover's mount replay shows it again with nobody having asked.
  watch(options.disabled, (refused) => {
    if (!refused || !open.value) return
    closePanel()
    open.value = false
  })

  // @a11y
  /*
   * Handing the focus back to the field is what makes a field that opens on FOCUS reopen the
   * panel that was just closed: the two would chase each other and the panel would never close.
   * The lock covers the focus call, which is synchronous.
   */
  let refocusing = false

  /** Puts the focus on the field without opening the panel. */
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

  /** The icon at the end of the field. */
  function toggleFromIcon() {
    if (open.value) closeAndFocus()
    else openPanel(true)
  }

  /**
   * Whether an event started on one of the controls the field holds: the clear cross, the AM/PM
   * word, a clickable icon, or a button of the consumer's own in a slot.
   */
  const fromOwnControl = (event: Event) =>
    !!(event.target as HTMLElement | null)?.closest?.('button, a[href]')

  function onControlClick(event: MouseEvent) {
    if (fromOwnControl(event)) return
    openPanel()
  }

  // @a11y
  const onFocusout = useFocusoutDismiss(options.rootEl, closePanel)

  // @a11y
  /*
   * Clicking a non-focusable pixel of the panel (padding, the gutter between cells) hands focus
   * back to `<body>`. `onFocusout` above then fires with a null `relatedTarget`, reads it as an
   * exit; rightly; and closes a panel the reader has just clicked.
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
    // A key already consumed INSIDE the panel is ignored. An Enter that selected a day has just
    // CLOSED the panel, and without the guard would reopen it as it bubbles.
    if (
      (event.key === 'ArrowDown' || event.key === 'Enter') &&
      !open.value &&
      !event.defaultPrevented &&
      !fromOwnControl(event)
    ) {
      event.preventDefault()
      // Opened from the KEYBOARD the panel always takes focus, whatever `openOnFocus` says:
      // otherwise ArrowDown opens a panel the keyboard cannot reach.
      openPanel(true)
    }
  }

  // @a11y
  /**
   * The field's attributes with the popup wiring spread over them, which makes the field the
   * combobox the pattern calls for. Spread rather than bound after `v-bind`, where a binding wins
   * even when `undefined`: without a panel the wiring adds no key and the consumer's own `role`
   * or `aria-controls` stays.
   */
  function popupAttrs(base: () => Record<string, unknown>, hasPanel: () => boolean) {
    return computed(() =>
      hasPanel()
        ? {
            ...base(),
            role: 'combobox',
            'aria-haspopup': 'dialog',
            'aria-expanded': open.value,
            'aria-controls': panelId,
          }
        : base(),
    )
  }

  return {
    open,
    panelId,
    popupAttrs,
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
