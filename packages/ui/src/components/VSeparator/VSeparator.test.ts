import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vite-plus/test'

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

  it('a consumer role wins over the implicit one (the VListboxSeparator contract)', () => {
    const { container, queryByRole } = render(VSeparator, { attrs: { role: 'presentation' } })
    expect(root(container).getAttribute('role')).toBe('presentation')
    expect(queryByRole('separator')).toBeNull()
  })

  it('native attributes fall through to the <hr>', () => {
    const { container } = render(VSeparator, { attrs: { id: 'rule', 'data-testid': 'x' } })
    expect(root(container).id).toBe('rule')
    expect(root(container).getAttribute('data-testid')).toBe('x')
  })

  it('variant, size and colour reach the rule', () => {
    expect(root(render(VSeparator).container).getAttribute('data-size')).toBe('sm')
    const { container } = render(VSeparator, {
      props: { variant: 'dotted', size: 'lg', color: 'red' },
    })
    expect(root(container).getAttribute('data-variant')).toBe('dotted')
    expect(root(container).getAttribute('data-size')).toBe('lg')
    expect(root(container).style.getPropertyValue('--separator-color')).toBe('red')
  })

  it('a label turns the root into a named role="separator" carrying the text', () => {
    const { container, getByRole } = render(VSeparator, { props: { label: 'or' } })
    const rule = getByRole('separator', { name: 'or' })
    expect(rule).toBe(root(container))
    expect(rule.tagName).toBe('DIV')
    expect(rule.textContent).toBe('or')
    expect(rule.getAttribute('data-content-position')).toBe('center')
  })

  it('an icon alone breaks the rule, unnamed', () => {
    const { container } = render(VSeparator, {
      props: { icon: { path: 'M0 0h1v1z' }, contentPosition: 'end' },
    })
    expect(root(container).getAttribute('role')).toBe('separator')
    expect(root(container).hasAttribute('aria-label')).toBe(false)
    expect(root(container).getAttribute('data-content-position')).toBe('end')
    expect(root(container).querySelector('svg')).not.toBeNull()
  })

  it('the slot replaces the label text; the consumer names it', () => {
    const { getByRole } = render(VSeparator, {
      attrs: { 'aria-label': 'Chapter 2' },
      props: { orientation: 'vertical' },
      slots: { default: '<strong>2</strong>' },
    })
    const rule = getByRole('separator', { name: 'Chapter 2' })
    expect(rule.querySelector('strong')?.textContent).toBe('2')
    expect(rule.getAttribute('aria-orientation')).toBe('vertical')
  })
})
