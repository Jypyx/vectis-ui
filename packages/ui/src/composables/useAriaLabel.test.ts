import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'

import { useAriaLabel } from './useAriaLabel'

const Named = defineComponent({
  props: { label: { type: String, default: 'Default' } },
  setup(props) {
    const ariaLabel = useAriaLabel(() => props.label)
    return () => h('div', { role: 'group', 'aria-label': ariaLabel.value })
  },
})

const groupOf = (container: Element) => container.querySelector('[role="group"]')

describe('useAriaLabel', () => {
  it('with no consumer attribute, the label prop makes the name', () => {
    const { container } = render(Named, { props: { label: 'Alignment' } })
    expect(groupOf(container)?.getAttribute('aria-label')).toBe('Alignment')
  })

  it('a consumer aria-label replaces the default', () => {
    const { container } = render(Named, {
      props: { label: 'Alignment' },
      attrs: { 'aria-label': 'From the consumer' },
    })
    expect(groupOf(container)?.getAttribute('aria-label')).toBe('From the consumer')
  })

  it('an aria-labelledby removes the default (never two competing names)', () => {
    const { container } = render(Named, {
      props: { label: 'Alignment' },
      attrs: { 'aria-labelledby': 'heading' },
    })
    expect(groupOf(container)?.hasAttribute('aria-label')).toBe(false)
  })
})
