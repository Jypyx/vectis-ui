<script setup lang="ts">
/**
 * One command in a menu. The panel moves the focus between items, and choosing one closes
 * the whole menu, submenus included.
 *
 * With an `href` it becomes a link, made inert through `useInertLink` when disabled: a
 * link has no `disabled` attribute, so the address is removed, `aria-disabled` says why
 * and the consumer's click listeners are dropped (an `<a>` without `href` still clicks).
 *
 * With the `#submenu` slot it becomes the trigger of a nested panel rendered INSIDE the
 * parent one. That nesting is what buys the submenu behaviour from the browser: the panels
 * form a native stack, a click outside closes all of them, and opening one branch closes its
 * sibling.
 *
 * The JS covers only the two openings the browser does not: the keyboard, and a hover held
 * long enough to show it was meant. A click already opens it natively, and ONLY opens it
 * (`popovertargetaction="show"`): the hover has usually opened it a moment before the
 * click lands, and the default toggle would shut what the reader was reaching for.
 */

import { inject, ref, useAttrs, useId } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { useInertLink } from '../../composables/useInertLink'
import { isRtl } from '../../utils/direction'
import { iconProps } from '../VIcon/iconProps'
import { chevron_right as chevronRightIcon } from '../VIcon/icons/chevron_right'
import type { IconSource } from '../VIcon/types'
import VMenuPanel from './VMenuPanel.vue'
import { menuKey, SUBMENU_HOVER_DELAY } from './context'

import { useTimer } from '../../composables/useTimer'

/**
 * What a command means, in colour. It is the subset of VButton's tones a menu row can
 * carry: an ordinary command, or a destructive one.
 */
export type MenuItemTone = 'neutral' | 'danger'

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
   * Marks this item as the one currently in effect: the chosen sort order, the active
   * view. It is coloured and announced as such.
   */
  selected?: boolean
  /**
   * What the command means, in colour. `danger` marks it destructive (deleting something
   * belongs there), and `neutral`, the default, is every other command.
   *
   * A row is an action, so it takes the vocabulary of one: the same word on the same
   * prop as a VButton, rather than a boolean of its own. There is no `accent` here,
   * a menu having no primary command among its rows.
   */
  tone?: MenuItemTone
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
  tone: 'neutral',
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

const slots = defineSlots<{
  /** The label, replacing the `label` prop. */
  default?(): unknown
  /** The second line, replacing the `sublabel` prop. */
  sublabel?(): unknown
  /** Free content before the label, which takes the place of `iconStart`. */
  start?(): unknown
  /** Free content after the label, which takes the place of `iconEnd`. */
  end?(): unknown
  /**
   * The contents of a submenu: items, groups and separators, this component included,
   * so menus may nest as deep as needed.
   */
  submenu?(): unknown
}>()

// TRAP — a function read by the template, never a `computed`: `slots` is not reactive, so a
// computed would keep its first answer while a slot behind a `v-if` comes and goes.
function hasSubmenu() {
  return !!slots.submenu
}
function tag() {
  return !hasSubmenu() && props.href !== undefined ? ('a' as const) : ('button' as const)
}

const attrs = useAttrs()
const link = useInertLink({
  href: () => (hasSubmenu() ? undefined : props.href),
  inert: () => props.disabled,
  attrs: () => attrs,
})

const menu = inject(menuKey, null)

