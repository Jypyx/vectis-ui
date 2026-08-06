<script setup lang="ts">
/**
 * Composed pagination: every pill is a VButton, the previous/next controls a
 * VButton or a VIconButton, and `attached` joins the whole thing in a
 * VButtonGroup. No state rule is redefined here.
 *
 * Double truncation: logical (`totalVisible`, pure SSR-safe derivation) and
 * responsive (100% CSS through container queries on the nav itself, so no
 * ResizeObserver). The only behavioural JS is keyboard navigation, justified at
 * the head of `onKeydown`.
 */
import { computed, ref } from 'vue'

import VButton from '../VButton/VButton.vue'
import VButtonGroup from '../VButton/VButtonGroup.vue'
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import VIconButton from '../VIconButton/VIconButton.vue'

import { arrowNavigate, navigableItems } from '../../utils/arrowNav'
import { clamp } from '../../utils/number'
import { resolveMatcher } from '../../utils/matcher'

import { useAriaLabel } from '../../composables/useAriaLabel'
import { useMessages } from '../../i18n/state'

interface PaginationProps {
  /** Total number of pages. */
  length?: number
  /**
   * Total number of rendered slots, ellipses included (minimum 5: first +
   * ellipsis + current + ellipsis + last). The window shifts at the ends instead
   * of shrinking: the bar's width is stable. Absent: every page is rendered.
   */
  totalVisible?: number

  /** Joins every button into a segmented control (VButtonGroup). */
  attached?: boolean
  /** Variant of the NON-active pages and of the controls. The active page is always `solid`. */
  variant?: 'ghost' | 'outline'
  /** Tone of the active page; inactive pages and the controls stay neutral. */
  tone?: 'accent' | 'neutral' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Height reduced by 4px, propagated to every button. */
  compact?: boolean
  /** Alignment within the container: the nav takes the full available width (see CSS). */
  align?: 'start' | 'center' | 'end'

  /** Shows the previous / next buttons. */
  showControls?: boolean
  /** Rendering of the controls: icon only, text only, or both. */
  controlsDisplay?: 'icon' | 'text' | 'both'
  /** Icon of the previous control: a name, or an explicit render. */
  prevIcon?: IconSource
  /** Icon of the next control: a name, or an explicit render. */
  nextIcon?: IconSource
  /** Label of the previous control (visible text and accessible name). Default: the DS dictionary. */
  prevLabel?: string
  /** Label of the next control (visible text and accessible name). Default: the DS dictionary. */
  nextLabel?: string

  /** Disables the whole component. */
  disabled?: boolean
  /** Disabled pages: a list OR a predicate (the same convention as VCalendar's `disabledDates`). */
  disabledPages?: number[] | ((page: number) => boolean)

  /** Responsive truncation through container queries. */
  responsive?: boolean

  /** Accessible name of the navigation. Default: the DS dictionary. */
  label?: string
  /** Accessible name of a page pill. Default: the DS dictionary. */
  pageLabel?: (page: number) => string
}

const props = withDefaults(defineProps<PaginationProps>(), {
  length: 1,
  totalVisible: undefined,
  attached: false,
  variant: 'ghost',
  tone: 'accent',
  size: 'md',
  compact: false,
  align: 'start',
  showControls: true,
  controlsDisplay: 'icon',
  prevIcon: 'chevron_left',
  nextIcon: 'chevron_right',
  prevLabel: undefined,
  nextLabel: undefined,
  disabled: false,
  disabledPages: undefined,
  responsive: false,
  label: undefined,
  pageLabel: undefined,
})

// Cascade prop > dictionary; for the nav's name, `useAriaLabel` still places the
// consumer's `aria-labelledby` and `aria-label` above it.
const m = useMessages()
const ariaLabel = useAriaLabel(() => props.label ?? m.value.pagination.label)
const resolvedPrevLabel = computed(() => props.prevLabel ?? m.value.pagination.previous)
const resolvedNextLabel = computed(() => props.nextLabel ?? m.value.pagination.next)

