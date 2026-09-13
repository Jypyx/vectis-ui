import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import VSpinner from './VSpinner.vue'

describe('VSpinner', () => {
  it('exposes role="status" with a default accessible label', () => {
    const { getByRole } = render(VSpinner)
    expect(getByRole('status').textContent).toContain('Loading…')
  })

  it('the label is customizable', () => {
    const { getByRole } = render(VSpinner, { props: { label: 'Sending…' } })
    expect(getByRole('status').textContent).toContain('Sending…')
  })

  it('numeric size prop: sets --spinner-size inline, nothing otherwise', () => {
    const explicit = render(VSpinner, { props: { size: 32 } })
    const explicitSpinner = explicit.container.querySelector('.v-spinner') as HTMLElement
    expect(explicitSpinner.style.getPropertyValue('--spinner-size')).toBe('32px')

    const implicit = render(VSpinner)
    const implicitSpinner = implicit.container.querySelector('.v-spinner') as HTMLElement
    expect(implicitSpinner.hasAttribute('style')).toBe(false)
  })

  it('size accepts a numeric string, and ignores what is not a number rather than writing NaNpx', () => {
    const text = render(VSpinner, { props: { size: '24' } })
    const fromString = text.container.querySelector('.v-spinner') as HTMLElement
    expect(fromString.style.getPropertyValue('--spinner-size')).toBe('24px')

    const invalid = render(VSpinner, { props: { size: 'large' } })
    expect(
      (invalid.container.querySelector('.v-spinner') as HTMLElement).hasAttribute('style'),
    ).toBe(false)
  })
})
