<script setup lang="ts">
/**
 * One tab. It IS a VButton — the colour, the size, the focus ring and the disabled
 * state all come from there — and what this component adds is the handful of
 * attributes that make a button part of a tab row for assistive technology.
 *
 * Used outside a VTabs it renders as a quiet neutral button at VButton's own size, and as
 * nothing more: the row's decisions all come from the context, and a tab with no row takes
 * VButton's defaults rather than a copy of the row's. It carries no `tab` role either,
 * which would be an orphan without a tablist, nor the roving `tabindex` that would take
 * it out of the tab order.
 */

import { computed, inject } from 'vue'

import VButton from '../VButton/VButton.vue'
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import { tabsKey } from './context'
import type { ItemValue } from '../../types'

interface TabProps {
  /**
   * What this tab is called in code. The panel carrying the same value is the one it
   * shows, and it is also what the v-model holds when this tab is selected.
   */
  value: ItemValue
  /** The visible label. The default slot replaces it. */
  label?: string
  /** An icon before the label: an icon name, or an explicit render. */
  iconStart?: IconSource
  /** An icon after the label, for a count or a state the tab carries. */
  iconEnd?: IconSource
  /** Renders `iconStart` and `iconEnd` in their filled form (the font's `FILL` axis). */
  iconFilled?: boolean
  /**
   * Makes the tab unusable: it no longer responds, the arrow keys skip over it, and it
   * greys out through the colour tokens. A VTabs set `disabled` disables every tab, this
   * one included, whatever this says.
   */
  disabled?: boolean
}

const props = withDefaults(defineProps<TabProps>(), {
  label: undefined,
  iconStart: undefined,
  iconEnd: undefined,
  iconFilled: false,
  disabled: false,
})

const slots = defineSlots<{
  /** The content of the tab, replacing the `label` prop. */
  default?(): unknown
  /** Content before the label, which takes the place of `iconStart`. */
  start?(): unknown
  /** Content after the label, which takes the place of `iconEnd`. */
  end?(): unknown
}>()

const tabs = inject(tabsKey, null)

const selected = computed(() => tabs != null && tabs.value === props.value)
const tabId = computed(() => tabs?.tabId(props.value))
const panelId = computed(() => (tabs?.hasPanels ? tabs.panelId(props.value) : undefined))
// Cumulative, the VButtonGroup rule: a row switched off has no tab that can opt back in.
const resolvedDisabled = computed(() => props.disabled || Boolean(tabs?.disabled))

// TRAP — a function read by the template, never a `computed`: `slots` is not reactive, so a
// computed would keep its first answer while a slot behind a `v-if` comes and goes.
/**
 * An icon, on either side, and no label at all: the tab becomes a square, like a VIconButton.
 * The same definition as VChip's, and the square itself is VButton's `[data-icon-only]` rule.
 */
function iconOnly() {
  return (
    !props.label &&
    !slots.default &&
    Boolean(slots.start || slots.end || props.iconStart || props.iconEnd)
  )
}

// @keyboard @a11y
/*
 * Selecting a tab the moment it takes focus, which is what `automatic` activation
 * means. It lives here rather than in the row's keyboard handler, because this
 * component knows its own value: the handler would have to read it back from a DOM
 * attribute, and would lose the distinction between the number 1 and the string "1"
 * doing so.
 */
function onFocus() {
  if (tabs?.activation === 'automatic' && !resolvedDisabled.value) tabs.select(props.value)
}
</script>

<template>
  <VButton
    :id="tabId"
    class="v-tab"
    :role="tabs ? 'tab' : undefined"
    :aria-selected="tabs ? String(selected) : undefined"
    :aria-controls="panelId"
    :tabindex="tabs ? (selected ? 0 : -1) : undefined"
    variant="ghost"
    :elevated="selected && tabs?.variant === 'inset'"
    :tone="selected && tabs ? tabs.tone : 'neutral'"
    :size="tabs?.size"
    :compact="tabs?.compact"
    :disabled="resolvedDisabled"
    :data-icon-only="iconOnly() ? '' : undefined"
    @click="tabs?.select(value)"
    @focus="onFocus"
  >
    <template v-if="iconStart || $slots.start" #start>
      <slot name="start"><VIcon v-bind="iconProps(iconStart!)" :filled="iconFilled" /></slot>
    </template>
    <template v-if="iconEnd || $slots.end" #end>
      <slot name="end"><VIcon v-bind="iconProps(iconEnd!)" :filled="iconFilled" /></slot>
    </template>
    <!-- The label is wrapped in an element of its own so that it can be truncated:
         an ellipsis cannot be applied to the bare text of a flex container, and tabs
         sharing the bar equally have to be able to cut their labels short -->
    <span v-if="!iconOnly()" class="v-tab-label"
      ><slot>{{ label }}</slot></span
    >
  </VButton>
</template>

