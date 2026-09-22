import { fireEvent, render } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { KeepAlive, defineComponent, h, nextTick, ref } from 'vue'

import VHotkeys from './VHotkeys.vue'
import { capLabel, detectPlatform, parseHotkeys, resolveKeys } from './platform'

/** The visible caps, in order. */
function capsOf(container: Element): string[] {
  return [...container.querySelectorAll('.v-hotkeys-key')].map((el) => el.textContent)
}

function keydown(init: KeyboardEventInit, target: EventTarget = document): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init })
  target.dispatchEvent(event)
  return event
}

describe('parseHotkeys', () => {
  it('splits, trims and lowercases: the prop is written as the consumer likes', () => {
    expect(parseHotkeys('mod+k')).toEqual(['mod', 'k'])
    expect(parseHotkeys(' Mod + K ')).toEqual(['mod', 'k'])
  })

  it('normalizes the aliases to the canonical tokens', () => {
    expect(parseHotkeys('cmd+shift+p')).toEqual(['meta', 'shift', 'p'])
    expect(parseHotkeys('control+escape')).toEqual(['ctrl', 'esc'])
    expect(parseHotkeys('option+return')).toEqual(['alt', 'enter'])
    expect(parseHotkeys('arrowup')).toEqual(['up'])
    expect(parseHotkeys('win+r')).toEqual(['meta', 'r'])
    expect(parseHotkeys('CmdOrCtrl+Del')).toEqual(['mod', 'delete'])
  })

  it('drops the empty segments, so a doubled or trailing + is harmless', () => {
    expect(parseHotkeys('mod++k')).toEqual(['mod', 'k'])
    expect(parseHotkeys('mod+')).toEqual(['mod'])
    expect(parseHotkeys('')).toEqual([])
  })

  it('warns about a combination with no key, or with two', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    parseHotkeys('ctrl++')
    parseHotkeys('g+h')
    expect(warn.mock.calls.map(([m]) => String(m))).toEqual([
      expect.stringContaining('only modifiers'),
      expect.stringContaining('more than one key'),
    ])
    warn.mockClear()
    parseHotkeys('ctrl+plus')
    parseHotkeys('mod+shift+k')
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it('the + KEY is the `plus` token', () => {
    expect(parseHotkeys('mod+plus')).toEqual(['mod', 'plus'])
  })
})

describe('resolveKeys / capLabel', () => {
  it('mod is ⌘ on macOS and the Ctrl word everywhere else', () => {
    expect(resolveKeys(['mod'], 'mac')[0]).toEqual({ token: 'mod', glyph: '⌘', word: 'command' })
    expect(resolveKeys(['mod'], 'windows')[0]).toEqual({
      token: 'mod',
      glyph: undefined,
      word: 'ctrl',
    })
  })

  it('meta names the physical key: Command, Windows or Super', () => {
    expect(resolveKeys(['meta'], 'mac')[0]?.word).toBe('command')
    expect(resolveKeys(['meta'], 'windows')[0]?.word).toBe('windows')
    expect(resolveKeys(['meta'], 'linux')[0]?.word).toBe('super')
    expect(resolveKeys(['meta'], 'other')[0]?.word).toBe('super')
  })

  it('esc and space have no macOS glyph: the key is engraved with the word', () => {
    expect(resolveKeys(['esc', 'space'], 'mac').map((k) => k.glyph)).toEqual([undefined, undefined])
  })

  it('the arrows carry their glyph on every platform', () => {
    expect(resolveKeys(['up', 'down', 'left', 'right'], 'windows').map((k) => k.glyph)).toEqual([
      '↑',
      '↓',
      '←',
      '→',
    ])
  })

  it('a modifier written twice, or mod beside its own key, is shown once', () => {
    expect(resolveKeys(parseHotkeys('mod+ctrl+k'), 'windows').map((k) => k.token)).toEqual([
      'mod',
      'k',
    ])
    expect(resolveKeys(parseHotkeys('ctrl+ctrl+k'), 'mac').map((k) => k.token)).toEqual([
      'ctrl',
      'k',
    ])
    // On a Mac mod is Command, so it and Ctrl are two different keys.
    expect(resolveKeys(parseHotkeys('mod+ctrl+k'), 'mac')).toHaveLength(3)
  })

  it('an unknown token has neither glyph nor word: it falls through to capLabel', () => {
    expect(resolveKeys(['f5'], 'mac')[0]).toEqual({
      token: 'f5',
      glyph: undefined,
      word: undefined,
    })
    expect(capLabel('k')).toBe('K')
    expect(capLabel('f5')).toBe('F5')
    expect(capLabel('/')).toBe('/')
  })
})

describe('detectPlatform', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reads navigator.userAgentData.platform first', () => {
    const cases: [string, string][] = [
      ['macOS', 'mac'],
      ['Windows', 'windows'],
      ['Linux', 'linux'],
      ['Android', 'linux'],
      ['Chrome OS', 'linux'],
    ]
    for (const [reported, expected] of cases) {
      vi.stubGlobal('navigator', { userAgentData: { platform: reported }, platform: '' })
      expect(detectPlatform()).toBe(expected)
    }
  })

  it('falls back to the deprecated navigator.platform (Firefox, Safari)', () => {
    const cases: [string, string][] = [
      ['MacIntel', 'mac'],
      ['iPhone', 'mac'],
      ['Win32', 'windows'],
      ['Linux x86_64', 'linux'],
    ]
    for (const [reported, expected] of cases) {
      vi.stubGlobal('navigator', { platform: reported })
      expect(detectPlatform()).toBe(expected)
    }
  })

  it('userAgentData wins over a contradictory navigator.platform', () => {
    vi.stubGlobal('navigator', { userAgentData: { platform: 'Windows' }, platform: 'MacIntel' })
    expect(detectPlatform()).toBe('windows')
  })

  it('an unknown or empty source falls back to the SSR default', () => {
    vi.stubGlobal('navigator', { platform: 'FreeBSD amd64' })
    expect(detectPlatform()).toBe('other')
    vi.stubGlobal('navigator', { platform: '' })
    expect(detectPlatform()).toBe('other')
  })
})

