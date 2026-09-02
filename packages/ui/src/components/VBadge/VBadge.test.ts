import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import VBadge from './VBadge.vue'

describe('VBadge', () => {
  it('standalone by default: a lone .v-badge root, accent tone, count rendered', () => {
    const { container, getByText } = render(VBadge, { props: { count: 3 } })
    const root = container.firstElementChild!
    expect(root.classList.contains('v-badge')).toBe(true)
    expect(container.querySelector('.v-badge-host')).toBeNull()
    expect(root.getAttribute('data-tone')).toBe('accent')
    expect(getByText('3')).toBeTruthy()
  })

  it('an explicit tone is set as data-tone', () => {
    const { container } = render(VBadge, { props: { tone: 'danger', count: 3 } })
    expect(container.querySelector('.v-badge')!.getAttribute('data-tone')).toBe('danger')
  })

  it('color: data-custom + an inline --custom-color; both absent without color', () => {
    const { container } = render(VBadge, { props: { color: 'hotpink', count: 3 } })
    const badge = container.querySelector('.v-badge')!
    expect(badge.hasAttribute('data-custom')).toBe(true)
    expect(badge.getAttribute('style')).toContain('--custom-color: hotpink')

    const { container: bare } = render(VBadge, { props: { count: 3 } })
    const bareBadge = bare.querySelector('.v-badge')!
    expect(bareBadge.hasAttribute('data-custom')).toBe(false)
    expect(bareBadge.getAttribute('style')).toBeNull()
  })

  it('capping: count > 99 displayed as "99+", 99 unchanged', () => {
    const { container } = render(VBadge, { props: { count: 100 } })
    expect(container.querySelector('.v-badge')!.textContent).toBe('99+')

    const { container: at99 } = render(VBadge, { props: { count: 99 } })
    expect(at99.querySelector('.v-badge')!.textContent).toBe('99')
  })

  it('icon: data-icon-only, .v-icon rendered, wins over count', () => {
    const { container } = render(VBadge, { props: { icon: 'notifications', count: 3 } })
    const badge = container.querySelector('.v-badge')!
    expect(badge.hasAttribute('data-icon-only')).toBe(true)
    expect(badge.querySelector('.v-icon')).toBeTruthy()
    expect(badge.textContent).not.toContain('3')
  })

  it('dot: data-dot, no content, icon and count ignored', () => {
    const { container } = render(VBadge, {
      props: { dot: true, icon: 'notifications', count: 3 },
    })
    const badge = container.querySelector('.v-badge')!
    expect(badge.hasAttribute('data-dot')).toBe(true)
    expect(badge.hasAttribute('data-icon-only')).toBe(false)
    expect(badge.querySelector('.v-icon')).toBeNull()
    expect(badge.textContent).toBe('')
  })

  it('default slot: a .v-badge-host root, the target rendered, the badge last child', () => {
    const { container, getByText } = render(VBadge, {
      props: { count: 3 },
      slots: { default: '<button type="button">Messages</button>' },
    })
    const host = container.firstElementChild!
    expect(host.classList.contains('v-badge-host')).toBe(true)
    expect(host.hasAttribute('data-overlay')).toBe(false)
    expect(getByText('Messages')).toBeTruthy()
    expect(host.lastElementChild!.classList.contains('v-badge')).toBe(true)
  })

  it('overlay: data-overlay set on the host', () => {
    const { container } = render(VBadge, {
      props: { count: 3, overlay: true },
      slots: { default: '<span>Target</span>' },
    })
    expect(container.querySelector('.v-badge-host')!.hasAttribute('data-overlay')).toBe(true)
  })

  it('overlayPosition: mirrored as data-overlay-position, top by default', () => {
    const { container } = render(VBadge, {
      props: { count: 3, overlay: true },
      slots: { default: '<span>Target</span>' },
    })
    expect(container.querySelector('.v-badge-host')!.getAttribute('data-overlay-position')).toBe(
      'top',
    )

    const { container: bottom } = render(VBadge, {
      props: { count: 3, overlay: true, overlayPosition: 'bottom' },
      slots: { default: '<span>Target</span>' },
    })
    expect(bottom.querySelector('.v-badge-host')!.getAttribute('data-overlay-position')).toBe(
      'bottom',
    )
  })

  it('bordered: data-bordered set on the badge', () => {
    const { container } = render(VBadge, { props: { count: 3, bordered: true } })
    expect(container.querySelector('.v-badge')!.hasAttribute('data-bordered')).toBe(true)
  })

  it('ringColor: an inline --badge-ring-color; no style at all without it', () => {
    const { container } = render(VBadge, {
      props: { count: 3, bordered: true, ringColor: 'rebeccapurple' },
    })
    const badge = container.querySelector('.v-badge') as HTMLElement
    expect(badge.style.getPropertyValue('--badge-ring-color')).toBe('rebeccapurple')

    const { container: bare } = render(VBadge, { props: { count: 3, bordered: true } })
    expect(bare.querySelector('.v-badge')!.getAttribute('style')).toBeNull()
  })

  // The two colours share one inline style, which is what a return to a single
  // ternary on `color` would silently break.
  it('color and ringColor are carried by the same style attribute', () => {
    const { container } = render(VBadge, {
      props: { count: 3, bordered: true, color: 'hotpink', ringColor: 'rebeccapurple' },
    })
    const style = container.querySelector('.v-badge')!.getAttribute('style')!
    expect(style).toContain('--custom-color: hotpink')
    expect(style).toContain('--badge-ring-color: rebeccapurple')
  })

  it('fallthrough: class on .v-badge when standalone, on .v-badge-host with a target', () => {
    const { container } = render(VBadge, {
      props: { count: 3 },
      attrs: { class: 'extra', 'data-testid': 'alone' },
    })
    const badge = container.querySelector('.v-badge')!
    expect(badge.classList.contains('extra')).toBe(true)
    expect(badge.getAttribute('data-testid')).toBe('alone')

    const { container: hosted } = render(VBadge, {
      props: { count: 3 },
      attrs: { class: 'extra' },
      slots: { default: '<span>Target</span>' },
    })
    expect(hosted.querySelector('.v-badge-host')!.classList.contains('extra')).toBe(true)
    expect(hosted.querySelector('.v-badge')!.classList.contains('extra')).toBe(false)
  })
})