function onClick() {
  if (props.disabled || hasSubmenu()) return
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
  // A key held with a modifier is the browser's: Alt+Right is Forward.
  if (event.altKey || event.ctrlKey || event.metaKey) return
  // @keyboard @a11y
  // A menu item is activated by Space as well as Enter, and a LINK answers Enter alone:
  // Space would scroll the page instead.
  if (!hasSubmenu()) {
    if (event.key === ' ' && tag() === 'a') {
      event.preventDefault()
      itemEl.value?.click()
    }
    return
  }
  if (props.disabled) return
  // The submenu opens towards the end of the line, so the arrow that points at it is the
  // one that opens it: the left one in a right-to-left page.
  const toward = isRtl(itemEl.value) ? 'ArrowLeft' : 'ArrowRight'
  if (![toward, 'Enter', ' '].includes(event.key)) return
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
// TRAP — a TOUCH tap sends `pointerenter` and `pointerleave` before its `click`, so the
// leave below armed the close and the submenu the tap opened shut 150 ms later. Hover
// intent means nothing to a finger: only a pointer that can hover takes this route, the
// tap opening the submenu natively through the click.
function onPointerEnter(event: PointerEvent) {
  if (props.disabled || event.pointerType === 'touch') return
  // Hovering also moves the focus, so that the mouse and the keyboard never highlight
  // two different items at once — in a menu there is only ever one current item.
  itemEl.value?.focus({ preventScroll: true })
  if (!hasSubmenu()) return
  hoverTimer.start(() => subPanel.value?.show(itemEl.value ?? undefined), SUBMENU_HOVER_DELAY)
}

// @a11y @core
// The test on where the focus currently is, is the accessibility half:
// a pointer drifting off the item must not close a submenu a keyboard user is
// standing inside.
function onPointerLeave(event: PointerEvent) {
  if (!hasSubmenu() || event.pointerType === 'touch') return
  hoverTimer.start(() => {
    if (subPanel.value?.el?.contains(document.activeElement)) return
    subPanel.value?.close()
  }, SUBMENU_HOVER_DELAY)
}
</script>

<template>
  <component
    :is="tag()"
    ref="itemEl"
    :aria-disabled="link.isInertLink.value ? 'true' : undefined"
    :aria-current="selected ? 'true' : undefined"
    :aria-haspopup="hasSubmenu() ? 'menu' : undefined"
    :aria-expanded="hasSubmenu() ? subOpen : undefined"
    :aria-controls="hasSubmenu() ? subId : undefined"
    v-bind="link.attrs.value"
    role="menuitem"
    tabindex="-1"
    class="v-menu-item"
    :type="tag() === 'button' ? 'button' : undefined"
    :disabled="tag() === 'button' ? disabled : undefined"
    :href="link.linkHref.value"
    :data-tone="tone"
    :data-selected="selected ? '' : undefined"
    :popovertarget="hasSubmenu() ? subId : undefined"
    :popovertargetaction="hasSubmenu() ? 'show' : undefined"
    @click="onClick"
    @keydown="onKeydown"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
  >
    <slot name="start">
      <VIcon v-if="iconStart" class="v-menu-item-icon" v-bind="iconProps(iconStart)" />
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
    <VIcon v-if="hasSubmenu()" :name="chevronRightIcon" class="v-menu-item-chevron" mirrored />
    <slot v-else name="end">
      <VIcon v-if="iconEnd" v-bind="iconProps(iconEnd)" />
    </slot>
  </component>
  <VMenuPanel
    v-if="hasSubmenu()"
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
     * weight and lines set tight against each other, and a row may carry a second line
     * under its label.
     *
     * The label and that second line TRUNCATE rather than wrap, the VSideNavigationItem
     * recipe: the panel has a ceiling, and a command that grew a line would break the
     * rhythm of the list. `width` on VMenu is the way to give long labels more room.
     *
     * The corner is VSideNavigationItem's: the control radius capped at half a control
     * height, so a pill override paints every row of a menu alike, a row carrying a
     * sublabel included, instead of rounding each one to half of its own height.
     */
    display: flex;
    align-items: center;
    gap: var(--control-gap);
    inline-size: 100%;
    min-block-size: var(--control-height);
    padding-block: var(--vectis-space-1);
    padding-inline: var(--control-padding-inline);
    border: none;
    background: transparent;
    color: var(--vectis-color-text);
    border-radius: min(var(--vectis-radius-interactive), calc(var(--control-height) / 2));
    font-family: inherit;
    font-size: var(--control-font-size);
    line-height: var(--vectis-text-body-md-leading);
    text-align: start;
    text-decoration: none;
    cursor: pointer;
  }

  .v-menu-item-content {
    flex: 1;
    min-inline-size: 0;
    display: flex;
    flex-direction: column;
  }

  .v-menu-item-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .v-menu-item-sublabel {
    overflow: hidden;
    font-size: var(--vectis-text-caption-size);
    color: var(--vectis-color-text-muted);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* The start icon is muted, as on every row of the design system (VSideNavigationItem,
     VAccordionItem): the label carries the command, the icon only helps find it. */
  .v-menu-item-icon,
  .v-menu-item-chevron {
    flex: none;
    color: var(--vectis-color-text-muted);
  }

  /* In a menu the focus IS the highlight, so it is drawn on `:focus` and not on
     `:focus-visible`: the focus is moved from code — by the arrows, and by hovering —
     and the browser would not call that a keyboard focus worth showing. While a submenu is
     open its parent item keeps the highlight too, so the path followed through the levels
     stays visible. */
  .v-menu-item:hover:not(:disabled, [aria-disabled='true']),
  .v-menu-item:focus,
  .v-menu-item[aria-expanded='true'] {
    background: var(--vectis-color-surface-muted);
    outline: none;
  }

  .v-menu-item[data-selected] {
    background: var(--vectis-color-accent-surface);
    color: var(--vectis-color-accent-text);
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

  .v-menu-item[data-tone='danger'] {
    color: var(--vectis-color-danger-text);
  }

  .v-menu-item[data-tone='danger']:hover:not(:disabled, [aria-disabled='true']),
  .v-menu-item[data-tone='danger']:focus,
  .v-menu-item[data-tone='danger'][aria-expanded='true'] {
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

  /* On a row painted in a colour of its own, the start icon and the second line take the
     label's colour rather than the muted grey: muted would clash with the selected and the
     danger tints, and on a disabled row it is DARKER than the subtle grey the label takes,
     so they would outshine it. Each `:is()` counts for its most specific member, which
     keeps the rule at (0,3,0), above the two (0,1,0) base rules. */
  .v-menu-item:is([data-selected], [data-tone='danger'], :disabled, [aria-disabled='true'])
    :is(.v-menu-item-icon, .v-menu-item-sublabel) {
    color: inherit;
  }

  /* Windows forced colors. The highlight is a background, which the mode forces to Canvas:
     the row under the focus would look exactly like the others, and a keyboard user would
     lose their place (WCAG 2.4.7). An outline inside the row takes its place. The selected
     row, also drawn by its tint alone, takes the system selection pair, the rule the
     selected controls of the actions family follow; the class is doubled to stay above
     its (0,3,0) hover and focus rules. */
  @media (forced-colors: active) {
    .v-menu-item:focus,
    .v-menu-item[aria-expanded='true'] {
      outline: var(--vectis-focus-ring-width) solid Highlight;
      outline-offset: calc(-1 * var(--vectis-focus-ring-width));
    }

    .v-menu-item.v-menu-item[data-selected] {
      forced-color-adjust: none;
      background-color: Highlight;
      color: HighlightText;
    }
  }
}
</style>
