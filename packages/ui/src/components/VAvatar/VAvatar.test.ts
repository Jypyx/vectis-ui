import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
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

  it('an inert link when disabled (href removed + aria-disabled)', () => {
    const { container } = render(VAvatar, {
      props: { name: 'Ada', href: '/u/ada', disabled: true },
    })
    const a = container.querySelector('a.v-avatar') as HTMLElement
    expect(a.getAttribute('href')).toBeNull()
    expect(a.getAttribute('aria-disabled')).toBe('true')
  })

  it('with neither name nor image: decorative (no role="img")', () => {
    const { container } = render(VAvatar, { props: { icon: 'star' } })
    const el = container.querySelector('.v-avatar') as HTMLElement
    expect(el.getAttribute('role')).toBeNull()
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
