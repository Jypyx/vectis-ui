<script setup lang="ts">
import { computed, onMounted, provide, ref, useId, watch } from 'vue'

import VMenuPanel from './VMenuPanel.vue'
import { menuInvoker, menuKey } from './context'
import type { MenuPlacement } from './context'
import { isKeyboardFocus } from '../../utils/focus'

// @a11y @core
/**
 * A menu of actions, opened by a button and closed as soon as one is chosen. It
 * follows the ARIA menu pattern, which is what tells a screen reader that these are
 * commands rather than links or options in a list.
 *
 * It rests on the browser's own popover support: the panel closes on a click outside
 * or on Escape without a line of code, and it positions itself in CSS against the
 * button that opened it — the browser knows which one, since that button names the
 * panel it opens.
 *
 * The JavaScript here is limited to what the platform does not do: keeping
 * `v-model:open` and the browser's own state in step, moving the focus into the panel
 * when it opens, and giving it back to the trigger when it closes. The keyboard inside
 * the panel — the arrows moving from one command to the next — lives in VMenuPanel.
 *
 * How far the focus goes in depends on how the menu was opened. Opened from the
 * keyboard it settles on the first command, ready to be chosen; opened with a mouse or
 * a finger it stops at the panel, so that nothing is picked out for someone who has
 * not asked for a choice yet — the arrows still enter the list from there.
 */
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
  size?: 'sm' | 'md' | 'lg'
  /** Takes 4px off the height of every row, submenus included. */
  compact?: boolean
  /**
   * A width for the panel, given as any CSS length or keyword — `16rem`,
   * `max-content`. It applies to the menu itself; submenus keep the default width.
   */
  width?: string
  /**
   * Stops the panel from being narrower than the button that opened it, while leaving
   * it free to grow wider for its content. Submenus are unaffected.
   */
  matchTrigger?: boolean
}

// Deliberately not assigned to a variable: the template reads the props directly.
withDefaults(defineProps<MenuProps>(), {
  placement: 'bottom-start',
  size: 'sm',
  compact: false,
  width: undefined,
  matchTrigger: false,
})

const open = defineModel<boolean>('open', { default: false })

/**
 * What the trigger has to carry: the link to the panel it opens, and the two
 * attributes telling assistive technology that a menu is attached to this button and
 * whether it is currently open.
 */
type MenuTriggerProps = {
  popovertarget: string
  'aria-haspopup': 'menu'
  'aria-expanded': boolean
  'aria-controls': string
}

defineSlots<{
  /**
   * The button that opens the menu. Bind the `triggerProps` it receives onto it —
   * that is what wires the two together.
   */
  trigger(props: { triggerProps: MenuTriggerProps }): unknown
  /** The contents of the menu: VMenuItem, VMenuGroup and VMenuSeparator. */
  default(): unknown
}>()

const panelRef = ref<InstanceType<typeof VMenuPanel> | null>(null)
const menuId = useId()
const shown = ref(false)

const triggerProps = computed<MenuTriggerProps>(() => ({
  popovertarget: menuId,
  'aria-haspopup': 'menu',
  'aria-expanded': open.value,
  'aria-controls': menuId,
}))

// Closing this panel closes every submenu with it: they are rendered inside it, and
// the browser closes a stack of popovers from the outside in.
provide(menuKey, { closeAll: () => panelRef.value?.hide() })

// @a11y — the focus half of the bridge: into the panel when it opens, back to the
// trigger when it closes. Keeping the state in step alone would leave a keyboard user
// stranded at the top of the page every time a menu opened or closed.
//
// WHERE it lands in the panel is the whole question, and the browser is the one that
// answers it. In a menu the focus IS the highlight (see the rule in VMenuItem), so
// taking the first item singles out a command — which is what someone arriving on the
// arrows wants, and what someone who has just clicked never asked for. `:focus-visible`
// is exactly that distinction, read off whatever holds the focus at this instant: the
// trigger, since opening a popover through `popovertarget` does not move the focus.
//
// The pointer branch focuses the PANEL rather than nothing at all, and that is
// structural: every key the menu answers to is listened for on the panel element, so
// focus left outside it — on a trigger that is a DOM sibling — would silence the arrows,
// Home/End and the Tab that closes the menu. Both ways of being wrong are mild and
// symmetric: a misread pointer costs one extra keystroke, a misread keyboard gives back
// the older behaviour.
function onToggle(value: boolean) {
  shown.value = value
  open.value = value
  if (value) {
    if (isKeyboardFocus(document.activeElement)) panelRef.value?.focusFirst()
    else panelRef.value?.focusPanel()
  } else {
    // The browser's own dismissal — a click outside, Escape — leaves the focus
    // nowhere, on the page body. Only then is it handed back to the trigger: if the
    // focus has already moved somewhere else deliberately, it must be left alone.
    const active = document.activeElement
    if (!active || active === document.body || panelRef.value?.el?.contains(active)) {
      menuInvoker(menuId)?.focus()
    }
  }
}

// Opening and closing from the model. The guard is what keeps the two directions from
// chasing each other: a menu the browser has just closed already reports it here.
watch(open, (value) => {
  if (value === shown.value) return
  if (value) panelRef.value?.show()
  else panelRef.value?.hide()
})

// @ssr — a watcher does not run during the server render, so a menu asked to be open
// from the start would never be told to open. Replaying the initial state on mount is
// what covers that case.
onMounted(() => {
  if (open.value) panelRef.value?.show()
})
</script>

<template>
  <slot name="trigger" :trigger-props="triggerProps" />
  <VMenuPanel
    :id="menuId"
    ref="panelRef"
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
