<script setup lang="ts">
// @keyboard @a11y @core
/**
 * A native modal `<dialog>` holding a search field and the listbox it filters. The focus stays
 * in the field, which points at the active command through aria-activedescendant: no native
 * element pairs free text with a list the arrows walk through.
 */

import { computed, onMounted, ref, useId, watch } from 'vue'

import VEmptyState from '../VEmptyState/VEmptyState.vue'
import VHotkeys from '../VHotkeys/VHotkeys.vue'
import {
  DEFAULT_PLATFORM,
  ariaKeyshortcuts,
  detectPlatform,
  parseHotkeys,
} from '../VHotkeys/platform'
import type { HotkeysPlatform } from '../VHotkeys/platform'
import VIcon from '../VIcon/VIcon.vue'
import { search as searchIcon } from '../VIcon/icons/search'
import { search_off as searchOffIcon } from '../VIcon/icons/search_off'
import type { IconSource } from '../VIcon/types'
import VSeparator from '../VSeparator/VSeparator.vue'
import VSpinner from '../VSpinner/VSpinner.vue'
import VCommandPaletteItem from './VCommandPaletteItem.vue'
import { useHotkeyListener } from '../../composables/useHotkeyListener'
import { useModalDialog } from '../../composables/useModalDialog'
import { useDebouncedSearch } from '../../composables/useDebouncedSearch'
import { useMessages } from '../../i18n/state'
import { cssSize } from '../../utils/css'
import { createNormalizedCache, normalizeText } from '../../utils/text'

/** One thing the palette can do. */
export interface CommandPaletteCommand {
  /** What it is called on screen, and what the search matches. */
  label: string
  /** A second line under the label. The search does not read it. */
  description?: string
  /** Other words the search matches without showing them: synonyms, a former name. */
  keywords?: string[]
  /** An icon before the label: an icon name, or an explicit render. */
  icon?: IconSource
  /**
   * A shortcut shown at the end of the row, written as for VHotkeys (`mod+shift+p`). The palette
   * displays it and does not listen for it.
   */
  shortcut?: string
  /**
   * Makes the command a link: choosing it follows the address, and a modified or middle click
   * opens it elsewhere, natively.
   */
  href?: string
  /** Shows the command without allowing it to be chosen. */
  disabled?: boolean
  /** Leaves the palette open once the command is chosen. */
  keepOpen?: boolean
  /** An identifier of your own. The palette does not read it; it comes back with `select`. */
  id?: string | number
}

/** A named block of commands. A block none of whose commands match is hidden, name included. */
export interface CommandPaletteGroup {
  label: string
  commands: CommandPaletteCommand[]
}

/** A rule between two blocks. One the search leaves at an end or against another is not drawn. */
export interface CommandPaletteSeparator {
  separator: true
}

/** Anything the list may hold: a command, a named block, or a separator. */
export type CommandPaletteItem =
  CommandPaletteCommand | CommandPaletteGroup | CommandPaletteSeparator

/**
 * How the list is narrowed as one types: by the label and the keywords, not at all (when the
 * commands arrive already filtered by a server), or by a rule of your own.
 */
export type CommandPaletteFilter =
  boolean | ((command: CommandPaletteCommand, query: string) => boolean)

/** What the `#item` slot receives. */
export interface CommandPaletteItemSlotProps {
  command: CommandPaletteCommand
  active: boolean
}

/** What the `#empty` slot receives. */
export interface CommandPaletteEmptySlotProps {
  query: string
}

/** What the trigger has to carry: the click that opens the palette, and the fact that it does. */
export type CommandPaletteTriggerProps = {
  onClick: () => void
  'aria-haspopup': 'dialog'
  /** The `shortcut`, spelled for assistive technology, when there is one. */
  'aria-keyshortcuts'?: string
}

const isGroup = (item: CommandPaletteItem): item is CommandPaletteGroup => 'commands' in item
const isSeparator = (item: CommandPaletteItem): item is CommandPaletteSeparator =>
  'separator' in item

