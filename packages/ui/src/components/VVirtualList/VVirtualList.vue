<script setup lang="ts" generic="T">
// @a11y @ssr @core
/**
 * A list too long to render whole: only the rows near its viewport exist in the page. It is its
 * own scroll container, focusable so the keyboard can scroll it, and each row says where it
 * stands in the whole list. Rows are measured as they render, so they may differ in height.
 */
import { computed, ref, toRaw, watch } from 'vue'

import VSpinner from '../VSpinner/VSpinner.vue'
import { useInfiniteScroll } from '../../composables/useInfiniteScroll'
import { useVirtualList } from '../../composables/useVirtualList'
import { useMessages } from '../../i18n/state'
import { cssSize } from '../../utils/css'
import { isDev } from '../../utils/env'

/** Where `scrollToIndex` brings the row: to the top, the middle, the bottom, or barely in view. */
export type VirtualListAlign = ScrollLogicalPosition

/** What the default slot receives for each rendered row. */
export interface VirtualListItemSlotProps<T> {
  item: T
  index: number
}

/** The props of VVirtualList, for a row type `T`. */
export interface VirtualListProps<T> {
  /** The rows of the list, all of them: only those near the viewport are rendered. */
  items: T[]
  /**
   * The field identifying a row, under which its measured height is remembered. Without it a
   * row is identified by its position, which suits a list that only grows at the end.
   */
  itemKey?: string
  /**
   * The height assumed for a row not rendered yet, in pixels. Each row is measured once it
   * renders, so this is only an estimate; the closer it is, the steadier the scrollbar.
   */
  itemSize?: number
  /** How many rows to render beyond each edge of the viewport, so a fast scroll shows no gap. */
  overscan?: number
  /**
   * How many rows to render before the list can measure its viewport: on the server and until
   * the page is hydrated.
   */
  initialCount?: number
  /**
   * The height of the list: a number of pixels or any CSS length. Without it, give the list a
   * bounded height in your own CSS; a list that grows with its content renders every row.
   */
  height?: number | string
  /** The accessible name of the list. */
  label?: string
  /** Says that rows are being loaded: a row with a spinner ends the list. */
  loading?: boolean
  /** What that row says, and what the spinner is announced as. */
  loadingText?: string
  /**
   * Says that there are more rows to come, which makes the list ask for them as its end comes
   * into view. The total is then announced as unknown.
   */
  hasMore?: boolean
}

const props = withDefaults(defineProps<VirtualListProps<T>>(), {
  itemKey: undefined,
  itemSize: 40,
  overscan: 5,
  initialCount: 10,
  height: undefined,
  label: undefined,
  loading: false,
  loadingText: undefined,
  hasMore: false,
})

const emit = defineEmits<{
  /** The end of the list has come into view: send the next rows. */
  'load-more': []
}>()

defineSlots<{
  /** One row of the list. */
  default(props: VirtualListItemSlotProps<T>): unknown
  /** Replaces the spinner and the text of the loading row. */
  loading?(): unknown
}>()

const m = useMessages()
const resolvedLoadingText = computed(() => props.loadingText ?? m.value.common.loading)

const listEl = ref<HTMLElement | null>(null)
const sentinelEl = ref<HTMLElement | null>(null)

// Read through the raw array: computing the offsets visits every row's key, and a reactive read
// for each of a hundred thousand rows is what would make scrolling stutter. The length is still
// read reactively, so rows pushed in place are seen.
function keyOf(index: number): unknown {
  if (!props.itemKey) return index
  const item = toRaw(props.items)[index] as Record<string, unknown> | undefined
  return item?.[props.itemKey]
}

// @a11y
// The row holding the focus stays rendered while the list scrolls away from it: dropping it
// would send the focus back to the page.
const focusedIndex = ref(-1)

const virtualList = useVirtualList({
  scrollEl: listEl,
  count: () => props.items.length,
  key: keyOf,
  itemSize: () => props.itemSize,
  overscan: () => props.overscan,
  initialCount: () => props.initialCount,
  pinned: () => (focusedIndex.value >= 0 ? [focusedIndex.value] : []),
})
const { segments, measure } = virtualList

