<script setup lang="ts">
// @keyboard @core
/**
 * The row of page numbers under a long list. Every pill is a VButton and the previous
 * and next controls are buttons too, so nothing about hovering, focusing or disabling
 * is written again here.
 *
 * A long list has more pages than fit on a line, and the row deals with that TWICE,
 * for two different reasons. First logically: `totalVisible` fixes how many slots are
 * rendered at all, and the pages that do not fit are replaced by an ellipsis — pure
 * arithmetic, identical on the server and in the browser. Then visually: as the space
 * actually available narrows, the neighbours of the current page are hidden one step
 * at a time, and that half is entirely CSS, the row asking about its own width rather
 * than being measured from code.
 *
 * The only behavioural JavaScript is the keyboard, explained where it is written.
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
  /** How many pages there are in all. */
  length?: number
  /**
   * How many slots to render, ellipses counted among them — so the row keeps exactly
   * the same width whichever page is current. Below five there would be nothing left
   * to show around the current page, so five is the effective minimum. Left out, every
   * page is rendered.
   */
  totalVisible?: number

  /** Joins every button into one segmented control. */
  attached?: boolean
  /**
   * How the pages OTHER than the current one, and the controls, are drawn. The current
   * page is always filled, whatever this says.
   */
  variant?: 'ghost' | 'outline'
  /** The colour the current page takes. The other pages and the controls stay neutral. */
  tone?: 'accent' | 'neutral' | 'danger'
  /** The height of the buttons, from the scale shared by every control. */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Takes 4px off the height of every button. */
  compact?: boolean
  /**
   * Where the row sits in the space it is given. It only matters in responsive mode,
   * where the row takes the whole width available.
   */
  align?: 'start' | 'center' | 'end'

  /** Shows the previous and next buttons on either side of the pages. */
  showControls?: boolean
  /** Whether those controls show an icon, their label, or both. */
  controlsDisplay?: 'icon' | 'text' | 'both'
  /** The icon of the previous control: an icon name, or an explicit render. */
  prevIcon?: IconSource
  /** The icon of the next control: an icon name, or an explicit render. */
  nextIcon?: IconSource
  /**
   * The wording of the previous control, used both as its visible text and as what
   * screen readers announce. It falls back to the design system dictionary.
   */
  prevLabel?: string
  /**
   * The wording of the next control, used both as its visible text and as what screen
   * readers announce. It falls back to the design system dictionary.
   */
  nextLabel?: string

  /** Makes the whole component unusable. */
  disabled?: boolean
  /**
   * Which pages cannot be reached, as a list or as a function. The previous and next
   * controls step OVER them rather than stopping at one.
   */
  disabledPages?: number[] | ((page: number) => boolean)

  /**
   * Lets the row shed pages as the space narrows, by asking about its own width. It is
   * off by default, because it makes the row take the full width available.
   */
  responsive?: boolean

  /**
   * What screen readers announce for the navigation itself. It falls back to the
   * design system dictionary.
   */
  label?: string
  /**
   * How a page is announced. A pill shows a bare number, which alone means nothing to
   * a screen reader — this is what turns it into "Page 3". It falls back to the design
   * system dictionary.
   */
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

// The prop wins over the dictionary, and above both, a consumer's own aria-label or
// aria-labelledby still wins — that arbitration is what `useAriaLabel` is for.
const m = useMessages()
const ariaLabel = useAriaLabel(() => props.label ?? m.value.pagination.label)
const resolvedPrevLabel = computed(() => props.prevLabel ?? m.value.pagination.previous)
const resolvedNextLabel = computed(() => props.nextLabel ?? m.value.pagination.next)

const page = defineModel<number>({ default: 1 })

/** One slot in the row: either a page, or the ellipsis standing for those left out. */
type PaginationItem =
  | { kind: 'page'; key: string; page: number; edge: boolean; distance: number }
  | { kind: 'gap'; key: string }

