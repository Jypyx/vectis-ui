import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import ButtonGroup from './ButtonGroup.vue'

describe('ButtonGroup', () => {
  it('rend un role="group" avec la classe ds-button-group', () => {
    const { getByRole } = render(ButtonGroup, {
      slots: { default: '<button>A</button>' },
    })
    const group = getByRole('group')
    expect(group.classList.contains('ds-button-group')).toBe(true)
  })

  it('par défaut : data-orientation horizontal', () => {
    const { getByRole } = render(ButtonGroup, {
      slots: { default: '<button>A</button>' },
    })
    expect(getByRole('group').dataset.orientation).toBe('horizontal')
  })

  it('orientation="vertical" : pose data-orientation vertical', () => {
    const { getByRole } = render(ButtonGroup, {
      props: { orientation: 'vertical' },
      slots: { default: '<button>A</button>' },
    })
    expect(getByRole('group').dataset.orientation).toBe('vertical')
  })

  it('rend les boutons enfants du slot', () => {
    const { getAllByRole } = render(ButtonGroup, {
      slots: { default: '<button>Un</button><button>Deux</button><button>Trois</button>' },
    })
    const buttons = getAllByRole('button')
    expect(buttons).toHaveLength(3)
    expect(buttons.map((button) => button.textContent?.trim())).toEqual(['Un', 'Deux', 'Trois'])
  })

  it('laisse passer les attributs natifs sur la racine (fallthrough)', () => {
    const { getByRole } = render(ButtonGroup, {
      attrs: { 'aria-label': 'Format du texte' },
      slots: { default: '<button>A</button>' },
    })
    expect(getByRole('group').getAttribute('aria-label')).toBe('Format du texte')
  })

  it('un role surchargé (toolbar) atterrit sur la racine', () => {
    const { getByRole } = render(ButtonGroup, {
      attrs: { role: 'toolbar' },
      slots: { default: '<button>A</button>' },
    })
    const toolbar = getByRole('toolbar')
    expect(toolbar.classList.contains('ds-button-group')).toBe(true)
  })
})
