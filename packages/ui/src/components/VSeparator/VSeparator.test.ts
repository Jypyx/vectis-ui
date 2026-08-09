import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import VSeparator from './VSeparator.vue'

const root = (container: Element) => container.firstElementChild as HTMLElement

describe('VSeparator', () => {
  it('renders a single <hr> whose separator role is implicit', () => {
    const { container, getByRole } = render(VSeparator)
    expect(root(container).tagName).toBe('HR')
    expect(root(container).classList.contains('v-separator')).toBe(true)
    expect(getByRole('separator')).toBe(root(container))
  })

  it('horizontal by default: no aria-orientation, since it matches the role', () => {
    const { container } = render(VSeparator)
    expect(root(container).getAttribute('data-orientation')).toBe('horizontal')
    expect(root(container).hasAttribute('aria-orientation')).toBe(false)
  })

  it('vertical: aria-orientation contradicts the role, so it is emitted', () => {
    const { container } = render(VSeparator, { props: { orientation: 'vertical' } })
    expect(root(container).getAttribute('data-orientation')).toBe('vertical')
    expect(root(container).getAttribute('aria-orientation')).toBe('vertical')
  })

  it('a consumer class lands on the SAME element as .v-separator', () => {
    // The precondition of the `.v-separator.v-menu-separator` compound: a wrapper
    // overrides from its own sheet, whose order against VSeparator's the consumer's
    // bundler decides. jsdom evaluates no styles, so this is all it can see of it.
    const { container } = render(VSeparator, { attrs: { class: 'v-menu-separator' } })
    expect(root(container).classList.contains('v-separator')).toBe(true)
    expect(root(container).classList.contains('v-menu-separator')).toBe(true)
  })

  it('a consumer role wins over the implicit one (the VComboboxSeparator contract)', () => {
    const { container, queryByRole } = render(VSeparator, { attrs: { role: 'presentation' } })
    expect(root(container).getAttribute('role')).toBe('presentation')
    expect(queryByRole('separator')).toBeNull()
  })

  it('native attributes fall through to the <hr>', () => {
    const { container } = render(VSeparator, { attrs: { id: 'rule', 'data-testid': 'x' } })
    expect(root(container).id).toBe('rule')
    expect(root(container).getAttribute('data-testid')).toBe('x')
  })
})
