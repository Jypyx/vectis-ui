import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import Avatar from './Avatar.vue'

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
})