interface CommandPaletteProps {
  /** What the palette offers: commands, named blocks of commands, and separators. */
  items: CommandPaletteItem[]
  /**
   * A shortcut that opens the palette from anywhere in the page and closes it again, written as
   * for VHotkeys: `mod+k` is ⌘K on a Mac and Ctrl+K elsewhere. Left out, nothing is listened for.
   */
  shortcut?: string
  /** How the list is narrowed as one types. */
  filter?: CommandPaletteFilter
  /**
   * How long to wait before reporting the search with `search`, in milliseconds. Zero reports
   * it at once.
   */
  searchDebounce?: number
  /** Says that commands are being loaded: a spinner shows in the search field. */
  loading?: boolean
  /** What is announced while loading with nothing to show yet. */
  loadingText?: string
  /** What the palette says when nothing matches. */
  emptyText?: string
  /** What the search field says while empty. */
  placeholder?: string
  /** The accessible name of the palette. */
  label?: string
  /** The accessible name of its search field. */
  searchLabel?: string
  /** Leaves out the footer listing the keys. */
  hideFooter?: boolean
  /**
   * How wide the palette is: a number is read as pixels, a string as any CSS length. Left out,
   * it takes the `--vectis-control-size-command-palette-width` token, 640px by default.
   */
  width?: number | string
}

const props = withDefaults(defineProps<CommandPaletteProps>(), {
  shortcut: undefined,
  filter: true,
  searchDebounce: 250,
  loading: false,
  loadingText: undefined,
  emptyText: undefined,
  placeholder: undefined,
  label: undefined,
  searchLabel: undefined,
  hideFooter: false,
  width: undefined,
})

const emit = defineEmits<{
  /**
   * A command was chosen, by a click or by Enter. Call `event.preventDefault()` to stop a link
   * being followed, to hand its address to a router instead.
   */
  select: [command: CommandPaletteCommand, event: MouseEvent]
  /** What is being searched for, to be sent to the source. It is also reported on opening. */
  search: [query: string]
}>()

defineSlots<{
  /**
   * The button that opens the palette. Bind the `triggerProps` it receives onto it. It stays
   * rendered always, unlike the palette itself.
   */
  trigger?(props: { triggerProps: CommandPaletteTriggerProps }): unknown
  /** The label and description of a row. The icon and the shortcut stay in place. */
  item?(props: CommandPaletteItemSlotProps): unknown
  /** What the palette shows when nothing matches. It receives the term that was searched. */
  empty?(props: CommandPaletteEmptySlotProps): unknown
  /** What the palette shows while loading with nothing to show yet. */
  loading?(): unknown
  /** Replaces the footer listing the keys. */
  footer?(): unknown
}>()

defineOptions({ inheritAttrs: false })

const m = useMessages()
const resolvedLabel = computed(() => props.label ?? m.value.commandPalette.label)
const resolvedSearchLabel = computed(() => props.searchLabel ?? m.value.commandPalette.searchLabel)
const resolvedPlaceholder = computed(() => props.placeholder ?? m.value.commandPalette.placeholder)
const resolvedEmptyText = computed(() => props.emptyText ?? m.value.commandPalette.empty)
const resolvedLoadingText = computed(() => props.loadingText ?? m.value.common.loading)

/** Whether the palette is showing. */
const open = defineModel<boolean>('open', { default: false })
/** What is typed in the search field. It is emptied each time the palette closes. */
const query = defineModel<string>('query', { default: '' })

const {
  dialogEl,
  rendered,
  rootAttrs,
  show,
  close,
  onClose,
  onCancel,
  onPointerdown,
  onBackdropClick,
} = useModalDialog(open, { persistentBackdrop: () => false, persistentEscape: () => false })

const inputEl = ref<HTMLInputElement | null>(null)
const listId = useId()
const activeIndex = ref(-1)

// @ssr
// The server renders `mod` as Ctrl; the platform is read once mounted.
const platform = ref<HotkeysPlatform>(DEFAULT_PLATFORM)
onMounted(() => {
  platform.value = detectPlatform()
})

const shortcutTokens = computed(() => (props.shortcut ? parseHotkeys(props.shortcut) : []))

useHotkeyListener({
  tokens: () => shortcutTokens.value,
  platform: () => platform.value,
  enabled: () => !!props.shortcut,
  // While open, the focus is held inside the palette: the field being typed in is its own
  // search field, and the shortcut closes it again.
  allowInInput: () => open.value,
  onTrigger: () => (open.value ? close() : void show()),
})

const triggerProps = computed<CommandPaletteTriggerProps>(() => ({
  onClick: show,
  'aria-haspopup': 'dialog',
  'aria-keyshortcuts': props.shortcut
    ? ariaKeyshortcuts(shortcutTokens.value, platform.value)
    : undefined,
}))

