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

  it('prop size numérique : pose --spinner-size en style inline, sinon rien', () => {
    const explicite = render(Spinner, { props: { size: 32 } })
    const spinnerExplicite = explicite.container.querySelector('.v-spinner') as HTMLElement
    expect(spinnerExplicite.style.getPropertyValue('--spinner-size')).toBe('32px')

    const implicite = render(Spinner)
    const spinnerImplicite = implicite.container.querySelector('.v-spinner') as HTMLElement
    expect(spinnerImplicite.hasAttribute('style')).toBe(false)
  })
})
