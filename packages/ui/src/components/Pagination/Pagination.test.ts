import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import Pagination from './Pagination.vue'

describe('Pagination', () => {
  it('fenêtre avec ellipses : bornes + voisins de la page courante', () => {
    const { getAllByRole, container } = render(Pagination, {
      props: { count: 20, modelValue: 10 },
    })
    const labels = getAllByRole('button').map((b) => b.textContent?.trim())
    // [prev] 1 … 9 10 11 … 20 [next]
    expect(labels).toEqual(['', '1', '9', '10', '11', '20', ''])
    expect(container.querySelectorAll('.ds-pagination-gap')).toHaveLength(2)
  })

  it('aria-current sur la page active, boutons prev/next en butée', () => {
    const { getByRole } = render(Pagination, { props: { count: 5, modelValue: 1 } })
    expect(getByRole('button', { name: 'Page 1' }).getAttribute('aria-current')).toBe('page')
    expect((getByRole('button', { name: 'Page précédente' }) as HTMLButtonElement).disabled).toBe(
      true,
    )
    expect((getByRole('button', { name: 'Page suivante' }) as HTMLButtonElement).disabled).toBe(
      false,
    )
  })

  it('la navigation émet le v-model et respecte les butées', async () => {
    // page 3 sur 5 : toutes les pages sont visibles (pas d'ellipse)
    const { getByRole, emitted } = render(Pagination, { props: { count: 5, modelValue: 3 } })
    await fireEvent.click(getByRole('button', { name: 'Page 5' }))
    expect(emitted('update:modelValue')).toEqual([[5]])
    // defineModel non contrôlé : l'état local passe à 5 → suivant en butée
    expect((getByRole('button', { name: 'Page suivante' }) as HTMLButtonElement).disabled).toBe(
      true,
    )
  })
})