/** A command, with its place among all of them: the same command may be listed twice. */
type Entry = { command: CommandPaletteCommand; source: number }

// The blocks unwrapped and the separators dropped: this flat list is what the filter, the
// keyboard and the option ids count through.
const allEntries = computed<Entry[]>(() =>
  props.items
    .flatMap((item) => {
      if (isSeparator(item)) return []
      return isGroup(item) ? item.commands : [item]
    })
    .map((command, source) => ({ command, source })),
)

const normalizedOf = createNormalizedCache<CommandPaletteCommand>()

function matches(command: CommandPaletteCommand, needle: string) {
  if (normalizedOf(command, command.label).includes(needle)) return true
  return (
    command.keywords?.some((word, i) =>
      normalizedOf(command, word, `keyword${i}`).includes(needle),
    ) ?? false
  )
}

const term = computed(() => query.value.trim())

const filtered = computed(() => {
  const list = allEntries.value
  const matcher = props.filter
  if (matcher === false || !term.value) return list
  if (typeof matcher === 'function') return list.filter((e) => matcher(e.command, term.value))
  const needle = normalizeText(term.value)
  return list.filter((e) => matches(e.command, needle))
})

const firstEnabled = () => filtered.value.findIndex((e) => !e.command.disabled)

// @a11y
// An option's id follows its place among ALL the commands, not its place in the filtered list:
// a screen reader announces the active option when aria-activedescendant changes, and a
// positional id would stay the same while the filter slides another command under it. Nor is
// it keyed by the command object, which a block of recent commands lists a second time.
const optionId = (source: number) => `${listId}-${source}`
const activeId = computed(() => {
  const entry = filtered.value[activeIndex.value]
  return entry ? optionId(entry.source) : undefined
})

type Row = {
  kind: 'command'
  key: string
  command: CommandPaletteCommand
  index: number
  source: number
}
type Node =
  | Row
  | { kind: 'group'; key: string; label: string; labelId: string; rows: Row[] }
  | { kind: 'separator'; key: string }

const nodes = computed<Node[]>(() => {
  const kept = new Set(filtered.value.map((e) => e.source))
  let source = 0
  let next = 0
  // Walked in the order `allEntries` was built, so `source` names the same entry.
  const rowOf = (command: CommandPaletteCommand, key: string): Row | null => {
    const at = source++
    return kept.has(at) ? { kind: 'command', key, command, index: next++, source: at } : null
  }

  const result: Node[] = []
  // A separator is held back until something comes after it, and dropped when nothing came
  // before: one rule for the three ways a search can strand it.
  let pendingSeparator: string | null = null
  for (const [i, item] of props.items.entries()) {
    if (isSeparator(item)) {
      if (result.length > 0) pendingSeparator = `separator-${i}`
      continue
    }
    let node: Node | null
    if (isGroup(item)) {
      const rows = item.commands
        .map((command, j) => rowOf(command, `${i}.${j}`))
        .filter((row): row is Row => row !== null)
      node = rows.length
        ? {
            kind: 'group',
            key: `group-${i}`,
            label: item.label,
            labelId: `${listId}-group-${i}`,
            rows,
          }
        : null
    } else {
      node = rowOf(item, String(i))
    }
    if (!node) continue
    if (pendingSeparator !== null) {
      result.push({ kind: 'separator', key: pendingSeparator })
      pendingSeparator = null
    }
    result.push(node)
  }
  return result
})

// @a11y
/** What is announced about the list: that nothing matches, or that something is loading. */
const stateAnnouncement = computed(() => {
  if (!open.value || filtered.value.length > 0) return ''
  return props.loading ? resolvedLoadingText.value : resolvedEmptyText.value
})

const { request: emitSearch, cancel: cancelSearch } = useDebouncedSearch({
  delay: () => props.searchDebounce,
  active: () => open.value,
  report: (value) => emit('search', value),
})

watch(open, (value) => {
  if (value) {
    activeIndex.value = firstEnabled()
    emitSearch(term.value, true)
  } else {
    cancelSearch()
    query.value = ''
    activeIndex.value = -1
  }
})

watch(term, (value) => {
  if (!open.value) return
  activeIndex.value = firstEnabled()
  emitSearch(value)
})

// Commands arriving from a source replace the list without the term changing: a highlight that
// fell out of it, or that never existed, moves to the first command, or Enter would do nothing.
watch(filtered, (list) => {
  if (!open.value) return
  if (activeIndex.value < 0 || activeIndex.value >= list.length) activeIndex.value = firstEnabled()
})