const page = defineModel<number>({ default: 1 })

/** A rendered entry: a page pill, or an ellipsis marker. */
type PaginationItem =
  | { kind: 'page'; key: string; page: number; edge: boolean; distance: number }
  | { kind: 'gap'; key: string }

const total = computed(() => Math.max(Math.trunc(props.length), 1))
const currentPage = computed(() => clamp(page.value, 1, total.value))

const isPageDisabled = computed(() => resolveMatcher(props.disabledPages))

function pageLabelFor(n: number): string {
  return props.pageLabel ? props.pageLabel(n) : m.value.pagination.page(n)
}

/**
 * Logical truncation with a constant slot count: `totalVisible` counts EVERYTHING
 * rendered, ellipses included. The central window (totalVisible - 4 pages) is
 * centred on the current page and SHIFTS near the ends instead of shrinking — the
 * bar keeps exactly the same width whatever the current page. Each pill carries
 * its distance to the current page — the sort key of the responsive hiding,
 * capped at 3: beyond that, the most distant neighbours share the first step.
 */
const items = computed<PaginationItem[]>(() => {
  const count = total.value
  const current = currentPage.value

  const pageItem = (n: number): PaginationItem => ({
    kind: 'page',
    key: `page-${n}`,
    page: n,
    edge: n === 1 || n === count,
    distance: Math.min(Math.abs(n - current), 3),
  })
  const pages = (from: number, to: number): PaginationItem[] => {
    const out: PaginationItem[] = []
    for (let n = from; n <= to; n++) out.push(pageItem(n))
    return out
  }
  const gap = (after: number): PaginationItem => ({ kind: 'gap', key: `gap-${after}` })

  // Without totalVisible: no truncation, every page is rendered.
  // Useful minimum: 5 (first + ellipsis + current + ellipsis + last).
  const visible =
    props.totalVisible === undefined ? count : Math.max(Math.trunc(props.totalVisible), 5)
  if (visible >= count) return pages(1, count)

  const start = current - Math.floor((visible - 5) / 2)
  const end = start + (visible - 5)

  // Near an end (the ellipsis on that side would skip no number), the window
  // stretches to the bound: always `visible` slots.
  if (start <= 3) return [...pages(1, visible - 2), gap(visible - 2), pageItem(count)]
  if (end >= count - 2) return [pageItem(1), gap(1), ...pages(count - visible + 3, count)]
  return [pageItem(1), gap(1), ...pages(start, end), gap(end), pageItem(count)]
})

/**
 * Target of a control: the nearest activatable page in the given direction —
 * disabled pages are stepped over. `undefined` = the end of the line, hence a
 * disabled control (which also covers the extremities, with no separate test).
 */
function step(direction: -1 | 1): number | undefined {
  for (let n = currentPage.value + direction; n >= 1 && n <= total.value; n += direction) {
    if (!isPageDisabled.value(n)) return n
  }
  return undefined
}

const prevTarget = computed(() => step(-1))
const nextTarget = computed(() => step(1))
const prevDisabled = computed(() => props.disabled || prevTarget.value === undefined)
const nextDisabled = computed(() => props.disabled || nextTarget.value === undefined)

function goTo(n: number | undefined) {
  if (n === undefined) return
  page.value = clamp(n, 1, total.value)
}

const navEl = ref<HTMLElement | null>(null)

/**
 * Keyboard navigation (shared implementation: `utils/arrowNav`). Tab stays
 * natural — every visible pill is a tab stop, as in a list of links. The pills
 * hidden by the container queries are excluded by the helper's `display` filter:
 * they do not take focus.
 */
function onKeydown(event: KeyboardEvent) {
  const nav = navEl.value
  if (!nav) return
  arrowNavigate(event, nav, navigableItems(nav, '.v-pagination-page:not(:disabled)'))
}
</script>

