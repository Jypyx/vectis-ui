<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import {
  DEFAULT_PLATFORM,
  capLabel,
  detectPlatform,
  isEditableTarget,
  matchesEvent,
  parseHotkeys,
  resolveKeys,
} from './platform'
import type { HotkeysPlatform } from './platform'
import { useMessages } from '../../i18n/state'

/**
 * A keyboard shortcut, displayed. `<kbd>` caps derived from a `+`-separated
 * string, with the glyphs of the OS the visitor is actually on: ⌘K on macOS,
 * Ctrl+K on Windows and Linux.
 *
 * Two behavioural JS blocks, both required and both unique in the DS:
 *
 * - `detectPlatform()` is the ONLY `navigator` read in the library. It runs in
 *   `onMounted` and nowhere else: the server cannot know the OS, so the first
 *   client render must match what the server wrote (the `today` pattern of
 *   VCalendar). A macOS visitor therefore sees `Ctrl` for one frame; the
 *   `platform` prop is the escape hatch for a host that knows better.
 * - `listen` attaches a `keydown` listener on `document` — the only
 *   document-level listener in the DS, hence OPT-IN: a display component must
 *   never silently capture the page's keyboard. The matching itself is pure and
 *   lives in `platform.ts`.
 *
 * Not interactive and not focusable: no hover, active or focus rule, and
 * therefore no transition and no reduced-motion block. That absence is
 * deliberate — do not copy VButton's state blocks here.
 */
export type HotkeysVariant = 'flat' | 'outlined' | 'elevated'
export type HotkeysSize = 'xs' | 'sm'

interface HotkeysProps {
  /**
   * The combination, `+`-separated: `mod+k`, `ctrl+shift+p`, `alt+enter`, `esc`.
   * Case- and space-insensitive. `mod` is the CROSS-PLATFORM modifier — ⌘ on
   * macOS, Ctrl everywhere else; `meta` is the literal Command/Windows/Super key.
   * Aliases: cmd/command/win/super → meta, control → ctrl, option/opt → alt,
   * return → enter, escape → esc, del → delete, arrowup… → up…. An unknown token
   * is displayed as declared (`k` → K, `f5` → F5). The `+` key is `plus`.
   */
  keys: string
  /** flat = a tinted cap (the default), outlined = a border, elevated = a raised cap. */
  variant?: HotkeysVariant
  /**
   * Joins the caps into a SINGLE key: the variant's decoration moves from each
   * cap to the root, so the separator ends up inside the key rather than between
   * two of them. Purely visual — the markup is identical either way.
   */
  attached?: boolean
  size?: HotkeysSize
  /** Height reduced by 4px; padding and typography unchanged. */
  compact?: boolean
  /**
   * Forces the keyboard's OS instead of detecting it — for a deterministic
   * rendering (stories, tests, a table showing all three) or a host that already
   * knows (Electron, Tauri, a server reading the User-Agent).
   */
  platform?: HotkeysPlatform
  /** Text between two caps. `""` gives the macOS convention (⇧⌘K, nothing between). */
  separator?: string
  /**
   * Listens for the combination on `document` and emits `trigger`. Off by
   * default: a display component must not capture the page's keyboard.
   */
  listen?: boolean
  /** While listening, calls `preventDefault()` on a match — the point of taking over ⌘K. */
  preventDefault?: boolean
  /** While listening, fires even when the focus is in an input, a textarea or a contenteditable. */
  allowInInput?: boolean
  /** Accessible name. Default: the DS dictionary ("Keyboard shortcut: Ctrl + K"). */
  label?: string
}

const props = withDefaults(defineProps<HotkeysProps>(), {
  variant: 'flat',
  attached: false,
  size: 'xs',
  compact: false,
  platform: undefined,
  separator: '+',
  listen: false,
  preventDefault: true,
  allowInInput: false,
  label: undefined,
})

const emit = defineEmits<{
  /** The combination was pressed. Only ever emitted while `listen` is set. */
  trigger: [event: KeyboardEvent]
}>()

const m = useMessages()

/* The OS is read on mount only: the server has no `navigator`, so rendering the
   detected value directly would be a hydration mismatch. A ref PER INSTANCE, not
   a module-level one — once a module ref held 'mac', a component hydrated later
   (a Nuxt island, a route Suspense) would render ⌘ on its first client pass
   where the server wrote Ctrl. */
const detected = ref<HotkeysPlatform>(DEFAULT_PLATFORM)
onMounted(() => {
  detected.value = detectPlatform()
  if (props.listen) attach()
})

const platform = computed(() => props.platform ?? detected.value)
const tokens = computed(() => parseHotkeys(props.keys))
const resolved = computed(() => resolveKeys(tokens.value, platform.value))

/* The two readings of one table: on SCREEN the glyph wins (⌘), in the ACCESSIBLE
   NAME the word does (Command) — U+2318 is silent or read as "place of interest
   sign" depending on the screen reader. That inversion is what avoids a second
   table. */
const caps = computed(() =>
  resolved.value.map(
    (key) => key.glyph ?? (key.word ? m.value.hotkeys[key.word] : capLabel(key.token)),
  ),
)
const spoken = computed(() =>
  resolved.value
    .map((key) => (key.word ? m.value.hotkeys[key.word] : (key.glyph ?? capLabel(key.token))))
    .join(' + '),
)
const resolvedLabel = computed(() => props.label ?? m.value.hotkeys.label(spoken.value))

