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
import { computed, h, nextTick, ref } from 'vue'
import type { FunctionalComponent } from 'vue'

import VButton from '../VButton/VButton.vue'
import VButtonGroup from '../VButton/VButtonGroup.vue'
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import { chevron_left as chevronLeftIcon } from '../VIcon/icons/chevron_left'
import { chevron_right as chevronRightIcon } from '../VIcon/icons/chevron_right'
import { more_horiz as moreHorizIcon } from '../VIcon/icons/more_horiz'
import type { IconSource } from '../VIcon/types'
import VIconButton from '../VIconButton/VIconButton.vue'

import { arrowNavigate, navigableItems } from '../../utils/arrowNav'
import { clamp } from '../../utils/number'
import { resolveMatcher } from '../../utils/matcher'

import { useAriaLabel } from '../../composables/useAriaLabel'
import { useMessages } from '../../i18n/state'

/** How the pages that are not the current one are drawn. */
export type PaginationItemVariant = 'ghost' | 'outline'

/** How the current page is drawn. */
export type PaginationSelectedVariant = 'solid' | 'soft' | 'ghost'

/** The colour of the current page. */
export type PaginationTone = 'accent' | 'neutral' | 'danger'

/** The height of the pills, from the scale every control shares. */
export type PaginationSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/** Where the row sits in the width it is given. */
export type PaginationAlign = 'start' | 'center' | 'end'

/** Whether the previous and next controls are rendered, and what they show. */
export type PaginationControls = false | 'icon' | 'text' | 'both'

/**
 * Which pages cannot be reached, given either as a list of page numbers or as a function
 * answering that question for a page.
 */
export type PaginationMatcher = number[] | ((page: number) => boolean)

interface PaginationProps {
  /**
   * How many pages there are in all. It is 1 by default, which renders a single page: the
   * real count almost always has to be given.
   */
  length?: number
  /**
   * How many slots to render, ellipses counted among them, so the row keeps exactly
   * the same width whichever page is current. Below five there would be nothing left
   * to show around the current page, so five is the effective minimum. Left out, every
   * page is rendered.
   */
  totalVisible?: number

  /**
   * Separates the buttons instead of joining them into one segmented control. It is the
   * word VButtonGroup and VToggle use for the same question, in the same direction.
   */
  detached?: boolean
  /**
   * Takes the lines out from between the joined buttons, so the row reads as one frame rather
   * than as segments, on the terms of VButtonGroup's own `seamless`. It has no effect under
   * `detached`.
   */
  seamless?: boolean
  /**
   * How the pages OTHER than the current one, and the controls, are drawn. What the current
   * page takes is `selectedVariant`. It is named for the ITEMS because that is what it
   * paints: on VTabs and VDataTable `variant` names the decoration of the frame instead.
   */
  itemVariant?: PaginationItemVariant
  /**
   * How the current page is drawn, in the row's tone: filled, tinted, or the colour of its
   * text alone. The same choice as VToggle's `selectedVariant`.
   */
  selectedVariant?: PaginationSelectedVariant
  /** The colour the current page takes. The other pages and the controls stay neutral. */
  tone?: PaginationTone
  /** The height of the buttons, from the scale shared by every control. */
  size?: PaginationSize
  /** Takes 4px off the height of every button. */
  compact?: boolean
  /**
   * Raises the row off the page, on the terms of VButton's own `elevated`. Joined, the
   * shadow belongs to the ROW and not to each pill, which is what stops it falling into
   * the joints; detached, every button carries its own.
   */
  elevated?: boolean
  /**
   * Where the row sits in the space it is given. It only matters in responsive mode,
   * where the row takes the whole width available.
   */
  align?: PaginationAlign

  /**
   * The previous and next buttons on either side of the pages: what they show, or `false`
   * to leave them out. One prop rather than two, the shape VFilePicker's `preview` and
   * VCarousel's `controls` already use.
   */
  controls?: PaginationControls
  /** The icon of the previous control: an icon name, or an explicit render. */
  prevIcon?: IconSource
  /** The icon of the next control: an icon name, or an explicit render. */
  nextIcon?: IconSource
  /**
   * The wording of the previous control, used both as its visible text and as what
   * screen readers announce. It falls back to the design system dictionary.
   */
  prevText?: string
  /**
   * The wording of the next control, used both as its visible text and as what screen
   * readers announce. It falls back to the design system dictionary.
   */
  nextText?: string