<template>
  <nav
    ref="navEl"
    class="v-pagination"
    :aria-label="ariaLabel"
    :data-align="align"
    :data-controls-display="controlsDisplay"
    :data-responsive="responsive ? '' : undefined"
    @keydown="onKeydown"
  >
    <!-- attached: VButtonGroup merges the borders. It targets its DIRECT
         `.v-button` children — hence no <ul>/<li>, and an ellipsis rendered as a
         VIconButton rather than a <span>. -->
    <component :is="attached ? VButtonGroup : 'div'" class="v-pagination-items">
      <template v-if="showControls">
        <VIconButton
          v-if="controlsDisplay === 'icon'"
          class="v-pagination-control"
          :label="resolvedPrevLabel"
          :variant="variant"
          tone="neutral"
          :size="size"
          :compact="compact"
          :disabled="prevDisabled"
          @click="goTo(prevTarget)"
        >
          <VIcon v-bind="iconProps(prevIcon)" />
        </VIconButton>
        <!-- aria-label set even when the label is visible: the container queries
             hide it at narrow widths, and the accessible name must survive that. -->
        <VButton
          v-else
          class="v-pagination-control"
          :variant="variant"
          tone="neutral"
          :size="size"
          :compact="compact"
          :disabled="prevDisabled"
          :aria-label="resolvedPrevLabel"
          @click="goTo(prevTarget)"
        >
          <template v-if="controlsDisplay === 'both'" #start>
            <VIcon v-bind="iconProps(prevIcon)" />
          </template>
          <span class="v-pagination-control-label">{{ resolvedPrevLabel }}</span>
        </VButton>
      </template>

      <template v-for="item in items" :key="item.key">
        <VButton
          v-if="item.kind === 'page'"
          class="v-pagination-page"
          :variant="item.page === currentPage ? 'solid' : variant"
          :tone="item.page === currentPage ? tone : 'neutral'"
          :size="size"
          :compact="compact"
          :disabled="disabled || isPageDisabled(item.page)"
          :aria-label="pageLabelFor(item.page)"
          :aria-current="item.page === currentPage ? 'page' : undefined"
          :data-edge="item.edge ? '' : undefined"
          :data-distance="!item.edge && item.distance > 0 ? item.distance : undefined"
          @click="goTo(item.page)"
        >
          {{ item.page }}
        </VButton>
        <!-- Ellipsis: an inert VIconButton (hence a `.v-button`, so the group's
             seam stays continuous and the height follows size/compact). Hidden
             from assistive technologies, out of the tab order through disabled. -->
        <VIconButton
          v-else
          class="v-pagination-ellipsis"
          :label="m.pagination.hiddenPages"
          aria-hidden="true"
          :variant="variant"
          tone="neutral"
          :size="size"
          :compact="compact"
          disabled
        >
          <VIcon name="more_horiz" />
        </VIconButton>
      </template>

      <template v-if="showControls">
        <VIconButton
          v-if="controlsDisplay === 'icon'"
          class="v-pagination-control"
          :label="resolvedNextLabel"
          :variant="variant"
          tone="neutral"
          :size="size"
          :compact="compact"
          :disabled="nextDisabled"
          @click="goTo(nextTarget)"
        >
          <VIcon v-bind="iconProps(nextIcon)" />
        </VIconButton>
        <VButton
          v-else
          class="v-pagination-control"
          :variant="variant"
          tone="neutral"
          :size="size"
          :compact="compact"
          :disabled="nextDisabled"
          :aria-label="resolvedNextLabel"
          @click="goTo(nextTarget)"
        >
          <template v-if="controlsDisplay === 'both'" #end>
            <VIcon v-bind="iconProps(nextIcon)" />
          </template>
          <span class="v-pagination-control-label">{{ resolvedNextLabel }}</span>
        </VButton>
      </template>
    </component>
  </nav>
</template>