describe('VHotkeys', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('root <kbd class="v-hotkeys v-control"> with one nested <kbd> per token, in order', () => {
    const { container } = render(VHotkeys, { props: { keys: 'ctrl+shift+p', platform: 'windows' } })
    const root = container.firstElementChild as HTMLElement
    expect(root.tagName).toBe('KBD')
    expect(root.classList.contains('v-hotkeys')).toBe(true)
    expect(root.classList.contains('v-control')).toBe(true)
    expect(capsOf(container)).toEqual(['Ctrl', 'Shift', 'P'])
    expect(container.querySelectorAll('kbd.v-hotkeys-key')).toHaveLength(3)
  })

  it('default data-attributes, and rerender updates them', async () => {
    const { container, rerender } = render(VHotkeys, { props: { keys: 'esc' } })
    const root = container.firstElementChild as HTMLElement
    expect(root.getAttribute('data-variant')).toBe('soft')
    expect(root.getAttribute('data-size')).toBe('xs')
    expect(root.hasAttribute('data-compact')).toBe(false)

    await rerender({ variant: 'elevated', size: 'sm', compact: true })
    expect(root.getAttribute('data-variant')).toBe('elevated')
    expect(root.getAttribute('data-size')).toBe('sm')
    expect(root.hasAttribute('data-compact')).toBe(true)
  })

  it('the caps follow the platform, which is reflected on data-platform', () => {
    const mac = render(VHotkeys, { props: { keys: 'mod+shift+k', platform: 'mac' } })
    expect(capsOf(mac.container)).toEqual(['⌘', '⇧', 'K'])
    expect((mac.container.firstElementChild as HTMLElement).getAttribute('data-platform')).toBe(
      'mac',
    )
    mac.unmount()

    const windows = render(VHotkeys, { props: { keys: 'mod+shift+k', platform: 'windows' } })
    expect(capsOf(windows.container)).toEqual(['Ctrl', 'Shift', 'K'])
    windows.unmount()

    const linux = render(VHotkeys, { props: { keys: 'meta+r', platform: 'linux' } })
    expect(capsOf(linux.container)).toEqual(['Super', 'R'])
  })

  it('with no platform prop the OS is detected on mount, all the way to the DOM', async () => {
    vi.stubGlobal('navigator', { userAgentData: { platform: 'macOS' } })
    const { container } = render(VHotkeys, { props: { keys: 'mod+k' } })
    await nextTick()
    expect(capsOf(container)).toEqual(['⌘', 'K'])
  })

  it('a separator between the caps, never before the first; "" removes it', async () => {
    const { container, rerender } = render(VHotkeys, {
      props: { keys: 'mod+shift+k', platform: 'mac' },
    })
    expect([...container.querySelectorAll('.v-hotkeys-separator')].map((el) => el.textContent)) //
      .toEqual(['+', '+'])

    await rerender({ separator: '' })
    expect(container.querySelectorAll('.v-hotkeys-separator')).toHaveLength(0)
    expect(capsOf(container)).toEqual(['⌘', '⇧', 'K'])
  })

  it('the caps are aria-hidden, the accessible name is spelled in WORDS', () => {
    const { container } = render(VHotkeys, { props: { keys: 'mod+k', platform: 'windows' } })
    expect(container.querySelector('.v-hotkeys-keys')?.getAttribute('aria-hidden')).toBe('true')
    expect(container.querySelector('.v-visually-hidden')?.textContent).toBe(
      'Keyboard shortcut: Ctrl + K',
    )
  })

  it('the glyph never leaks into the accessible name: ⌘ is spoken "Command"', () => {
    const { container } = render(VHotkeys, { props: { keys: 'mod+k', platform: 'mac' } })
    expect(capsOf(container)).toEqual(['⌘', 'K'])
    expect(container.querySelector('.v-visually-hidden')?.textContent).toBe(
      'Keyboard shortcut: Command + K',
    )
  })

  it('the label prop replaces the whole accessible name', () => {
    const { container } = render(VHotkeys, {
      props: { keys: 'mod+k', platform: 'mac', label: 'Open the palette' },
    })
    expect(container.querySelector('.v-visually-hidden')?.textContent).toBe('Open the palette')
  })

  it('attached is opt-in and reflected on data-attached', async () => {
    const { container, rerender } = render(VHotkeys, { props: { keys: 'mod+k' } })
    const root = container.firstElementChild as HTMLElement
    expect(root.hasAttribute('data-attached')).toBe(false)

    await rerender({ attached: true })
    expect(root.hasAttribute('data-attached')).toBe(true)
  })

  it('attached is purely visual: identical markup and accessible name', async () => {
    const props = { keys: 'mod+shift+k', platform: 'windows' } as const
    const { container, rerender } = render(VHotkeys, { props })
    const detached = {
      caps: capsOf(container),
      separators: container.querySelectorAll('.v-hotkeys-separator').length,
      name: container.querySelector('.v-visually-hidden')?.textContent,
    }

    await rerender({ ...props, attached: true })
    expect(capsOf(container)).toEqual(detached.caps)
    expect(container.querySelectorAll('.v-hotkeys-separator')).toHaveLength(detached.separators)
    expect(container.querySelector('.v-visually-hidden')?.textContent).toBe(detached.name)
    expect(detached.name).toBe('Keyboard shortcut: Ctrl + Shift + K')
  })

  it('an unknown token is displayed as declared, merely capitalized', () => {
    const { container } = render(VHotkeys, { props: { keys: 'ctrl+f5', platform: 'windows' } })
    expect(capsOf(container)).toEqual(['Ctrl', 'F5'])
  })
})

