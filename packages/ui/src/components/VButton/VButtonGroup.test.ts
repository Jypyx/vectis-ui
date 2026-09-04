import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'

import VButton from './VButton.vue'
import VButtonGroup from './VButtonGroup.vue'

import VIconButton from '../VIconButton/VIconButton.vue'

/** The `.v-button` elements in render order, which is where every resolved prop lands. */
const segments = (container: Element) => [...container.querySelectorAll<HTMLElement>('.v-button')]

describe('VButtonGroup', () => {
  it('renders a role="group" with the v-button-group class', () => {
    const { getByRole } = render(VButtonGroup, {
      slots: { default: '<button>A</button>' },
    })
    const group = getByRole('group')
    expect(group.classList.contains('v-button-group')).toBe(true)
  })

  it('by default: data-orientation horizontal', () => {
    const { getByRole } = render(VButtonGroup, {
      slots: { default: '<button>A</button>' },
    })
    expect(getByRole('group').dataset.orientation).toBe('horizontal')
  })

  it('orientation="vertical": sets data-orientation vertical', () => {
    const { getByRole } = render(VButtonGroup, {
      props: { orientation: 'vertical' },
      slots: { default: '<button>A</button>' },
    })
    expect(getByRole('group').dataset.orientation).toBe('vertical')
  })

  describe('how the row is drawn', () => {
    it('joined and lined by default: neither marker is on the root', () => {
      const { getByRole } = render(VButtonGroup, {
        slots: { default: '<button>A</button>' },
      })
      const group = getByRole('group')
      expect(group.hasAttribute('data-detached')).toBe(false)
      expect(group.hasAttribute('data-seamless')).toBe(false)
    })

    it('detached: the marker the whole joining half of the sheet steps aside for', () => {
      const { getByRole } = render(VButtonGroup, {
        props: { detached: true },
        slots: { default: '<button>A</button>' },
      })
      expect(getByRole('group').hasAttribute('data-detached')).toBe(true)
    })

    it('seamless: the marker the transparent shared edges read', () => {
      const { getByRole } = render(VButtonGroup, {
        props: { seamless: true },
        slots: { default: '<button>A</button>' },
      })
      expect(getByRole('group').hasAttribute('data-seamless')).toBe(true)
    })

    // The DOM never carries a claim the markup cannot honour: apart, the buttons share
    // no edge for a line to sit on, so there is nothing for `seamless` to take away.
    it('detached, seamless is withheld', () => {
      const { getByRole } = render(VButtonGroup, {
        props: { detached: true, seamless: true },
        slots: { default: '<button>A</button>' },
      })
      expect(getByRole('group').hasAttribute('data-seamless')).toBe(false)
    })
  })

  it('renders the slot child buttons', () => {
    const { getAllByRole } = render(VButtonGroup, {
      slots: { default: '<button>One</button><button>Two</button><button>Three</button>' },
    })
    const buttons = getAllByRole('button')
    expect(buttons).toHaveLength(3)
    expect(buttons.map((button) => button.textContent?.trim())).toEqual(['One', 'Two', 'Three'])
  })

  it('lets the native attributes through on the root (fallthrough)', () => {
    const { getByRole } = render(VButtonGroup, {
      attrs: { 'aria-label': 'Text format' },
      slots: { default: '<button>A</button>' },
    })
    expect(getByRole('group').getAttribute('aria-label')).toBe('Text format')
  })

  it('an overridden role (toolbar) lands on the root', () => {
    const { getByRole } = render(VButtonGroup, {
      attrs: { role: 'toolbar' },
      slots: { default: '<button>A</button>' },
    })
    const toolbar = getByRole('toolbar')
    expect(toolbar.classList.contains('v-button-group')).toBe(true)
  })

  // A group that names none of the five must leave its children exactly as they would
  // have rendered on their own: the context then holds `undefined` throughout.
  it('naming nothing changes nothing about the buttons inside', () => {
    const { container } = render(VButtonGroup, {
      slots: { default: () => [h(VButton, () => 'One'), h(VButton, () => 'Two')] },
    })
    for (const segment of segments(container)) {
      expect(segment.dataset.variant).toBe('solid')
      expect(segment.dataset.tone).toBe('accent')
      expect(segment.dataset.size).toBe('md')
      expect(segment.dataset.compact).toBeUndefined()
      expect(segment.dataset.elevated).toBeUndefined()
    }
  })

  // TRAP — `compact: undefined` and `elevated: undefined` must stay in the group's
  // withDefaults. Vue casts a Boolean prop with NO default to `false`, and a group
  // reading `false` would then swallow the compact and the elevation of every button
  // inside it, silently: the two lines look redundant and are not.
  it('a silent group does not swallow a compact or elevated button', () => {
    const { container } = render(VButtonGroup, {
      slots: { default: () => h(VButton, { compact: true, elevated: true }, () => 'One') },
    })
    const segment = segments(container)[0]!
    expect(segment.dataset.compact).toBe('')
    expect(segment.dataset.elevated).toBe('')
  })

  it('hands its variant, size, compact and elevated to every button', () => {
    const { container } = render(VButtonGroup, {
      props: { variant: 'outline', size: 'lg', compact: true, elevated: true },
      slots: { default: () => [h(VButton, () => 'One'), h(VButton, () => 'Two')] },
    })
    const rendered = segments(container)
    expect(rendered).toHaveLength(2)
    for (const segment of rendered) {
      expect(segment.dataset.variant).toBe('outline')
      expect(segment.dataset.size).toBe('lg')
      expect(segment.dataset.compact).toBe('')
      expect(segment.dataset.elevated).toBe('')
    }
  })

  // The shape of the control belongs to the row: a segment of another height or
  // silhouette no longer lines up with its neighbours.
  it('the group wins over a button that sets its own variant, size or compact', () => {
    const { container } = render(VButtonGroup, {
      props: { variant: 'soft', size: 'sm', compact: true },
      slots: {
        default: () => h(VButton, { variant: 'solid', size: 'xl', compact: false }, () => 'One'),
      },
    })
    const segment = segments(container)[0]!
    expect(segment.dataset.variant).toBe('soft')
    expect(segment.dataset.size).toBe('sm')
    expect(segment.dataset.compact).toBe('')
  })

  // The tone is meaning rather than shape, so it travels the other way: one segment in
  // the row can be the destructive one.
  it('a button keeps its own tone, and takes the group tone without one', () => {
    const { container } = render(VButtonGroup, {
      props: { tone: 'neutral' },
      slots: {
        default: () => [h(VButton, () => 'Copy'), h(VButton, { tone: 'danger' }, () => 'Delete')],
      },
    })
    const [copy, remove] = segments(container)
    expect(copy?.dataset.tone).toBe('neutral')
    expect(remove?.dataset.tone).toBe('danger')
  })

  it('reaches a VIconButton, whose own neutral tone stands in when the group names none', () => {
    const { container } = render(VButtonGroup, {
      props: { variant: 'outline', size: 'lg' },
      slots: { default: () => h(VIconButton, { label: 'Bold', icon: 'edit' }) },
    })
    const segment = segments(container)[0]!
    expect(segment.dataset.variant).toBe('outline')
    expect(segment.dataset.size).toBe('lg')
    expect(segment.dataset.tone).toBe('neutral')
  })

  // The third arbitration: the row and the button add up, and neither lifts the other.
  describe('disabled', () => {
    it('a disabled row disables every segment', () => {
      const { container } = render(VButtonGroup, {
        props: { disabled: true },
        slots: { default: () => [h(VButton, () => 'One'), h(VButton, () => 'Two')] },
      })
      const rendered = segments(container) as HTMLButtonElement[]
      expect(rendered).toHaveLength(2)
      expect(rendered.every((segment) => segment.disabled)).toBe(true)
    })

    it('a segment that disables itself stays disabled in a row that says nothing', () => {
      const { container } = render(VButtonGroup, {
        slots: {
          default: () => [h(VButton, () => 'One'), h(VButton, { disabled: true }, () => 'Two')],
        },
      })
      const [one, two] = segments(container) as HTMLButtonElement[]
      expect(one?.disabled).toBe(false)
      expect(two?.disabled).toBe(true)
    })

    // The OR read the other way round: a row switched off cannot have one of its
    // segments opt back in.
    it('a segment cannot refuse a disabled row', () => {
      const { container } = render(VButtonGroup, {
        props: { disabled: true },
        slots: { default: () => h(VButton, { disabled: false }, () => 'One') },
      })
      expect((segments(container)[0] as HTMLButtonElement).disabled).toBe(true)
    })

    it('reaches a VIconButton too, which forwards it to the button it renders', () => {
      const { container } = render(VButtonGroup, {
        props: { disabled: true },
        slots: { default: () => h(VIconButton, { label: 'Bold', icon: 'edit' }) },
      })
      expect((segments(container)[0] as HTMLButtonElement).disabled).toBe(true)
    })

    // An inert LINK has no `disabled` attribute to take: the group has to reach the
    // bridge VButton builds instead, or a disabled row of links stays followable.
    it('makes a link segment inert, the way its own prop does', () => {
      const { container } = render(VButtonGroup, {
        props: { disabled: true },
        slots: { default: () => h(VButton, { href: '/one' }, () => 'One') },
      })
      const segment = segments(container)[0]!
      expect(segment.getAttribute('aria-disabled')).toBe('true')
      expect(segment.hasAttribute('href')).toBe(false)
    })
  })

  it('gives a VIconButton the group tone, which its own prop still overrides', () => {
    const { container } = render(VButtonGroup, {
      props: { tone: 'accent' },
      slots: {
        default: () => [
          h(VIconButton, { label: 'Bold', icon: 'edit' }),
          h(VIconButton, { label: 'Delete', icon: 'close', tone: 'danger' }),
        ],
      },
    })
    const [bold, remove] = segments(container)
    expect(bold?.dataset.tone).toBe('accent')
    expect(remove?.dataset.tone).toBe('danger')
  })
})
