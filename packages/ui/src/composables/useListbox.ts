// @a11y @keyboard
/**
 * Model a listbox whose DOM focus stays on its field, for VCombobox and VSelect: the field names
 * the highlighted option through aria-activedescendant and moves it by hand, and the panel renders
 * `blocks`. Groups and separators exist for the eye alone; the keyboard counts through the flat
 * list of options and therefore never stops on one.
 */
import { computed, reactive, ref, watch, watchEffect, type ComputedRef, type Ref } from 'vue'

import type { IconSource } from '../components/VIcon/types'
import type {
  ItemValue,
  ListboxGroup,
  ListboxItem,
  ListboxOption,
  ListboxOptionSlotProps,
  ListboxSeparator,
} from '../types'
import { useVirtualList, type VirtualList, type VirtualSegment } from './useVirtualList'

export const isListboxGroup = (item: ListboxItem): item is ListboxGroup => 'options' in item
export const isListboxSeparator = (item: ListboxItem): item is ListboxSeparator =>
  'separator' in item

/**
 * The chosen values as a list, whatever the model holds. An empty string is what an emptied
 * single field says, and it is not a value. A NUMBER is a value even at zero; hence the test on
 * the empty string alone rather than on falsiness, which would drop the option keyed `0`.
 */
export function selectionOf(value: ItemValue | ItemValue[], multiple: boolean): ItemValue[] {
  if (multiple) return Array.isArray(value) ? value : []
  return !Array.isArray(value) && value !== '' ? [value] : []
}

type ListboxSize = 'sm' | 'md' | 'lg'

export interface ListboxOptions {
  /** What the list offers, as the consumer gave it. */
  items: () => ListboxItem[]
  /**
   * Narrows the flattened options, read inside a computed so it may follow reactive state. Left
   * out, every option stays.
   */
  filter?: (options: ListboxOption[]) => ListboxOption[]
  /** The chosen values. */
  selected: () => ItemValue[]
  /** Whether the panel is showing; the highlight is kept on a valid option only while it is. */
  open: () => boolean
  /** The panel's id, and the prefix of every option's and heading's id. */
  id: string
  /** The scrolling panel, which the virtual mode windows. */
  panelEl: () => HTMLElement | null
  /** Renders only the rows near the visible part of the panel. */
  virtual: () => boolean
  /** More pages are coming, so the last block's size is unknown. */
  hasMore?: () => boolean
  size: () => ListboxSize
  compact: () => boolean
}

/** An option the panel renders, with its index in the visible options. */
export interface ListboxRenderedOption {
  kind: 'option'
  key: string
  option: ListboxOption
  index: number
}

type RenderedNode =
  | ListboxRenderedOption
  | { kind: 'group'; key: string; id: string; label: string; options: ListboxRenderedOption[] }
  | { kind: 'separator'; key: string }

/**
 * The panel as one flat sequence of rows, the unit the virtual mode windows: a block's name is a
 * row of its own, above its options. Each row knows its block, so the rows rendered can be
 * gathered back into their groups. `set` and `position` are the option's place in its block, or
 * among the options outside any block.
 */
type FlatOption = ListboxRenderedOption & { group?: string; set: number; position: number }
type FlatRow =
  | FlatOption
  | { kind: 'heading'; key: string; id: string; label: string; group: string }
  | { kind: 'separator'; key: string }

/**
 * A rendered option with its state worked out, once per row: `row` is what the option element
 * takes, `slot` what the `#option` slot receives, and both read the same two answers. `at` is
 * the row's place in the flat sequence, which the virtual mode measures it under.
 */
export type ListboxOptionRow = FlatOption & {
  at: number
  row: {
    id: string
    icon?: IconSource
    active: boolean
    selected: boolean
    disabled?: boolean
    'aria-setsize'?: number
    'aria-posinset'?: number
  }
  slot: ListboxOptionSlotProps
}

export type ListboxRow =
  | ListboxOptionRow
  | { kind: 'heading'; key: string; id: string; label: string; at: number }
  | { kind: 'separator'; key: string; at: number }
  | { kind: 'spacer'; key: string; size: number }

/** What the panel renders: rows, and blocks of rows gathered under their name. */
export type ListboxBlock =
  | ListboxRow
  | { kind: 'group'; key: string; label: string; labelId?: string; children: ListboxRow[] }

// Only a starting guess for the virtual mode, every row being measured once rendered: the
// height of an option at each size, 4px less when compact, as the control heights go.
const OPTION_HEIGHT: Record<ListboxSize, number> = { sm: 32, md: 40, lg: 48 }

