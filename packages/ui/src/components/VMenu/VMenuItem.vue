<script setup lang="ts">
import { computed, inject, ref, useId, useSlots } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import VMenuPanel from './VMenuPanel.vue'
import { menuKey, SUBMENU_HOVER_DELAY } from './context'

import { useTimer } from '../../composables/useTimer'

/**
 * One command in a menu. The panel is what moves the focus between items, and
 * choosing one closes the whole menu, submenus included.
 *
 * Given an `href` the item becomes a link. A link has no `disabled` attribute of its
 * own, so a disabled one is made inert by hand: its address is removed, and
 * `aria-disabled` tells assistive technology why it no longer responds.
 *
 * Given the `#submenu` slot it becomes the trigger of a nested panel, which is
 * rendered INSIDE the parent one. That nesting is what buys the whole submenu
 * behaviour from the browser: the panels form a stack, clicking outside closes all of
 * them, and opening one branch closes its sibling.
 *
 * The JavaScript is limited to the two ways of opening a submenu the browser does not
 * cover: the keyboard, and hovering long enough to show it was meant. A click already
 * opens it natively.
 */
interface MenuItemProps {
  /** What the command says. The default slot replaces it. */
  label?: string
  /** A second line under the label, for a shortcut or a short explanation. */
  sublabel?: string
  /**
   * An icon before the label: an icon name, an image address, or an explicit render.
   * The `#start` slot replaces it.
   */
  iconStart?: IconSource
  /** An icon after the label, in the same forms. The `#end` slot replaces it. */
  iconEnd?: IconSource
  /**
   * Marks this item as the one currently in effect — the chosen sort order, the
   * active view. It is coloured and announced as such.
   */
  selected?: boolean
  /**
   * Marks the command as destructive, which colours it accordingly. Deleting
   * something belongs here.
   */
  danger?: boolean
  /** Makes the item unusable: it no longer responds and the arrows skip over it. */
  disabled?: boolean
  /**
   * Turns the item into a link pointing at this address, for a menu that navigates
   * rather than acts. A disabled link is made inert by hand.
   */
  href?: string
}

// With a submenu this component renders two elements — the item and the nested panel
// — so there is no single root for Vue to put the consumer's attributes on. They are
// placed on the item explicitly.
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<MenuItemProps>(), {
  label: undefined,
  sublabel: undefined,
  iconStart: undefined,
  iconEnd: undefined,
  selected: false,
  danger: false,
  disabled: false,
  href: undefined,
})

const emit = defineEmits<{
  /**
   * The command was chosen, by click or by keyboard. It is emitted before the menu
   * closes, so the handler runs while the menu is still open.
   */
  select: []
}>()

defineSlots<{
  /** The label, replacing the `label` prop. */
  default?(): unknown
  /** The second line, replacing the `sublabel` prop. */
  sublabel?(): unknown
  /** Free content before the label, which takes the place of `iconStart`. */
  start?(): unknown
  /** Free content after the label, which takes the place of `iconEnd`. */
  end?(): unknown
  /**
   * The contents of a submenu — items, groups and separators, this component
   * included, so menus may nest as deep as needed.
   */
  submenu?(): unknown
}>()

const slots = useSlots()
const hasSubmenu = computed(() => !!slots.submenu)
const tag = computed(() =>
  !hasSubmenu.value && props.href !== undefined ? ('a' as const) : ('button' as const),
)

const menu = inject(menuKey, null)

function onClick() {
  if (props.disabled || hasSubmenu.value) return
  emit('select')
  menu?.closeAll()
}

const subId = useId()
const subOpen = ref(false)
const subPanel = ref<InstanceType<typeof VMenuPanel> | null>(null)
// TRAP — when a submenu is opened from code rather than by a click, the item must be
// handed to the browser as the source of that opening. The implicit anchor is only
// established natively, on click; without it the panel has nothing to position itself
// against and lands at the corner of the viewport, with no error anywhere.
const itemEl = ref<HTMLElement | null>(null)

// @keyboard
// Opening a submenu from the keyboard, which the browser's own toggle does not cover
// — it only reacts to a click.
function onKeydown(event: KeyboardEvent) {
  if (!hasSubmenu.value || props.disabled) return
  if (!['ArrowRight', 'Enter', ' '].includes(event.key)) return
  // The button's native activation has to be stopped: it would fire a click of its
  // own, and that click would toggle the panel shut again right behind the opening
  // below.
  event.preventDefault()
  subPanel.value?.show(itemEl.value ?? undefined)
  subPanel.value?.focusFirst()
}

// A submenu opens on hover, but only once the pointer has stayed long enough to show
// it was meant — otherwise every panel crossed on the way to another one would flash
// open. ONE timer serves both directions, since opening and closing are mutually
// exclusive: arming either always cancels the other.
const hoverTimer = useTimer()

// @a11y @core
function onPointerEnter() {
  if (props.disabled) return
  // Hovering also moves the focus, so that the mouse and the keyboard never highlight
  // two different items at once — in a menu there is only ever one current item.
  itemEl.value?.focus({ preventScroll: true })
  if (!hasSubmenu.value) return
  hoverTimer.start(() => subPanel.value?.show(itemEl.value ?? undefined), SUBMENU_HOVER_DELAY)
}

// @a11y @core — the test on where the focus currently is, is the accessibility half:
// a pointer drifting off the item must not close a submenu a keyboard user is
// standing inside.
function onPointerLeave() {
  if (!hasSubmenu.value) return
  hoverTimer.start(() => {
    if (subPanel.value?.el?.contains(document.activeElement)) return
    subPanel.value?.hide()
  }, SUBMENU_HOVER_DELAY)
}
</script>

