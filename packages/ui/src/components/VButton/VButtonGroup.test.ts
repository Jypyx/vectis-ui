import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import VButtonGroup from './VButtonGroup.vue'

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
})
