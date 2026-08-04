import { isDev } from '../../utils/env'

/**
 * Which OS the keyboard belongs to, and the token ⇄ glyph ⇄ word ⇄ KeyboardEvent
 * mapping of a shortcut. The ONLY place in the DS that reads `navigator`.
 *
 * The OS is not a language: ⌘ vs Ctrl is a hardware fact, so it does NOT go
 * through the locale. Only the WORDS do (`Shift` → `Maj`), and those stay in the
 * dictionary — this module returns the dictionary KEY, never the text.
 *
 * The alias table is what earns this module its existence: the SAME table
 * normalizes the tokens of the `keys` prop and `event.key` in the matcher
 * ('Escape' → esc, ' ' → space, 'ArrowUp' → up), so a shortcut cannot be
 * declared in a spelling the matcher does not recognize.
 *
 * ⚠ `detectPlatform()` must only ever be called from `onMounted`: the server has
 * no `navigator`, and sniffing a User-Agent header is not this library's job.
 */
export type HotkeysPlatform = 'mac' | 'windows' | 'linux' | 'other'

/** Dictionary keys of the `hotkeys` namespace that name a key — `label` excluded.
    Declared here rather than derived from `VectisMessages`, which would couple
    this module to the dictionary's shape; the use site (`m.value.hotkeys[word]`)
    checks the union just as strictly. */
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

export interface ResolvedKey {
  /** Canonical token — what the matcher compares against. */
  token: string
  /** What to PRINT when the OS engraves a symbol on that key. */
  glyph?: string
  /** Dictionary key of the word. Absent → an unknown key, printed through `capLabel`. */
  word?: HotkeysWord
}

/**
 * What the SERVER renders, and therefore what the client's FIRST render must be
 * too. `'other'` shares the non-mac word set (Ctrl, Alt, Shift…): only macOS
 * pays one frame of `Ctrl` before `onMounted` corrects it to ⌘.
 */
export const DEFAULT_PLATFORM: HotkeysPlatform = 'other'

/**
 * `navigator.userAgentData.platform` is the modern source; `navigator.platform`
 * is deprecated and frozen, but it is the only one Firefox and Safari ship.
 * `userAgentData` is absent from lib.dom: typed with a LOCAL structural type
 * rather than a `declare global`, which would leak into the consumer's
 * compilation.
 */
export function detectPlatform(): HotkeysPlatform {
  if (typeof navigator === 'undefined') return DEFAULT_PLATFORM
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } }
  const source = (nav.userAgentData?.platform || nav.platform || '').toLowerCase()
  /* iPadOS reports `MacIntel` — the same modifier glyphs either way. */
  if (/mac|iphone|ipad|ipod/.test(source)) return 'mac'
  if (source.includes('win')) return 'windows'
  /* ChromeOS reports `Chrome OS` through userAgentData and `CrOS` in a legacy
     User-Agent: both spellings, or the branch is dead where it matters most. */
  if (/linux|android|cros|chrome os/.test(source)) return 'linux'
  return DEFAULT_PLATFORM
}

/* Spellings accepted in `keys`, AND the normalization of `event.key`. `plus` is
   the canonical name of the `+` key: `+` is the separator, so it cannot name
   itself in the prop — but `event.key` does hand it over as `'+'`. */
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

/* Engraved on an Apple keyboard, and on no other. `esc` and `space` are absent
   on purpose: the mac key IS engraved `esc`, and the space bar has no symbol. */
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

/* Universal symbols: an arrow key is engraved with an arrow on every keyboard. */
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

/** Input types that are not text: a shortcut stays live over a checkbox or a button. */
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

/** `'mod+k'`, `' Mod + K '` → `['mod', 'k']`. Empty segments are dropped, so a
    trailing `+` is harmless; the `+` KEY is written `plus`. */
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

export function isModifier(token: string): boolean {
  return MODIFIERS.has(token)
}

/** `'k'` → `'K'`, `'f5'` → `'F5'`, `'/'` → `'/'`. The fallback for a token the
    DS knows nothing about — displayed as declared, merely capitalized. */
export function capLabel(token: string): string {
  return token.charAt(0).toUpperCase() + token.slice(1)
}

function wordOf(token: string, platform: HotkeysPlatform): HotkeysWord | undefined {
  /* The two platform-dependent tokens: `mod` is the CROSS-PLATFORM modifier,
     `meta` the literal Command/Windows/Super key. */
  if (token === 'mod') return platform === 'mac' ? 'command' : 'ctrl'
  if (token === 'meta') {
    if (platform === 'mac') return 'command'
    return platform === 'windows' ? 'windows' : 'super'
  }
  return WORDS[token]
}

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
 * Modifiers are matched EXACTLY (`!==`, never "at least"): otherwise `mod+k` and
 * `mod+shift+k` could not coexist in one app, the first swallowing the second.
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
  /* A modifiers-only combination never fires: there is no key to press. */
  if (main === undefined) return false
  /* Normalized on both sides — which is also what makes `event.key === 'K'`
     match `k` when Shift is held. */
  return normalizeEventKey(event) === main
}

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (tag !== 'INPUT') return false
  return !NON_TEXT_INPUT_TYPES.has((target as HTMLInputElement).type)
}
