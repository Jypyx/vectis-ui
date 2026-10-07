<script setup lang="ts">
// @keyboard @a11y @core
/**
 * A hierarchy following the ARIA tree pattern. The rows are rendered flat, in display order, their
 * depth carried by `aria-level`, `aria-setsize` and `aria-posinset`: no native element folds a tree
 * with a single tab stop, and a row that does not wrap its subtree keeps its accessible name free of
 * its descendants' text. JavaScript owns the focus, the keyboard, selection and lazy loading.
 */
import { computed, onMounted, ref, shallowReactive, watch } from 'vue'
import type { ComponentPublicInstance } from 'vue'

import VCheckMark from '../VCheckbox/VCheckMark.vue'
import VIcon from '../VIcon/VIcon.vue'
import VSpinner from '../VSpinner/VSpinner.vue'
import { iconProps } from '../VIcon/iconProps'
import { chevron_right as chevronRightIcon } from '../VIcon/icons/chevron_right'
import { error as errorIcon } from '../VIcon/icons/error'
import type { IconSource } from '../VIcon/types'
import type { ItemValue } from '../../types'
import { useAriaLabel } from '../../composables/useAriaLabel'
import { useLiveAnnouncer } from '../../composables/useLiveAnnouncer'
import { useRootAttrs } from '../../composables/useRootAttrs'
import { useTimer } from '../../composables/useTimer'
import { useMessages } from '../../i18n/state'
import { isRtl } from '../../utils/direction'
import { normalizeText } from '../../utils/text'

/** Whether nodes can be selected: not at all, one at a time, or several with checkboxes. */
export type TreeSelectionMode = 'none' | 'single' | 'multiple'

/** The height of the rows: 32 or 40 pixels. */
export type TreeViewSize = 'sm' | 'md'

/**
 * What is selected, and its shape follows `selectionMode`: a single value (or `null`) in `single`
 * mode, an array in `multiple` mode.
 */
export type TreeViewModelValue = ItemValue | ItemValue[] | null

/** One node of the tree. */
export interface TreeItem {
  /** What identifies the node, in the selection and expansion models. Unique across the tree. */
  value: ItemValue
  /** What the row says. It is also what typeahead matches. */
  label: string
  /** An icon before the label: an icon name, or an explicit render. */
  icon?: IconSource
  /** The child nodes, which make this node a branch. */
  children?: TreeItem[]
  /**
   * Marks a branch whose children `loadChildren` fetches on its first expansion. Ignored when
   * `children` is set or when the tree has no `loadChildren`.
   */
  lazy?: boolean
  /** Where the node leads, which makes the row a link. */
  href?: string
  /** Marks the node as the page being viewed (`aria-current`). */
  current?: boolean
  /**
   * Keeps the node focusable, so it is still found, but it cannot be selected, activated, expanded
   * or collapsed.
   */
  disabled?: boolean
}

/** What the `#icon`, `#label` and `#end` slots receive. */
export interface TreeItemSlotProps {
  item: TreeItem
  /** The depth of the node, from 1. */
  level: number
  /** Whether the node's children are shown. */
  expanded: boolean
}

type CheckState = 'true' | 'false' | 'mixed'

interface TreeNode {
  item: TreeItem
  level: number
  parent: TreeNode | null
  posinset: number
  setsize: number
}

interface TreeViewProps {
  /** The first level of the tree. */
  items: TreeItem[]
  /**
   * Whether nodes can be selected. In `multiple` mode each row has a checkbox, and checking a
   * branch checks everything under it.
   */
  selectionMode?: TreeSelectionMode
  /**
   * Fetches the children of a `lazy` node, on its first expansion. The tree keeps them; a failure
   * collapses the node again, and the next expansion retries.
   */
  loadChildren?: (item: TreeItem) => Promise<TreeItem[]>
  /** The height of the rows, 32 or 40 pixels. */
  size?: TreeViewSize
  /** What screen readers announce for the tree. It falls back to the design system dictionary. */
  label?: string
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<TreeViewProps>(), {
  selectionMode: 'none',
  loadChildren: undefined,
  size: 'md',
  label: undefined,
})