/* Non-reactive `let`: nobody renders it, and a ref would trigger renders for
   nothing (the `useTimer` idiom). Named `listening` and NOT `attached`: every
   top-level binding of a `<script setup>` is exposed to the template, where it
   SHADOWS the prop of the same name — `:data-attached="attached && …"` would
   silently read this flag instead of `props.attached`. */
let listening = false

function attach() {
  if (listening || typeof document === 'undefined') return
  document.addEventListener('keydown', onKeydown)
  listening = true
}

function detach() {
  if (!listening) return
  document.removeEventListener('keydown', onKeydown)
  listening = false
}

function onKeydown(event: KeyboardEvent) {
  /* `repeat`: holding the combination down would emit at the OS auto-repeat
     rate, reopening the consumer's palette a dozen times. */
  if (!props.listen || event.repeat) return
  if (!props.allowInInput && isEditableTarget(event.target)) return
  if (!matchesEvent(event, tokens.value, platform.value)) return
  if (props.preventDefault) event.preventDefault()
  emit('trigger', event)
}

/* Attaching once and returning early in the handler would be shorter, but a docs
   page listing 50 shortcuts would install 50 inert document listeners. */
watch(
  () => props.listen,
  (on) => (on ? attach() : detach()),
)
onBeforeUnmount(detach)
</script>

<template>
  <kbd
    class="v-hotkeys v-control"
    :data-variant="variant"
    :data-attached="attached ? '' : undefined"
    :data-size="size"
    :data-compact="compact ? '' : undefined"
    :data-platform="platform"
  >
    <span class="v-hotkeys-keys" aria-hidden="true">
      <template v-for="(cap, index) in caps" :key="index">
        <span v-if="index > 0 && separator" class="v-hotkeys-separator">{{ separator }}</span>
        <kbd class="v-hotkeys-key">{{ cap }}</kbd>
      </template>
    </span>
    <span class="v-visually-hidden">{{ resolvedLabel }}</span>
  </kbd>
</template>

<style>
@layer vectis.components {
  /* The UA gives <kbd> `font-family: monospace` AND `font-size: smaller` — and
     `smaller` COMPOUNDS on a nested <kbd>, which would shrink the caps to ~69%.
     Both are reset here AND on .v-hotkeys-key: deleting either line silently
     miniaturizes the component.
     `vertical-align`: an inline-flex box aligns on the baseline of its first
     item, which drops the caps below the surrounding prose. */
  .v-hotkeys {
    display: inline-flex;
    align-items: center;
    /* Centres the content when min-inline-size wins — an attached single-key. */
    justify-content: center;
    vertical-align: middle;
    font-family: var(--vectis-text-family);
    font-size: var(--control-font-size);
  }

  /* Sizes/compact through the shared v-control class (styles/control-size.css),
     set on the ROOT — the custom properties inherit, and it is the CAPS that
     consume --control-height. The TS union restricts the scale to xs/sm. */
  .v-hotkeys-keys {
    display: inline-flex;
    align-items: center;
    gap: var(--control-gap);
    color: var(--vectis-color-text);
  }

  .v-hotkeys-key {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: inherit;
    font-size: inherit;
    font-weight: var(--vectis-text-control-weight);
    line-height: var(--vectis-text-control-leading);
  }

  /* The three variants mirror VButton's NEUTRAL tone, declaration for
     declaration: flat = tonal, outlined = outline, elevated = elevated (minus
     the hover shadow — there is no hover here). A single colour set, so no
     [data-tone] table.
     They set LOCALS rather than declaring straight away, because the recipe has
     two possible carriers (see below). The names are qualified: these variables
     inherit, so a generic --bg would be captured by any host ancestor defining
     one. */
  .v-hotkeys[data-variant='flat'] {
    --hotkeys-bg: var(--vectis-color-surface-muted);
    --hotkeys-border: transparent;
    --hotkeys-shadow: none;
  }

  .v-hotkeys[data-variant='outlined'] {
    --hotkeys-bg: transparent;
    --hotkeys-border: var(--vectis-color-border-strong);
    --hotkeys-shadow: none;
  }

  .v-hotkeys[data-variant='elevated'] {
    --hotkeys-bg: var(--vectis-color-surface-raised);
    --hotkeys-border: transparent;
    --hotkeys-shadow: var(--vectis-shadow-2);
  }

  /* THE KEY — one recipe, two carriers: every cap by default, the ROOT alone
     when attached, which is what puts the separator inside the key instead of
     between two of them. Writing it twice would let the two renderings drift
     apart on the next token change. */
  .v-hotkeys[data-attached],
  .v-hotkeys:not([data-attached]) .v-hotkeys-key {
    height: var(--control-height);
    /* A single-character key reads as a square, not a sliver (border-box is global). */
    min-inline-size: var(--control-height);
    padding-inline: var(--control-padding-inline);
    border: 1px solid var(--hotkeys-border);
    border-radius: var(--vectis-radius-interactive);
    background: var(--hotkeys-bg);
    box-shadow: var(--hotkeys-shadow);
  }

  /* A dimmed currentcolor rather than text-muted (the .v-chip-remove idiom): the
     separator must stay legible whatever colour the surrounding prose sets. */
  .v-hotkeys-separator {
    color: color-mix(in oklab, currentcolor, transparent 40%);
  }
}
</style>
