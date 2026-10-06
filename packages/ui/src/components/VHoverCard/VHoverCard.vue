<script setup lang="ts">
/**
 * A manual popover driven by hover and keyboard focus: no stable HTML primitive opens a panel
 * with a delay, as `popover="hint"` and interest invokers are missing at the browser floor.
 * Manual mode also leaves any open menu or popover untouched.
 */

import { onBeforeUnmount, ref, useId } from 'vue'

import { usePopover, usePopoverModel } from '../../composables/usePopover'
import { useTimer } from '../../composables/useTimer'
import { isKeyboardFocus } from '../../utils/focus'

/** Which side of the trigger the card appears on. */
export type HoverCardPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'

/** What the trigger has to carry: the link to the card holding its details. */
export type HoverCardTriggerProps = {
  'aria-details': string
}

interface HoverCardProps {
  /**
   * Which side of the trigger the card appears on. The browser flips it to the opposite side by
   * itself when there is not enough room.
   */
  placement?: HoverCardPlacement
  /**
   * How long the pointer or the keyboard focus must rest on the trigger before the card opens,
   * in milliseconds.
   */
  openDelay?: number
  /**
   * How long the card stays once the pointer has left both the trigger and the card, in
   * milliseconds. It is the time to cross the gap between them.
   */
  closeDelay?: number
}

const props = withDefaults(defineProps<HoverCardProps>(), {
  placement: 'bottom',
  openDelay: 500,
  closeDelay: 300,
})

/** Whether the card is showing. Setting it opens or closes the card without any delay. */
const open = defineModel<boolean>('open', { default: false })

defineSlots<{
  /** The trigger, usually a link. Bind the `triggerProps` it receives onto it. */
  default(props: { triggerProps: HoverCardTriggerProps }): unknown
  /** What the card contains. It may hold links and buttons, and is rendered on first opening. */
  content?(): unknown
}>()

const cardId = useId()
const rootEl = ref<HTMLElement | null>(null)
const panelEl = ref<HTMLElement | null>(null)
const { shown, syncShown, show: showPanel, hide: hidePanel } = usePopover(panelEl)

// @ssr
/*
 * The card is a `<span>` and its content mounts on first opening, so a trigger inside a
 * paragraph still produces valid server HTML: the parser closes a `<p>` at the first `<div>` or
 * `<p>` it meets, which would break hydration. The content then stays for the exit transition.
 */
const rendered = ref(false)

const timer = useTimer()

let hovered = false
let focused = false
// Set while the card hands the focus back to its trigger, whose keyboard focus would reopen it.
let returningFocus = false

const inCard = (node: EventTarget | null) => !!panelEl.value?.contains(node as Node | null)

function trigger() {
  return rootEl.value?.querySelector<HTMLElement>(`[aria-details="${cardId}"]`) ?? null
}

// @core
function show(immediate = false) {
  if (shown.value) {
    timer.cancel()
    return
  }
  // A delay of 0 runs the callback synchronously; the convention useTimer documents.
  timer.start(showPanel, immediate ? 0 : props.openDelay)
}

// @a11y
/*
 * The trigger takes the focus back before the card hides. Left inside, the focus would follow
 * the browser's own restoration, which returns it to whatever held it when the card OPENED: for
 * a card opened by hover, an unrelated control elsewhere on the page.
 */
function returnFocus() {
  if (!inCard(document.activeElement)) return
  returningFocus = true
  trigger()?.focus()
  returningFocus = false
}

function hide() {
  timer.cancel()
  returnFocus()
  hidePanel()
}

// @a11y
// There is no hover on a touch screen: a tap keeps its usual meaning and opens nothing, so
// whatever the card shows must also be reachable through the trigger's destination.
function onPointerEnter(event: PointerEvent) {
  if (event.pointerType === 'touch') return
  hovered = true
  show()
}

function onPointerLeave(event: PointerEvent) {
  if (event.pointerType === 'touch') return
  hovered = false
  if (!focused) timer.start(hide, props.closeDelay)
}

