<script setup lang="ts">
import { provide, ref, useId } from 'vue'

import type { IconSource } from '../VIcon/types'
import { sideNavigationKey } from './context'

import { arrowNavigate } from '../../utils/arrowNav'
import { useAriaLabel } from '../../composables/useAriaLabel'
import { useMessages } from '../../i18n/state'

// @keyboard @core
/**
 * Vertical sidebar navigation: a tree of links rendered INLINE (nothing floats),
 * collapsible level by level, composed from subcomponents —
 * `VSideNavigationItem`, `VSideNavigationGroup`, `VSideNavigationSeparator`.
 *
 * `<ul>`/`<li>` and not divs as in VMenu: the ARIA `menu` pattern forbids lists (it
 * admits only `menuitem`/`group`), and a navigation is the opposite — counting and
 * the nesting relation ARE the hierarchy information.
 *
 * The folding is native (`<details>`/`<summary>`, see VSideNavigationItem): state,
 * activation keyboard, exclusivity between siblings (`<details name>`) and animation
 * all come from the browser. The component's only behavioural JS: the arrow
 * navigation below.
 */
interface SideNavigationProps {
  /** Accessible name of the <nav>. Default: the DS dictionary. */
  label?: string
  /** Row height: 32px (sm) or 40px (md). Inherited by EVERY level. */
  size?: 'sm' | 'md'
  /** Density: −4px of height. This is NOT a "collapsed icon rail" mode. */
  compact?: boolean
  /**
   * A single sublevel open at a time PER LEVEL (the native `<details name>`
   * attribute). Default `false`: a sidebar normally keeps several sections open.
   */
  exclusive?: boolean
  /** Chevron of collapsed branches: an icon name, or an explicit render (`{ src }`…). */
  expandIcon?: IconSource
  /** Chevron of expanded branches; absent = `expandIcon` rotated 180°. */
  collapseIcon?: IconSource
}

const props = withDefaults(defineProps<SideNavigationProps>(), {
  label: undefined,
  size: 'md',
  compact: false,
  exclusive: false,
  expandIcon: 'expand_more',
  collapseIcon: undefined,
})

defineSlots<{
  /** The `VSideNavigationItem` / `VSideNavigationGroup` / `VSideNavigationSeparator` elements. */
  default(): unknown
}>()

const m = useMessages()
const ariaLabel = useAriaLabel(() => props.label ?? m.value.sideNavigation.label)

// Group name of the FIRST-level <details>; each item provides another one to its own
// children (see context.ts).
const rootName = useId()

provide(sideNavigationKey, {
  get name() {
    return props.exclusive ? rootName : undefined
  },
  get exclusive() {
    return props.exclusive
  },
  get expandIcon() {
    return props.expandIcon
  },
  get collapseIcon() {
    return props.collapseIcon
  },
})

const rootEl = ref<HTMLElement | null>(null)

// @keyboard @a11y
/**
 * Focus targets: a branch's <summary>, a leaf's action. Disabled items are excluded
 * — `:disabled` only matches <button>, while an inert link and a summary go through
 * `aria-disabled` (the VMenuPanel model).
 */
const ROW_SELECTOR = ':is(summary, .v-side-nav-action):not(:disabled):not([aria-disabled="true"])'

// @keyboard @a11y
/**
 * Excludes everything living under a COLLAPSED branch — except its own <summary>,
 * which stays focusable. The content of a closed <details> is not `display: none`
 * (the browser "skips" it): `navigableItems`' filter would not see it. So OUR own
 * list is passed to `arrowNavigate`, which also avoids one `getComputedStyle` per
 * row.
 */
function reachable(el: HTMLElement, root: HTMLElement): boolean {
  for (
    let child: HTMLElement = el, parent = el.parentElement;
    parent && child !== root;
    child = parent, parent = parent.parentElement
  ) {
    if (parent.tagName === 'DETAILS' && !(parent as HTMLDetailsElement).open) {
      if (child.tagName !== 'SUMMARY') return false
    }
  }
  return true
}

// @keyboard @a11y
/*
 * The only behavioural JS: no native primitive moves the focus between sibling
 * links. The DS contract (utils/arrowNav) — the arrows MOVE the focus, they never
 * activate. No roving tabindex: every visible row stays a tab stop (the VToggle
 * model), as the "disclosure navigation" pattern requires.
 */
function onKeydown(event: KeyboardEvent) {
  const root = rootEl.value
  if (!root) return
  const items = [...root.querySelectorAll<HTMLElement>(ROW_SELECTOR)].filter((el) =>
    reachable(el, root),
  )
  arrowNavigate(event, root, items, { vertical: true })
}
</script>

<template>
  <nav
    ref="rootEl"
    class="v-side-nav v-control"
    :data-size="size"
    :data-compact="compact ? '' : undefined"
    :aria-label="ariaLabel"
    @keydown="onKeydown"
  >
    <ul class="v-side-nav-list">
      <slot />
    </ul>
  </nav>
</template>

<style>
@layer vectis.components {
  .v-side-nav {
    /*
     * Indent of one hierarchy level: exactly the room a start icon takes (icon +
     * gutter), so that a subitem's label lands on the SAME VERTICAL as its parent's.
     * Both variables are set by `v-control` on this same root — the indent therefore
     * follows the size scale with no local table, and a consumer redefining
     * `--vectis-icon-size` sees it follow. Inherited by every level.
     */
    --side-nav-indent: calc(var(--vectis-icon-size) + var(--control-gap));

    font-family: var(--vectis-text-family);
    /* Animated folding of `::details-content`: allows block-size 0 → auto
       (progressive enhancement, the VAccordion idiom). Inherited by the items. */
    interpolate-size: allow-keywords;
  }

  /*
   * Reset shared by the three lists, declared ONCE by the root's owner rather than
   * copied into three SFCs — no cascade arbitration is possible, these classes exist
   * nowhere else.
   *
   * `flex` and not `block`: it removes all margin collapsing, so a group's margin
   * cannot leak out of a collapsed branch (block-size: 0).
   */
  .v-side-nav-list,
  .v-side-nav-children,
  .v-side-nav-group-list {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
  }
}
</style>