// @a11y
// The focus never moves, so nothing scrolls the active row into view by itself.
watch(
  activeId,
  () => {
    if (!activeId.value) return
    // Optional call: jsdom implements no scrolling.
    document.getElementById(activeId.value)?.scrollIntoView?.({ block: 'nearest' })
  },
  { flush: 'post' },
)

/** What a row draws: the command's own fields, and none of the ones meant for the palette. */
const rowProps = ({
  label,
  description,
  icon,
  shortcut,
  href,
  disabled,
}: CommandPaletteCommand) => ({
  label,
  description,
  icon,
  shortcut,
  href,
  disabled,
})

function hover(row: Row) {
  if (!row.command.disabled) activeIndex.value = row.index
}

function choose(command: CommandPaletteCommand, event: MouseEvent) {
  emit('select', command, event)
  // A link opened elsewhere leaves this page as it was, the palette included.
  const elsewhere = !!command.href && (event.ctrlKey || event.metaKey || event.shiftKey)
  if (!command.keepOpen && !elsewhere) open.value = false
}

// @keyboard
function move(delta: number) {
  const list = filtered.value
  if (list.length === 0) return
  // From nothing highlighted, a step back lands on the last command rather than the one before.
  let i = activeIndex.value < 0 && delta < 0 ? 0 : activeIndex.value
  for (let step = 0; step < list.length; step++) {
    i = (i + delta + list.length) % list.length
    if (!list[i]?.command.disabled) break
  }
  activeIndex.value = i
}

// @keyboard
// Home and End stay with the field, where they move the caret. Escape is the dialog's own
// close request.
function onKeydown(event: KeyboardEvent) {
  if (event.isComposing) return
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      move(1)
      break
    case 'ArrowUp':
      event.preventDefault()
      move(-1)
      break
    case 'Enter': {
      if (!activeId.value) return
      event.preventDefault()
      // Clicking the row itself is what lets a link be followed natively.
      document.getElementById(activeId.value)?.click()
      break
    }
  }
}

defineExpose({
  /**
   * Opens the palette, exactly as setting `open` does. The promise settles once the element has
   * been rendered.
   */
  show,
  /** Closes the palette. */
  close,
  /** Moves the focus to the search field, while the palette is open. */
  focus: (options?: FocusOptions) => inputEl.value?.focus(options),
  /** The `<dialog>` element. It is null while closed: each opening builds a fresh one. */
  el: dialogEl,
})
</script>