/**
 * What is selected. In `single` mode, a value or `null`; in `multiple` mode, the checked nodes in
 * tree order, a branch included when everything under it is checked. A value given for a branch
 * checks its whole subtree. A shape that does not match the mode reads as an empty selection.
 */
const model = defineModel<TreeViewModelValue>({ default: null })

/** The values of the expanded nodes. Left unbound, the tree keeps that state itself. */
const expanded = defineModel<ItemValue[]>('expanded', { default: () => [] })

const emit = defineEmits<{
  /**
   * A node was clicked or Enter was pressed on it, after the tree applied its own effect: selecting
   * it, checking it, or folding a branch in `none` mode. For a link, calling `preventDefault()` on
   * the event stops the navigation, which hands it to a router.
   */
  activate: [item: TreeItem, event: MouseEvent | KeyboardEvent]
}>()

defineSlots<{
  /** Replaces the icon of a node, for instance to show an open folder when it is expanded. */
  icon?(props: TreeItemSlotProps): unknown
  /** Replaces the label of a node. */
  label?(props: TreeItemSlotProps): unknown
  /**
   * Content at the end of a row: a count, a badge. It must not be focusable: a row is a single
   * control.
   */
  end?(props: TreeItemSlotProps): unknown
}>()

const { rootClass, rootStyle, forwardedAttrs } = useRootAttrs()
const m = useMessages()
const ariaLabel = useAriaLabel(() => props.label ?? m.value.treeView.label)
const { polite: announcement, announce } = useLiveAnnouncer()

const loaded = shallowReactive(new Map<ItemValue, TreeItem[]>())
const loading = shallowReactive(new Set<ItemValue>())
const failed = shallowReactive(new Set<ItemValue>())

function childrenOf(item: TreeItem): TreeItem[] | undefined {
  return item.children ?? loaded.get(item.value)
}

function isPending(item: TreeItem): boolean {
  return !!props.loadChildren && !!item.lazy && !item.children && !loaded.has(item.value)
}

function isBranch(item: TreeItem): boolean {
  return !!childrenOf(item)?.length || isPending(item)
}

const expandedSet = computed(() => new Set(expanded.value))

/** The rows on screen, in display order: every node whose ancestors are all expanded. */
const visible = computed(() => {
  const rows: TreeNode[] = []
  const walk = (items: TreeItem[], level: number, parent: TreeNode | null) => {
    items.forEach((item, index) => {
      const node = { item, level, parent, posinset: index + 1, setsize: items.length }
      rows.push(node)
      const children = childrenOf(item)
      if (children && expandedSet.value.has(item.value)) walk(children, level + 1, node)
    })
  }
  walk(props.items, 1, null)
  return rows
})

function setExpanded(item: TreeItem, open: boolean) {
  if (open === expandedSet.value.has(item.value)) return
  expanded.value = open
    ? [...expanded.value, item.value]
    : expanded.value.filter((value) => value !== item.value)
}

// @core
/**
 * Derives what each checkbox shows. A value in the selection checks its node and the whole subtree
 * under it; a branch then shows checked when all its children are, unchecked when none are, and
 * mixed otherwise, so its own presence in the selection only matters through its children. The map
 * is filled in tree order, which is the order the model is written in.
 */
function deriveCheckStates(chosen: Set<ItemValue>): Map<ItemValue, CheckState> {
  const states = new Map<ItemValue, CheckState>()
  const visit = (item: TreeItem, inherited: boolean): CheckState => {
    states.set(item.value, 'false')
    const own = inherited || chosen.has(item.value)
    const children = childrenOf(item)
    let state: CheckState = own ? 'true' : 'false'
    if (children?.length) {
      const childStates = children.map((child) => visit(child, own))
      state = childStates.every((s) => s === 'true')
        ? 'true'
        : childStates.every((s) => s === 'false')
          ? 'false'
          : 'mixed'
    }
    states.set(item.value, state)
    return state
  }
  props.items.forEach((item) => visit(item, false))
  return states
}

const chosenValues = computed<ItemValue[]>(() => {
  const value = model.value
  if (props.selectionMode === 'multiple') return Array.isArray(value) ? value : []
  return value === null || Array.isArray(value) ? [] : [value]
})

