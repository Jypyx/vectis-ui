<script setup lang="ts">
import { provide, ref, useId } from 'vue'

import type { IconSource } from '../VIcon/types'
import { sideNavigationKey } from './context'

import { arrowNavigate } from '../../utils/arrowNav'
import { useAriaLabel } from '../../composables/useAriaLabel'
import { useMessages } from '../../i18n/state'

// @keyboard @core
/**
 * The navigation of a sidebar: a tree of links, shown in place rather than in a
 * floating panel, whose branches can be opened and closed. It is written out level by
 * level with its own subcomponents, never described as a list of data.
 *
 * The markup is real lists, where VMenu uses plain containers, and the difference is
 * meaningful: the menu pattern forbids lists — it admits nothing but commands and
 * groups — whereas in a navigation the counting and the nesting ARE the information. A
 * screen reader announcing "list of 4 items, item 2, itself a list of 3" is describing
 * the site's structure.
 *
 * The folding is the browser's: the open state, the keyboard that toggles it, the
 * exclusivity between neighbouring sections and the animation all come from the native
 * disclosure elements. The only behavioural JavaScript here is moving the focus with
 * the arrow keys.
 */
interface SideNavigationProps {
  /**
   * What screen readers announce for this navigation. A page often has several — a
   * main one, a sidebar, a footer — and this is what tells them apart. It falls back
   * to the design system dictionary.
   */
  label?: string
  /** The height of the rows, 32 or 40 pixels, inherited by every level. */
  size?: 'sm' | 'md'
  /**
   * Takes 4px off the height of every row. It is a density setting and NOT a collapsed
   * icon-only rail, which this component does not offer.
   */
  compact?: boolean
  /**
   * Keeps a single section open at a time WITHIN EACH LEVEL, which the browser does on
   * its own. It is off by default: a sidebar normally lets several sections stay open.
   */
  exclusive?: boolean
  /** The chevron of a closed section: an icon name, or an explicit render. */
  expandIcon?: IconSource
  /**
   * The chevron of an open section. Leave it out and the closed one is simply rotated
   * by 180°.
   */
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
  /** The first level of the tree: items, groups and separators. */
  default(): unknown
}>()

const m = useMessages()
const ariaLabel = useAriaLabel(() => props.label ?? m.value.sideNavigation.label)

// The name shared by the first level's sections. Each item mints another for its own
// children, which is what keeps the exclusivity local to a level (see context.ts).
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
 * What the arrow keys may move to: the header of a branch, and the link of a leaf.
 *
 * Both forms of disabling have to be excluded, since `:disabled` only ever matches a
 * button — an inert link and a disabled branch header are marked with `aria-disabled`
 * instead, exactly as in VMenu's panel.
 */
const ROW_SELECTOR = ':is(summary, .v-side-nav-action):not(:disabled):not([aria-disabled="true"])'

// @keyboard @a11y
/**
 * Whether a row can actually be reached: everything inside a CLOSED branch is skipped,
 * except that branch's own header, which stays focusable.
 *
 * TRAP — this cannot be left to the shared helper, which skips whatever is not
 * displayed. The content of a closed disclosure element is not hidden that way: the
 * browser passes over it by a rule of its own, and it still reports itself as
 * displayed. Walking the ancestors is the only reliable answer, and it also spares one
 * style computation per row.
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
 * The component's only behavioural JavaScript, and it exists because nothing native
 * moves the focus from one link to the next.
 *
 * It follows the design system's contract: the arrows MOVE the focus and never
 * activate anything. Every visible row also stays a stop in the tab order — the
 * VToggle model — which is what the disclosure navigation pattern calls for.
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
     * How much one level of the tree is indented by: exactly the room a leading icon
     * occupies, the icon plus the gap after it. That is what makes a subitem's label
     * start on the SAME VERTICAL as its parent's, whether or not the parent has an
     * icon.
     *
     * Both measurements come from the shared size class set on this very element, so
     * the indent follows the size scale with no table of its own, and a consumer who
     * changes the icon size sees it follow. Every level inherits it.
     */
    --side-nav-indent: calc(var(--vectis-icon-size) + var(--control-gap));

    font-family: var(--vectis-text-family);
    /* What makes a branch able to animate open: without it, a height cannot be
       transitioned towards `auto`. It is inherited by every item, and where the browser
       does not support it the branches simply open at once. */
    interpolate-size: allow-keywords;
  }

  /*
   * The three lists of the tree are stripped of their bullets and their padding here,
   * once, rather than in each of the three components that render one. Nothing can be
   * arbitrated wrongly by doing so: these classes exist nowhere else in the design
   * system.
   *
   * They are laid out as flex columns and not as ordinary blocks, which removes margin
   * collapsing entirely — otherwise a group's margin could escape a branch that is
   * closed, and therefore of zero height, and push the rows apart under it.
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
