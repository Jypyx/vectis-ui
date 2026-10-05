import { render } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import VCard from './VCard.vue'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('VCard', () => {
  it('renders a div.v-card with the outline, vertical, md defaults', () => {
    const { container, getByText } = render(VCard, { slots: { default: 'Body text' } })
    const root = container.firstElementChild!
    expect(root.tagName).toBe('DIV')
    expect(root.classList.contains('v-card')).toBe(true)
    expect(root.getAttribute('data-variant')).toBe('outline')
    expect(root.getAttribute('data-orientation')).toBe('vertical')
    expect(root.getAttribute('data-size')).toBe('md')
    expect(getByText('Body text').className).toBe('v-card-body')
  })

  it('mirrors variant, orientation and size as data attributes', () => {
    const { container } = render(VCard, {
      props: { variant: 'elevated', orientation: 'horizontal', size: 'lg' },
    })
    const root = container.firstElementChild!
    expect(root.getAttribute('data-variant')).toBe('elevated')
    expect(root.getAttribute('data-orientation')).toBe('horizontal')
    expect(root.getAttribute('data-size')).toBe('lg')
  })

  it('renders as the element named by `as`', () => {
    const { container } = render(VCard, { props: { as: 'article' } })
    expect(container.firstElementChild!.tagName).toBe('ARTICLE')
  })

  it('draws the title as a paragraph, or as a heading of headingLevel', () => {
    const plain = render(VCard, { props: { title: 'Plan', subtitle: 'Monthly' } })
    expect(plain.container.querySelector('.v-card-title')!.tagName).toBe('P')
    expect(plain.container.querySelector('.v-card-subtitle')!.textContent).toBe('Monthly')

    const heading = render(VCard, { props: { title: 'Plan', headingLevel: 3 } })
    expect(heading.getByRole('heading', { level: 3, name: 'Plan' })).toBeTruthy()
  })

  it('renders the header, media and footer areas only when they have content', () => {
    const bare = render(VCard, { slots: { default: 'Body' } })
    for (const part of ['header', 'media', 'footer'])
      expect(bare.container.querySelector(`.v-card-${part}`)).toBeNull()

    const full = render(VCard, {
      slots: {
        header: '<strong>Custom</strong>',
        media: '<img alt="" src="data:," />',
        footer: '<button type="button">Buy</button>',
      },
    })
    expect(full.container.querySelector('.v-card-header strong')).not.toBeNull()
    expect(full.container.querySelector('.v-card-media img')).not.toBeNull()
    expect(full.container.querySelector('.v-card-footer button')).not.toBeNull()
  })

  it('without href, keeps every attribute on the root and renders no link', () => {
    const { container, queryByRole } = render(VCard, {
      props: { title: 'Plan' },
      attrs: { id: 'card', 'data-test': 'x', class: 'custom' },
    })
    const root = container.firstElementChild!
    expect(root.id).toBe('card')
    expect(root.getAttribute('data-test')).toBe('x')
    expect(root.classList.contains('custom')).toBe(true)
    expect(root.hasAttribute('data-interactive')).toBe(false)
    expect(queryByRole('link')).toBeNull()
  })

  it('with href, the title is the link, which receives the forwarded attributes', () => {
    const { container, getByRole } = render(VCard, {
      props: { title: 'Plan', href: '/plans/pro' },
      attrs: { class: 'custom', style: 'color: red', target: '_blank', 'aria-describedby': 'd' },
    })
    const root = container.firstElementChild!
    const link = getByRole('link', { name: 'Plan' })
    expect(link.getAttribute('href')).toBe('/plans/pro')
    expect(link.classList.contains('v-card-link')).toBe(true)
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('aria-describedby')).toBe('d')
    expect(root.hasAttribute('data-interactive')).toBe(true)
    expect(root.classList.contains('custom')).toBe(true)
    expect(root.getAttribute('style')).toContain('color: red')
    expect(root.hasAttribute('target')).toBe(false)
  })

  it('disabled: the link loses its address, is marked disabled and drops click listeners', () => {
    const onClick = vi.fn()
    const { container, getByRole } = render(VCard, {
      props: { title: 'Plan', href: '/plans/pro', disabled: true },
      attrs: { onClick },
    })
    const link = getByRole('link', { name: 'Plan' })
    expect(link.hasAttribute('href')).toBe(false)
    expect(link.getAttribute('aria-disabled')).toBe('true')
    link.click()
    expect(onClick).not.toHaveBeenCalled()
    expect(container.firstElementChild!.hasAttribute('data-disabled')).toBe(true)
  })

  it('loading: aria-busy, placeholders instead of content, footer hidden', () => {
    const { container, queryByText } = render(VCard, {
      props: { title: 'Plan', loading: true },
      slots: {
        media: '<img alt="" src="data:," />',
        default: 'Body',
        footer: '<button type="button">Buy</button>',
      },
    })
    const root = container.firstElementChild!
    expect(root.getAttribute('aria-busy')).toBe('true')
    expect(queryByText('Plan')).toBeNull()
    expect(queryByText('Body')).toBeNull()
    expect(container.querySelector('.v-card-footer')).toBeNull()
    expect(container.querySelector('.v-card-media img')).toBeNull()
    expect(container.querySelector('.v-card-media .v-skeleton-loader')).not.toBeNull()
    expect(container.querySelector('[role="status"]')).toBeNull()
  })

  it('loading with loadingText announces it through a status region', () => {
    const { getByRole } = render(VCard, { props: { loading: true, loadingText: 'Loading plan' } })
    expect(getByRole('status').textContent).toContain('Loading plan')
  })

  it('warns when href has no title to carry the link', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(VCard, { props: { href: '/x' } })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[VCard]'))

    warn.mockClear()
    render(VCard, { props: { href: '/x', title: 'Plan' } })
    expect(warn).not.toHaveBeenCalled()
  })
})