const checkStates = computed(() =>
  props.selectionMode === 'multiple'
    ? deriveCheckStates(new Set(chosenValues.value))
    : new Map<ItemValue, CheckState>(),
)

/** Calls `fn` on a node and on every node under it that is not disabled. */
function eachEnabled(item: TreeItem, fn: (item: TreeItem) => void) {
  fn(item)
  childrenOf(item)?.forEach((child) => {
    if (!child.disabled) eachEnabled(child, fn)
  })
}

// @core
/**
 * Checks a node and its subtree when any leaf of it is unchecked, and unchecks them otherwise.
 * Disabled nodes keep their state. Unchecking also drops the ancestors, which would otherwise check
 * the node again through their subtree. Values the tree does not know, such as the children of a
 * node not loaded yet, are kept at the end.
 */
function toggleCheck(node: TreeNode) {
  const states = checkStates.value
  const chosen = new Set<ItemValue>()
  states.forEach((state, value) => {
    if (state === 'true') chosen.add(value)
  })
  const unknown = chosenValues.value.filter((value) => !states.has(value))

  let check = false
  eachEnabled(node.item, (item) => {
    if (!childrenOf(item)?.length && states.get(item.value) !== 'true') check = true
  })
  // Only the leaves are added: a branch in the selection would check its disabled children too.
  eachEnabled(node.item, (item) => {
    if (!check) chosen.delete(item.value)
    else if (!childrenOf(item)?.length) chosen.add(item.value)
  })
  if (!check) for (let p = node.parent; p; p = p.parent) chosen.delete(p.item.value)

  const next: ItemValue[] = []
  deriveCheckStates(chosen).forEach((state, value) => {
    if (state === 'true') next.push(value)
  })
  model.value = [...next, ...unknown]
}

function isSelected(item: TreeItem): boolean {
  return props.selectionMode === 'single' && chosenValues.value[0] === item.value
}

// @core
/** What a click or Enter does besides the `activate` event, which follows it. */
function applyDefault(node: TreeNode) {
  const { item } = node
  if (props.selectionMode === 'single') model.value = item.value
  else if (props.selectionMode === 'multiple') toggleCheck(node)
  else if (item.href === undefined && isBranch(item))
    setExpanded(item, !expandedSet.value.has(item.value))
}

function activate(node: TreeNode, event: MouseEvent | KeyboardEvent) {
  applyDefault(node)
  emit('activate', node.item, event)
}

async function load(item: TreeItem) {
  const loader = props.loadChildren
  if (!loader) return
  loading.add(item.value)
  failed.delete(item.value)
  try {
    loaded.set(item.value, await loader(item))
  } catch {
    failed.add(item.value)
    setExpanded(item, false)
    announce(m.value.treeView.loadError(item.label), false)
  } finally {
    loading.delete(item.value)
  }
}

// @ssr
// Loading waits for the client: an expanded lazy node renders busy on the server, then fetches.
onMounted(() => {
  // The expanded set is watched too: a pending node shows no children, so its expansion alone
  // does not change the rows.
  watch(
    [visible, expandedSet],
    ([rows, open]) => {
      for (const { item } of rows)
        if (open.has(item.value) && isPending(item) && !loading.has(item.value)) void load(item)
    },
    { immediate: true },
  )
})

const treeEl = ref<HTMLElement | null>(null)
const rowEls = new Map<ItemValue, HTMLElement>()
const rowValues = new WeakMap<Element, ItemValue>()

function bindRow(value: ItemValue, el: Element | ComponentPublicInstance | null) {
  if (el instanceof HTMLElement) {
    rowEls.set(value, el)
    rowValues.set(el, value)
  } else rowEls.delete(value)
}

// @keyboard @a11y
/**
 * The single tab stop: the node last focused, or its closest ancestor still on screen once a
 * branch above it folds; before any focus, the first selected node on screen, then the current
 * one, then the first row.
 */
const active = ref<TreeNode | null>(null)
const tabStop = computed<ItemValue | undefined>(() => {
  const rows = visible.value
  const shown = new Set(rows.map((node) => node.item.value))
  for (let node = active.value; node; node = node.parent)
    if (shown.has(node.item.value)) return node.item.value
  const selected =
    props.selectionMode === 'multiple'
      ? rows.find((node) => checkStates.value.get(node.item.value) === 'true')
      : rows.find((node) => isSelected(node.item))
  return (selected ?? rows.find((node) => node.item.current) ?? rows[0])?.item.value
})

