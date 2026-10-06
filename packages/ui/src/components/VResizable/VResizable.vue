<script setup lang="ts">
/**
 * No native element resizes siblings, so each handle follows the APG window splitter: a focusable
 * `separator` carrying the size of its primary panel, moved with the arrow keys or dragged under
 * pointer capture. Sizes are percentages rendered as `flex-grow` weights, which needs no
 * measurement on the server.
 */

import {
  cloneVNode,
  computed,
  onMounted,
  provide,
  ref,
  shallowReactive,
  shallowRef,
  useId,
  watchEffect,
  type FunctionalComponent,
  type VNode,
} from 'vue'

import { useSlotNodes } from '../../composables/useSlotNodes'
import { useMessages } from '../../i18n/state'
import { isRtl } from '../../utils/direction'
import { isDev } from '../../utils/env'
import { clamp } from '../../utils/number'
import { resizableKey, type ResizablePanelEntry } from './context'
import { defaultSizes, isCollapsedAt, resizeAt, type PanelLimits } from './layout'
import VResizablePanel from './VResizablePanel.vue'

/** Which way the panels are laid out: side by side, or stacked. */
export type ResizableOrientation = 'horizontal' | 'vertical'

/** A panel limit: a number in percent of the group, or a CSS length such as `240px`. */
export type ResizableLength = number | string

interface ResizableProps {
  /**
   * `horizontal` puts the panels side by side, following the direction of the text; `vertical`
   * stacks them, and the group then needs a height.
   */
  orientation?: ResizableOrientation
  /** Fixes the sizes: the handles can neither be dragged nor focused. */
  disabled?: boolean
  /** Draws a grip in the middle of every handle, which makes it easier to find. */
  grip?: boolean
  /** How far an arrow key moves a handle, in percent of the group. */
  step?: number
}

const props = withDefaults(defineProps<ResizableProps>(), {
  orientation: 'horizontal',
  disabled: false,
  grip: false,
  step: 5,
})

/**
 * The size of each panel, in percent of the space they share, adding up to 100. Left unbound,
 * the panels start from their `defaultSize`.
 */
const model = defineModel<number[]>()

const emit = defineEmits<{
  /**
   * The sizes have settled: a handle was released, moved with a key, or a panel collapsed or
   * reopened. Save them here rather than on every `update:modelValue` of a drag.
   */
  change: [sizes: number[]]
}>()

defineSlots<{
  /** The `<VResizablePanel>`s, two or more. A handle is placed between each pair. */
  default(): unknown
}>()

const m = useMessages()
const baseId = useId()
const rootEl = ref<HTMLElement | null>(null)
const horizontal = computed(() => props.orientation === 'horizontal')

// @ssr
/*
 * The panels are read from the slot's VNodes, never from a registry fed at mount, which would
 * render no handle on the server. Cloning gives each panel its position and the id its handle
 * points at (the VCarousel idiom).
 */
const nodes = useSlotNodes()
const panels = computed(() => nodes.value.filter((node) => node.type === VResizablePanel))

const nodeProp = (node: VNode, camel: string, kebab: string): unknown =>
  node.props?.[camel] ?? node.props?.[kebab]

const panelId = (node: VNode, index: number) =>
  (node.props?.id as string | undefined) ?? `${baseId}-panel-${index}`

const defaults = computed(() =>
  defaultSizes(
    panels.value.map((node) => {
      const size = nodeProp(node, 'defaultSize', 'default-size')
      return size === undefined || size === null ? undefined : Number(size)
    }),
  ),
)

const sizes = computed(() =>
  model.value?.length === panels.value.length ? model.value : defaults.value,
)

const entries = shallowReactive(new Map<string, ResizablePanelEntry>())
const entryAt = (index: number) => {
  for (const entry of entries.values()) if (entry.index === index) return entry
  return undefined
}

/** Restored when a collapsed panel reopens: its size when it collapsed, by panel. */
const restoreSizes = new WeakMap<ResizablePanelEntry, number>()

