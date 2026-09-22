import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'

import VAvatar from './VAvatar.vue'
import VAvatarGroup from './VAvatarGroup.vue'

describe('VAvatar', () => {
  it('displays the initials of the first two words of the name', () => {
    const { getByText } = render(VAvatar, { props: { name: 'Ada Byron Lovelace' } })
    expect(getByText('AB')).toBeTruthy()
  })

  it('displays the image when src is supplied, with the name as the default alt', () => {
    const { getByRole } = render(VAvatar, {
      props: { src: 'https://example.test/a.png', name: 'Ada Lovelace' },
    })
    expect(getByRole('img').getAttribute('alt')).toBe('Ada Lovelace')
  })

  it('initials: whole characters, stray spaces ignored', () => {
    const initials = (name: string) =>
      render(VAvatar, { props: { name } }).container.querySelector('.v-avatar-initials')!
        .textContent
    expect(initials('😀 Smile')).toBe('😀S')
    expect(initials('  Ada   Lovelace ')).toBe('AL')
    expect(initials('ada')).toBe('A')
  })

  it('an image that failed before the component mounted falls back to the initials', () => {
    const complete = vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true)
    const { getByText } = render(VAvatar, {
      props: { src: 'https://example.test/broken.png', name: 'Grace Hopper' },
    })
    complete.mockRestore()
    return Promise.resolve().then(() => expect(getByText('GH')).toBeTruthy())
  })

  it('falls back to the initials when the image fails', async () => {
    const { getByRole, getByText } = render(VAvatar, {
      props: { src: 'https://example.test/broken.png', name: 'Grace Hopper' },
    })
    await fireEvent.error(getByRole('img'))
    expect(getByText('GH')).toBeTruthy()
  })

  it('renders a Material icon when `icon` is a name (not a URL)', () => {
    const { container, queryByText } = render(VAvatar, { props: { icon: 'star' } })
    // no initials, the Material ligature is present
    expect(container.querySelector('.v-avatar-icon')).toBeTruthy()
    expect(queryByText('star')).toBeTruthy()
  })

  it('derives a deterministic auto hue from the name (a stable --avatar-hue + data-auto)', () => {
    const first = render(VAvatar, { props: { name: 'Ada Lovelace' } })
    const a = first.container.querySelector('.v-avatar') as HTMLElement
    expect(a.getAttribute('data-auto')).toBe('')
    const hueA = a.style.getPropertyValue('--avatar-hue')
    expect(hueA).not.toBe('')

    const second = render(VAvatar, { props: { name: 'Ada Lovelace' } })
    const b = second.container.querySelector('.v-avatar') as HTMLElement
    expect(b.style.getPropertyValue('--avatar-hue')).toBe(hueA)
  })

  it('the custom colour wins over the auto hue (data-custom + --custom-color, no data-auto)', () => {
    const { container } = render(VAvatar, { props: { name: 'Ada Lovelace', color: '#ff0000' } })
    const el = container.querySelector('.v-avatar') as HTMLElement
    expect(el.getAttribute('data-custom')).toBe('')
    expect(el.getAttribute('data-auto')).toBeNull()
    expect(el.style.getPropertyValue('--custom-color')).toBe('#ff0000')
  })

  it('clickable → <button>, with the name as aria-label', () => {
    const { getByRole } = render(VAvatar, { props: { name: 'Ada Lovelace', clickable: true } })
    const btn = getByRole('button')
    expect(btn.tagName).toBe('BUTTON')
    expect(btn.getAttribute('aria-label')).toBe('Ada Lovelace')
  })

  it('href → <a> with an href', () => {
    const { getByRole } = render(VAvatar, { props: { name: 'Ada', href: '/u/ada' } })
    const link = getByRole('link')
    expect(link.tagName).toBe('A')
    expect(link.getAttribute('href')).toBe('/u/ada')
  })

  it('an inert link when disabled (href removed + aria-disabled + click filtered out)', async () => {
    const onClick = vi.fn()
    const { container } = render(VAvatar, {
      props: { name: 'Ada', href: '/u/ada', disabled: true },
      attrs: { onClick, style: 'margin: 1px' },
    })
    const a = container.querySelector('a.v-avatar') as HTMLElement
    expect(a.getAttribute('href')).toBeNull()
    expect(a.getAttribute('aria-disabled')).toBe('true')
    // The consumer's style is merged, not dropped with the attributes the link filters.
    expect(a.style.margin).toBe('1px')
    await fireEvent.click(a)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('with neither name nor image: decorative (no role="img")', () => {
    const { container } = render(VAvatar, { props: { icon: 'star' } })
    const el = container.querySelector('.v-avatar') as HTMLElement
    expect(el.getAttribute('role')).toBeNull()
  })

  it('a consumer aria-label wins over the name, and survives a picture', () => {
    const named = render(VAvatar, {
      props: { name: 'Ada Lovelace', clickable: true },
      attrs: { 'aria-label': 'Open the profile' },
    })
    expect(named.getByRole('button').getAttribute('aria-label')).toBe('Open the profile')

    const pictured = render(VAvatar, {
      props: { src: 'https://example.test/a.png', clickable: true },
      attrs: { 'aria-label': 'Open the profile' },
    })
    expect(pictured.getAllByRole('button')[0]?.getAttribute('aria-label')).toBe('Open the profile')
  })

  it('a static avatar named only by a consumer aria-label is an image', () => {
    const { container } = render(VAvatar, {
      attrs: { 'aria-label': '3 more members' },
      slots: { default: () => '+3' },
    })
    const el = container.querySelector('.v-avatar') as HTMLElement
    expect(el.getAttribute('role')).toBe('img')
    expect(el.getAttribute('aria-label')).toBe('3 more members')
  })

  it('aria-labelledby removes the name the component would give', () => {
    const { container } = render(VAvatar, {
      props: { name: 'Ada Lovelace', clickable: true },
      attrs: { 'aria-labelledby': 'elsewhere' },
    })
    expect(container.querySelector('.v-avatar')?.getAttribute('aria-label')).toBeNull()
  })

  it('a consumer aria-disabled is kept', () => {
    const { getByRole } = render(VAvatar, {
      props: { name: 'Ada', clickable: true },
      attrs: { 'aria-disabled': 'true' },
    })
    expect(getByRole('button').getAttribute('aria-disabled')).toBe('true')
  })

  it('warns once about an interactive avatar with no accessible name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(VAvatar, { props: { src: 'https://example.test/a.png', clickable: true } })
    expect(warn.mock.calls.filter(([m]) => String(m).includes('[VAvatar]'))).toHaveLength(1)
    warn.mockClear()
    render(VAvatar, { props: { name: 'Ada', clickable: true } })
    render(VAvatar, { props: { clickable: true }, slots: { default: () => '+3' } })
    expect(warn.mock.calls.filter(([m]) => String(m).includes('[VAvatar]'))).toHaveLength(0)
    warn.mockRestore()
  })
})

