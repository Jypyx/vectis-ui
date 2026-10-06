<script setup lang="ts">
// @a11y @keyboard @core
/**
 * The native `contextmenu` event covers the right click, the long press on Android and the
 * Menu key. JavaScript places a zero-size anchor at the pointer so CSS anchoring can position
 * the panel and flip it near the viewport edges, and adds Shift+F10 where the platform lacks it.
 */

import { computed, provide, ref, shallowRef, useId } from 'vue'

import VMenuPanel from '../VMenu/VMenuPanel.vue'
import { menuAnchor, menuKey } from '../VMenu/context'
import type { MenuSize } from '../VMenu/context'
import { usePopoverModel } from '../../composables/usePopover'
import { isRtl } from '../../utils/direction'

interface ContextMenuProps {
  /** The element wrapping the zone. Any element able to hold the default slot's content. */
  as?: string
  /** How tall the rows are: 32, 40 or 48 pixels. Submenus inherit it. */
  size?: MenuSize
  /** Takes 4px off the height of every row, submenus included. */
  compact?: boolean
  /**
   * A width for the panel: a number is read as pixels, a string as any CSS length or
   * keyword. Submenus keep the default width.
   */
  width?: number | string
  /** Leaves the zone to the browser's own context menu. */
  disabled?: boolean
}

// The attributes belong on the zone, the one element of the three this component renders that
// the consumer sees.
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<ContextMenuProps>(), {
  as: 'div',
  size: 'sm',
  compact: false,
  width: undefined,
  disabled: false,
})

/**
 * Whether the menu is showing. The browser's own dismissal (a click outside, Escape,
 * choosing a command) writes back to it. Opened from the model, the menu appears under
 * the focused element of the zone, or under the zone itself.
 */
const open = defineModel<boolean>('open', { default: false })

defineSlots<{
  /** The zone the menu belongs to. */
  default(): unknown
  /**
   * The contents of the menu: VMenuItem, VMenuGroup and VMenuSeparator. `target` is the
   * element the menu was opened on, so one menu can serve every item of a list.
   */
  menu(props: { target: Element | null }): unknown
}>()

const zoneEl = ref<HTMLElement | null>(null)
const anchorEl = ref<HTMLElement | null>(null)
const panelRef = ref<InstanceType<typeof VMenuPanel> | null>(null)
const menuId = useId()
const anchor = menuAnchor(menuId)

/** The element the menu was opened on, handed to the `menu` slot. */
const target = shallowRef<Element | null>(null)

/** Where the focus goes back when the menu closes. */
let returnFocus: HTMLElement | null = null
let fromKeyboard = false

provide(menuKey, { closeAll: () => panelRef.value?.close() })

/** Moves the invisible anchor the panel is positioned against. */
function placeAnchor(x: number, y: number) {
  const el = anchorEl.value
  if (!el) return
  el.style.left = `${x}px`
  el.style.top = `${y}px`
}

/**
 * Puts the anchor under an element's start edge, kept inside the viewport so a zone taller
 * than the screen still opens a visible menu.
 */
function placeUnder(el: Element) {
  const rect = el.getBoundingClientRect()
  const x = isRtl(el) ? rect.right : rect.left
  const y = Math.min(Math.max(rect.bottom, 0), window.innerHeight)
  placeAnchor(Math.min(Math.max(x, 0), window.innerWidth), y)
}

function openMenu(on: Element | null, keyboard: boolean) {
  const panel = panelRef.value
  if (!panel) return
  target.value = on
  fromKeyboard = keyboard
  // Reopening at another spot must not take the focus inside the old panel as the place to
  // return to.
  const active = document.activeElement
  if (!panel.el?.contains(active)) {
    returnFocus = active instanceof HTMLElement && active !== document.body ? active : null
  }
  if (panel.shown) panel.close()
  panel.show()
}

/** The element of the zone holding the focus, or the zone itself. */
function focusedInZone(): Element | null {
  const active = document.activeElement
  return active && zoneEl.value?.contains(active) ? active : zoneEl.value
}

// @keyboard
// Keyboard openings carry no pointer position: the spec gives them an empty pointer type. Where
// `contextmenu` is still a plain MouseEvent, no button is pressed or released for them; a
// Control-click on macOS holds the primary button down.
function isKeyboardEvent(event: MouseEvent): boolean {
  if ('pointerType' in event) return (event as PointerEvent).pointerType === ''
  return event.button !== 2 && event.buttons === 0
}