function onFocusin(event: FocusEvent) {
  const value = rowValues.get(event.target as Element)
  if (value === undefined) return
  active.value = visible.value.find((node) => node.item.value === value) ?? null
}

function focusRow(node: TreeNode | undefined) {
  if (node) rowEls.get(node.item.value)?.focus()
}

const typeahead = useTimer()
let typed = ''

// @keyboard
/**
 * Moves to the next row whose label starts with what was typed in the last half-second. Repeating
 * one letter cycles through the rows starting with it.
 */
function typeTo(char: string, index: number) {
  typed += normalizeText(char)
  typeahead.start(() => (typed = ''), 500)
  const rows = visible.value
  const needle = [...typed].every((c) => c === typed[0]) ? typed[0]! : typed
  const start = needle.length === 1 ? index + 1 : index
  for (let i = 0; i < rows.length; i++) {
    const node = rows[(start + i) % rows.length]!
    if (normalizeText(node.item.label).startsWith(needle)) return focusRow(node)
  }
}

// @keyboard @a11y
function onKeydown(event: KeyboardEvent) {
  const tree = treeEl.value
  const value = rowValues.get(event.target as Element)
  if (!tree || value === undefined || event.altKey || event.ctrlKey || event.metaKey) return
  const rows = visible.value
  const index = rows.findIndex((node) => node.item.value === value)
  const node = rows[index]
  if (!node) return
  const { item } = node
  const isOpen = expandedSet.value.has(item.value)
  const forward = isRtl(tree) ? 'ArrowLeft' : 'ArrowRight'
  const back = isRtl(tree) ? 'ArrowRight' : 'ArrowLeft'

  switch (event.key) {
    case 'ArrowDown':
      focusRow(rows[index + 1])
      break
    case 'ArrowUp':
      focusRow(rows[index - 1])
      break
    case 'Home':
      focusRow(rows[0])
      break
    case 'End':
      focusRow(rows.at(-1))
      break
    case forward:
      if (!isBranch(item)) break
      if (!isOpen) {
        if (!item.disabled) setExpanded(item, true)
      } else if (rows[index + 1]?.parent?.item === item) focusRow(rows[index + 1])
      break
    case back:
      if (isBranch(item) && isOpen && !item.disabled) setExpanded(item, false)
      else focusRow(node.parent ?? undefined)
      break
    case 'Enter':
      // A link follows itself: the browser turns Enter into a click, which lands in onRowClick.
      if (item.href !== undefined) return
      if (!item.disabled) activate(node, event)
      break
    case ' ':
      // Space selects without following a link, as it does nothing on a link natively.
      if (item.disabled) break
      if (item.href !== undefined) applyDefault(node)
      else activate(node, event)
      break
    case '*': {
      const siblings = node.parent ? childrenOf(node.parent.item)! : props.items
      const closed = siblings
        .filter((sibling) => !sibling.disabled && isBranch(sibling))
        .map((sibling) => sibling.value)
        .filter((sibling) => !expandedSet.value.has(sibling))
      if (closed.length) expanded.value = [...expanded.value, ...closed]
      break
    }
    default:
      if (event.key.length !== 1 || event.key === ' ') return
      typeTo(event.key, index)
  }
  event.preventDefault()
}

function onRowClick(node: TreeNode, event: MouseEvent) {
  // An inert link has no address left to follow; this also covers a click on its children.
  if (node.item.disabled) {
    event.preventDefault()
    return
  }
  activate(node, event)
}

// The chevron folds without selecting, and without following the link it sits in.
function onChevronClick(node: TreeNode, event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
  if (!node.item.disabled && isBranch(node.item))
    setExpanded(node.item, !expandedSet.value.has(node.item.value))
}

function slotProps(node: TreeNode): TreeItemSlotProps {
  return {
    item: node.item,
    level: node.level,
    expanded: expandedSet.value.has(node.item.value) && !isPending(node.item),
  }
}

function ariaExpanded(item: TreeItem) {
  return isBranch(item) ? String(expandedSet.value.has(item.value)) : undefined
}