// @core
/*
 * CSS lengths are converted at each interaction, against the space the panels share at that
 * moment. The pixels are cached so that the ARIA values can be derived reactively.
 */
const space = ref(0)
const pixels = shallowReactive(new Map<string, number>())

const lengthKey = (length: string) => `${props.orientation}:${length}`

function percentOf(length: ResizableLength | undefined): number | undefined {
  if (length === undefined) return undefined
  if (typeof length === 'number') return length
  if (length.trim().endsWith('%')) return Number.parseFloat(length)
  const px = pixels.get(lengthKey(length))
  return px === undefined || !space.value ? undefined : (px / space.value) * 100
}

const limits = computed<PanelLimits[]>(() =>
  panels.value.map((_, index) => {
    const entry = entryAt(index)
    const min = clamp(percentOf(entry?.minSize) ?? 0, 0, 100)
    return {
      min,
      max: clamp(percentOf(entry?.maxSize) ?? 100, min, 100),
      collapsible: !!entry?.collapsible,
      collapsedSize: clamp(percentOf(entry?.collapsedSize) ?? 0, 0, min),
    }
  }),
)

/**
 * The sizes as laid out: a collapsed panel keeps its collapsed size, and the others share the
 * rest in proportion to their weights, as `flex-grow` distributes it. `before` gives one panel
 * back the collapsed state it had before its model changed.
 */
function layoutOf(before?: { index: number; collapsed: boolean }) {
  const fixed = sizes.value.map((_, i) =>
    (i === before?.index ? before.collapsed : entryAt(i)?.collapsed)
      ? limits.value[i]!.collapsedSize
      : undefined,
  )
  const fixedTotal = fixed.reduce<number>((sum, size) => sum + (size ?? 0), 0)
  const weights = sizes.value.reduce((sum, size, i) => sum + (fixed[i] === undefined ? size : 0), 0)
  return sizes.value.map(
    (size, i) => fixed[i] ?? (weights ? (size / weights) * (100 - fixedTotal) : 0),
  )
}

const layout = computed(() => layoutOf())

function lengthInPixels(root: HTMLElement, length: string): number {
  const probe = document.createElement('div')
  probe.style.position = 'absolute'
  probe.style.visibility = 'hidden'
  probe.style.setProperty(horizontal.value ? 'width' : 'height', length)
  root.append(probe)
  const rect = probe.getBoundingClientRect()
  probe.remove()
  return horizontal.value ? rect.width : rect.height
}

/**
 * Measures the panels as they are drawn, which accounts for CSS limits that the weights alone do
 * not show, and refreshes the converted lengths. It falls back to the computed layout when
 * nothing can be measured.
 */
function measure(before?: { index: number; collapsed: boolean }): number[] {
  const root = rootEl.value
  const rects = panels.value.map((_, i) => entryAt(i)?.el?.getBoundingClientRect())
  const extents = rects.map((rect) => (rect ? (horizontal.value ? rect.width : rect.height) : 0))
  const total = extents.reduce((sum, extent) => sum + extent, 0)
  if (!root || !total || rects.some((rect) => !rect)) return layoutOf(before)
  for (const entry of entries.values())
    for (const length of [entry.minSize, entry.maxSize, entry.collapsedSize])
      if (typeof length === 'string' && !length.trim().endsWith('%'))
        pixels.set(lengthKey(length), lengthInPixels(root, length))
  space.value = total
  const laidOut = layoutOf(before)
  // Within two pixels, the difference is the 1px lines shrunk off the panels: the computed sizes
  // are kept, so the model does not fill with measurement noise. Beyond, CSS limits are at work.
  const drawn = extents.every((extent, i) => Math.abs(extent - (laidOut[i]! * total) / 100) < 2)
  return drawn ? laidOut : extents.map((extent) => (extent / total) * 100)
}

onMounted(measure)

