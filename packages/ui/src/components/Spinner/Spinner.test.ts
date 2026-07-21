import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import Spinner from './Spinner.vue'

describe('Spinner', () => {
  it('expose role="status" avec un libellé accessible par défaut', () => {
    const { getByRole } = render(Spinner)
    expect(getByRole('status').textContent).toContain('Chargement…')
  })

  it('le libellé est personnalisable', () => {
    const { getByRole } = render(Spinner, { props: { label: 'Envoi en cours…' } })
    expect(getByRole('status').textContent).toContain('Envoi en cours…')
  })
})