<template>
  <slot name="trigger" :trigger-props="triggerProps" />
  <dialog
    v-if="rendered"
    ref="dialogEl"
    :aria-label="resolvedLabel"
    v-bind="rootAttrs"
    class="v-command-palette"
    :style="{ '--command-palette-width': cssSize(width) }"
    @close="onClose"
    @cancel="onCancel"
    @pointerdown="onPointerdown"
    @click="onBackdropClick"
  >
    <div class="v-command-palette-search">
      <VIcon :name="searchIcon" class="v-command-palette-search-icon" />
      <!-- `autofocus` is what the native dialog focusing steps look for when it opens. -->
      <!-- eslint-disable vuejs-accessibility/no-autofocus -->
      <input
        ref="inputEl"
        v-model="query"
        class="v-command-palette-input"
        type="text"
        role="combobox"
        autofocus
        autocomplete="off"
        spellcheck="false"
        aria-autocomplete="list"
        aria-expanded="true"
        :aria-controls="listId"
        :aria-activedescendant="activeId"
        :aria-label="resolvedSearchLabel"
        :placeholder="resolvedPlaceholder"
        @keydown="onKeydown"
      />
      <!-- eslint-enable vuejs-accessibility/no-autofocus -->
      <VSpinner v-if="loading" class="v-command-palette-spinner" aria-hidden="true" />
    </div>

    <!-- A press on a row would take the focus out of the field; it is cancelled so the click
         that follows still chooses, and the field keeps typing. -->
    <div
      :id="listId"
      role="listbox"
      :aria-label="resolvedLabel"
      class="v-command-palette-list v-control"
      data-size="md"
      @mousedown.prevent
    >
      <template v-for="node in nodes" :key="node.key">
        <VSeparator
          v-if="node.kind === 'separator'"
          role="presentation"
          class="v-command-palette-separator"
        />
        <div
          v-else-if="node.kind === 'group'"
          role="group"
          class="v-command-palette-group"
          :aria-labelledby="node.labelId"
        >
          <span :id="node.labelId" class="v-command-palette-group-label">{{ node.label }}</span>
          <VCommandPaletteItem
            v-for="row in node.rows"
            :id="optionId(row.source)"
            :key="row.key"
            v-bind="rowProps(row.command)"
            :active="row.index === activeIndex"
            @select="(event) => choose(row.command, event)"
            @pointermove="hover(row)"
          >
            <template v-if="$slots.item" #default>
              <slot name="item" :command="row.command" :active="row.index === activeIndex" />
            </template>
          </VCommandPaletteItem>
        </div>
        <VCommandPaletteItem
          v-else
          :id="optionId(node.source)"
          v-bind="rowProps(node.command)"
          :active="node.index === activeIndex"
          @select="(event) => choose(node.command, event)"
          @pointermove="hover(node)"
        >
          <template v-if="$slots.item" #default>
            <slot name="item" :command="node.command" :active="node.index === activeIndex" />
          </template>
        </VCommandPaletteItem>
      </template>

      <!-- Loading is checked before emptiness, so a list waiting for an answer never claims
           there is none. Both are spoken by the status below instead. -->
      <div
        v-if="loading && filtered.length === 0"
        class="v-command-palette-state"
        aria-hidden="true"
      >
        <slot name="loading">
          <VSpinner />
          <span>{{ resolvedLoadingText }}</span>
        </slot>
      </div>
      <div v-else-if="filtered.length === 0" class="v-command-palette-state" aria-hidden="true">
        <slot name="empty" :query="term">
          <VEmptyState
            size="sm"
            class="v-command-palette-empty"
            :icon="searchOffIcon"
            :title="resolvedEmptyText"
          />
        </slot>
      </div>
    </div>

    <footer v-if="!hideFooter" class="v-command-palette-footer">
      <slot name="footer">
        <!-- A reminder for the eye: the combobox already tells assistive technology how it
             works, and every cap would otherwise be read as "Keyboard shortcut". -->
        <span class="v-command-palette-hints" aria-hidden="true">
          <span class="v-command-palette-hint">
            <VHotkeys keys="up" />
            <VHotkeys keys="down" />
            {{ m.commandPalette.navigate }}
          </span>
          <span class="v-command-palette-hint">
            <VHotkeys keys="enter" />
            {{ m.commandPalette.choose }}
          </span>
          <span class="v-command-palette-hint">
            <VHotkeys keys="esc" />
            {{ m.common.close }}
          </span>
        </span>
      </slot>
    </footer>

    <!-- Outside the listbox, which may hold only options and groups. -->
    <span class="v-visually-hidden" role="status">{{ stateAnnouncement }}</span>
  </dialog>
</template>