const total = computed(() => Math.max(Math.trunc(props.length), 1))
const currentPage = computed(() => clamp(page.value, 1, total.value))

const isPageDisabled = computed(() => resolveMatcher(props.disabledPages))

// @a11y — a pill shows nothing but a number, which on its own tells a screen reader
// nothing at all; this is what has it announced as "Page 3".
function pageLabelFor(n: number): string {
  return props.pageLabel ? props.pageLabel(n) : m.value.pagination.page(n)
}

/**
 * Works out which slots the row holds.
 *
 * The count is CONSTANT: `totalVisible` counts everything rendered, the ellipses
 * included, so the row never changes width as one moves through the pages. The window
 * of pages around the current one is centred on it, and near either end it SHIFTS
 * rather than shrinking — which is what keeps that count constant there too.
 *
 * Each page also carries how far it is from the current one. That distance is what the
 * responsive hiding sorts by, and it is capped at three: past that, the most distant
 * neighbours all disappear together at the first step.
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
  // Keyed by the side it stands on, never by the page it follows: there is at most one
  // ellipsis per side, and the left one always comes after the first page while the right
  // one always comes before the last. A key derived from the window would change on every
  // navigation, so the right-hand ellipsis would be destroyed and rebuilt each time the
  // window slid, for a node that never changes.
  const gap = (side: 'start' | 'end'): PaginationItem => ({ kind: 'gap', key: `gap-${side}` })

  // With no limit given, nothing is left out. Below five slots there would be no room
  // for the first page, an ellipsis, the current page, another ellipsis and the last,
  // so that is the floor.
  const visible =
    props.totalVisible === undefined ? count : Math.max(Math.trunc(props.totalVisible), 5)
  if (visible >= count) return pages(1, count)

  const start = current - Math.floor((visible - 5) / 2)
  const end = start + (visible - 5)

  // Close to either end, an ellipsis on that side would stand for no missing page at
  // all. The window is stretched to the bound instead, which both avoids that and
  // keeps the number of slots exactly the same.
  if (start <= 3) return [...pages(1, visible - 2), gap('end'), pageItem(count)]
  if (end >= count - 2) return [pageItem(1), gap('start'), ...pages(count - visible + 3, count)]
  return [pageItem(1), gap('start'), ...pages(start, end), gap('end'), pageItem(count)]
})

/**
 * Where a control leads: the nearest page in that direction that can actually be
 * reached, disabled ones being stepped over rather than stopped at.
 *
 * Answering `undefined` means there is none left, which disables the control — and
 * that single answer also covers being on the first or the last page, with no separate
 * test for the ends.
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

// @keyboard @a11y
/**
 * The arrow keys, through the shared implementation in `utils/arrowNav`. Tab is left
 * alone: every visible pill remains a stop in the tab order, as in any list of links.
 *
 * The pills the responsive rules have hidden are left out by the helper, which skips
 * anything not displayed — so they cannot be focused into.
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
    <!-- Joined, the row is a VButtonGroup, which merges the borders of its DIRECT
         button children. That is why there is no list markup wrapping the pills, and
         why the ellipsis is itself an inert button rather than a plain span: anything
         else between two pills would break the seam. -->
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
        <!-- The control is named explicitly even though its label is visible: at
             narrow widths that label is hidden and only the icon remains, and the name
             a screen reader announces has to survive that. -->
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
        <!-- The ellipsis is a disabled button rather than a span: being a button, it
             keeps the joined row's seam continuous and follows the size and density
             like everything else. Disabling it takes it out of the tab order, and it
             is hidden from screen readers, which have the page numbers themselves. -->
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
   * Making the row a query container is reserved for responsive mode, since every
   * query below depends on it — and it is not free.
   *
   * A container of this kind computes its width WITHOUT looking at its content, so the
   * row has to be block-level: as an inline box it would measure zero and hide
   * everything at once. It therefore takes its parent's whole width, which is exactly
   * what makes the hiding follow the space the component was actually given, and what
   * obliges a flex parent to grant it one.
   *
   * Outside responsive mode the row keeps a width of its own and sits like any other
   * content. Either way the alignment is asked for explicitly and never inferred.
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

  /* Joined, the gap goes: VButtonGroup pulls the buttons onto one another itself. */
  .v-button-group.v-pagination-items {
    gap: 0;
  }

  /* Qualified by an attribute VButton always renders, which is what makes both of these
     beat that button's own padding and its own transition whatever order the two sheets
     end up in — the VIconButton idiom. */
  .v-pagination-page[data-size] {
    /* A one-digit pill is square, and widens by itself past that. The height variable
       is set by the shared size class on this very element, so this single rule covers
       all five sizes and their compact forms. */
    min-inline-size: var(--control-height);
    padding-inline: var(--vectis-space-2);

    /*
     * The current page changes appearance instantly, and that is deliberate: VButton
     * fades `background-color` and `color` over `--vectis-duration-fast`, which is right
     * for a button that stays put, and wrong here. Truncation SHIFTS its window, so from
     * one page to the next the highlight keeps its slot but changes ELEMENT — the pill
     * that was current fades out while its neighbour fades in, over the very same
     * 120 ms. Delete this line and two adjacent pills are half-tinted for a few frames,
     * which reads as a flicker; nothing in the console says a word about it.
     *
     * No duration avoids that: a symmetric fade overlaps, and an asymmetric one either
     * leaves the row with no highlight at all or lets the outgoing pill trail at full
     * strength behind the new one. Keeping the fade for hover alone is not expressible
     * either — a transition is resolved from the state being entered, and the pill
     * losing the highlight enters "neither current nor hovered", the exact state of a
     * pill the pointer has just left. So the hover fade goes with it, on the pills only:
     * the previous and next controls never change active state and keep theirs.
     */
    transition: none;
  }

  /* The ellipsis is a disabled button only as a technical device; to the reader it is
     not a control that has been turned off, so it does not take the forbidden
     cursor. */
  .v-pagination-ellipsis {
    cursor: default;
  }

  /* A chevron points at a physical direction, which the logical properties do not
     mirror: in a right-to-left page it has to be flipped by hand. */
  [dir='rtl'] .v-pagination-control .v-icon {
    scale: -1 1;
  }

  /*
   * The responsive half of the truncation. The row asks about ITS OWN width, so the
   * steps follow the space the component was given rather than the size of the window
   * — a sidebar and a full-width page behave differently, as they should, and nothing
   * has to be measured from code.
   *
   * The thresholds are written as literal lengths because a container query accepts no
   * variables. They are calibrated on the default size: there, a pill and a control are
   * each one control height wide, 2.5rem, plus a 0.25rem gutter, so 2.75rem apiece — a
   * thirteen-slot row needs about 35.5rem, eleven about 30, nine about 24.5, hence the
   * three thresholds with a little margin. For the extreme cases, the biggest size or
   * five-digit page numbers, the way out is `totalVisible` or turning this off.
   *
   * Each threshold is the width NEEDED to show that level, and not what remains once
   * something is hidden: written the other way round, the row would overflow for the
   * whole interval before the next step took effect.
   *
   * The most distant neighbours go first. The first and last pages, and the current
   * one, carry no distance at all, so no rule here can ever reach them. Hiding them
   * outright also takes them out of the tab order and out of the accessibility tree,
   * which is intended: a control nobody can see should not be reachable.
   *
   * No ellipsis is added in place of a hidden neighbour — it is exactly as wide as the
   * pill it would replace, so it would free nothing.
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

    /* A control showing both its icon and its label is about four times as wide as a
       pill, so dropping its label frees more room than sacrificing another page —
       which is why it happens before the last step. It is never done when the control
       shows text alone: there would be nothing left to click. */
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
