// @core — module-wide: pure, no Vue and no lifecycle. `detectPlatform` is the
// exception below.
/**
 * Everything VHotkeys needs to know about keyboards: which system this one belongs to,
 * and how a written token relates to the symbol engraved on the key, to the word for
 * it, and to what the browser reports when it is pressed.
 *
 * An operating system is not a language, and the distinction matters here. Whether a
 * key shows ⌘ or Ctrl is a fact about the hardware, so it does NOT depend on the
 * reader's language. Only the WORDS do — Shift becomes Maj in French — and those live
 * in the dictionary: this module hands back the dictionary KEY and never the text
 * itself.
 *
 * What earns the module its existence is the alias table. The SAME table normalizes
 * the tokens a consumer writes in `keys` and the key names the browser reports, so a
 * shortcut cannot be declared in a spelling the matcher would fail to recognize.
 *
 * TRAP — detecting the platform must only ever be done once a component is mounted.
 * There is nothing to read it from on a server, and sniffing a request header is not
 * this library's business.
 */

import { isDev } from '../../utils/env'

export type HotkeysPlatform = 'mac' | 'windows' | 'linux' | 'other'

/**
 * The dictionary entries naming a key, and only those — the sentence framing the
 * shortcut is not one of them.
 *
 * The list is written out here rather than derived from the dictionary's own type,
 * which would tie this module to the dictionary's shape. Nothing is lost: reading an
 * entry by one of these names is checked just as strictly at the point of use.
 */
export type HotkeysWord =
  | 'command'
  | 'ctrl'
  | 'alt'
  | 'shift'
  | 'windows'
  | 'super'
  | 'enter'
  | 'escape'
  | 'space'
  | 'backspace'
  | 'delete'
  | 'tab'
  | 'up'
  | 'down'
  | 'left'
  | 'right'

/** One key of a shortcut, once resolved for a given platform. */
export interface ResolvedKey {
  /** Its canonical name, which is what the matcher compares a key press against. */
  token: string
  /** The symbol engraved on that key, where the system engraves one. */
  glyph?: string
  /**
   * Which dictionary entry names it. Nothing here means the design system does not
   * know this key, and it is printed as it was written.
   */
  word?: HotkeysWord
}

// @ssr
/**
 * What a SERVER renders, and therefore what the browser's FIRST render must be as
 * well. It shares its words with Windows and Linux — Ctrl, Alt, Shift — so only a Mac
 * visitor pays a single frame of "Ctrl" before it is corrected to ⌘.
 */
export const DEFAULT_PLATFORM: HotkeysPlatform = 'other'

// @ssr @fallback — the DS's ONLY `navigator` read, with a two-source ladder.
/**
 * Works out which system the keyboard belongs to, from two sources in order. The
 * modern one is the more reliable; the older one is deprecated and frozen, but it is
 * still the only one Firefox and Safari provide.
 *
 * The modern one is missing from TypeScript's own definitions, so it is described by a
 * type declared LOCALLY rather than added to the global ones — the latter would leak
 * out into every consumer's compilation.
 */
export function detectPlatform(): HotkeysPlatform {
  if (typeof navigator === 'undefined') return DEFAULT_PLATFORM
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } }
  const source = (nav.userAgentData?.platform || nav.platform || '').toLowerCase()
  /* iPadOS reports itself as a Mac, which is fine here: an attached keyboard carries
     the same modifier symbols either way. */
  if (/mac|iphone|ipad|ipod/.test(source)) return 'mac'
  if (source.includes('win')) return 'windows'
  /* ChromeOS spells itself two different ways depending on which of the two sources
     answered. Both have to be listed, or the branch is dead precisely where it
     matters. */
  if (/linux|android|cros|chrome os/.test(source)) return 'linux'
  return DEFAULT_PLATFORM
}

/* Every spelling accepted in the `keys` prop, and at the same time the table that
   normalizes what the browser reports. Serving both is what guarantees the two can
   never disagree.

   The `+` key is canonically named `plus`, since `+` is the separator and cannot name
   itself in the prop — but the browser does report it as `'+'`, hence its presence
   here. */
const ALIASES: Record<string, string> = {
  cmd: 'meta',
  command: 'meta',
  win: 'meta',
  windows: 'meta',
  super: 'meta',
  os: 'meta',
  cmdorctrl: 'mod',
  commandorcontrol: 'mod',
  control: 'ctrl',
  option: 'alt',
  opt: 'alt',
  return: 'enter',
  escape: 'esc',
  spacebar: 'space',
  ' ': 'space',
  del: 'delete',
  arrowup: 'up',
  arrowdown: 'down',
  arrowleft: 'left',
  arrowright: 'right',
  '+': 'plus',
}

/* The symbols engraved on an Apple keyboard, and on no other. Escape and the space bar
   are deliberately absent: the Mac key really does read "esc", and the space bar
   carries no symbol at all. */
