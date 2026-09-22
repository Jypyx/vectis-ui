import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'

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

  it('label names the group; a consumer aria-label wins, aria-labelledby removes it', () => {
    const labelled = render(VAvatarGroup, {
      props: { label: 'Project members' },
      slots: { default: () => avatars(['Ada']) },
    })
    expect(labelled.container.querySelector('[role=group]')?.getAttribute('aria-label')).toBe(
      'Project members',
    )

    const overridden = render(VAvatarGroup, {
      props: { label: 'Project members' },
      attrs: { 'aria-label': 'Reviewers' },
      slots: { default: () => avatars(['Ada']) },
    })
    expect(overridden.container.querySelector('[role=group]')?.getAttribute('aria-label')).toBe(
      'Reviewers',
    )

    const referenced = render(VAvatarGroup, {
      props: { label: 'Project members' },
      attrs: { 'aria-labelledby': 'heading' },
      slots: { default: () => avatars(['Ada']) },
    })
    const group = referenced.container.querySelector('[role=group]')
    expect(group?.getAttribute('aria-label')).toBeNull()
    expect(group?.getAttribute('aria-labelledby')).toBe('heading')
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

  it('`max: 0` shows every avatar, as documented', () => {
    const { container } = render(VAvatarGroup, {
      props: { max: 0 },
      slots: { default: () => avatars(['Ada', 'Linus', 'Grace']) },
    })
    expect(discs(container)).toHaveLength(3)
    expect(container.textContent).not.toContain('+')
  })

  it('a negative `max` is no limit, like 0', () => {
    const { container } = render(VAvatarGroup, {
      props: { max: -1 },
      slots: { default: () => avatars(['Ada', 'Linus', 'Grace']) },
    })
    expect(discs(container)).toHaveLength(3)
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

  it('compact is cumulative: an avatar cannot opt out of a compact group', () => {
    const { container } = render(VAvatarGroup, {
      props: { compact: true },
      slots: { default: () => [h(VAvatar, { name: 'Ada', compact: false })] },
    })
    expect(discs(container)[0]?.hasAttribute('data-compact')).toBe(true)
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

  // The count is read from the slot inside a computed, and `slots` is not reactive: a
  // parent passing a new slot whose list it captured outside the slot must still move "+N".
  it('recounts when the parent hands down a new slot', async () => {
    const names = ref(['Ada', 'Linus', 'Grace'])
    const Parent = defineComponent(() => () => {
      const captured = [...names.value]
      return h(VAvatarGroup, { max: 2 }, { default: () => avatars(captured) })
    })
    const { container } = render(Parent)
    expect(container.textContent).toContain('+1')
    names.value = ['Ada', 'Linus', 'Grace', 'Alan', 'Barbara']
    await nextTick()
    expect(container.textContent).toContain('+3')
  })
})