const sameSizes = (a: readonly number[], b: readonly number[]) =>
  a.length === b.length && a.every((size, i) => Math.abs(size - b[i]!) < 0.01)

/** Writes new sizes and the collapsed state they imply, remembering what collapsing panels had. */
function apply(next: number[], base: readonly number[]) {
  if (!sameSizes(next, sizes.value)) model.value = next
  next.forEach((size, i) => {
    const entry = entryAt(i)
    const lim = limits.value[i]!
    if (!entry || !lim.collapsible) return
    const now = isCollapsedAt(size, lim)
    if (now && !isCollapsedAt(base[i]!, lim)) restoreSizes.set(entry, base[i]!)
    entry.setCollapsed(now)
  })
}

function commit(next: number[], base: readonly number[]) {
  apply(next, base)
  if (!sameSizes(next, base)) emit('change', next)
}

/**
 * The size a reopened panel returns to: the one it had when it collapsed, or its starting size,
 * within its limits.
 */
function reopenSize(index: number) {
  const entry = entryAt(index)
  const lim = limits.value[index]!
  const remembered = entry && restoreSizes.get(entry)
  return clamp(remembered ?? defaults.value[index]!, lim.min, lim.max)
}

/** Collapses or reopens a panel through the handle after it, or before it for the last one. */
function sizesWithCollapsed(index: number, collapse: boolean, base: readonly number[]) {
  const lim = limits.value[index]!
  const growth = (collapse ? lim.collapsedSize : reopenSize(index)) - base[index]!
  return index < base.length - 1
    ? resizeAt(base, index, growth, limits.value, 1)
    : resizeAt(base, index - 1, -growth, limits.value, 1)
}

/**
 * The panel a handle reports on and collapses: the one before it, unless only the one after it
 * can collapse, as for a sidebar on the end side.
 */
function primaryOf(handle: number) {
  const before = limits.value[handle]
  const after = limits.value[handle + 1]
  return !before?.collapsible && after?.collapsible ? handle + 1 : handle
}

provide(resizableKey, {
  get orientation() {
    return props.orientation
  },
  sizeAt: (index) => sizes.value[index] ?? 1,
  register: (id, entry) => entries.set(id, entry),
  unregister: (id) => entries.delete(id),
  // Called from the panel's pre-flush watcher: the DOM still shows the panel as it was.
  toggle(index, collapse) {
    const base = measure({ index, collapsed: !collapse })
    const lim = limits.value[index]
    if (!lim || isCollapsedAt(base[index]!, lim) === collapse) return
    commit(sizesWithCollapsed(index, collapse, base), base)
  },
})

// @keyboard
/*
 * The arrows that run along the group move its handles, following the direction of the text.
 * Home and End give the primary panel its smallest and largest size, and Enter collapses or
 * reopens it, as the APG window splitter describes.
 */
function onKeydown(handle: number, event: KeyboardEvent) {
  if (props.disabled) return
  const base = measure()
  const primary = primaryOf(handle)
  const lim = limits.value[primary]!
  // Positive when the primary panel grows, negative when it shrinks.
  const primarySign = primary === handle ? 1 : -1
  const rtl = horizontal.value && isRtl(rootEl.value)
  const back = horizontal.value ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp'
  const forth = horizontal.value ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown'
  let next: number[]
  if (event.key === back) next = resizeAt(base, handle, -props.step, limits.value, 1)
  else if (event.key === forth) next = resizeAt(base, handle, props.step, limits.value, 1)
  else if (event.key === 'Home') {
    const lowest = lim.collapsible ? lim.collapsedSize : lim.min
    next = resizeAt(base, handle, (lowest - base[primary]!) * primarySign, limits.value, 1)
  } else if (event.key === 'End')
    next = resizeAt(base, handle, (lim.max - base[primary]!) * primarySign, limits.value, 1)
  else if (event.key === 'Enter' && lim.collapsible)
    next = sizesWithCollapsed(primary, !isCollapsedAt(base[primary]!, lim), base)
  else return
  event.preventDefault()
  commit(next, base)
}