const MAC_GLYPHS: Record<string, string> = {
  mod: '⌘',
  meta: '⌘',
  ctrl: '⌃',
  alt: '⌥',
  shift: '⇧',
  enter: '↵',
  backspace: '⌫',
  delete: '⌦',
  tab: '⇥',
}

/* Symbols that are the same everywhere: an arrow key is engraved with an arrow on
   every keyboard ever made. */
const GLYPHS: Record<string, string> = {
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
  plus: '+',
}

const WORDS: Record<string, HotkeysWord> = {
  ctrl: 'ctrl',
  alt: 'alt',
  shift: 'shift',
  enter: 'enter',
  esc: 'escape',
  space: 'space',
  backspace: 'backspace',
  delete: 'delete',
  tab: 'tab',
  up: 'up',
  down: 'down',
  left: 'left',
  right: 'right',
}

const MODIFIERS = new Set(['mod', 'meta', 'ctrl', 'alt', 'shift'])

/**
 * The kinds of field one cannot type prose into. A shortcut stays live over a
 * checkbox, a button or a colour picker: there is no sentence to interrupt there.
 */
const NON_TEXT_INPUT_TYPES = new Set([
  'button',
  'submit',
  'reset',
  'checkbox',
  'radio',
  'file',
  'range',
  'color',
  'image',
])

/**
 * Reads a combination as it was written and returns its keys in canonical form:
 * `'mod+k'` and `' Mod + K '` both give the same two. Empty segments are dropped, so a
 * trailing separator is harmless — and the `+` KEY itself is written `plus`.
 */
export function parseHotkeys(keys: string): string[] {
  const tokens = keys
    .split('+')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
    .map((token) => ALIASES[token] ?? token)
  if (isDev && tokens.length === 0) {
    console.warn(`[VHotkeys] \`keys\` is empty: "${keys}" declares no key.`)
  }
  return tokens
}

/** Whether this key is one that is held down rather than pressed. */
function isModifier(token: string): boolean {
  return MODIFIERS.has(token)
}

/**
 * How a key nobody has a word or a symbol for is printed: as it was written, merely
 * capitalized — `k` becomes K, `f5` becomes F5, and a slash stays a slash.
 */
export function capLabel(token: string): string {
  return token.charAt(0).toUpperCase() + token.slice(1)
}

function wordOf(token: string, platform: HotkeysPlatform): HotkeysWord | undefined {
  /* The two keys whose name depends on the system. `mod` is the modifier a consumer
     writes when they mean "the usual one here" — Command on a Mac, Ctrl elsewhere —
     while `meta` names that physical key literally, and it is called something
     different on each system. */
  if (token === 'mod') return platform === 'mac' ? 'command' : 'ctrl'
  if (token === 'meta') {
    if (platform === 'mac') return 'command'
    return platform === 'windows' ? 'windows' : 'super'
  }
  return WORDS[token]
}

/**
 * Resolves each key of a combination for a given system, attaching the symbol engraved
 * on it and the dictionary entry naming it, where either exists.
 */
export function resolveKeys(tokens: string[], platform: HotkeysPlatform): ResolvedKey[] {
  return tokens.map((token) => ({
    token,
    glyph: (platform === 'mac' ? MAC_GLYPHS[token] : undefined) ?? GLYPHS[token],
    word: wordOf(token, platform),
  }))
}

function normalizeEventKey(event: KeyboardEvent): string {
  const key = event.key.toLowerCase()
  return ALIASES[key] ?? key
}

/**
 * Whether a key press IS this combination.
 *
 * The modifiers are compared EXACTLY, and never as "at least these ones". Without
 * that, `mod+k` and `mod+shift+k` could not coexist in one application: the first
 * would swallow every press meant for the second.
 */
export function matchesEvent(
  event: KeyboardEvent,
  tokens: string[],
  platform: HotkeysPlatform,
): boolean {
  const wantCtrl = tokens.includes('ctrl') || (platform !== 'mac' && tokens.includes('mod'))
  const wantMeta = tokens.includes('meta') || (platform === 'mac' && tokens.includes('mod'))
  if (event.ctrlKey !== wantCtrl) return false
  if (event.metaKey !== wantMeta) return false
  if (event.altKey !== tokens.includes('alt')) return false
  if (event.shiftKey !== tokens.includes('shift')) return false
  const main = tokens.find((token) => !isModifier(token))
  /* A combination made of modifiers alone never fires: there is no key to press. */
  if (main === undefined) return false
  /* Both sides go through the same normalization, which is also what makes a press
     reported as "K" — because Shift was held — match a shortcut written `k`. */
  return normalizeEventKey(event) === main
}

// @keyboard — what `allowInInput` is asked about: a shortcut must not fire in the
// middle of someone typing a sentence.
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (tag !== 'INPUT') return false
  return !NON_TEXT_INPUT_TYPES.has((target as HTMLInputElement).type)
}