<template>
  <component
    :is="tag"
    ref="itemEl"
    v-bind="$attrs"
    role="menuitem"
    tabindex="-1"
    class="v-menu-item"
    :type="tag === 'button' ? 'button' : undefined"
    :disabled="tag === 'button' ? disabled : undefined"
    :href="tag === 'a' && !disabled ? href : undefined"
    :aria-disabled="tag === 'a' && disabled ? 'true' : undefined"
    :data-danger="danger ? '' : undefined"
    :data-selected="selected ? '' : undefined"
    :aria-current="selected ? 'true' : undefined"
    :aria-haspopup="hasSubmenu ? 'menu' : undefined"
    :aria-expanded="hasSubmenu ? subOpen : undefined"
    :aria-controls="hasSubmenu ? subId : undefined"
    :popovertarget="hasSubmenu ? subId : undefined"
    @click="onClick"
    @keydown="onKeydown"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
  >
    <slot name="start">
      <VIcon v-if="iconStart" v-bind="iconProps(iconStart)" />
    </slot>
    <span class="v-menu-item-content">
      <span class="v-menu-item-label"
        ><slot>{{ label }}</slot></span
      >
      <span v-if="sublabel !== undefined || $slots.sublabel" class="v-menu-item-sublabel">
        <slot name="sublabel">{{ sublabel }}</slot>
      </span>
    </span>
    <!-- An item opening a submenu always shows the chevron announcing it, and never
         the end icon: the sideways opening is what the reader needs to be told -->
    <VIcon v-if="hasSubmenu" name="chevron_right" class="v-menu-item-chevron" />
    <slot v-else name="end">
      <VIcon v-if="iconEnd" v-bind="iconProps(iconEnd)" />
    </slot>
  </component>
  <VMenuPanel
    v-if="hasSubmenu"
    :id="subId"
    ref="subPanel"
    placement="right-start"
    submenu
    @toggle="subOpen = $event"
    @pointerenter="hoverTimer.cancel()"
    @pointerleave="onPointerLeave"
  >
    <slot name="submenu" />
  </VMenuPanel>
</template>

<style>
@layer vectis.components {
  .v-menu-item {
    /*
     * Every dimension comes from the `--control-*` variables the root panel sets and
     * this row inherits — one size table for the whole design system. The icons follow
     * with nothing written for them, their own variables belonging to that same block.
     *
     * The type is the one composite part: the SIZE comes from the scale, but the line
     * height stays that of body text — a unitless ratio, so it still follows the size
     * — and the weight stays regular. The full `control` type role would mean a medium
     * weight and lines set tight against each other, which suits a single-line label
     * and not a row that may wrap and carry a second line under it.
     */
    display: flex;
    align-items: center;
    gap: var(--control-gap);
    width: 100%;
    min-height: var(--control-height);
    padding: var(--vectis-space-1) var(--control-padding-inline);
    border: none;
    background: transparent;
    color: var(--vectis-color-text);
    border-radius: var(--vectis-radius-sm);
    font-family: inherit;
    font-size: var(--control-font-size);
    line-height: var(--vectis-text-body-md-leading);
    text-align: start;
    text-decoration: none;
    cursor: pointer;
  }

  .v-menu-item-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .v-menu-item-sublabel {
    font-size: var(--vectis-text-caption-size);
    color: var(--vectis-color-text-muted);
  }

  .v-menu-item-chevron {
    color: var(--vectis-color-text-muted);
  }

  .v-menu-item-chevron:dir(rtl) {
    transform: scaleX(-1);
  }

  /* In a menu the focus IS the highlight, so it is drawn on `:focus` and not on
     `:focus-visible`: the focus is moved from code — by the arrows, and by hovering —
     and the browser would not call that a keyboard focus worth showing. */
  .v-menu-item:hover:not(:disabled, [aria-disabled='true']),
  .v-menu-item:focus {
    background: var(--vectis-color-surface-muted);
    outline: none;
  }

  /* While a submenu is open its parent item keeps the highlight, so the path followed
     through the levels stays visible. */
  .v-menu-item[aria-expanded='true'] {
    background: var(--vectis-color-surface-muted);
  }

  .v-menu-item[data-selected] {
    background: var(--vectis-color-accent-surface);
    color: var(--vectis-color-accent-text);
  }

  .v-menu-item[data-selected] .v-menu-item-sublabel {
    color: inherit;
  }

  .v-menu-item[data-selected]:hover:not(:disabled, [aria-disabled='true']),
  .v-menu-item[data-selected]:focus,
  .v-menu-item[data-selected][aria-expanded='true'] {
    /* The selected row is already tinted, so its hover deepens that tint rather than
       replacing it with the neutral highlight. */
    background: color-mix(
      in oklab,
      var(--vectis-color-accent-surface),
      var(--vectis-color-accent-text) 8%
    );
  }

  .v-menu-item[data-danger] {
    color: var(--vectis-color-danger-text);
  }

  .v-menu-item[data-danger] .v-menu-item-sublabel {
    color: inherit;
  }

  .v-menu-item[data-danger]:hover:not(:disabled, [aria-disabled='true']),
  .v-menu-item[data-danger]:focus,
  .v-menu-item[data-danger][aria-expanded='true'] {
    background: var(--vectis-color-danger-surface);
  }

  /* Both forms have to be matched: `:disabled` only ever applies to a `<button>`, and
     an item rendered as a link is made inert through `aria-disabled` instead. */
  .v-menu-item:disabled,
  .v-menu-item[aria-disabled='true'] {
    background: transparent;
    color: var(--vectis-color-text-subtle);
    cursor: not-allowed;
  }

  .v-menu-item:disabled .v-menu-item-sublabel,
  .v-menu-item[aria-disabled='true'] .v-menu-item-sublabel {
    color: inherit;
  }
}
</style>