  /** Makes the whole component unusable. */
  disabled?: boolean
  /**
   * Which pages cannot be reached, as a list or as a function. The previous and next
   * controls step OVER them rather than stopping at one.
   */
  disabledPages?: PaginationMatcher

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
   * a screen reader: this is what turns it into "Page 3". It falls back to the design
   * system dictionary.
   */
  pageLabel?: (page: number) => string
}

const props = withDefaults(defineProps<PaginationProps>(), {
  length: 1,
  totalVisible: undefined,
  detached: false,
  seamless: false,
  itemVariant: 'ghost',
  selectedVariant: 'solid',
  tone: 'accent',
  size: 'md',
  compact: false,
  elevated: false,
  align: 'start',
  controls: 'icon',
  prevIcon: () => chevronLeftIcon,
  nextIcon: () => chevronRightIcon,
  prevText: undefined,
  nextText: undefined,
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
const resolvedPrevText = computed(() => props.prevText ?? m.value.pagination.previous)
const resolvedNextText = computed(() => props.nextText ?? m.value.pagination.next)

/** The page being shown, counted from 1. It starts on the first. */
const page = defineModel<number>({ default: 1 })

/** One slot in the row: either a page, or the ellipsis standing for those left out. */
type PaginationItem =
  | { kind: 'page'; key: string; page: number; edge: boolean; distance: number }
  | { kind: 'gap'; key: string }

// A length or a model that is not a whole number (`NaN` while a page size is still loading,
// a computed `2.5`) is brought back to a page that exists, or no pill would ever match it.
const total = computed(() => Math.max(Math.trunc(props.length) || 1, 1))
const currentPage = computed(() => clamp(Math.round(page.value) || 1, 1, total.value))

const isPageDisabled = computed(() => resolveMatcher(props.disabledPages))

// @a11y
// A pill shows nothing but a number, which on its own tells a screen reader
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
  const limit = Math.trunc(props.totalVisible ?? count)
  const visible = Number.isNaN(limit) ? count : Math.max(limit, 5)
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

// @a11y
/*
 * The previous and next controls disable themselves once no page is left in their direction,
 * and a focused button that becomes disabled hands the focus to <body>: a keyboard reader
 * pressing "Next page" on the second to last page would be sent back to the top of the
 * document by the next Tab. The focus goes to the page just reached instead, which is always
 * rendered, the current page being the one pill the responsive steps never hide.
 *
 * The focus is read BEFORE the change: a pointer click may not focus a button at all (Safari),
 * and a control that did not hold the focus has nothing to hand on.
 */
async function goFromControl(event: MouseEvent, n: number | undefined) {
  const control = event.currentTarget as HTMLButtonElement
  const hadFocus = control === document.activeElement
  goTo(n)
  if (!hadFocus) return
  await nextTick()
  if (control.disabled) {
    navEl.value?.querySelector<HTMLElement>('[aria-current="page"]')?.focus()
  }
}

/*
 * The previous and next controls, written ONCE: the two differ only by their direction, and
 * a pair of template blocks drifting apart on the next change is exactly what this avoids.
 * A functional component because the two sit at either end of the row, with the pages in
 * between, where a `v-for` over two descriptors could not put them.
 *
 * The icon goes on the side the control points to — before the word going back, after it
 * going forward — and every icon mirrors in a right-to-left page, an arrow pointing at a
 * physical direction.
 *
 * The control is named explicitly even though its label is visible: at narrow widths that
 * label is hidden and only the icon remains, and the name a screen reader announces has to
 * survive that.
 */
const PageControl: FunctionalComponent<{ side: 'prev' | 'next' }> = ({ side }) => {
  const prev = side === 'prev'
  const label = prev ? resolvedPrevText.value : resolvedNextText.value
  const icon = prev ? props.prevIcon : props.nextIcon
  const common = {
    class: 'v-pagination-control',
    variant: props.itemVariant,
    disabled: prev ? prevDisabled.value : nextDisabled.value,
    onClick: (event: MouseEvent) =>
      goFromControl(event, prev ? prevTarget.value : nextTarget.value),
  }
  const glyph = () => h(VIcon, { ...iconProps(icon), mirrored: true })
  if (props.controls === 'icon') return h(VIconButton, { ...common, label }, glyph)
  return h(
    VButton,
    { ...common, tone: 'neutral', 'aria-label': label },
    {
      ...(props.controls === 'both' ? { [prev ? 'start' : 'end']: glyph } : {}),
      default: () => h('span', { class: 'v-pagination-control-label' }, label),
    },
  )
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
  arrowNavigate(event, nav, () => navigableItems(nav, '.v-pagination-page:not(:disabled)'))
}

// The pills are rendered by a VButtonGroup inside the nav, so a template ref reaches none of
// them. `focus` goes to the current page, which every responsive step keeps on screen.
defineExpose({
  // Two queries, not one selector list: a list matches in DOM order, which would hand the
  // focus to the previous control ahead of the current page.
  /** Moves the focus to the current page, or to the first control that can take it. */
  focus: (options?: FocusOptions) =>
    (
      navEl.value?.querySelector<HTMLElement>('[aria-current="page"]:not(:disabled)') ??
      navEl.value?.querySelector<HTMLElement>('button:not(:disabled)')
    )?.focus(options),
  /** The `<nav>` element, which is also where the consumer's attributes land. */
  el: navEl,
})
</script>

<template>
  <nav
    ref="navEl"
    class="v-pagination"
    :aria-label="ariaLabel"
    :data-align="align"
    :data-item-variant="itemVariant"
    :data-controls="controls || undefined"
    :data-responsive="responsive ? '' : undefined"
    @keydown="onKeydown"
  >
    <!-- The row is a VButtonGroup either way: joined it merges the borders of its DIRECT
         button children, and detached it spaces them, which is all this prop asks of it.
         That is why there is no list markup wrapping the pills, and why the ellipsis is
         itself an inert button rather than a plain span: anything else between two pills
         would break the seam. -->
    <!--
      The size, the density and the elevation are handed to the GROUP, which gives them to
      every button inside, rather than repeated on each child. The elevation has to be there
      in any case, since that is where VButtonGroup draws it: joined, the row takes the shadow
      and the segments give theirs up, or it would fall into every joint.

      `|| undefined` keeps the group opinion-free when the row does not ask, `undefined`
      being what means "no opinion" there where `false` is an order. The size is always an
      opinion, the pagination having a default of its own.
    -->
    <VButtonGroup
      class="v-pagination-items"
      :detached="detached"
      :seamless="seamless"
      :size="size"
      :compact="compact || undefined"
      :elevated="elevated || undefined"
    >
      <PageControl v-if="controls" side="prev" />

      <template v-for="item in items" :key="item.key">
        <VButton
          v-if="item.kind === 'page'"
          class="v-pagination-page"
          :variant="item.page === currentPage ? selectedVariant : itemVariant"
          :tone="item.page === currentPage ? tone : 'neutral'"
          :disabled="disabled || isPageDisabled(item.page)"
          :aria-label="pageLabelFor(item.page)"
          :aria-current="item.page === currentPage ? 'page' : undefined"
          :data-edge="item.edge ? '' : undefined"
          :data-distance="!item.edge && item.distance > 0 ? item.distance : undefined"
          @click="goTo(item.page)"
        >
          {{ item.page }}
        </VButton>
        <!-- The ellipsis is a disabled icon-only button rather than a span: being a button,
             it keeps the joined row's seam continuous and follows the size and density like
             everything else. Disabling it takes it out of the tab order, and it is hidden
             from screen readers, which have the page numbers themselves — which is also why
             it is a VButton and not a VIconButton, whose required label would name something
             nobody can reach. -->
        <VButton
          v-else
          class="v-pagination-ellipsis"
          aria-hidden="true"
          data-icon-only
          :variant="itemVariant"
          tone="neutral"
          disabled
        >
          <template #start>
            <VIcon :name="moreHorizIcon" />
          </template>
        </VButton>
      </template>

      <PageControl v-if="controls" side="next" />
    </VButtonGroup>
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
     * TRAP — the highlight changes instantly, and this must not be "restored for
     * consistency". VButton fades `background-color` over `--vectis-duration-fast`, which is
     * right for a button that stays put and wrong here: truncation SHIFTS its window, so from
     * one page to the next the highlight keeps its slot but changes ELEMENT, and the outgoing
     * and incoming pills are both half-tinted for a few frames — read as a flicker, with
     * nothing in the console.
     *
     * No duration avoids it: symmetric fades overlap, asymmetric ones leave either no
     * highlight or a trailing one. Keeping the fade for hover alone is not expressible
     * either — a transition resolves from the state being ENTERED, and "no longer current"
     * is the same state as "no longer hovered". So the hover fade goes too, on the pills
     * only; the controls never change active state and keep theirs.
     */
    transition: none;
  }

  /* The ellipsis is a disabled button only as a technical device; to the reader it is
     not a control that has been turned off, so it does not take the forbidden
     cursor. Qualified like the pills: VButton's disabled cursor weighs (0,2,0), and a bare
     class loses to it whatever the sheet order. */
  .v-pagination-ellipsis[data-size] {
    cursor: default;
  }

  /*
   * The responsive half of the truncation. The nav queries ITS OWN width, so the steps follow
   * the space the component was given rather than the viewport — a sidebar and a full-width
   * page behave differently, as they should, with nothing measured from code.
   *
   * The thresholds are rem LITERALS, a container query accepting no variables, and are
   * calibrated on `md`: a pill and a control are each 2.5rem plus a 0.25rem gutter, so
   * 2.75rem apiece — thirteen slots need ~35.5rem, eleven ~30, nine ~24.5, hence the three
   * with a little margin. The extremes (the largest size, five-digit page numbers) are what
   * `totalVisible` and `responsive: false` are for.
   *
   * Each threshold is the width NEEDED to show that level, never what remains after hiding:
   * written the other way round the row overflows for the whole interval before the next
   * step takes effect.
   *
   * The most distant neighbours go first. The edges and the current page carry no distance,
   * so no rule here can reach them. `display: none` also takes a hidden pill out of the tab
   * order and the a11y tree, which is intended. No ellipsis replaces one either — it is
   * exactly as wide as the pill it would stand for, so it frees nothing.
   */
  @container v-pagination (max-inline-size: 36rem) {
    .v-pagination[data-responsive] .v-pagination-page[data-distance='3'] {
      display: none;
    }
  }

  @container v-pagination (max-inline-size: 31rem) {
    .v-pagination[data-responsive] .v-pagination-page[data-distance='2'] {
      display: none;
    }

    /* A control showing both its icon and its label is about four times as wide as a
       pill, so dropping its label frees more room than sacrificing another page —
       which is why it happens before the last step. It is never done when the control
       shows text alone: there would be nothing left to click. */
    .v-pagination[data-responsive][data-controls='both'] .v-pagination-control-label {
      display: none;
    }
  }

  @container v-pagination (max-inline-size: 25rem) {
    .v-pagination[data-responsive] .v-pagination-page[data-distance='1'] {
      display: none;
    }
  }

  /*
   * The frame of an `outline` row: the colour its other pages already paint. They are drawn
   * in the NEUTRAL tone, so this is what their `--tone-border-soft` resolves to; naming that
   * variable here instead would read the CURRENT page's tone and tint one segment of the
   * frame accent or red. A disabled page greys its outline to a different token, hence a
   * variable the second rule changes. VToggle's `--toggle-frame` is the same device.
   *
   * `soft` and `ghost` leave VButton's border transparent, which in an outline row opens a
   * gap in the frame for the whole width of the current page (the `SelectedVariants` play
   * function). Restoring it on all four sides keeps the frame closed wherever the current
   * page sits; seamless, the shared edges are cleared again by VButtonGroup's own (0,6,0)
   * rules, which these (0,5,0) ones stay below.
   */
  .v-pagination[data-item-variant='outline'] {
    --pagination-frame: var(--vectis-color-border-strong);
  }

  .v-pagination[data-item-variant='outline']
    > *
    > .v-pagination-page:is(:disabled, [aria-disabled='true']) {
    --pagination-frame: var(--vectis-color-border);
  }

  .v-pagination[data-item-variant='outline']
    > *
    > .v-pagination-page[aria-current='page']:is([data-variant='soft'], [data-variant='ghost']) {
    border-color: var(--pagination-frame);
  }

  /*
   * Windows forced colors replace every background with the page's, so the current page would look
   * exactly like the others there: the fill is its only cue, the state being in an ARIA
   * attribute a sighted reader never sees. It takes the system's own selection pair
   * instead, and opts out of the forcing for that element alone so the pair is painted.
   *
   * TRAP — the class is repeated to reach (0,6,0). The variant, hover and active rules
   * reach (0,5,0), and with the forcing turned off any of them that still won would paint
   * its tone over the selection, with HighlightText on top of it.
   */
  @media (forced-colors: active) {
    .v-pagination-page.v-pagination-page.v-pagination-page.v-pagination-page[aria-current='page']:not(
        :disabled
      ) {
      forced-color-adjust: none;
      background-color: Highlight;
      color: HighlightText;
      border-color: Highlight;
      outline-color: CanvasText;
    }
  }
}
</style>
