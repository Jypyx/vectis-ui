<script setup lang="ts">
/**
 * Render platform-specific shortcut glyphs. Detect the platform after mount for SSR; attach
 * keyboard listeners only when listen is enabled.
 */

import { computed, onMounted, ref } from 'vue'

import { DEFAULT_PLATFORM, capLabel, detectPlatform, parseHotkeys, resolveKeys } from './platform'
import type { HotkeysPlatform } from './platform'
import { useHotkeyListener } from '../../composables/useHotkeyListener'
import { useMessages } from '../../i18n/state'

/** How a key cap is drawn. */
export type HotkeysVariant = 'soft' | 'outline' | 'elevated'
/** The size of the caps, from the two smallest steps of the control scale. */
export type HotkeysSize = 'xs' | 'sm'

interface HotkeysProps {
  /** The combination, `+`-separated: `mod+k`, `ctrl+shift+p`, `alt+enter`, `esc`. */
  keys: string
  /** How a key cap is drawn: tinted (`soft`), outlined (`outline`), or raised off the page (`elevated`). */
  variant?: HotkeysVariant
  /**
   * Draws the whole combination as a SINGLE key rather than as several: the decoration moves
   * from each cap to the shortcut as a whole, so the separator ends up inside the key instead
   * of between two of them.
   */
  attached?: boolean
  /** The size of the caps, `xs` by default: a shortcut is chrome beside other text. */
  size?: HotkeysSize
  /** Takes 4px off the height, leaving the padding and the text as they are. */
  compact?: boolean
  /**
   * Forces the keyboard's OS instead of detecting it, for a deterministic
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
   * While listening, lets the browser go on doing whatever the combination normally does. Left
   * out, the browser is stopped, which is the entire point of taking over something like ⌘K.
   */
  allowDefault?: boolean
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
  variant: 'soft',
  attached: false,
  size: 'xs',
  compact: false,
  platform: undefined,
  separator: '+',
  listen: false,
  allowDefault: false,
  allowInInput: false,
  label: undefined,
})

const emit = defineEmits<{
  /** The combination was pressed. It is only ever emitted while `listen` is on. */
  trigger: [event: KeyboardEvent]
}>()

const m = useMessages()

// @ssr
/*
 * The value is held per instance and not at module level. A shared one, having already resolved
 * to macOS, would make a component hydrated later; a Nuxt island, a route loaded on demand;
 * render ⌘ on its very first client pass where the server had written Ctrl.
 */
const detected = ref<HotkeysPlatform>(DEFAULT_PLATFORM)
onMounted(() => {
  detected.value = detectPlatform()
})

const platform = computed(() => props.platform ?? detected.value)
const tokens = computed(() => parseHotkeys(props.keys))
const resolved = computed(() => resolveKeys(tokens.value, platform.value))

// @a11y
/*
 * On SCREEN the symbol wins, ⌘ being what is engraved on the key; in the ANNOUNCED NAME the
 * word does, because that symbol is either passed over in silence or read out as "place of
 * interest sign", depending on the screen reader. Inverting the preference is what lets one
 * table serve both.
 */
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

useHotkeyListener({
  tokens: () => tokens.value,
  platform: () => platform.value,
  enabled: () => props.listen,
  allowDefault: () => props.allowDefault,
  allowInInput: () => props.allowInInput,
  onTrigger: (event) => emit('trigger', event),
})
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
  /*
   * The browser gives a `<kbd>` a monospaced family and a smaller size, and that reduction
   * COMPOUNDS when one `<kbd>` sits inside another, as it does here: the caps would come out at
   * roughly 69% of the surrounding text. Both are reset here and again on the caps themselves,
   * and deleting either line silently miniaturizes the whole component.
   */
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

  /*
   * Deriving the whole cap from the inherited colour is what makes the component
   * ground-independent, and it is the same reason there is no tone table at all. They set
   * VARIABLES rather than declaring the look straight away, because that look has two possible
   * carriers (see below).
   */
  .v-hotkeys[data-variant='soft'] {
    --hotkeys-bg: color-mix(in oklab, currentcolor, transparent 90%);
    --hotkeys-border: transparent;
    --hotkeys-shadow: none;
  }

  .v-hotkeys[data-variant='outline'] {
    --hotkeys-bg: transparent;
    --hotkeys-border: color-mix(in oklab, currentcolor, transparent 70%);
    --hotkeys-shadow: none;
  }

  /* Lifted rather than settled into its ground, so the tint is the lighter of the two
     and the shadow does the work. That shadow is the one paint left that is not
     derived: it is a cast rather than a colour, so on a dark ground it simply has
     nothing to fall on, and the tint is what still separates the cap there. */
  .v-hotkeys[data-variant='elevated'] {
    --hotkeys-bg: color-mix(in oklab, currentcolor, transparent 94%);
    --hotkeys-border: transparent;
    --hotkeys-shadow: var(--vectis-shadow-sm);
  }

  /*
   * When one key holds the whole combination, its ends take the same breathing room as the gaps
   * inside it, which gives the key a single rhythm. The usual control padding is sized to wrap
   * ONE short label; around three runs of text already spaced from one another, it reads as
   * slack at the edges.
   */
  .v-hotkeys[data-attached] {
    --hotkeys-pad: var(--control-gap);
  }

  /*
   * THE key recipe, written once for its two possible carriers: every cap by default, and the
   * whole shortcut alone when it is drawn as a single key; which is exactly what puts the
   * separator inside the key rather than between two of them. Written out twice, the two
   * renderings would drift apart at the first token change.
   */
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

  /* Softened rather than full strength: the separator is punctuation between two
     caps, and at the same weight as them it competes with what it separates. */
  .v-hotkeys-separator {
    color: color-mix(in oklab, currentcolor, transparent 40%);
  }

  /*
   * Forced colours flatten the tint and drop the shadow, which is all a soft or an elevated cap
   * is made of. Every variant takes the edge of the outlined one, in the system text colour.
   */
  @media (forced-colors: active) {
    .v-hotkeys[data-variant] {
      --hotkeys-border: CanvasText;
    }
  }
}
</style>