/*
 * Pressing the trigger closes the card so it cannot stand over a dialog or a page the trigger
 * opens. A press inside the card is a use of its content and keeps it.
 */
function onPointerDown(event: PointerEvent) {
  if (inCard(event.target)) return
  hovered = false
  focused = false
  hide()
}

// @a11y
/*
 * Only the KEYBOARD focus opens the card from the trigger, read from `:focus-visible` as VTooltip
 * does: a focus given by a click opens nothing. Any focus inside the card keeps it, since a
 * click on one of its controls is still a use of it.
 */
function onFocusIn(event: FocusEvent) {
  if (returningFocus) return
  if (inCard(event.target)) {
    focused = true
    timer.cancel()
    return
  }
  if (!isKeyboardFocus(event.target)) return
  focused = true
  show()
}

function onFocusOut(event: FocusEvent) {
  if (rootEl.value?.contains(event.relatedTarget as Node | null)) return
  focused = false
  if (!hovered) hide()
}

// @keyboard @a11y
/*
 * Escape dismisses the card from anywhere on the page (WCAG 1.4.13), since a hovered card rarely
 * holds the focus. The key is spent on it so an enclosing VDialog does not close as well.
 */
function onDocumentKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || event.defaultPrevented) return
  event.preventDefault()
  hovered = false
  focused = false
  hide()
}

function listen(value: boolean) {
  if (value) document.addEventListener('keydown', onDocumentKeydown)
  else document.removeEventListener('keydown', onDocumentKeydown)
}

function onBeforeToggle(event: Event) {
  syncShown(event)
  if (shown.value) rendered.value = true
}

// The toggle event is synchronous, so Escape works from the moment the card shows.
function onToggle(event: Event) {
  onBeforeToggle(event)
  open.value = shown.value
  listen(shown.value)
}

// A model closing the card goes through `hide`, which hands a focus inside it back as well.
usePopoverModel(open, () => shown.value, showPanel, hide)
onBeforeUnmount(() => listen(false))

defineExpose({
  /** Opens the card at once, without the delay. */
  show: () => show(true),
  /** Closes the card, handing a focus inside it back to the trigger. */
  close: hide,
  /** The card element. */
  el: panelEl,
})
</script>

<template>
  <span
    ref="rootEl"
    class="v-hover-card"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @pointerdown="onPointerDown"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <slot :trigger-props="{ 'aria-details': cardId }" />
    <!--
      The card follows the trigger in the DOM, so Tab moves from the trigger into the card's
      content while it shows.
    -->
    <span
      :id="cardId"
      ref="panelEl"
      popover="manual"
      class="v-overlay v-floating v-panel v-hover-card-panel"
      :data-placement="placement"
      @beforetoggle="onBeforeToggle"
      @toggle="onToggle"
    >
      <slot v-if="rendered" name="content" />
    </span>
  </span>
</template>

<style>
@layer vectis.components {
  .v-hover-card {
    display: inline-flex;
    align-items: center;
    anchor-name: --hover-card-anchor;
    /*
     * A visible card sits in the top layer, which anchor resolution treats as following the
     * whole document: without the scope, every card would attach to the last wrapper.
     */
    anchor-scope: --hover-card-anchor;
  }

  /*
   * Compound with `.v-panel` so the card's spacing outranks the shared panel chrome whatever
   * order the stylesheets load in.
   */
  .v-panel.v-hover-card-panel {
    position-anchor: --hover-card-anchor;
    gap: var(--vectis-space-2);
    padding: var(--vectis-space-4);
    inline-size: max-content;
    max-inline-size: min(
      var(--vectis-control-size-hover-card-max),
      calc(100dvi - var(--vectis-space-8))
    );
    font-size: var(--vectis-text-body-md-size);
    font-weight: var(--vectis-text-body-md-weight);
    line-height: var(--vectis-text-body-md-leading);
    text-align: start;
    white-space: normal;
  }
}
</style>
