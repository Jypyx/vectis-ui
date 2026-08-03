import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import VChip from './VChip.vue'

describe('VChip', () => {
  it('static with no interaction: no button, no link, the action rendered as a span', () => {
    const { container, queryByRole, getByText } = render(VChip, {
      slots: { default: 'Label' },
    })
    expect(queryByRole('button')).toBeNull()
    expect(queryByRole('link')).toBeNull()
    expect(container.querySelector('.v-chip-action')?.tagName).toBe('SPAN')
    expect(getByText('Label')).toBeTruthy()
  })

  it('clickable: a native button, the @click fallthrough lands on the button', async () => {
    const onClick = vi.fn()
    const { getByRole } = render(VChip, {
      props: { clickable: true },
      attrs: { onClick },
      slots: { default: 'Action' },
    })
    const button = getByRole('button', { name: 'Action' })
    expect(button.getAttribute('type')).toBe('button')
    await fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('clickable disabled: the native disabled attribute is set', () => {
    const { getByRole } = render(VChip, {
      props: { clickable: true, disabled: true },
      slots: { default: 'Action' },
    })
    expect((getByRole('button') as HTMLButtonElement).disabled).toBe(true)
  })

  it('href: rendered as <a>, the target/rel attrs land on the link', () => {
    const { getByRole } = render(VChip, {
      props: { href: '/docs' },
      attrs: { target: '_blank', rel: 'noopener' },
      slots: { default: 'Docs' },
    })
    const link = getByRole('link', { name: 'Docs' })
    expect(link.getAttribute('href')).toBe('/docs')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener')
  })

  it('inert link: disabled removes the href, sets aria-disabled and filters onClick', async () => {
    const onClick = vi.fn()
    const { container } = render(VChip, {
      props: { href: '/docs', disabled: true },
      attrs: { onClick },
      slots: { default: 'Docs' },
    })
    const action = container.querySelector('.v-chip-action')!
    expect(action.tagName).toBe('A')
    expect(action.hasAttribute('href')).toBe(false)
    expect(action.getAttribute('aria-disabled')).toBe('true')
    await fireEvent.click(action)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('selectable > href priority: an aria-pressed button, no link', () => {
    const { getByRole, queryByRole } = render(VChip, {
      props: { selectable: true, href: '/docs' },
      slots: { default: 'Filter' },
    })
    expect(queryByRole('link')).toBeNull()
    expect(getByRole('button', { name: 'Filter' }).getAttribute('aria-pressed')).toBe('false')
  })

  it('selectable: an aria-pressed button synchronized with v-model:selected', async () => {
    const { getByRole, emitted } = render(VChip, {
      props: { selectable: true, selected: false },
      slots: { default: 'Filter' },
    })
    const button = getByRole('button', { name: 'Filter' })
    expect(button.getAttribute('aria-pressed')).toBe('false')
    await fireEvent.click(button)
    expect(emitted('update:selected')).toEqual([[true]])
  })

  it('selectable disabled: no update:selected emitted', async () => {
    const { getByRole, emitted } = render(VChip, {
      props: { selectable: true, selected: false, disabled: true },
      slots: { default: 'Filter' },
    })
    await fireEvent.click(getByRole('button'))
    expect(emitted('update:selected')).toBeUndefined()
  })

  it('check: replaces iconStart when selected', async () => {
    const { container, rerender } = render(VChip, {
      props: { selectable: true, check: true, iconStart: 'star', selected: true },
      slots: { default: 'Filter' },
    })
    const icon = (name: string) => container.querySelector(`.v-icon[data-icon='${name}']`)
    expect(icon('check')).toBeTruthy()
    expect(icon('star')).toBeNull()
    await rerender({ selected: false })
    expect(icon('check')).toBeNull()
    expect(icon('star')).toBeTruthy()
  })

  it('dismissible: emits dismiss without nesting buttons', async () => {
    const { getAllByRole, emitted } = render(VChip, {
      props: { selectable: true, dismissible: true, selected: true },
      slots: { default: 'Tag' },
    })
    const buttons = getAllByRole('button')
    expect(buttons).toHaveLength(2)
    for (const b of buttons) expect(b.closest('button')).toBe(b)
    await fireEvent.click(getAllByRole('button', { name: 'Remove' })[0]!)
    expect(emitted('dismiss')).toHaveLength(1)
  })

  it('dismissIcon: the built-in cross by default (close), `{ src }` rendered as an <img>', () => {
    const { container, rerender } = render(VChip, {
      props: { dismissible: true },
      slots: { default: 'Tag' },
    })
    expect(container.querySelector<HTMLElement>('.v-chip-remove .v-icon')?.dataset.icon).toBe(
      'close',
    )
    return rerender({ dismissIcon: { src: 'https://example.com/x.svg' } }).then(() => {
      expect(container.querySelector('.v-chip-remove img')?.getAttribute('src')).toBe(
        'https://example.com/x.svg',
      )
    })
  })

  it('the #start/#end slots win over iconStart/iconEnd', () => {
    const { queryByText, getByText } = render(VChip, {
      props: { iconStart: 'star', iconEnd: 'cancel' },
      slots: { default: 'Tag', start: '<b>S</b>', end: '<b>E</b>' },
    })
    expect(getByText('S')).toBeTruthy()
    expect(getByText('E')).toBeTruthy()
    expect(queryByText('star')).toBeNull()
    expect(queryByText('cancel')).toBeNull()
  })

  it('icon alone: data-icon-only set only when there is no label', () => {
    const { container } = render(VChip, { props: { iconStart: 'favorite' } })
    expect(container.querySelector('.v-chip')?.hasAttribute('data-icon-only')).toBe(true)
    const withLabel = render(VChip, { props: { iconStart: 'favorite' }, slots: { default: 'Tag' } })
    expect(withLabel.container.querySelector('.v-chip')?.hasAttribute('data-icon-only')).toBe(false)
    const noIcon = render(VChip, {})
    expect(noIcon.container.querySelector('.v-chip')?.hasAttribute('data-icon-only')).toBe(false)
  })

  it('splits the attrs: class/style on the root, the rest on the action', () => {
    const { container } = render(VChip, {
      props: { clickable: true },
      attrs: { class: 'extra', style: 'margin: 4px;', 'data-x': '1' },
      slots: { default: 'Tag' },
    })
    const root = container.querySelector('.v-chip') as HTMLElement
    const action = container.querySelector('.v-chip-action') as HTMLElement
    expect(root.classList.contains('extra')).toBe(true)
    expect(root.style.margin).toBe('4px')
    expect(root.hasAttribute('data-x')).toBe(false)
    expect(action.getAttribute('data-x')).toBe('1')
    expect(action.classList.contains('extra')).toBe(false)
  })

  it('default data-attributes, a custom colour as an inline --custom-color', () => {
    const { container, rerender } = render(VChip, { slots: { default: 'Tag' } })
    const root = container.querySelector('.v-chip') as HTMLElement
    expect(root.getAttribute('data-variant')).toBe('tonal')
    expect(root.getAttribute('data-tone')).toBe('neutral')
    expect(root.getAttribute('data-shape')).toBe('chip')
    expect(root.hasAttribute('data-custom')).toBe(false)
    return rerender({ color: 'hotpink', shape: 'pill', variant: 'solid' }).then(() => {
      expect(root.getAttribute('data-variant')).toBe('solid')
      expect(root.getAttribute('data-shape')).toBe('pill')
      expect(root.hasAttribute('data-custom')).toBe(true)
      expect(root.style.getPropertyValue('--custom-color')).toBe('hotpink')
    })
  })

  it('sets data-size/data-compact on the v-control root (xs by default)', () => {
    const { container, rerender } = render(VChip, { slots: { default: 'Tag' } })
    const root = container.querySelector('.v-chip') as HTMLElement
    expect(root.classList.contains('v-control')).toBe(true)
    expect(root.getAttribute('data-size')).toBe('xs')
    expect(root.hasAttribute('data-compact')).toBe(false)
    return rerender({ size: 'sm', compact: true }).then(() => {
      expect(root.getAttribute('data-size')).toBe('sm')
      expect(root.hasAttribute('data-compact')).toBe(true)
    })
  })
})
