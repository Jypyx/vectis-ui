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
 * A keyboard shortcut, shown as the keys one presses. It is written as a plain string
 * — `mod+k` — and rendered with the symbols of the system the reader is actually on:
 * ⌘K on a Mac, Ctrl+K on Windows and Linux.
 *
 * Two pieces of behaviour here are unique in the whole library, and both are worth
 * knowing about.
 *
 * The first is reading which operating system this is, the only place the library asks
 * that question. It happens once the component is mounted and nowhere else, because a
 * server cannot know the answer and the browser's first render has to match what the
 * server sent — the same reasoning as today's date in VDatePicker. A Mac visitor
 * therefore sees "Ctrl" for a single frame; the `platform` prop is the way out for a
 * host that already knows better.
 *
 * The second is `listen`, which attaches a key listener to the whole document — the
 * only one in the library, and therefore something one has to ASK for: a component
 * whose job is to display a shortcut must not silently capture the page's keyboard.
 *
 * The component is not interactive and cannot be focused, so it carries no hover, no
 * active and no focus rule, and consequently no transition and no reduced-motion
 * block. That absence is deliberate: do not copy VButton's state rules into it.
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
  /** How a key cap is drawn: tinted, outlined, or raised off the page. */
  variant?: HotkeysVariant
  /**
   * Draws the whole combination as a SINGLE key rather than as several: the decoration
   * moves from each cap to the shortcut as a whole, so the separator ends up inside
   * the key instead of between two of them. It is purely visual — the markup and the
   * announced name are identical either way.
   */
  attached?: boolean
  /** The size of the caps. */
  size?: HotkeysSize
  /** Takes 4px off the height, leaving the padding and the text as they are. */
  compact?: boolean
  /**
   * Forces the keyboard's OS instead of detecting it — for a deterministic
   * rendering (stories, tests, a table showing all three) or a host that already
   * knows (Electron, Tauri, a server reading the User-Agent).
   */
  platform?: HotkeysPlatform
  /**
   * What is written between two caps. An empty string gives the macOS convention,
   * where the symbols simply follow one another: ⇧⌘K.
   */
  separator?: string
  /**
   * Actually listens for the combination and reports it. It is off by default: a
   * component whose job is to display a shortcut must not capture the page's keyboard
   * without being asked.
   */
  listen?: boolean
  /**
   * While listening, stops the browser from doing whatever the combination normally
   * does — which is the entire point of taking over something like ⌘K.
   */
  preventDefault?: boolean
  /**
   * While listening, fires even when the reader is typing in a field. It is off by
   * default, so a shortcut cannot fire in the middle of a sentence.
   */
  allowInInput?: boolean
  /**
   * What screen readers announce, "Keyboard shortcut: Ctrl + K" by default, from the
   * design system dictionary.
   */
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
  /** The combination was pressed. It is only ever emitted while `listen` is on. */
  trigger: [event: KeyboardEvent]
}>()

const m = useMessages()

// @ssr — the library's ONLY reading of the visitor's platform, and the reason it
// happens after mounting.
/* The operating system is read once the component is in the page and never during
   setup: a server has nothing to read it from, so rendering the detected value
   directly would make the two markups differ.

   TRAP — the value is held PER INSTANCE and not at module level. A shared one, having
   already resolved to macOS, would make a component hydrated later — a Nuxt island, a
   route loaded on demand — render ⌘ on its very first client pass where the server had
   written Ctrl. */
const detected = ref<HotkeysPlatform>(DEFAULT_PLATFORM)
onMounted(() => {
  detected.value = detectPlatform()
  if (props.listen) attach()
})

const platform = computed(() => props.platform ?? detected.value)
const tokens = computed(() => parseHotkeys(props.keys))
const resolved = computed(() => resolveKeys(tokens.value, platform.value))

// @a11y
/* The same table is read twice, in opposite directions. On SCREEN the symbol wins, ⌘
   being what is engraved on the key; in the ANNOUNCED NAME the word does, because that
   symbol is either passed over in silence or read out as "place of interest sign",
   depending on the screen reader. Inverting the preference is what lets one table
   serve both. */
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

