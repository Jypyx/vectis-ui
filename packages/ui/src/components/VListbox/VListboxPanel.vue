<script setup lang="ts">
// @a11y
/**
 * Render the floating listbox of VCombobox and VSelect from the rows `useListbox` works out. The
 * panel carries both the listbox role and the scrolling: the virtual window, the scrolling of the
 * highlighted option and the observer watching for the end of the list all rely on it, so no
 * wrapper may come between them.
 */
import { computed, ref } from 'vue'

import type { Listbox, ListboxBlock, ListboxRenderedOption } from '../../composables/useListbox'
import type { ListboxOption, ListboxOptionSlotProps } from '../../types'
import VPopover, { type PopoverPlacement } from '../VPopover/VPopover.vue'
import VListboxGroup from './VListboxGroup.vue'
import VListboxOption from './VListboxOption.vue'
import VListboxSeparator from './VListboxSeparator.vue'

interface ListboxPanelProps {
  /** The panel's id, which the field points at through `aria-controls`. */
  id: string
  /** The CSS anchor name the owner sets on its field, which the panel opens against. */
  anchor: string
  /** Where the panel opens relative to the field. */
  placement: PopoverPlacement
  /** The size the options take, the field's own. */
  size: 'sm' | 'md' | 'lg'
  /** The field's reduced density. */
  compact?: boolean
  /** Several options can be chosen. */
  multiple?: boolean
  /** Only the rows near the visible part of the panel are rendered. */
  virtual?: boolean
  /** The rows to render. */
  blocks: ListboxBlock[]
  /** Measures a rendered row, in the virtual mode. */
  measure: Listbox['measureRow']
}

withDefaults(defineProps<ListboxPanelProps>(), {
  compact: false,
  multiple: false,
  virtual: false,
})

/** Whether the panel is showing. */
const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  /** An option was clicked. What that does to the selection is the field's business. */
  select: [option: ListboxOption]
  /** The pointer moved over an option, which should become the highlighted one. */
  highlight: [row: ListboxRenderedOption]
}>()

defineSlots<{
  /** What a row shows, in place of the plain label. */
  option?(props: ListboxOptionSlotProps): unknown
  /** Rows of the owner's own after the options: an empty state, a loading foot. */
  default?(): unknown
}>()

const popoverRef = ref<InstanceType<typeof VPopover> | null>(null)

// @a11y
/*
 * The focus must never leave the field. Without cancelling the press, clicking an option takes
 * the focus off the field, the field's focusout closes the panel before the click is turned into
 * a selection, and choosing with the mouse stops working entirely.
 */
function onMousedown(event: MouseEvent) {
  event.preventDefault()
}

defineExpose({
  /** The panel element, which scrolls. */
  el: computed(() => popoverRef.value?.el ?? null),
})
</script>

<template>
  <VPopover
    :id="id"
    ref="popoverRef"
    v-model:open="open"
    mode="manual"
    :anchor="anchor"
    match-trigger
    :placement="placement"
    role="listbox"
    class="v-listbox-panel v-control"
    :data-size="size"
    :data-compact="compact ? '' : undefined"
    :aria-multiselectable="multiple ? 'true' : undefined"
    :data-virtual="virtual ? '' : undefined"
    @mousedown="onMousedown"
  >
    <template v-for="block in blocks" :key="block.key">
      <div
        v-if="block.kind === 'spacer'"
        class="v-listbox-spacer"
        aria-hidden="true"
        :style="{ blockSize: `${block.size}px` }"
      />

      <VListboxSeparator
        v-else-if="block.kind === 'separator'"
        :ref="virtual ? (el) => measure(el, block.at) : undefined"
      />

      <VListboxGroup
        v-else-if="block.kind === 'group'"
        :label="block.label"
        :label-id="block.labelId"
      >
        <template v-for="child in block.children" :key="child.key">
          <div
            v-if="child.kind === 'spacer'"
            class="v-listbox-spacer"
            aria-hidden="true"
            :style="{ blockSize: `${child.size}px` }"
          />
          <span
            v-else-if="child.kind === 'heading'"
            :id="child.id"
            :ref="virtual ? (el) => measure(el, child.at) : undefined"
            class="v-listbox-group-label"
            >{{ child.label }}</span
          >
          <VListboxOption
            v-else-if="child.kind === 'option'"
            :ref="virtual ? (el) => measure(el, child.at) : undefined"
            v-bind="child.row"
            @select="emit('select', child.option)"
            @pointermove="emit('highlight', child)"
          >
            <slot name="option" v-bind="child.slot">{{ child.option.label }}</slot>
          </VListboxOption>
        </template>
      </VListboxGroup>

      <VListboxOption
        v-else-if="block.kind === 'option'"
        :ref="virtual ? (el) => measure(el, block.at) : undefined"
        v-bind="block.row"
        @select="emit('select', block.option)"
        @pointermove="emit('highlight', block)"
      >
        <slot name="option" v-bind="block.slot">{{ block.option.label }}</slot>
      </VListboxOption>
    </template>

    <slot />
  </VPopover>
</template>

<style>
@layer vectis.components {
  /*
   * VPopover brings the floating element, its open state, its anchoring, its placement and its
   * surface. The shared size class lets the options and the owner's state rows read their
   * dimensions from the panel with no size table here; the owner sets the maximum height.
   */
  .v-listbox-panel {
    overflow: auto;
  }

  /* The virtual mode corrects the scroll itself when a row above the view changes height. */
  .v-listbox-panel[data-virtual] {
    overflow-anchor: none;
  }

  .v-listbox-spacer {
    flex: none;
  }
}
</style>
