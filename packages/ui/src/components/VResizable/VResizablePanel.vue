<script setup lang="ts">
/**
 * The group hands each panel its share of the space as a `flex-grow` weight. The panel writes its
 * own limits in CSS as well, so a length limit holds before any script runs and while the window
 * is resized.
 */

import { computed, inject, onBeforeUnmount, ref, useAttrs, useId, watch } from 'vue'

import { isDev } from '../../utils/env'
import { resizableKey } from './context'
import type { ResizableLength } from './VResizable.vue'

interface ResizablePanelProps {
  /** Which panel this is among its siblings, set by VResizable. Do not set it yourself. */
  index?: number
  /**
   * The starting size in percent, used when the group's v-model gives none. Panels without one
   * share what is left equally.
   */
  defaultSize?: number
  /** The smallest size: a number in percent, or a CSS length such as `200px` or `12rem`. */
  minSize?: ResizableLength
  /** The largest size: a number in percent, or a CSS length. */
  maxSize?: ResizableLength
  /**
   * Lets the panel collapse: dragged past the middle of its minimum, or with Enter on its
   * handle.
   */
  collapsible?: boolean
  /**
   * The size of the collapsed panel, in percent or as a CSS length such as the width of an icon
   * rail. At 0, the default, its content is hidden.
   */
  collapsedSize?: ResizableLength
  /**
   * What the panel is called. It names the handle that resizes it; the dictionary's "Panel 2"
   * otherwise.
   */
  label?: string
}

const props = withDefaults(defineProps<ResizablePanelProps>(), {
  index: 0,
  defaultSize: undefined,
  minSize: 0,
  maxSize: undefined,
  collapsible: false,
  collapsedSize: 0,
  label: undefined,
})

/** Whether the panel is collapsed. It only takes effect on a `collapsible` panel. */
const collapsed = defineModel<boolean>('collapsed', { default: false })

defineSlots<{
  /** The panel's content. */
  default(): unknown
}>()

const group = inject(resizableKey, null)
const attrs = useAttrs()
const id = useId()
const el = ref<HTMLElement | null>(null)

const isCollapsed = computed(() => props.collapsible && collapsed.value)

const cssLength = (length: ResizableLength) => (typeof length === 'number' ? `${length}%` : length)

/** A collapsed size of zero leaves nothing to read, so the content is hidden, focus included. */
const hidesContent = computed(
  () => isCollapsed.value && Number.parseFloat(String(props.collapsedSize)) === 0,
)

// @core
/*
 * The value the group last wrote, so the watcher below tells the group's own writes from the
 * consumer's. Only the consumer's ask the group to make room.
 */
let fromGroup: boolean | undefined

group?.register(id, {
  get index() {
    return props.index
  },
  get el() {
    return el.value
  },
  get minSize() {
    return props.minSize
  },
  get maxSize() {
    return props.maxSize
  },
  get collapsible() {
    return props.collapsible
  },
  get collapsedSize() {
    return props.collapsedSize
  },
  get collapsed() {
    return isCollapsed.value
  },
  setCollapsed(value) {
    if (collapsed.value === value) return
    fromGroup = value
    collapsed.value = value
  },
})
onBeforeUnmount(() => group?.unregister(id))

watch(collapsed, (value) => {
  const own = value === fromGroup
  fromGroup = undefined
  if (!own && props.collapsible) group?.toggle(props.index, value)
})

// @devwarn
if (isDev) {
  if (!group) console.warn('[VResizablePanel] Place it directly inside a VResizable.')
  watch(
    () => collapsed.value && !props.collapsible,
    (wrong) => {
      if (wrong) console.warn('[VResizablePanel] `collapsed` has no effect without `collapsible`.')
    },
    { immediate: true },
  )
}

// Every variable is set, even to its default, so that a nested group's panel never inherits
// the limits of the panel it sits in.
const style = computed(() => ({
  '--resizable-panel-size': String(group?.sizeAt(props.index) ?? 1),
  '--resizable-panel-min': cssLength(props.minSize),
  '--resizable-panel-max': props.maxSize === undefined ? 'none' : cssLength(props.maxSize),
  '--resizable-panel-collapsed': cssLength(props.collapsedSize),
}))
</script>

<template>
  <div
    :id="(attrs.id as string | undefined) ?? id"
    ref="el"
    class="v-resizable-panel"
    :data-collapsed="isCollapsed ? '' : undefined"
    :data-hidden="hidesContent ? '' : undefined"
    :style="style"
  >
    <slot />
  </div>
</template>

<style>
@layer vectis.components {
  /*
   * The basis is the size itself, padding and border included, so a padded panel still takes its
   * exact share. Growing by the same weight spreads any space left over, such as that of a
   * collapsed sibling, in proportion; the 1px handles are shrunk off the same way.
   */
  .v-resizable-panel {
    box-sizing: border-box;
    flex: var(--resizable-panel-size) var(--resizable-panel-size)
      calc(var(--resizable-panel-size) * 1%);
    overflow: auto;
  }

  .v-resizable[data-orientation='horizontal'] > .v-resizable-panel {
    min-inline-size: var(--resizable-panel-min);
    max-inline-size: var(--resizable-panel-max);
  }

  .v-resizable[data-orientation='vertical'] > .v-resizable-panel {
    min-block-size: var(--resizable-panel-min);
    max-block-size: var(--resizable-panel-max);
  }

  .v-resizable[data-orientation] > .v-resizable-panel[data-collapsed] {
    flex: 0 0 var(--resizable-panel-collapsed);
    min-inline-size: 0;
    max-inline-size: none;
    min-block-size: 0;
    max-block-size: none;
  }

  /* Removed from the layout as well, or its padding would keep the panel open. */
  .v-resizable-panel[data-hidden] {
    display: none;
  }
}
</style>