function rowOf(target: EventTarget | null) {
  if (!(target instanceof Element)) return -1
  const row = target.closest('.v-virtual-list-item')
  if (!row || row.parentElement !== listEl.value) return -1
  return Number((row as HTMLElement).dataset.index)
}

function onFocusin(event: FocusEvent) {
  focusedIndex.value = rowOf(event.target)
}

function onFocusout(event: FocusEvent) {
  focusedIndex.value = rowOf(event.relatedTarget)
}

useInfiniteScroll({
  sentinelEl,
  root: () => listEl.value,
  canLoad: () => props.hasMore && !props.loading,
  loaded: () => props.items,
  onLoadMore: () => emit('load-more'),
})

// @devwarn
// A list without a bounded height grows with its content, so every row is in view and
// rendered: the symptom is a long list that never scrolls.
if (isDev) {
  watch(
    segments,
    (list) => {
      const el = listEl.value
      if (!el || props.items.length < 100 || el.scrollHeight > el.clientHeight) return
      if (list.some((segment) => segment.type === 'spacer')) return
      console.warn(
        '[VVirtualList] Every row is rendered because the list does not scroll: give it a `height` or a bounded height in CSS.',
      )
    },
    { flush: 'post', once: true },
  )
}

defineExpose({
  /**
   * Scrolls the list until a row is in view, rendering it first if needed. `align` places it at
   * the top, the middle or the bottom; by default it moves as little as possible.
   */
  scrollToIndex: (index: number, align?: VirtualListAlign) =>
    virtualList.scrollToIndex(index, align),
  /** The scrolling element, which carries the list role. */
  el: listEl,
})
</script>

<template>
  <div
    ref="listEl"
    class="v-virtual-list"
    role="list"
    tabindex="0"
    :aria-label="label"
    :aria-busy="loading ? 'true' : undefined"
    :style="{ blockSize: cssSize(height) }"
    @focusin="onFocusin"
    @focusout="onFocusout"
  >
    <template
      v-for="segment in segments"
      :key="segment.type === 'row' ? `row:${String(keyOf(segment.index))}` : segment.key"
    >
      <div
        v-if="segment.type === 'spacer'"
        class="v-virtual-list-spacer"
        aria-hidden="true"
        :style="{ blockSize: `${segment.size}px` }"
      />
      <div
        v-else
        :ref="(el) => measure(el as Element | null, segment.index)"
        role="listitem"
        class="v-virtual-list-item"
        :aria-setsize="hasMore ? -1 : items.length"
        :aria-posinset="segment.index + 1"
        :data-index="segment.index"
      >
        <slot :item="items[segment.index]!" :index="segment.index" />
      </div>
    </template>

    <!--
      A single element for as long as more rows may come: replacing it would cancel the
      observation, and no further rows would be asked for. Hidden from assistive technology,
      which hears `aria-busy` on the list instead.
    -->
    <div v-if="hasMore || loading" ref="sentinelEl" class="v-virtual-list-more" aria-hidden="true">
      <slot v-if="loading" name="loading">
        <VSpinner :label="resolvedLoadingText" />
        <span>{{ resolvedLoadingText }}</span>
      </slot>
    </div>
  </div>
</template>

<style>
@layer vectis.components {
  /*
   * The list corrects its scroll itself when a row above the view changes height; the browser's
   * own anchoring would apply the same correction a second time. Positioned, so it contains the
   * absolutely positioned parts of the rows: positioned against an ancestor beyond it, they
   * escape its clip and stretch the page.
   */
  .v-virtual-list {
    position: relative;
    display: block;
    overflow-y: auto;
    overflow-anchor: none;
    border-radius: var(--vectis-radius-xs);
  }

  .v-virtual-list:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  /*
   * A row contains the margins of its content: collapsing through it, they would sit between
   * rows where no measurement sees them.
   */
  .v-virtual-list-item {
    display: flow-root;
  }

  .v-virtual-list-more {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--vectis-space-2);
    min-block-size: var(--vectis-control-height-md);
    padding: var(--vectis-space-2);
    font-size: var(--vectis-text-body-sm-size);
    font-weight: var(--vectis-text-body-sm-weight);
    line-height: var(--vectis-text-body-sm-leading);
    color: var(--vectis-color-text-muted);
  }
}
</style>