function ariaCurrent(item: TreeItem) {
  if (!item.current) return undefined
  return item.href !== undefined ? 'page' : 'true'
}

// The root is a wrapper holding the live region, which a tree may not contain: these two reach
// the tree itself.
defineExpose({
  /** Moves the focus to the tree's tab stop: the last focused node, else the selected or current one. */
  focus: (options?: FocusOptions) =>
    tabStop.value !== undefined && rowEls.get(tabStop.value)?.focus(options),
  /** The `role="tree"` element, which also receives the consumer's attributes. */
  el: treeEl,
})
</script>

<template>
  <div class="v-tree-view" :class="rootClass" :style="rootStyle">
    <ul
      ref="treeEl"
      class="v-tree v-control"
      role="tree"
      :data-size="size"
      :aria-multiselectable="selectionMode === 'multiple' || undefined"
      v-bind="forwardedAttrs"
      :aria-label="ariaLabel"
      @keydown="onKeydown"
      @focusin="onFocusin"
    >
      <li v-for="node in visible" :key="node.item.value" class="v-tree-node" role="none">
        <component
          :is="node.item.href !== undefined ? 'a' : 'div'"
          :ref="(el: Element | ComponentPublicInstance | null) => bindRow(node.item.value, el)"
          class="v-tree-row"
          role="treeitem"
          :style="{ '--tree-level': node.level - 1 }"
          :href="node.item.disabled ? undefined : node.item.href"
          :tabindex="tabStop === node.item.value ? 0 : -1"
          :aria-level="node.level"
          :aria-setsize="node.setsize"
          :aria-posinset="node.posinset"
          :aria-expanded="ariaExpanded(node.item)"
          :aria-selected="selectionMode === 'single' ? String(isSelected(node.item)) : undefined"
          :aria-checked="
            selectionMode === 'multiple' ? checkStates.get(node.item.value) : undefined
          "
          :aria-current="ariaCurrent(node.item)"
          :aria-disabled="node.item.disabled || undefined"
          :aria-busy="loading.has(node.item.value) || undefined"
          :data-current="node.item.current ? '' : undefined"
          @click="onRowClick(node, $event)"
        >
          <!-- Decorative: the row is the control, and the arrows fold it. -->
          <span class="v-tree-toggle" aria-hidden="true" @click="onChevronClick(node, $event)">
            <VSpinner v-if="loading.has(node.item.value)" />
            <VIcon
              v-else-if="isBranch(node.item)"
              class="v-tree-chevron"
              :name="chevronRightIcon"
              mirrored
            />
          </span>
          <VCheckMark v-if="selectionMode === 'multiple'" />
          <slot name="icon" v-bind="slotProps(node)">
            <VIcon v-if="node.item.icon" class="v-tree-icon" v-bind="iconProps(node.item.icon)" />
          </slot>
          <span class="v-tree-label"
            ><slot name="label" v-bind="slotProps(node)">{{ node.item.label }}</slot></span
          >
          <template v-if="failed.has(node.item.value)">
            <VIcon class="v-tree-error" :name="errorIcon" />
            <span class="v-visually-hidden">{{ m.treeView.loadFailed }}</span>
          </template>
          <span v-if="$slots.end" class="v-tree-end"
            ><slot name="end" v-bind="slotProps(node)"
          /></span>
        </component>
      </li>
    </ul>
    <div class="v-visually-hidden" role="status" aria-live="polite">{{ announcement }}</div>
  </div>
</template>