function onContextmenu(event: MouseEvent) {
  // A nested context menu, or the consumer's own handler, already answered this event.
  if (props.disabled || event.defaultPrevented) return
  const keyboard = isKeyboardEvent(event)
  // Shift is the way through to the browser's own menu, as Firefox already does by itself.
  if (event.shiftKey && !keyboard) return
  event.preventDefault()
  // Shift+F10 also fires a native `contextmenu` on some platforms, after the keydown below
  // has already opened the menu.
  if (keyboard && panelRef.value?.shown) return
  const on = event.target instanceof Element ? event.target : zoneEl.value
  if (keyboard) {
    if (on) placeUnder(on)
    openMenu(on, true)
    return
  }
  placeAnchor(event.clientX, event.clientY)
  // @core
  // macOS and Linux fire the event on the press, not the release. An auto popover opened while
  // the button is still down is dismissed by that release, so the opening waits until the
  // release has been dispatched.
  const pointer = (event as Partial<PointerEvent>).pointerType
  if (event.buttons !== 0 && pointer !== 'touch') {
    const release = () => {
      window.removeEventListener('pointerup', release, true)
      window.removeEventListener('pointercancel', release, true)
      setTimeout(() => openMenu(on, false))
    }
    window.addEventListener('pointerup', release, true)
    window.addEventListener('pointercancel', release, true)
    return
  }
  openMenu(on, false)
}

// @keyboard
// Windows and Linux turn Shift+F10 into a `contextmenu` event by themselves; macOS does not.
function onKeydown(event: KeyboardEvent) {
  if (props.disabled || event.defaultPrevented) return
  if (event.key !== 'F10' || !event.shiftKey || event.altKey || event.ctrlKey || event.metaKey)
    return
  event.preventDefault()
  const on = focusedInZone()
  if (on) placeUnder(on)
  openMenu(on, true)
}

// @a11y
// The keyboard lands on the first command, the pointer on the panel itself, as in VMenu. On
// closing, the focus returns where it was unless it has deliberately moved elsewhere.
function onToggle(value: boolean) {
  open.value = value
  if (value) {
    if (fromKeyboard) panelRef.value?.focusFirst()
    else panelRef.value?.focusPanel()
    return
  }
  const active = document.activeElement
  if (!active || active === document.body || panelRef.value?.el?.contains(active)) {
    if (returnFocus?.isConnected) returnFocus.focus()
  }
}

/** Opening from the model or from code without an event. */
function showFromCode() {
  const on = focusedInZone()
  if (on) placeUnder(on)
  openMenu(on, false)
}

usePopoverModel(
  open,
  () => panelRef.value?.shown ?? false,
  showFromCode,
  () => panelRef.value?.close(),
)

defineExpose({
  /**
   * Opens the menu. Given a mouse event, it opens at the pointer on the event's target;
   * otherwise under the focused element of the zone.
   */
  show(event?: MouseEvent) {
    if (!event) return showFromCode()
    placeAnchor(event.clientX, event.clientY)
    openMenu(event.target instanceof Element ? event.target : zoneEl.value, false)
  },
  /** Closes the menu, submenus included. */
  close: () => panelRef.value?.close(),
  /** The panel element. */
  el: computed(() => panelRef.value?.el ?? null),
})
</script>

<template>
  <component
    :is="as"
    ref="zoneEl"
    v-bind="$attrs"
    class="v-context-menu"
    @contextmenu="onContextmenu"
    @keydown="onKeydown"
  >
    <slot />
  </component>
  <span
    ref="anchorEl"
    class="v-context-menu-anchor"
    aria-hidden="true"
    :style="{ 'anchor-name': anchor }"
  />
  <!-- The browser's menu is kept off the panel: a context menu opened on top of this one
       would hide it, and a keyboard opening that already moved the focus inside must not be
       answered by the browser too -->
  <VMenuPanel
    :id="menuId"
    ref="panelRef"
    class="v-context-menu-panel"
    placement="bottom-start"
    :anchor="anchor"
    :size="size"
    :compact="compact"
    :width="width"
    @toggle="onToggle"
    @contextmenu.prevent
  >
    <slot name="menu" :target="target" />
  </VMenuPanel>
</template>

<style>
@layer vectis.components {
  /* A point, not a box: the panel's corner sits on it. */
  .v-context-menu-anchor {
    /* Physical, like the pointer coordinates written into it. */
    position: fixed;
    top: 0;
    left: 0;
    inline-size: 0;
    block-size: 0;
    pointer-events: none;
  }

  /*
   * Native context menus open against the pointer, with no gap. The gutter on the opposite side
   * stays, so a flipped panel keeps its distance from the viewport edge.
   */
  .v-context-menu-panel.v-floating {
    margin-block-start: 0;
    /* A pointer can sit in a corner of the viewport, where both directions must flip at once. */
    position-try-fallbacks:
      flip-block,
      flip-inline,
      flip-block flip-inline;
  }
}
</style>
