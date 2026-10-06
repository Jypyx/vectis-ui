<script setup lang="ts">
/**
 * Reuse VButton for activation; tab context supplies selection, IDs and roving tabindex without
 * a mounted-child registry.
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
  /** A VTabs set `disabled` disables every tab, this one included, whatever this says. */
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
const resolvedDisabled = computed(() => props.disabled || Boolean(tabs?.disabled))

// A function read by the template, never a `computed`: `slots` is not reactive, so a computed
// would keep its first answer while a slot behind a `v-if` comes and goes.
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
 * Selecting a tab the moment it takes focus, which `automatic` activation means. It lives here
 * rather than in the row's keyboard handler, because this component knows its own value: the
 * handler would have to read it back from a DOM attribute, and would lose the distinction
 * between the number 1 and the string "1" doing so.
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
   * These rules override a VButton, so they are qualified by an attribute that button always
   * renders. That is what makes them win whatever order the two sheets end up in; the same
   * device VIconButton uses.
   */
  .v-tab[data-size] {
    position: relative;
    /*
     * The tabs are never compressed, and that is precisely what makes the row overflow. Allowed
     * to shrink, they would squeeze down to their smallest possible width and scrolling would
     * never come into play at all.
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
   * On a track the tabs keep their radius except on the edge the indicator is drawn along:
   * there the indicator lies flush with the rule, which a rounded corner would notch.
   */
  .v-tabs:is(
      [data-variant='flat'],
      [data-variant='outline'],
      [data-variant='elevated'],
      [data-variant='filled']
    )[data-orientation='horizontal']
    > .v-tabs-bar
    > .v-tabs-list
    .v-tab[data-size] {
    border-end-start-radius: 0;
    border-end-end-radius: 0;
  }

  .v-tabs:is(
      [data-variant='flat'],
      [data-variant='outline'],
      [data-variant='elevated'],
      [data-variant='filled']
    )[data-orientation='vertical']
    > .v-tabs-bar
    > .v-tabs-list
    .v-tab[data-size] {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }

  /*
   * The selectors ask for the first and last of their TYPE rather than the first and last
   * child, because the scroll markers are the row's real first and last children. They are
   * spans, the tabs being the only buttons, which makes the distinction work. The first-tab
   * rule ties with the vertical one above on specificity, so it must stay after it.
   */
  .v-tabs:is([data-variant='outline'], [data-variant='elevated'], [data-variant='filled'])
    > .v-tabs-bar
    > .v-tabs-list
    .v-tab[data-size]:first-of-type {
    border-start-start-radius: var(--tabs-corner-radius);
  }

  .v-tabs:is(
      [data-variant='outline'],
      [data-variant='elevated'],
      [data-variant='filled']
    )[data-orientation='horizontal']
    > .v-tabs-bar
    > .v-tabs-list
    .v-tab[data-size]:last-of-type {
    border-start-end-radius: var(--tabs-corner-radius);
  }

  /* Turned vertical, the track has migrated to the end edge, so the free edge is the
     start one: that is where the ends of the column round their corners. */
  .v-tabs:is(
      [data-variant='outline'],
      [data-variant='elevated'],
      [data-variant='filled']
    )[data-orientation='vertical']
    > .v-tabs-bar
    > .v-tabs-list
    .v-tab[data-size]:last-of-type {
    border-end-start-radius: var(--tabs-corner-radius);
  }

  /*
   * It is painted in the tab's own text colour rather than by reading one of VButton's private
   * variables: that way it follows the selected tone and the grey of a disabled tab on its own,
   * without this file having to know anything about either.
   */
  .v-tabs:is(
      [data-variant='flat'],
      [data-variant='outline'],
      [data-variant='elevated'],
      [data-variant='filled']
    )
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

  .v-tabs:is(
      [data-variant='flat'],
      [data-variant='outline'],
      [data-variant='elevated'],
      [data-variant='filled']
    )[data-orientation='vertical']
    > .v-tabs-bar
    > .v-tabs-list
    .v-tab[data-size]::after {
    inset-block: 0;
    inset-inline: auto;
    inset-inline-start: 0;
    block-size: auto;
    inline-size: var(--vectis-control-size-tab-indicator);
  }

  .v-tabs:is(
      [data-variant='flat'],
      [data-variant='outline'],
      [data-variant='elevated'],
      [data-variant='filled']
    )
    > .v-tabs-bar
    > .v-tabs-list
    .v-tab[data-size][aria-selected='true']::after {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .v-tabs:is(
        [data-variant='flat'],
        [data-variant='outline'],
        [data-variant='elevated'],
        [data-variant='filled']
      )
      > .v-tabs-bar
      > .v-tabs-list
      .v-tab[data-size]::after {
      transition: none;
    }
  }

  /*
   * The class is repeated to reach (0,6,0). The variant, hover and active rules reach (0,5,0),
   * and with the forcing turned off any of them that still won would paint its tone over the
   * selection, with HighlightText on top of it.
   */
  @media (forced-colors: active) {
    .v-tab.v-tab.v-tab.v-tab[aria-selected='true']:not(:disabled) {
      forced-color-adjust: none;
      background-color: Highlight;
      color: HighlightText;
      border-color: Highlight;
      outline-color: HighlightText;
    }
  }
}
</style>
