<script setup lang="ts">
import { computed, inject, useSlots } from 'vue'

import VButton from '../VButton/VButton.vue'
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import { tabsKey } from './context'

/**
 * One tab. It IS a `VButton`: tone, variant, size, focus and disabling all come
 * from it, and only the ARIA attributes of the tabs pattern are added (they travel
 * through VButton's fallthrough to the rendered <button>).
 *
 * The tab still renders outside a `VTabs` (as VAccordionItem does outside
 * VAccordion), simply never selected.
 */
interface TabProps {
  /** Identifies the tab and its matching `VTabPanel`. */
  value: string | number
  /** Visible label; the default slot wins. */
  label?: string
  /** Start icon: a name, or an explicit render. */
  icon?: IconSource
  /** Inert tab: neither clickable nor reachable, greyed through tokens. */
  disabled?: boolean
}

const props = withDefaults(defineProps<TabProps>(), {
  label: undefined,
  icon: undefined,
  disabled: false,
})

defineSlots<{
  /** Free content of the tab (replaces `label`). */
  default?(): unknown
}>()

const slots = useSlots()
const tabs = inject(tabsKey, null)

const selected = computed(() => tabs != null && tabs.value === props.value)
const tabId = computed(() => tabs?.tabId(props.value))
const panelId = computed(() => (tabs?.hasPanels ? tabs.panelId(props.value) : undefined))

/** No visible label: the tab shrinks to a square, like a VIconButton. */
const iconOnly = computed(() => Boolean(props.icon) && !props.label && !slots.default)

/*
 * Automatic activation (an APG option): selection follows focus. It lives here
 * rather than in VTabs' keyboard handler, which would otherwise have to route the
 * value through a DOM attribute — and would lose the `string | number` union.
 */
function onFocus() {
  if (tabs?.activation === 'automatic' && !props.disabled) tabs.select(props.value)
}
</script>

<template>
  <VButton
    :id="tabId"
    class="v-tab"
    role="tab"
    :aria-selected="selected ? 'true' : 'false'"
    :aria-controls="panelId"
    :tabindex="selected ? 0 : -1"
    :variant="selected && tabs?.variant === 'inset' ? 'elevated' : 'ghost'"
    :tone="selected ? (tabs?.tone ?? 'accent') : 'neutral'"
    :size="tabs?.size ?? 'md'"
    :compact="tabs?.compact ?? false"
    :disabled="disabled"
    :data-icon-only="iconOnly ? '' : undefined"
    @click="tabs?.select(value)"
    @focus="onFocus"
  >
    <template v-if="icon" #start>
      <VIcon v-bind="iconProps(icon)" />
    </template>
    <!-- the label is wrapped: `text-overflow` does not apply to the anonymous text
         of a flex container, and `grow` must be able to truncate it -->
    <span v-if="!iconOnly" class="v-tab-label"
      ><slot>{{ label }}</slot></span
    >
  </VButton>
</template>

<style>
@layer vectis.components {
  /*
   * VButton overrides qualified by [data-size] (always rendered by VButton): they
   * beat .v-button[data-variant='…'] whatever the bundled CSS order — the same
   * specificity trick as .v-icon-button.
   */
  .v-tab[data-size] {
    /* anchor for the ::after indicator; .v-button sets no position */
    position: relative;
    /*
     * Never compressed: this is WHAT produces the list's overflow. Without
     * `flex: none`, the tabs would shrink to their min-content size and scrolling
     * would never trigger.
     */
    flex: none;
    white-space: nowrap;
  }

  .v-tab[data-size][data-icon-only] {
    padding-inline: 0;
    min-inline-size: var(--control-height);
  }

  /*
   * The tab lives in an `overflow: auto` container that would crop a positive
   * outline-offset: hence an inner ring.
   */
  .v-tab[data-size]:focus-visible {
    outline-offset: calc(var(--vectis-focus-ring-offset) * -1);
  }

  .v-tab-label {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .v-tabs[data-grow] .v-tab[data-size] {
    flex: 1 1 0;
    min-inline-size: 0;
  }

  /* Nested radius inside the hollow track (the surface radius minus its padding) */
  .v-tabs[data-variant='inset'] .v-tab[data-size] {
    border-radius: calc(var(--vectis-radius-surface) - var(--vectis-space-1));
  }

  /*
   * On a track, the tabs are contiguous SEGMENTS with square corners: it is the
   * indicator and the track that carve the bar, not the buttons' silhouette. A
   * radius would leave light corners above the rule, and a gap would cut the row of
   * hover highlights. The `gap` is removed on the list rather than here (the list is
   * what sets it); the bar's own gap stays, since it separates the scroll buttons,
   * not the tabs.
   */
  .v-tabs:is([data-variant='flat'], [data-variant='outlined']) .v-tab[data-size] {
    border-radius: 0;
  }

  /*
   * When framed, the row takes its radius back at the ENDS only — square internal
   * seams, the VButtonGroup idiom, but transposed onto the one edge the track does
   * not occupy (it holds the other). The radius is the button's, not the card's: the
   * row is set back from the frame by the gutter, so it has no clip to follow.
   * `:first-of-type`/`:last-of-type` and not `:first-child`/`:last-child` — the
   * scroll end sentinels are the real first and last children of the list (they are
   * `span`s, the tabs being the only `button`s).
   */
  .v-tabs[data-variant='outlined'] .v-tab[data-size]:first-of-type {
    border-start-start-radius: var(--vectis-radius-interactive);
  }

  .v-tabs[data-variant='outlined'][data-orientation='horizontal'] .v-tab[data-size]:last-of-type {
    border-start-end-radius: var(--vectis-radius-interactive);
  }

  /* vertical: since the track migrated to the end edge, the free edge is the start
     one — the column's ends round their corners there */
  .v-tabs[data-variant='outlined'][data-orientation='vertical'] .v-tab[data-size]:last-of-type {
    border-end-start-radius: var(--vectis-radius-interactive);
  }

  /*
   * Indicator of the `flat` and `outlined` variants. `currentColor` rather than a
   * private VButton variable: it follows both the active tab's tone AND the grey of
   * the disabled state, with no coupling.
   */
  .v-tabs:is([data-variant='flat'], [data-variant='outlined']) .v-tab[data-size]::after {
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
    .v-tab[data-size]::after {
    inset-block: 0;
    inset-inline: auto;
    inset-inline-start: 0;
    block-size: auto;
    inline-size: var(--vectis-control-size-tab-indicator);
  }

  .v-tabs:is([data-variant='flat'], [data-variant='outlined'])
    .v-tab[data-size][aria-selected='true']::after {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .v-tabs:is([data-variant='flat'], [data-variant='outlined']) .v-tab[data-size]::after {
      transition: none;
    }
  }
}
</style>
