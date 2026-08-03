import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'

import Avatar from './VAvatar.vue'
import AvatarGroup from './VAvatarGroup.vue'

describe('Avatar', () => {
  it('affiche les initiales des deux premiers mots du nom', () => {
    const { getByText } = render(Avatar, { props: { name: 'Ada Byron Lovelace' } })
    expect(getByText('AB')).toBeTruthy()
  })

  it("affiche l'image quand src est fourni, avec le nom en alt par défaut", () => {
    const { getByRole } = render(Avatar, {
      props: { src: 'https://exemple.test/a.png', name: 'Ada Lovelace' },
    })
    expect(getByRole('img').getAttribute('alt')).toBe('Ada Lovelace')
  })

  it("bascule sur les initiales si l'image échoue", async () => {
    const { getByRole, getByText } = render(Avatar, {
      props: { src: 'https://exemple.test/casse.png', name: 'Grace Hopper' },
    })
    await fireEvent.error(getByRole('img'))
    expect(getByText('GH')).toBeTruthy()
  })

  it("rend une icône Material quand `icon` est un nom (pas d'URL)", () => {
    const { container, queryByText } = render(Avatar, { props: { icon: 'star' } })
    // pas d'initiales, la ligature Material est présente
    expect(container.querySelector('.v-avatar-icon')).toBeTruthy()
    expect(queryByText('star')).toBeTruthy()
  })

  it('dérive une teinte auto déterministe du nom (--avatar-hue stable + data-auto)', () => {
    const first = render(Avatar, { props: { name: 'Ada Lovelace' } })
    const a = first.container.querySelector('.v-avatar') as HTMLElement
    expect(a.getAttribute('data-auto')).toBe('')
    const hueA = a.style.getPropertyValue('--avatar-hue')
    expect(hueA).not.toBe('')

    const second = render(Avatar, { props: { name: 'Ada Lovelace' } })
    const b = second.container.querySelector('.v-avatar') as HTMLElement
    expect(b.style.getPropertyValue('--avatar-hue')).toBe(hueA)
  })

  it('la couleur custom prime sur la teinte auto (data-custom + --custom-color, pas de data-auto)', () => {
    const { container } = render(Avatar, { props: { name: 'Ada Lovelace', color: '#ff0000' } })
    const el = container.querySelector('.v-avatar') as HTMLElement
    expect(el.getAttribute('data-custom')).toBe('')
    expect(el.getAttribute('data-auto')).toBeNull()
    expect(el.style.getPropertyValue('--custom-color')).toBe('#ff0000')
  })

  it('cliquable → <button>, avec le nom en aria-label', () => {
    const { getByRole } = render(Avatar, { props: { name: 'Ada Lovelace', clickable: true } })
    const btn = getByRole('button')
    expect(btn.tagName).toBe('BUTTON')
    expect(btn.getAttribute('aria-label')).toBe('Ada Lovelace')
  })

  it('href → <a> avec href', () => {
    const { getByRole } = render(Avatar, { props: { name: 'Ada', href: '/u/ada' } })
    const link = getByRole('link')
    expect(link.tagName).toBe('A')
    expect(link.getAttribute('href')).toBe('/u/ada')
  })

  it('lien inerte quand disabled (href retiré + aria-disabled)', () => {
    const { container } = render(Avatar, {
      props: { name: 'Ada', href: '/u/ada', disabled: true },
    })
    const a = container.querySelector('a.v-avatar') as HTMLElement
    expect(a.getAttribute('href')).toBeNull()
    expect(a.getAttribute('aria-disabled')).toBe('true')
  })

  it('sans nom ni image : décoratif (pas de role="img")', () => {
    const { container } = render(Avatar, { props: { icon: 'star' } })
    const el = container.querySelector('.v-avatar') as HTMLElement
    expect(el.getAttribute('role')).toBeNull()
  })
})

describe('AvatarGroup', () => {
  it('tronque à `max` et affiche l’agrégat +X avec le bon compte', () => {
    const { getByText, container } = render(AvatarGroup, {
      props: { max: 2 },
      slots: {
        default: () =>
          ['Ada Lovelace', 'Grace Hopper', 'Margaret Hamilton', 'Katherine Johnson'].map((name) =>
            h(Avatar, { name }),
          ),
      },
    })
    expect(container.querySelectorAll('.v-avatar')).toHaveLength(3)
    expect(getByText('+2')).toBeTruthy()
  })

  it('sans `max` : rend tous les avatars, aucun agrégat', () => {
    const { container, queryByText } = render(AvatarGroup, {
      slots: {
        default: () => ['Ada Lovelace', 'Grace Hopper'].map((name) => h(Avatar, { name })),
      },
    })
    expect(container.querySelectorAll('.v-avatar')).toHaveLength(2)
    expect(queryByText(/^\+/)).toBeNull()
  })

  it('propage la taille aux enfants (à défaut de prop size explicite)', () => {
    const { container } = render(AvatarGroup, {
      props: { size: 'lg' },
      slots: {
        default: () => [h(Avatar, { name: 'Ada' }), h(Avatar, { name: 'Grace', size: 'xs' })],
      },
    })
    const avatars = container.querySelectorAll('.v-avatar')
    // 1er hérite lg, 2e garde sa prop xs
    expect(avatars[0]?.getAttribute('data-size')).toBe('lg')
    expect(avatars[1]?.getAttribute('data-size')).toBe('xs')
  })
})