export interface Listbox {
  /** Every option, the blocks unwrapped and the separators dropped, in the order given. */
  allOptions: ComputedRef<ListboxOption[]>
  /** The options left by the filter: what the keyboard counts through. */
  visible: ComputedRef<ListboxOption[]>
  /** The selection as a set, so that asking "is this one chosen?" costs nothing. */
  selectedSet: ComputedRef<Set<ItemValue>>
  /** The option holding a value, found among the options or in the memory of chosen ones. */
  optionOf: (value: ItemValue) => ListboxOption | undefined
  /** The label of a value, or the value itself spelled out when no option holds it. */
  labelOf: (value: ItemValue) => string
  /** Keeps an option just chosen in memory, before the parent passes the value back down. */
  remember: (option: ListboxOption) => void
  /** The index of the highlighted option among `visible`, or -1. */
  activeIndex: Ref<number>
  /** The id of the option at an index of `visible`. */
  optionId: (index: number) => string
  /** Highlights the first option that can be chosen, or nothing. */
  highlightFirst: () => void
  /** Highlights the last option that can be chosen, or nothing. */
  highlightLast: () => void
  /** Highlights the first chosen option, or the first that can be chosen. */
  highlightSelected: () => void
  /** Moves the highlight by `delta` options, wrapping around and skipping disabled ones. */
  move: (delta: number) => void
  /**
   * Moves the highlight by `delta` options without wrapping, the step of Page Up and Page Down:
   * it stops at the first or last option that can be chosen.
   */
  page: (delta: number) => void
  /** Highlights the option under the pointer. */
  hover: (row: ListboxRenderedOption) => void
  /** What the panel renders. */
  blocks: ComputedRef<ListboxBlock[]>
  /** Measures a rendered row, in the virtual mode. */
  measureRow: VirtualList['measure']
}

