import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'

import VAvatar from './VAvatar.vue'
import VAvatarGroup from './VAvatarGroup.vue'

const avatars = (names: string[]) => names.map((name) => h(VAvatar, { key: name, name }))

const discs = (container: Element) => container.querySelectorAll('.v-avatar')

describe('VAvatarGroup', () => {
  it('renders every avatar and names the group', () => {
    const { container, getByRole } = render(VAvatarGroup, {
      slots: { default: () => avatars(['Ada', 'Linus', 'Grace']) },
    })
    expect(getByRole('group')).toBeTruthy()
    expect(discs(container)).toHaveLength(3)
  })

  it('truncates at `max` and renders the +N aggregate', () => {
    const { container } = render(VAvatarGroup, {
      props: { max: 2 },
      slots: { default: () => avatars(['Ada', 'Linus', 'Grace', 'Alan']) },
    })
    // 2 visible + the aggregate, which is itself a VAvatar
    expect(discs(container)).toHaveLength(3)
    expect(container.textContent).toContain('+2')
  })

  it('renders no aggregate when `max` covers the whole list', () => {
    const { container } = render(VAvatarGroup, {
      props: { max: 5 },
      slots: { default: () => avatars(['Ada', 'Linus']) },
    })
    expect(discs(container)).toHaveLength(2)
    expect(container.textContent).not.toContain('+')
  })

  it('counts through a v-for Fragment and ignores comments and blank text', () => {
    // The flattening is the component's whole reason for having JS: a Fragment must
    // count as its children, a `v-if` false (a Comment) as nothing.
    const { container } = render(VAvatarGroup, {
      props: { max: 2 },
      slots: {
        default: () => [
          h(VAvatar, { name: 'Ada' }),
          avatars(['Linus', 'Grace']), // an array → a Fragment
          '\n  ', // whitespace between tags
        ],
      },
    })
    expect(container.textContent).toContain('+1')
  })

  it('exposes the remaining count to the #overflow slot', () => {
    const { getByTestId } = render(VAvatarGroup, {
      props: { max: 1 },
      slots: {
        default: () => avatars(['Ada', 'Linus', 'Grace']),
        overflow: (props: { count: number }) =>
          h('span', { 'data-testid': 'rest' }, `${props.count} more`),
      },
    })
    expect(getByTestId('rest').textContent).toBe('2 more')
  })

  it('propagates size and compact to the children and to the root', () => {
    const { container } = render(VAvatarGroup, {
      props: { size: 'lg', compact: true },
      slots: { default: () => avatars(['Ada']) },
    })
    const root = container.querySelector('.v-avatar-group') as HTMLElement
    // `v-control` on the GROUP is what keeps --control-height defined for the overlap
    // even when a child is wrapped.
    expect(root.classList.contains('v-control')).toBe(true)
    expect(root.dataset.size).toBe('lg')
    expect(root.dataset.compact).toBe('')
    expect(discs(container)[0]?.getAttribute('data-size')).toBe('lg')
  })

  it('sets the ring colour as a custom property, and nothing when absent', () => {
    const withRing = render(VAvatarGroup, {
      props: { ringColor: 'rebeccapurple' },
      slots: { default: () => avatars(['Ada']) },
    })
    expect(
      (withRing.container.querySelector('.v-avatar-group') as HTMLElement).style.getPropertyValue(
        '--avatar-ring-color',
      ),
    ).toBe('rebeccapurple')

    const plain = render(VAvatarGroup, { slots: { default: () => avatars(['Ada']) } })
    expect(
      (plain.container.querySelector('.v-avatar-group') as HTMLElement).getAttribute('style'),
    ).toBeNull()
  })
})