describe('VAvatarGroup', () => {
  it('truncates at `max` and displays the +X aggregate with the right count', () => {
    const { getByText, container } = render(VAvatarGroup, {
      props: { max: 2 },
      slots: {
        default: () =>
          ['Ada Lovelace', 'Grace Hopper', 'Margaret Hamilton', 'Katherine Johnson'].map((name) =>
            h(VAvatar, { name }),
          ),
      },
    })
    expect(container.querySelectorAll('.v-avatar')).toHaveLength(3)
    expect(getByText('+2')).toBeTruthy()
  })

  it('without `max`: renders every avatar, no aggregate', () => {
    const { container, queryByText } = render(VAvatarGroup, {
      slots: {
        default: () => ['Ada Lovelace', 'Grace Hopper'].map((name) => h(VAvatar, { name })),
      },
    })
    expect(container.querySelectorAll('.v-avatar')).toHaveLength(2)
    expect(queryByText(/^\+/)).toBeNull()
  })

  it('propagates the size to the children (absent an explicit size prop)', () => {
    const { container } = render(VAvatarGroup, {
      props: { size: 'lg' },
      slots: {
        default: () => [h(VAvatar, { name: 'Ada' }), h(VAvatar, { name: 'Grace', size: 'xs' })],
      },
    })
    const avatars = container.querySelectorAll('.v-avatar')
    // the first inherits lg, the second keeps its xs prop
    expect(avatars[0]?.getAttribute('data-size')).toBe('lg')
    expect(avatars[1]?.getAttribute('data-size')).toBe('xs')
  })
})