export function useListbox(options: ListboxOptions): Listbox {
  // The ONE reading of the items the rest of the module does: the filtering, the memory of what
  // was chosen, the labels and the paging all ignore the hierarchy entirely.
  const allOptions = computed<ListboxOption[]>(() =>
    options.items().flatMap((item) => {
      if (isListboxSeparator(item)) return []
      return isListboxGroup(item) ? item.options : [item]
    }),
  )

  const visible = computed(() => options.filter?.(allOptions.value) ?? allOptions.value)

  const selectedSet = computed(() => new Set(options.selected()))

  // With a source that answers over the network, the options only ever hold the latest results,
  // and something already chosen is usually absent from them; without this, a chip would show a
  // raw identifier instead of a name. It is kept up to date by an effect rather than by watching
  // the options, because the effect tracks the ITERATION and therefore also notices a page
  // appended in place.
  const optionCache = reactive(new Map<ItemValue, ListboxOption>())
  watchEffect(() => {
    const wanted = selectedSet.value
    for (const option of allOptions.value) {
      if (wanted.has(option.value)) optionCache.set(option.value, option)
    }
    // Without this the memory would grow with every value chosen during the session rather than
    // with the current selection.
    for (const value of optionCache.keys()) if (!wanted.has(value)) optionCache.delete(value)
  })

  // A lookup built once per list rather than searched each time: an option is looked up several
  // times per chip and per render, so a linear search would cost chips times options on every
  // keystroke.
  const optionsByValue = computed(() => {
    const map = new Map<ItemValue, ListboxOption>()
    for (const option of allOptions.value) if (!map.has(option.value)) map.set(option.value, option)
    return map
  })

  /*
   * An option coming from the memory is a reactive PROXY, since making the map reactive converts
   * the objects inside it. Compare options by their value and never by identity, or the two forms
   * of the same option will not match.
   */
  function optionOf(value: ItemValue) {
    return optionsByValue.value.get(value) ?? optionCache.get(value)
  }

  const labelOf = (value: ItemValue) => optionOf(value)?.label ?? String(value)

  const remember = (option: ListboxOption) => void optionCache.set(option.value, option)

  const activeIndex = ref(-1)

  // @a11y
  // An option's id follows the OPTION, from its place among all the options, and never its place
  // in the filtered list: a screen reader announces the current option when
  // `aria-activedescendant` changes, and a positional id would keep the same value while the
  // filter slides another option under the highlight, which then goes unannounced.
  const sourceIndex = computed(() => new Map(allOptions.value.map((option, i) => [option, i])))
  const optionId = (index: number) => {
    const option = visible.value[index]
    return `${options.id}-option-${option ? sourceIndex.value.get(option) : index}`
  }

  const firstEnabled = () => visible.value.findIndex((o) => !o.disabled)

  function highlightFirst() {
    activeIndex.value = firstEnabled()
  }

  function highlightLast() {
    const list = visible.value
    let i = list.length - 1
    while (i >= 0 && list[i]?.disabled) i--
    activeIndex.value = i
  }

  function highlightSelected() {
    const chosen = visible.value.findIndex((o) => !o.disabled && selectedSet.value.has(o.value))
    activeIndex.value = chosen >= 0 ? chosen : firstEnabled()
  }

  // @keyboard
  function move(delta: number) {
    const list = visible.value
    if (list.length === 0) return
    // From "nothing highlighted" the first step lands on an END of the list: starting at -1,
    // a step back would stop on the second-to-last option.
    let i = activeIndex.value < 0 && delta < 0 ? 0 : activeIndex.value
    for (let step = 0; step < list.length; step++) {
      i = (i + delta + list.length) % list.length
      if (!list[i]?.disabled) break
    }
    activeIndex.value = i
  }

  // @keyboard
  function page(delta: number) {
    const list = visible.value
    const target = Math.min(Math.max(activeIndex.value + delta, 0), list.length - 1)
    const step = Math.sign(delta)
    // Past a disabled option in the direction of travel, then back if the end was disabled too.
    for (const dir of [step, -step]) {
      for (let i = target; i >= 0 && i < list.length; i += dir) {
        if (!list[i]?.disabled) {
          activeIndex.value = i
          return
        }
      }
    }
  }

  function hover(row: ListboxRenderedOption) {
    if (!row.option.disabled) activeIndex.value = row.index
  }

  // While the panel is open there must always be a valid option highlighted. It is moved back to
  // the first one whenever the highlighted one has fallen out of the list or there was none at
  // all; without that second case, a search that passed through "no result" would leave nothing
  // highlighted, and Enter would not choose the single result that came back.
  watch(visible, (list) => {
    if (!options.open()) return
    if (activeIndex.value < 0 || activeIndex.value >= list.length) highlightFirst()
  })

  // Nothing here is keyed by VALUE. Two options may share one (a consumer's duplicate, or `1`
  // beside `'1'`, which a template literal spells the same), and a value-keyed index hands both
  // the same position, so both light up as active and Vue patches two rows under one key.
  const rendered = computed<RenderedNode[]>(() => {
    const kept = new Set(visible.value)
    let next = 0

    const entryOf = (option: ListboxOption, key: string): ListboxRenderedOption | null => {
      if (!kept.has(option)) return null
      return { kind: 'option', key: `option:${key}`, option, index: next++ }
    }

    const nodes: RenderedNode[] = []
    // A separator is held back and only drawn once something has come before it and something
    // comes after it. That single rule covers all three ways the filtering can strand one: at
    // the top of the list, at the bottom, and two in a row.
    let pendingSeparator: string | null = null

    for (const [i, item] of options.items().entries()) {
      if (isListboxSeparator(item)) {
        if (nodes.length > 0) pendingSeparator = `sep:${i}`
        continue
      }

      let node: RenderedNode | null
      if (isListboxGroup(item)) {
        const entries = item.options
          .map((option, j) => entryOf(option, `${i}.${j}`))
          .filter((entry): entry is ListboxRenderedOption => entry !== null)
        // A block none of whose options survived is dropped entirely, its name included:
        // a heading over nothing is worse than no heading.
        node =
          entries.length > 0
            ? {
                kind: 'group',
                key: `group:${i}`,
                id: `${options.id}-group-${i}`,
                label: item.label,
                options: entries,
              }
            : null
      } else {
        node = entryOf(item, String(i))
      }
      if (!node) continue

      if (pendingSeparator !== null) {
        nodes.push({ kind: 'separator', key: pendingSeparator })
        pendingSeparator = null
      }
      nodes.push(node)
    }

    return nodes
  })

  const flat = computed(() => {
    const rows: FlatRow[] = []
    const labels = new Map<string, string>()
    // Indexed by the option's place in `visible`: where the keyboard's highlight sits in the rows.
    const rowOfOption: number[] = []
    const loose = rendered.value.filter((node) => node.kind === 'option').length
    let looseSeen = 0
    for (const node of rendered.value) {
      if (node.kind === 'separator') rows.push(node)
      else if (node.kind === 'option') {
        rowOfOption[node.index] = rows.length
        rows.push({ ...node, set: loose, position: ++looseSeen })
      } else {
        labels.set(node.key, node.label)
        rows.push({
          kind: 'heading',
          key: `heading:${node.key}`,
          id: node.id,
          label: node.label,
          group: node.key,
        })
        for (const [j, option] of node.options.entries()) {
          rowOfOption[option.index] = rows.length
          rows.push({ ...option, group: node.key, set: node.options.length, position: j + 1 })
        }
      }
    }
    return { rows, labels, rowOfOption }
  })

  // @a11y
  // The highlighted row stays rendered wherever the panel is scrolled: `aria-activedescendant`
  // must name an element that exists.
  const virtualList = useVirtualList({
    scrollEl: computed(() => (options.virtual() ? options.panelEl() : null)),
    count: () => flat.value.rows.length,
    key: (index) => flat.value.rows[index]?.key,
    itemSize: () => OPTION_HEIGHT[options.size()] - (options.compact() ? 4 : 0),
    overscan: () => 5,
    initialCount: () => 10,
    pinned: () => {
      const row = flat.value.rowOfOption[activeIndex.value]
      return row === undefined ? [] : [row]
    },
  })

  function withState(entry: FlatOption, at: number): ListboxOptionRow {
    const active = entry.index === activeIndex.value
    const selected = selectedSet.value.has(entry.option.value)
    // @a11y
    // Only some options exist in the virtual mode, so each one says where it stands; the last
    // block may still grow while pages are coming.
    const placed = options.virtual()
      ? { 'aria-setsize': options.hasMore?.() ? -1 : entry.set, 'aria-posinset': entry.position }
      : {}
    return {
      ...entry,
      at,
      row: {
        id: optionId(entry.index),
        icon: entry.option.icon,
        active,
        selected,
        disabled: entry.option.disabled,
        ...placed,
      },
      slot: { option: entry.option, index: entry.index, active, selected },
    }
  }

  // The rows of the window and the space standing for the others, gathered back into their
  // blocks. Kept apart from `flat` on purpose: the highlight moves on every arrow key, and only
  // this pass over the rendered rows follows it; the filtering and the grouping stay where they
  // are.
  const blocks = computed<ListboxBlock[]>(() => {
    const { rows, labels } = flat.value
    const segments: VirtualSegment[] = options.virtual()
      ? virtualList.segments.value
      : rows.map((_, index) => ({ type: 'row', index }))
    const groupAt = (segment: VirtualSegment | undefined) => {
      const row = segment?.type === 'row' ? rows[segment.index] : undefined
      return row && row.kind !== 'separator' ? row.group : undefined
    }

    const out: ListboxBlock[] = []
    let open: Extract<ListboxBlock, { kind: 'group' }> | undefined
    for (const [k, segment] of segments.entries()) {
      let block: ListboxRow
      let group: string | undefined
      if (segment.type === 'spacer') {
        block = { kind: 'spacer', key: segment.key, size: segment.size }
        // Between two rows of one block, the space stands for rows of that block.
        const before = groupAt(segments[k - 1])
        group = before === groupAt(segments[k + 1]) ? before : undefined
      } else {
        const row = rows[segment.index]!
        block =
          row.kind === 'option' ? withState(row, segment.index) : { ...row, at: segment.index }
        group = groupAt(segment)
      }
      if (group === undefined) {
        open = undefined
        out.push(block)
        continue
      }
      if (open?.key !== group) {
        open = { kind: 'group', key: group, label: labels.get(group)!, children: [] }
        out.push(open)
      }
      if (block.kind === 'heading') open.labelId = block.id
      open.children.push(block)
    }
    return out
  })

  // @a11y
  // Since the focus never leaves the field, the browser has no reason to scroll the highlighted
  // option into view. It is brought into view by hand instead, and asked for the SMALLEST
  // movement that reveals it, so an option already visible does not make the panel jump.
  watch(
    activeIndex,
    (index) => {
      if (index < 0) return
      if (options.virtual()) {
        const row = flat.value.rowOfOption[index]
        if (row !== undefined) void virtualList.scrollToIndex(row)
        return
      }
      // Called optionally: the unit-test environment implements no scrolling at all.
      document.getElementById(optionId(index))?.scrollIntoView?.({ block: 'nearest' })
    },
    { flush: 'post' },
  )

  return {
    allOptions,
    visible,
    selectedSet,
    optionOf,
    labelOf,
    remember,
    activeIndex,
    optionId,
    highlightFirst,
    highlightLast,
    highlightSelected,
    move,
    page,
    hover,
    blocks,
    measureRow: virtualList.measure,
  }
}
