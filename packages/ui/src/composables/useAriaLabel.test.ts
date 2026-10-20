import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vite-plus/test'
import { defineComponent, h } from 'vue'

import { useAriaLabel, useLabelledBy } from './useAriaLabel'

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

  // `:aria-labelledby="headingId ?? null"` renders no attribute, so it names nothing: the
  // default must survive, or the control ends up with no name at all.
  it('a null aria-labelledby keeps the default', () => {
    const { container } = render(Named, {
      props: { label: 'Alignment' },
      attrs: { 'aria-labelledby': null },
    })
    expect(groupOf(container)?.getAttribute('aria-label')).toBe('Alignment')
  })
})

const Labelled = defineComponent({
  props: { label: { type: String, default: undefined } },
  setup(props) {
    const labelledBy = useLabelledBy('label-id', () => props.label)
    return () => h('div', { role: 'group', 'aria-labelledby': labelledBy.value })
  },
})

describe('useLabelledBy', () => {
  it('points at the label only when there is one', async () => {
    const { container, rerender } = render(Labelled)
    expect(groupOf(container)?.hasAttribute('aria-labelledby')).toBe(false)
    await rerender({ label: 'Upload' })
    expect(groupOf(container)?.getAttribute('aria-labelledby')).toBe('label-id')
  })

  it('gives way to a name of the consumer', () => {
    for (const attrs of [{ 'aria-label': 'Mine' }, { 'aria-labelledby': 'heading' }]) {
      const { container } = render(Labelled, { props: { label: 'Upload' }, attrs })
      expect(groupOf(container)?.getAttribute('aria-labelledby')).not.toBe('label-id')
    }
  })
})
