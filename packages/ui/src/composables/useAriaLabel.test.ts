import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'

import { useAriaLabel } from './useAriaLabel'

const Named = defineComponent({
  props: { label: { type: String, default: 'Défaut' } },
  setup(props) {
    const ariaLabel = useAriaLabel(() => props.label)
    return () => h('div', { role: 'group', 'aria-label': ariaLabel.value })
  },
})

const groupOf = (container: Element) => container.querySelector('[role="group"]')

describe('useAriaLabel', () => {
  it('sans attribut du consommateur, la prop label fait le nom', () => {
    const { container } = render(Named, { props: { label: 'Alignement' } })
    expect(groupOf(container)?.getAttribute('aria-label')).toBe('Alignement')
  })

  it('un aria-label du consommateur remplace le défaut', () => {
    const { container } = render(Named, {
      props: { label: 'Alignement' },
      attrs: { 'aria-label': 'Du consommateur' },
    })
    expect(groupOf(container)?.getAttribute('aria-label')).toBe('Du consommateur')
  })

  it('un aria-labelledby supprime le défaut (pas deux noms concurrents)', () => {
    const { container } = render(Named, {
      props: { label: 'Alignement' },
      attrs: { 'aria-labelledby': 'titre' },
    })
    expect(groupOf(container)?.hasAttribute('aria-label')).toBe(false)
  })
})
