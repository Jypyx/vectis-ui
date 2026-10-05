<script setup lang="ts">
// @a11y @core
/**
 * Native auto popovers own light dismissal, and CSS anchoring places them. JavaScript supplies
 * the model bridge and ARIA menu focus management.
 */

import { computed, provide, ref, useId } from 'vue'

import VMenuPanel from './VMenuPanel.vue'
import { menuAnchor, menuInvoker, menuKey } from './context'
import type { MenuPlacement, MenuSize } from './context'
import { usePopoverModel } from '../../composables/usePopover'
import { isKeyboardFocus } from '../../utils/focus'

interface MenuProps {
  /**
   * Where the panel opens relative to its trigger. The browser moves it to another
   * side by itself when there is not enough room.
   */
  placement?: MenuPlacement
  /**
   * How tall the rows are: 32, 40 or 48 pixels. Submenus inherit it, so it is set
   * once on the menu as a whole.
   */
  size?: MenuSize
  /** Takes 4px off the height of every row, submenus included. */
  compact?: boolean
  /**
   * A width for the panel: a number is read as pixels, a string as any CSS length or
   * keyword (`16rem`, `max-content`). It applies to the menu itself; submenus keep the
   * default width.
   */
  width?: number | string
  /**
   * Stops the panel from being narrower than the button that opened it, while leaving
   * it free to grow wider for its content. Submenus are unaffected.
   */
  matchTrigger?: boolean
}

withDefaults(defineProps<MenuProps>(), {
  placement: 'bottom-start',
  size: 'sm',
  compact: false,
  width: undefined,
  matchTrigger: false,
})

/**
 * Whether the menu is showing. It starts closed and is fed BY the panel, so the browser's
 * own dismissal (a click outside, Escape, choosing a command) writes back to it.
 */
const open = defineModel<boolean>('open', { default: false })

/**
 * What the trigger has to carry: the link to the panel it opens, the attributes telling
 * assistive technology that a menu is attached to this button and whether it is currently
 * open, and the anchor name the panel is positioned against.
 */
export type MenuTriggerProps = {
  popovertarget: string
  'aria-haspopup': 'menu'
  'aria-expanded': boolean
  'aria-controls': string
  style: { 'anchor-name': string }
}

defineSlots<{
  /**
   * The button that opens the menu. Bind the `triggerProps` it receives onto it: that
   * is what wires the two together.
   */
  trigger(props: { triggerProps: MenuTriggerProps }): unknown
  /** The contents of the menu: VMenuItem, VMenuGroup and VMenuSeparator. */
  default(): unknown
}>()

const panelRef = ref<InstanceType<typeof VMenuPanel> | null>(null)
const menuId = useId()
const anchor = menuAnchor(menuId)

const triggerProps = computed<MenuTriggerProps>(() => ({
  popovertarget: menuId,
  'aria-haspopup': 'menu',
  'aria-expanded': open.value,
  'aria-controls': menuId,
  style: { 'anchor-name': anchor },
}))

// Closing this panel closes every submenu with it: they are rendered inside it, and
// the browser closes a stack of popovers from the outside in.
provide(menuKey, { closeAll: () => panelRef.value?.close() })

// @a11y
// The focus half of the bridge: into the panel when it opens, back to the trigger when it
// closes. Keeping the state in step alone would leave a keyboard user stranded at the top of
// the page every time a menu opened or closed.
function onToggle(value: boolean) {
  open.value = value
  if (value) {
    if (isKeyboardFocus(document.activeElement)) panelRef.value?.focusFirst()
    else panelRef.value?.focusPanel()
  } else {
    // The browser's own dismissal; a click outside, Escape; leaves the focus nowhere, on the
    // page body. Only then is it handed back to the trigger: if the focus has already moved
    // somewhere else deliberately, it must be left alone.
    const active = document.activeElement
    if (!active || active === document.body || panelRef.value?.el?.contains(active)) {
      menuInvoker(menuId)?.focus()
    }
  }
}

/*
 * The position comes from the trigger's anchor name. Naming the trigger as `source` still gives
 * the opening the same invoker a click would.
 */
function openAtTrigger() {
  panelRef.value?.show(menuInvoker(menuId) ?? undefined)
}

// The open state is the panel's, read back from it rather than copied here: the panel has
// already recorded the browser's answer by the time it reports the toggle.
usePopoverModel(
  open,
  () => panelRef.value?.shown ?? false,
  openAtTrigger,
  () => panelRef.value?.close(),
)

/*
 * Relay the imperative panel API so programmatic opening can move focus immediately without
 * waiting for a model render.
 */
defineExpose({
  /** Opens the menu at once, without waiting for the model to come round. */
  show: openAtTrigger,
  /** Closes it at once, submenus included. */
  close: () => panelRef.value?.close(),
  /** The panel element, for what neither of the two above covers. */
  el: computed(() => panelRef.value?.el ?? null),
})
</script>

<template>
  <slot name="trigger" :trigger-props="triggerProps" />
  <VMenuPanel
    :id="menuId"
    ref="panelRef"
    :anchor="anchor"
    :placement="placement"
    :size="size"
    :compact="compact"
    :width="width"
    :match-trigger="matchTrigger"
    @toggle="onToggle"
  >
    <slot />
  </VMenuPanel>
</template>