<style>
@layer vectis.components {
  .v-command-palette {
    /*
     * Declared on the element rather than as a fallback: a custom property inherits, and a
     * palette opened inside a wider dialog would otherwise take that dialog's width.
     */
    --command-palette-width: var(--vectis-control-size-command-palette-width);
    /*
     * Where a row's icon and a block's name start: the list padding plus the inline padding of
     * a medium row. The field and the footer use it to line up with them.
     */
    --command-palette-inset: calc(var(--vectis-space-2) + var(--vectis-space-4));
    inline-size: var(--command-palette-width);
    max-inline-size: calc(100dvi - 2 * var(--vectis-space-4));
    max-block-size: calc(
      100dvb - var(--vectis-control-size-command-palette-offset) - var(--vectis-space-4)
    );
    /*
     * Pinned near the top rather than centred: the list grows and shrinks with every keystroke,
     * and a centred palette would move the field being typed in.
     */
    margin: var(--vectis-control-size-command-palette-offset) auto auto;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 0;
    border: none;
    border-radius: var(--vectis-radius-overlay);
    background: var(--vectis-color-surface-overlay);
    color: var(--vectis-color-text);
    box-shadow: var(--vectis-shadow-xl);
    font-family: var(--vectis-text-family);
  }

  /* The display above beats the browser's own rule hiding a closed dialog. */
  .v-command-palette:not([open]) {
    display: none;
  }

  .v-command-palette:focus-visible {
    outline: none;
  }

  .v-command-palette-search {
    flex: none;
    display: flex;
    align-items: center;
    /* The gap of a medium row, so the typed text starts where the labels do. */
    gap: var(--vectis-space-2);
    min-block-size: var(--vectis-control-height-xl);
    padding-inline: var(--command-palette-inset);
    border-block-end: 1px solid var(--vectis-color-border);
    /* The magnifier matches the larger text of the field, through VIcon's context size. */
    --vectis-icon-size: var(--vectis-icon-size-md);
  }

  /* The field draws no ring of its own inside the palette: its edge takes the focus colour. */
  .v-command-palette-search:has(.v-command-palette-input:focus-visible) {
    border-block-end-color: var(--vectis-focus-ring-color);
  }

  .v-command-palette-search-icon,
  .v-command-palette-spinner {
    flex: none;
    color: var(--vectis-color-text-muted);
  }

  .v-command-palette-input {
    flex: 1;
    min-inline-size: 0;
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    font-family: inherit;
    font-size: var(--vectis-text-body-lg-size);
    font-weight: var(--vectis-text-body-lg-weight);
    line-height: var(--vectis-text-body-lg-leading);
    outline: none;
  }

  .v-command-palette-input::placeholder {
    color: var(--vectis-color-text-subtle);
    opacity: 1;
  }

  /*
   * The zero minimum is what lets the list shrink inside a short viewport and scroll, a flex
   * item otherwise refusing to go below its content.
   */
  .v-command-palette-list {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-1);
    min-block-size: 0;
    max-block-size: var(--vectis-control-size-command-palette-list-max-block);
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: var(--vectis-space-2);
    scroll-padding-block: var(--vectis-space-2);
  }

  /* Blocks and rows refuse to shrink: the list is a bounded column that scrolls instead. */
  .v-command-palette-group {
    display: flex;
    flex: none;
    flex-direction: column;
    gap: var(--vectis-space-1);
  }

  .v-command-palette-list > .v-command-palette-item {
    flex: none;
  }

  .v-command-palette-group-label {
    display: flex;
    align-items: center;
    min-block-size: var(--control-height);
    padding-inline: var(--control-padding-inline);
    font-size: var(--vectis-text-overline-size);
    font-weight: var(--vectis-text-overline-weight);
    letter-spacing: var(--vectis-text-overline-tracking);
    color: var(--vectis-color-text-muted);
  }

  /* Compounded with `.v-separator`, whose own sheet sets the margin and may load after this one. */
  .v-separator.v-command-palette-separator {
    flex: none;
    margin-inline: calc(-1 * var(--vectis-space-2));
  }

  .v-command-palette-state {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    gap: var(--control-gap);
    min-block-size: var(--control-height);
    padding: var(--vectis-space-1) var(--control-padding-inline);
    font-size: var(--control-font-size);
    color: var(--vectis-color-text-muted);
  }

  /* `[data-size]` lifts the selector above VEmptyState's size rules, whose sheet may load after. */
  .v-command-palette-state > .v-command-palette-empty[data-size] {
    flex: 1;
    padding-block: var(--vectis-space-4);
    padding-inline: 0;
  }

  .v-command-palette-footer {
    flex: none;
    display: flex;
    align-items: center;
    padding: var(--vectis-space-2) var(--command-palette-inset);
    border-block-start: 1px solid var(--vectis-color-border);
    font-size: var(--vectis-text-caption-size);
    line-height: var(--vectis-text-caption-leading);
    color: var(--vectis-color-text-muted);
  }

  .v-command-palette-hints {
    display: flex;
    flex-wrap: wrap;
    gap: var(--vectis-space-1) var(--vectis-space-4);
  }

  .v-command-palette-hint {
    display: inline-flex;
    align-items: center;
    gap: var(--vectis-space-1);
  }

  .v-command-palette {
    transition:
      opacity var(--vectis-duration-base) var(--vectis-ease-default),
      transform var(--vectis-duration-base) var(--vectis-ease-default);
  }

  @starting-style {
    .v-command-palette[open] {
      opacity: 0;
      transform: scale(0.97);
    }
  }

  .v-command-palette::backdrop {
    background: var(--vectis-color-backdrop);
    transition: opacity var(--vectis-duration-base) var(--vectis-ease-default);
  }

  @starting-style {
    .v-command-palette[open]::backdrop {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .v-command-palette,
    .v-command-palette::backdrop {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    .v-command-palette {
      outline: 1px solid CanvasText;
    }
  }
}
</style>