<style>
@layer vectis.components {
  /*
   * These rules override a VButton, so they are qualified by an attribute that button
   * always renders. That is what makes them win whatever order the two sheets end up
   * in — the same device VIconButton uses.
   */
  .v-tab[data-size] {
    /* The indicator below is positioned against this box, and a button declares no
       position of its own. */
    position: relative;
    /*
     * The tabs are never compressed, and that is precisely WHAT makes the row
     * overflow. Allowed to shrink, they would squeeze down to their smallest possible
     * width and scrolling would never come into play at all.
     */
    flex: none;
    white-space: nowrap;
  }

  /*
   * The focus ring is drawn INSIDE the tab. The row scrolls, and a ring sitting
   * outside the tab would be cropped by that scrolling box on the first and last
   * tabs.
   */
  .v-tab[data-size]:focus-visible {
    outline-offset: calc(-1 * var(--vectis-focus-ring-width));
  }

  .v-tab-label {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .v-tabs[data-full-width] > .v-tabs-bar > .v-tabs-list .v-tab[data-size] {
    flex: 1 1 0;
    min-inline-size: 0;
  }

  /* A box nested inside a rounded one needs a smaller radius to look concentric: the
     track's own, less the padding between them. */
  .v-tabs[data-variant='inset'] > .v-tabs-bar > .v-tabs-list .v-tab[data-size] {
    border-radius: calc(var(--vectis-radius-surface) - var(--vectis-space-1));
  }

  /*
   * On a track the tabs are contiguous SEGMENTS with square corners: what carves the
   * bar up is the rule and the indicator, not the silhouette of each button. Rounded
   * corners would leave pale notches above the rule, and a gap would break the row of
   * hover highlights into islands.
   *
   * The gap is removed on the row rather than here, the row being what declares it;
   * the bar's own gap stays, since that one separates the scroll buttons and not the
   * tabs.
   */
  .v-tabs:is([data-variant='flat'], [data-variant='outlined'])
    > .v-tabs-bar
    > .v-tabs-list
    .v-tab[data-size] {
    border-radius: 0;
  }

  /*
   * Inside a card the row takes its rounded corners back at the ENDS only, the seams
   * between tabs staying square — the VButtonGroup idiom, applied to the one edge the
   * track does not occupy.
   *
   * The radius is the CARD's inner one — its own, less the border it sits behind — and
   * not the button's. The bar spends no gutter, so an end tab lands exactly on a corner
   * of the frame and has to follow that curve: a button radius, smaller, would leave a
   * sliver of card showing outside the tab as soon as it painted a background.
   *
   * TRAP — the selectors ask for the first and last of their TYPE rather than the
   * first and last child, because the scroll markers are the row's real first and last
   * children. They are spans, the tabs being the only buttons, which is what makes the
   * distinction work.
   */
  .v-tabs[data-variant='outlined'] > .v-tabs-bar > .v-tabs-list .v-tab[data-size]:first-of-type {
    border-start-start-radius: calc(var(--vectis-radius-surface) - 1px);
  }

  .v-tabs[data-variant='outlined'][data-orientation='horizontal']
    > .v-tabs-bar
    > .v-tabs-list
    .v-tab[data-size]:last-of-type {
    border-start-end-radius: calc(var(--vectis-radius-surface) - 1px);
  }

  /* Turned vertical, the track has migrated to the end edge, so the free edge is the
     start one: that is where the ends of the column round their corners. */
  .v-tabs[data-variant='outlined'][data-orientation='vertical']
    > .v-tabs-bar
    > .v-tabs-list
    .v-tab[data-size]:last-of-type {
    border-end-start-radius: calc(var(--vectis-radius-surface) - 1px);
  }

  /*
   * The bar marking the selected tab, in the two framed variants. It is painted in the
   * tab's own text colour rather than by reading one of VButton's private variables:
   * that way it follows the selected tone AND the grey of a disabled tab on its own,
   * without this file having to know anything about either.
   */
  .v-tabs:is([data-variant='flat'], [data-variant='outlined'])
    > .v-tabs-bar
    > .v-tabs-list
    .v-tab[data-size]::after {
    content: '';
    position: absolute;
    inset-inline: 0;
    inset-block-end: 0;
    block-size: var(--vectis-control-size-tab-indicator);
    background: currentColor;
    opacity: 0;
    transition: opacity var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-tabs:is([data-variant='flat'], [data-variant='outlined'])[data-orientation='vertical']
    > .v-tabs-bar
    > .v-tabs-list
    .v-tab[data-size]::after {
    inset-block: 0;
    inset-inline: auto;
    inset-inline-start: 0;
    block-size: auto;
    inline-size: var(--vectis-control-size-tab-indicator);
  }

  .v-tabs:is([data-variant='flat'], [data-variant='outlined'])
    > .v-tabs-bar
    > .v-tabs-list
    .v-tab[data-size][aria-selected='true']::after {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .v-tabs:is([data-variant='flat'], [data-variant='outlined'])
      > .v-tabs-bar
      > .v-tabs-list
      .v-tab[data-size]::after {
      transition: none;
    }
  }
}
</style>