<style>
@layer vectis.components {
  .v-pagination {
    display: flex;
  }

  /*
   * Containment reserved for responsive mode (every @container below depends on
   * it): `container-type: inline-size` computes the inline size WITHOUT the
   * content, so the nav must be block-level (an inline-flex would collapse to
   * zero) and takes its parent's width — that is what makes the truncation depend
   * on the space actually allocated, and what obliges a flex parent to give it a
   * width (`flex: 1`). Outside responsive mode the nav regains an intrinsic width
   * and sits like any other content. In both cases the alignment goes through
   * `data-align`, never through the context.
   */
  .v-pagination[data-responsive] {
    container-type: inline-size;
    container-name: v-pagination;
  }

  .v-pagination[data-align='center'] {
    justify-content: center;
  }

  .v-pagination[data-align='end'] {
    justify-content: flex-end;
  }

  .v-pagination-items {
    display: inline-flex;
    align-items: center;
    gap: var(--vectis-space-1);
  }

  /* attached: the joining is done by VButtonGroup's negative margins */
  .v-button-group.v-pagination-items {
    gap: 0;
  }

  /* The `[data-size]` selector (VButton always renders the attribute) beats
     `.v-button`'s own `padding-inline` whatever the order in which the consumer's
     bundler concatenates the CSS — the VIconButton idiom. */
  .v-pagination-page[data-size] {
    /* A square pill at one digit, widening by itself beyond that: the variable is
       set by v-control on this same element, so one rule covers all 5 sizes ×
       compact. */
    min-inline-size: var(--control-height);
    padding-inline: var(--vectis-space-2);
  }

  /* the ellipsis is not a disabled button in the user's sense */
  .v-pagination-ellipsis {
    cursor: default;
  }

  /* chevrons: the direction is physical, so the icon flips in RTL */
  [dir='rtl'] .v-pagination-control .v-icon {
    scale: -1 1;
  }

  /*
   * Responsive truncation — the nav is its own query container, so the steps
   * follow the space allocated to the component, never the viewport (no
   * ResizeObserver). The thresholds are literals: @container conditions do not
   * accept var(). They are calibrated on size="md"; for the extreme cases (size
   * xl, a 5-digit length), the escape hatch is `totalVisible` or
   * `responsive: false`.
   *
   * Each threshold is the width NEEDED to display the level concerned — not what
   * is left after hiding, otherwise the row overflows for the whole interval. At
   * size md: a pill and a control are one control height wide (2.5rem), the gutter
   * 0.25rem, so 2.75rem per element. A 13-element row (totalVisible 11) needs
   * ~35.5rem, 11 elements ~30rem, 9 elements ~24.5rem — hence 36 / 31 / 25rem,
   * margin included.
   *
   * The most distant neighbours fall first. `[data-edge]` (the bounds) and the
   * current page carry no `data-distance`, so they are never targeted.
   * `display: none` also removes them from the tab order and the accessibility
   * tree — that is intended.
   *
   * No ellipsis is added to compensate for a hidden neighbour: it occupies exactly
   * the width of a pill, so it would gain nothing.
   */
  @container v-pagination (max-width: 36rem) {
    .v-pagination[data-responsive] .v-pagination-page[data-distance='3'] {
      display: none;
    }
  }

  @container v-pagination (max-width: 31rem) {
    .v-pagination[data-responsive] .v-pagination-page[data-distance='2'] {
      display: none;
    }

    /* A control in 'both' mode costs ~4× a pill: folding it down to icon-only
       frees more room than sacrificing a neighbour, so it comes before the last
       step. Never in 'text' mode — nothing clickable would be left. */
    .v-pagination[data-responsive][data-controls-display='both'] .v-pagination-control-label {
      display: none;
    }
  }

  @container v-pagination (max-width: 25rem) {
    .v-pagination[data-responsive] .v-pagination-page[data-distance='1'] {
      display: none;
    }
  }
}
</style>