describe('VHotkeys — listen', () => {
  it('emits nothing without the listen prop', async () => {
    const { emitted } = render(VHotkeys, { props: { keys: 'mod+k', platform: 'windows' } })
    await fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    expect(emitted().trigger).toBeUndefined()
  })

  it('emits trigger on the combination when listening', async () => {
    const { emitted } = render(VHotkeys, {
      props: { keys: 'mod+k', platform: 'windows', listen: true },
    })
    await fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    expect(emitted().trigger).toHaveLength(1)
  })

  it('mod is Meta on macOS and Ctrl elsewhere — the matcher follows the platform', async () => {
    const { emitted } = render(VHotkeys, {
      props: { keys: 'mod+k', platform: 'mac', listen: true },
    })
    await fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    expect(emitted().trigger).toBeUndefined()
    await fireEvent.keyDown(document, { key: 'k', metaKey: true })
    expect(emitted().trigger).toHaveLength(1)
  })

  it('modifiers are matched EXACTLY: mod+k stays silent on mod+shift+k', async () => {
    const { emitted } = render(VHotkeys, {
      props: { keys: 'mod+k', platform: 'windows', listen: true },
    })
    await fireEvent.keyDown(document, { key: 'k', ctrlKey: true, shiftKey: true })
    expect(emitted().trigger).toBeUndefined()
  })

  it('the uppercase event.key produced by Shift is normalized', async () => {
    const { emitted } = render(VHotkeys, {
      props: { keys: 'mod+shift+p', platform: 'windows', listen: true },
    })
    await fireEvent.keyDown(document, { key: 'P', ctrlKey: true, shiftKey: true })
    expect(emitted().trigger).toHaveLength(1)
  })

  it('a modifiers-only combination never fires: there is no key to press', async () => {
    const { emitted } = render(VHotkeys, {
      props: { keys: 'mod+shift', platform: 'windows', listen: true },
    })
    await fireEvent.keyDown(document, { key: 'Shift', ctrlKey: true, shiftKey: true })
    expect(emitted().trigger).toBeUndefined()
  })

  it('the OS auto-repeat is ignored', async () => {
    const { emitted } = render(VHotkeys, {
      props: { keys: 'mod+k', platform: 'windows', listen: true },
    })
    await fireEvent.keyDown(document, { key: 'k', ctrlKey: true, repeat: true })
    expect(emitted().trigger).toBeUndefined()
  })

  it('the browser is stopped by default, and let through by allowDefault', async () => {
    const { rerender } = render(VHotkeys, {
      props: { keys: 'mod+k', platform: 'windows', listen: true },
    })
    expect(keydown({ key: 'k', ctrlKey: true }).defaultPrevented).toBe(true)

    await rerender({ allowDefault: true })
    expect(keydown({ key: 'k', ctrlKey: true }).defaultPrevented).toBe(false)
  })

  it('a text field swallows the shortcut, unless allowInInput', async () => {
    const field = document.createElement('input')
    document.body.appendChild(field)

    const { emitted, rerender } = render(VHotkeys, {
      props: { keys: 'mod+k', platform: 'windows', listen: true },
    })
    keydown({ key: 'k', ctrlKey: true }, field)
    expect(emitted().trigger).toBeUndefined()

    await rerender({ allowInInput: true })
    keydown({ key: 'k', ctrlKey: true }, field)
    expect(emitted().trigger).toHaveLength(1)

    field.remove()
  })

  it('a checkbox is not a text field: the shortcut stays live over it', () => {
    const box = document.createElement('input')
    box.type = 'checkbox'
    document.body.appendChild(box)

    const { emitted } = render(VHotkeys, {
      props: { keys: 'mod+k', platform: 'windows', listen: true },
    })
    keydown({ key: 'k', ctrlKey: true }, box)
    expect(emitted().trigger).toHaveLength(1)

    box.remove()
  })

  it('a key press another handler already cancelled is left alone', () => {
    const { emitted } = render(VHotkeys, {
      props: { keys: 'mod+k', platform: 'windows', listen: true },
    })
    const cancel = (event: Event) => event.preventDefault()
    document.body.addEventListener('keydown', cancel)
    keydown({ key: 'k', ctrlKey: true }, document.body)
    document.body.removeEventListener('keydown', cancel)
    expect(emitted().trigger).toBeUndefined()
  })

  it('Escape is reported but never cancelled: it stays the close request of dialogs', () => {
    const { emitted } = render(VHotkeys, {
      props: { keys: 'esc', platform: 'windows', listen: true },
    })
    expect(keydown({ key: 'Escape' }).defaultPrevented).toBe(false)
    expect(emitted().trigger).toHaveLength(1)
  })

  it('the key that confirms an IME composition does not fire', () => {
    const { emitted } = render(VHotkeys, {
      props: { keys: 'enter', platform: 'windows', listen: true, allowInInput: true },
    })
    keydown({ key: 'Enter', isComposing: true })
    expect(emitted().trigger).toBeUndefined()
  })

  it('a text field inside a shadow root swallows the shortcut too', () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const field = document.createElement('input')
    host.attachShadow({ mode: 'open' }).appendChild(field)

    const { emitted } = render(VHotkeys, {
      props: { keys: 'k', platform: 'windows', listen: true },
    })
    field.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', bubbles: true, composed: true, cancelable: true }),
    )
    expect(emitted().trigger).toBeUndefined()
    host.remove()
  })

  it('a deactivated KeepAlive view stops listening, and starts again once reactivated', async () => {
    const onTrigger = vi.fn()
    const shown = ref(true)
    const Host = defineComponent({
      setup: () => () =>
        h(KeepAlive, null, [
          shown.value
            ? h(VHotkeys, { keys: 'mod+k', platform: 'windows', listen: true, onTrigger })
            : h('span'),
        ]),
    })
    render(Host)
    await nextTick()
    keydown({ key: 'k', ctrlKey: true })
    expect(onTrigger).toHaveBeenCalledTimes(1)

    shown.value = false
    await nextTick()
    keydown({ key: 'k', ctrlKey: true })
    expect(onTrigger).toHaveBeenCalledTimes(1)

    shown.value = true
    await nextTick()
    keydown({ key: 'k', ctrlKey: true })
    expect(onTrigger).toHaveBeenCalledTimes(2)
  })

  it('the listener follows the prop and is removed on unmount', async () => {
    const { emitted, rerender, unmount } = render(VHotkeys, {
      props: { keys: 'mod+k', platform: 'windows', listen: true },
    })
    await fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    expect(emitted().trigger).toHaveLength(1)

    await rerender({ listen: false })
    await fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    expect(emitted().trigger).toHaveLength(1)

    /* Back on: the `attached` guard must not install a second listener. */
    await rerender({ listen: true })
    await fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    expect(emitted().trigger).toHaveLength(2)

    unmount()
    expect(() => keydown({ key: 'k', ctrlKey: true })).not.toThrow()
  })
})
