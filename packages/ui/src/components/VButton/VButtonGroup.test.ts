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