interface Drag {
  handle: number
  pointerId: number
  origin: number
  base: number[]
  sign: number
  last: number[]
}

const drag = shallowRef<Drag | null>(null)

const coordinate = (event: PointerEvent) => (horizontal.value ? event.clientX : event.clientY)

function onPointerdown(handle: number, event: PointerEvent) {
  // A second pointer pressed during a drag is ignored, which leaves one finger in charge.
  if (props.disabled || event.button !== 0 || drag.value) return
  const el = event.currentTarget as HTMLElement
  const base = measure()
  if (!space.value) return
  // Prevented so that no text gets selected; the focus a press would give is given back.
  event.preventDefault()
  el.focus({ preventScroll: true })
  // @fallback
  // Synthetic pointer events have no pointer to capture; the drag then follows the handle only.
  try {
    el.setPointerCapture(event.pointerId)
  } catch {
    /* Synthetic pointers cannot be captured. */
  }
  drag.value = {
    handle,
    pointerId: event.pointerId,
    origin: coordinate(event),
    base,
    sign: horizontal.value && isRtl(rootEl.value) ? -1 : 1,
    last: base,
  }
}

function onPointermove(event: PointerEvent) {
  const state = drag.value
  if (!state || state.pointerId !== event.pointerId) return
  const delta = ((coordinate(event) - state.origin) / space.value) * 100 * state.sign
  state.last = resizeAt(state.base, state.handle, delta, limits.value)
  apply(state.last, state.base)
}

function onPointerEnd(event: PointerEvent) {
  const state = drag.value
  if (!state || state.pointerId !== event.pointerId) return
  drag.value = null
  if (!sameSizes(state.last, state.base)) emit('change', state.last)
}

const handles = computed(() =>
  panels.value.slice(1).map((_, handle) => {
    const primary = primaryOf(handle)
    const node = panels.value[primary]!
    const lim = limits.value[primary]!
    return {
      controls: panelId(node, primary),
      label:
        (nodeProp(node, 'label', 'label') as string | undefined) ??
        m.value.resizable.panel(primary + 1),
      now: Math.round(layout.value[primary] ?? 0),
      min: Math.round(lim.collapsible ? lim.collapsedSize : lim.min),
      max: Math.round(lim.max),
    }
  }),
)

/** Renders a captured panel VNode, which `<component :is>` cannot do. */
const PanelNode: FunctionalComponent<{ node: VNode; index: number }> = ({ node, index }) =>
  cloneVNode(node, { index, id: panelId(node, index) })

// @devwarn
if (isDev) {
  watchEffect(() => {
    if (nodes.value.length !== panels.value.length)
      console.warn('[VResizable] Only VResizablePanel children are rendered.')
    if (model.value && model.value.length !== panels.value.length)
      console.warn(
        `[VResizable] The v-model holds ${model.value.length} sizes for ${panels.value.length} panels; the default sizes are used.`,
      )
  })
}
</script>

<template>
  <div
    ref="rootEl"
    class="v-resizable"
    :data-orientation="orientation"
    :data-disabled="disabled ? '' : undefined"
    :data-dragging="drag ? '' : undefined"
  >
    <template v-for="(node, index) in panels" :key="node.key ?? index">
      <!--
        A horizontal group is divided by vertical lines. `aria-orientation` is only written when
        it differs from the separator's implicit horizontal, as on VSeparator.
      -->
      <div
        v-if="index > 0"
        class="v-resizable-handle"
        role="separator"
        :tabindex="disabled ? undefined : 0"
        :aria-orientation="horizontal ? 'vertical' : undefined"
        :aria-label="handles[index - 1]!.label"
        :aria-controls="handles[index - 1]!.controls"
        :aria-valuenow="handles[index - 1]!.now"
        :aria-valuemin="handles[index - 1]!.min"
        :aria-valuemax="handles[index - 1]!.max"
        :aria-disabled="disabled || undefined"
        :data-active="drag?.handle === index - 1 ? '' : undefined"
        @keydown="onKeydown(index - 1, $event)"
        @pointerdown="onPointerdown(index - 1, $event)"
        @pointermove="onPointermove"
        @pointerup="onPointerEnd"
        @pointercancel="onPointerEnd"
        @lostpointercapture="onPointerEnd"
      >
        <span v-if="grip" class="v-resizable-grip" aria-hidden="true" />
      </div>
      <PanelNode :node="node" :index="index" />
    </template>
  </div>