/* A plain variable and not a reactive one: nothing renders it, and making it reactive
   would cause renders for no reason — the same reasoning as in `useTimer`.

   TRAP — it is called `listening` and NOT `attached`. Every top-level binding of a
   `<script setup>` is exposed to the template, where it SHADOWS the prop of the same
   name: called `attached`, this flag would silently be what the template read instead
   of the prop, and the joined rendering would follow whether a listener happened to be
   installed. */
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

// @keyboard @core — the listening half. Deciding whether a key event IS the
// combination is pure and lives in `platform.ts`.
function onKeydown(event: KeyboardEvent) {
  /* A held-down combination repeats at the system's auto-repeat rate, which would
     reopen the consumer's palette a dozen times a second; only the first press
     counts. */
  if (!props.listen || event.repeat) return
  if (!props.allowInInput && isEditableTarget(event.target)) return
  if (!matchesEvent(event, tokens.value, platform.value)) return
  if (props.preventDefault) event.preventDefault()
  emit('trigger', event)
}

/* Attaching the listener once and simply returning early inside it would be shorter to
   write, but a documentation page listing fifty shortcuts would then install fifty
   document listeners that do nothing. Following the prop is what keeps that at zero. */
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
  /* TRAP — the browser gives a `<kbd>` a monospaced family AND a smaller size, and
     that reduction COMPOUNDS when one `<kbd>` sits inside another, as it does here:
     the caps would come out at roughly 69% of the surrounding text. Both are reset
     here and again on the caps themselves, and deleting either line silently
     miniaturizes the whole component.

     The vertical alignment is the second correction: a box laid out this way sits on
     the baseline of its FIRST item, which drops the caps below the line of prose
     around them. */
  .v-hotkeys {
    display: inline-flex;
    align-items: center;
    /* Centres the content in the cases where the minimum width wins over it: a
       single-character combination drawn as one key. */
    justify-content: center;
    vertical-align: middle;
    font-family: var(--vectis-text-family);
    font-size: var(--control-font-size);
    --hotkeys-pad: var(--control-padding-inline);
  }

  /* The size comes from the shared class set on the ROOT: its variables inherit down,
     and it is the CAPS that read the height from them. The scale itself holds five
     steps; the component's type restricts it to the two smallest, a key cap being
     smaller than a control. */
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

  /* The three variants mirror VButton's NEUTRAL tone declaration for declaration —
     tinted, outlined, and raised — minus everything that reacts to a pointer, since
     nothing here is interactive. There is a single set of colours and therefore no
     tone table at all: a shortcut is chrome, never data of the reader's.

     They set VARIABLES rather than declaring the look straight away, because that look
     has two possible carriers (see below). The names are qualified on purpose: these
     variables inherit, so a bare `--bg` would be captured by any ancestor in the host
     application that happened to define one. */
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
    --hotkeys-shadow: var(--vectis-shadow-sm);
  }

  /* When one key holds the WHOLE combination, its ends take the same breathing room as
     the gaps inside it, which gives the key a single rhythm. The usual control padding
     is sized to wrap ONE short label; around three runs of text already spaced from
     one another, it reads as slack at the edges. */
  .v-hotkeys[data-attached] {
    --hotkeys-pad: var(--control-gap);
  }

  /* THE key recipe, written once for its two possible carriers: every cap by default,
     and the whole shortcut alone when it is drawn as a single key — which is exactly
     what puts the separator inside the key rather than between two of them. Written
     out twice, the two renderings would drift apart at the first token change. */
  .v-hotkeys[data-attached],
  .v-hotkeys:not([data-attached]) .v-hotkeys-key {
    height: var(--control-height);
    /* A minimum equal to the height makes a single-character key read as a square
       rather than as a sliver. */
    min-inline-size: var(--control-height);
    padding-inline: var(--hotkeys-pad);
    border: 1px solid var(--hotkeys-border);
    border-radius: var(--vectis-radius-interactive);
    background: var(--hotkeys-bg);
    box-shadow: var(--hotkeys-shadow);
  }

  /* The separator is the surrounding text colour softened, and not a fixed grey: a
     shortcut may sit in prose of any colour, and a grey chosen against the page would
     be wrong in half of them. */
  .v-hotkeys-separator {
    color: color-mix(in oklab, currentcolor, transparent 40%);
  }
}
</style>
