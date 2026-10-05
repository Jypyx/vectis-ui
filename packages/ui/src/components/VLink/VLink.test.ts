import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'

import VLink from './VLink.vue'

function renderHarness(template: string, bindings: Record<string, unknown> = {}) {
  const Harness = defineComponent({
    components: { VLink },
    setup: () => bindings,
    template,
  })
  return render(Harness)
}

describe('VLink', () => {
  it('is a native link, accent and always underlined by default', () => {
    const { getByRole } = renderHarness('<VLink href="/docs">Docs</VLink>')
    const link = getByRole('link', { name: 'Docs' })
    expect(link.tagName).toBe('A')
    expect(link.getAttribute('href')).toBe('/docs')
    expect(link.dataset.tone).toBe('accent')
    expect(link.dataset.underline).toBe('always')
    expect(link.hasAttribute('target')).toBe(false)
  })

  it('tone and underline are reflected for the stylesheet', () => {
    const { getByRole } = renderHarness(
      '<VLink href="/" tone="danger" underline="hover">Delete</VLink>',
    )
    const link = getByRole('link')
    expect(link.dataset.tone).toBe('danger')
    expect(link.dataset.underline).toBe('hover')
  })

  it('tone="inherit" is reflected for the stylesheet, which takes the parent colour', () => {
    const { getByRole } = renderHarness('<VLink href="/" tone="inherit">Nuxt</VLink>')
    expect(getByRole('link').dataset.tone).toBe('inherit')
  })

  it('forwards attributes, class and listeners to the link', async () => {
    const onClick = vi.fn((event: Event) => event.preventDefault())
    const { getByRole } = renderHarness(
      '<VLink href="/a" class="extra" data-x="1" download @click="onClick">A</VLink>',
      { onClick },
    )
    const link = getByRole('link')
    expect(link.classList.contains('extra')).toBe(true)
    expect(link.dataset.x).toBe('1')
    expect(link.hasAttribute('download')).toBe(true)
    await fireEvent.click(link)
    expect(onClick).toHaveBeenCalledOnce()
  })

  describe('external', () => {
    it('opens a new tab safely, with an icon and words for screen readers', () => {
      const { getByRole, container } = renderHarness(
        '<VLink href="https://vuejs.org" external>Vue</VLink>',
      )
      const link = getByRole('link', { name: 'Vue, opens in a new tab' })
      expect(link.getAttribute('target')).toBe('_blank')
      expect(link.getAttribute('rel')).toBe('noopener noreferrer')
      const icon = container.querySelector('.v-link-external')!
      expect(icon.getAttribute('aria-hidden')).toBe('true')
      expect(icon.getAttribute('data-icon')).toBe('open_in_new')
      expect(icon.hasAttribute('data-mirror')).toBe(true)
    })

    it('a rel or target given as an attribute wins', () => {
      const { getByRole } = renderHarness(
        '<VLink href="https://vuejs.org" external rel="noopener">Vue</VLink>',
      )
      expect(getByRole('link').getAttribute('rel')).toBe('noopener')
    })

    it('target="_blank" alone marks the link too', () => {
      const { getByRole, container } = renderHarness(
        '<VLink href="https://vuejs.org" target="_blank">Vue</VLink>',
      )
      expect(getByRole('link', { name: 'Vue, opens in a new tab' })).toBeTruthy()
      expect(container.querySelector('.v-link-external')).not.toBeNull()
    })

    it('externalIcon replaces the icon, hideExternalIcon removes it but keeps the words', () => {
      const custom = renderHarness(
        '<VLink href="https://a.b" external external-icon="launch">A</VLink>',
      )
      expect(custom.container.querySelector('.v-link-external')!.getAttribute('data-icon')).toBe(
        'launch',
      )
      const hidden = renderHarness(
        '<VLink href="https://a.b" external hide-external-icon>B</VLink>',
      )
      expect(hidden.container.querySelector('.v-link-external')).toBeNull()
      expect(hidden.getByRole('link', { name: 'B, opens in a new tab' })).toBeTruthy()
    })
  })

  describe('disabled', () => {
    it('drops the address and the click listeners, and is marked aria-disabled', async () => {
      const onClick = vi.fn()
      const { getByRole } = renderHarness('<VLink href="/a" disabled @click="onClick">A</VLink>', {
        onClick,
      })
      const link = getByRole('link', { name: 'A' })
      expect(link.hasAttribute('href')).toBe(false)
      expect(link.getAttribute('aria-disabled')).toBe('true')
      await fireEvent.click(link)
      expect(onClick).not.toHaveBeenCalled()
    })
  })
})