</template>

<style>
@layer vectis.components {
  .v-resizable {
    --resizable-hit: var(--vectis-control-size-resizable-hit);
    display: flex;
  }

  .v-resizable[data-orientation='vertical'] {
    flex-direction: column;
  }

  .v-resizable[data-dragging] {
    user-select: none;
  }

  .v-resizable-handle {
    position: relative;
    z-index: 1;
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 0 solid var(--vectis-color-border);
    touch-action: none;
    transition:
      border-color var(--vectis-duration-fast) var(--vectis-ease-default),
      box-shadow var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  /* The strip that catches the pointer, wider than the 1px line it is centred on. */
  .v-resizable-handle::before {
    content: '';
    position: absolute;
  }

  /* The content box stays empty so the line is exactly 1px: the grip overflows it, centred. */
  .v-resizable[data-orientation='horizontal'] > .v-resizable-handle {
    inline-size: 0;
    border-inline-start-width: 1px;
    cursor: col-resize;
  }

  .v-resizable[data-orientation='horizontal'] > .v-resizable-handle::before {
    inset-block: 0;
    inset-inline: calc(var(--resizable-hit) / -2);
  }

  .v-resizable[data-orientation='vertical'] > .v-resizable-handle {
    block-size: 0;
    border-block-start-width: 1px;
    cursor: row-resize;
  }

  .v-resizable[data-orientation='vertical'] > .v-resizable-handle::before {
    inset-inline: 0;
    inset-block: calc(var(--resizable-hit) / -2);
  }

  .v-resizable[data-dragging][data-orientation='horizontal'] {
    cursor: col-resize;
  }

  .v-resizable[data-dragging][data-orientation='vertical'] {
    cursor: row-resize;
  }

  .v-resizable-handle:is(:hover, [data-active]):not([aria-disabled]) {
    border-color: var(--vectis-color-accent);
    box-shadow: 0 0 0 1px var(--vectis-color-accent);
  }

  .v-resizable-handle:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  .v-resizable-grip {
    flex: none;
    border: 1px solid transparent;
    border-radius: var(--vectis-radius-pill);
    background: var(--vectis-color-border-strong);
    transition: background-color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-resizable[data-orientation='horizontal'] > .v-resizable-handle > .v-resizable-grip {
    inline-size: var(--vectis-control-size-resizable-grip-thickness);
    block-size: var(--vectis-control-size-resizable-grip-length);
  }

  .v-resizable[data-orientation='vertical'] > .v-resizable-handle > .v-resizable-grip {
    inline-size: var(--vectis-control-size-resizable-grip-length);
    block-size: var(--vectis-control-size-resizable-grip-thickness);
  }

  .v-resizable-handle:is(:hover, [data-active]):not([aria-disabled]) .v-resizable-grip {
    background: var(--vectis-color-accent);
  }

  .v-resizable-handle[aria-disabled] {
    cursor: default;
  }

  .v-resizable-handle[aria-disabled] .v-resizable-grip {
    background: var(--vectis-color-border);
  }

  @media (forced-colors: active) {
    .v-resizable-handle:is(:hover, [data-active]):not([aria-disabled]) {
      border-color: Highlight;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .v-resizable-handle,
    .v-resizable-grip {
      transition: none;
    }
  }
}
</style>
