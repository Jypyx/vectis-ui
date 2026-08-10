<script setup lang="ts">
import { computed, inject, ref, useId, useSlots } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import VMenuPanel from './VMenuPanel.vue'
import { menuKey, SUBMENU_HOVER_DELAY } from './context'

import { useTimer } from '../../composables/useTimer'

/**
 * Menu item (role="menuitem"): the focus is driven by the panel (roving focus),
 * and selecting closes the whole stack through the injected context. With `href`,
 * the item is an <a>; since an <a> has no native `disabled`, it goes through the
 * "inert link" bridge (href removed + aria-disabled).
 *
 * With the #submenu slot, the item becomes the `popovertarget` invoker of a nested
 * panel (= its implicit anchor; the panel is a DOM descendant of the parent panel →
 * a native popover stack: full light dismiss, opening a sibling branch closes the
 * other, cascading close). JS justified: keyboard opening and hover with an intent
 * delay — the click goes through the native toggle.
 */
interface MenuItemProps {
  /** Label of the item (the #default slot wins). */
  label?: string
  /** Sublabel under the label (the #sublabel slot wins). */
  sublabel?: string
  /**
   * Icon before the label: a Material Symbols Rounded name, an icon URL, or an
   * explicit render (`{ src }`, `{ component }`…). The #start slot wins.
   */
  iconStart?: IconSource
  /** Icon after the label (same forms). The #end slot wins. */
  iconEnd?: IconSource
  /** Selected state (accent + aria-current). */
  selected?: boolean
  /** Destructive item (danger colour). */
  danger?: boolean
  disabled?: boolean
  /** Rendered as <a role="menuitem"> (a navigation item). disabled → an inert link. */
  href?: string
}

// Multi-node root when #submenu is present (the item + the nested panel): the
// attrs (name, aria-*, class…) go explicitly on the item.
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
  /** Emitted on activation (click or Enter/Space), before the menu closes. */
  select: []
}>()

defineSlots<{
  /** Label of the item (wins over the `label` prop). */
  default?(): unknown
  /** Sublabel (wins over the `sublabel` prop). */
  sublabel?(): unknown
  /** Free content before the label (wins over `iconStart`). */
  start?(): unknown
  /** Free content after the label (wins over `iconEnd`). */
  end?(): unknown
  /** Content of the submenu (VMenuItem/VMenuGroup/VMenuSeparator, recursive). */
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
// Programmatic openings: the item is passed as `source` to showPopover(), or the
// subpanel has no implicit anchor (set natively on click only) and loses its
// positioning.
const itemEl = ref<HTMLElement | null>(null)

// @keyboard
// Keyboard opening: the native toggle only covers the click.
function onKeydown(event: KeyboardEvent) {
  if (!hasSubmenu.value || props.disabled) return
  if (!['ArrowRight', 'Enter', ' '].includes(event.key)) return
  // Blocks the button's native activation (a synthetic click would toggle the
  // panel back shut behind the show() below).
  event.preventDefault()
  subPanel.value?.show(itemEl.value ?? undefined)
  subPanel.value?.focusFirst()
}

// Hover with an intent delay (see useTimer). A single instance: opening and
// closing are mutually exclusive — arming one always cancels the other. Closing is
// refused while the focus is inside the subpanel: a stray pointer must not cut off
// a keyboard user.
const hoverTimer = useTimer()

// @a11y @core
function onPointerEnter() {
  if (props.disabled) return
  // Hovering also drives the focus: hover and roving focus stay synchronized, a
  // single highlight at a time (the menu pattern)
  itemEl.value?.focus({ preventScroll: true })
  if (!hasSubmenu.value) return
  hoverTimer.start(() => subPanel.value?.show(itemEl.value ?? undefined), SUBMENU_HOVER_DELAY)
}

// @a11y @core — the `activeElement` test is the a11y half: a stray pointer must
// not close a submenu a keyboard user is standing in.
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
    <!-- An item with a submenu signals its sideways opening: a chevron, never iconEnd -->
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
     * Size: the `--control-*` variables inherited from the root panel, which carries
     * `v-control` (styles/control-size.css) — a single table for the whole DS. The
     * icons follow without a line written: `--vectis-icon-size`/`-opsz` are part of
     * the same block and inherit too.
     *
     * Only the typography is composite: the SIZE comes from the scale, the leading
     * stays that of `body-md` (a unitless ratio, so it follows) and the weight stays
     * regular. Not the full `control` recipe: that means medium/1, and a row may wrap
     * and carry a sublabel.
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

  /* The focus IS the highlight (programmatic roving focus → :focus, not :focus-visible) */
  .v-menu-item:hover:not(:disabled, [aria-disabled='true']),
  .v-menu-item:focus {
    background: var(--vectis-color-surface-muted);
    outline: none;
  }

  /* Open submenu: the highlight persists on the parent item */
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
    /* Slightly darkens the accent surface */
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

  /* :disabled only applies to <button>; the inert link goes through aria-disabled */
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