<style>
@layer vectis.components {
  .v-tree {
    /* One level of indentation puts a child's chevron under its parent's icon. */
    --tree-indent: calc(var(--vectis-icon-size) + var(--control-gap));

    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
    font-family: var(--vectis-text-family);
  }

  .v-tree-row {
    /* See VSideNavigation: the radius cannot exceed half the height of a single row. */
    --tree-row-radius: min(var(--vectis-radius-interactive), calc(var(--control-height) / 2));

    display: flex;
    align-items: center;
    gap: var(--control-gap);
    min-block-size: var(--control-height);
    padding-block: var(--vectis-space-1);
    padding-inline: calc(var(--vectis-space-2) + var(--tree-level, 0) * var(--tree-indent))
      var(--vectis-space-2);
    border-radius: var(--tree-row-radius);
    color: var(--vectis-color-text);
    font-size: var(--control-font-size);
    font-weight: var(--vectis-text-body-md-weight);
    line-height: var(--vectis-text-body-md-leading);
    text-decoration: none;
    cursor: pointer;
    user-select: none;
  }

  .v-tree-row:hover:not([aria-disabled='true']) {
    background: var(--vectis-color-surface-muted);
  }

  /* Drawn inwards, so that neighbouring rows cannot cover it. */
  .v-tree-row:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: calc(-1 * var(--vectis-focus-ring-width));
  }

  .v-tree-row:is([aria-selected='true'], [data-current]) {
    background: var(--vectis-color-accent-surface);
    color: var(--vectis-color-accent-text);
  }

  /* The selected row is already tinted, so its hover deepens that tint; the VMenuItem idiom. */
  .v-tree-row:is([aria-selected='true'], [data-current]):hover:not([aria-disabled='true']) {
    background: color-mix(
      in oklab,
      var(--vectis-color-accent-surface),
      var(--vectis-color-accent-text) 8%
    );
  }

  .v-tree-row:is([aria-selected='true'], [data-current]) :is(.v-tree-icon, .v-tree-toggle) {
    color: inherit;
  }

  .v-tree-row[data-current] .v-tree-label {
    font-weight: var(--vectis-text-label-weight);
  }

  .v-tree-toggle {
    display: inline-grid;
    flex: none;
    place-items: center;
    inline-size: var(--vectis-icon-size);
    block-size: var(--vectis-icon-size);
    color: var(--vectis-color-text-muted);
  }

  .v-tree-chevron {
    transition: rotate var(--vectis-duration-base) var(--vectis-ease-default);
  }

  .v-tree-row[aria-expanded='true'] .v-tree-chevron {
    rotate: 90deg;
  }

  /* The mirrored chevron points left, and turns the other way to point down. */
  .v-tree-row[aria-expanded='true'] .v-tree-chevron:dir(rtl) {
    rotate: -90deg;
  }

  .v-tree-icon {
    flex: none;
    color: var(--vectis-color-text-muted);
  }

  .v-tree-label {
    flex: 1;
    min-inline-size: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .v-tree-end {
    flex: none;
    display: flex;
    align-items: center;
    gap: var(--vectis-space-1);
    color: var(--vectis-color-text-muted);
  }

  .v-tree-error {
    flex: none;
    color: var(--vectis-color-danger-text);
  }

  .v-tree-row:is([aria-checked='true'], [aria-checked='mixed']) .v-check-mark {
    background: var(--vectis-color-accent);
    border-color: var(--vectis-color-accent);
  }

  .v-tree-row[aria-checked='true'] .v-check-mark-tick,
  .v-tree-row[aria-checked='mixed'] .v-check-mark-dash {
    opacity: 1;
  }

  /* Last of the colour rules, so that a disabled node reads as such whatever its state. */
  .v-tree-row[aria-disabled='true'] {
    color: var(--vectis-color-text-subtle);
    cursor: not-allowed;
  }

  .v-tree-row[aria-disabled='true'] :is(.v-tree-icon, .v-tree-toggle, .v-tree-end) {
    color: inherit;
  }

  .v-tree-row[aria-disabled='true'] .v-check-mark {
    background: var(--vectis-color-surface-muted);
    border-color: var(--vectis-color-border);
    color: var(--vectis-color-text-subtle);
  }

  /*
   * Forced colours flatten the tint of the selected row: it takes the system selection pair,
   * repeated to (0,4,0) above its own hover.
   */
  @media (forced-colors: active) {
    .v-tree-row.v-tree-row:is([aria-selected='true'], [data-current]):not([aria-disabled='true']) {
      forced-color-adjust: none;
      background: Highlight;
      color: HighlightText;
    }

    .v-tree-row:is([aria-checked='true'], [aria-checked='mixed']):not([aria-disabled='true'])
      .v-check-mark {
      forced-color-adjust: none;
      background: Highlight;
      border-color: Highlight;
      color: HighlightText;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .v-tree-chevron {
      transition: none;
    }
  }
}
</style>
