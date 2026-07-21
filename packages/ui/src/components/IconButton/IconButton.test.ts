import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import IconButton from './IconButton.vue'

describe('IconButton', () => {
  it('expose le libellé accessible via aria-label', () => {
    const { getByRole } = render(IconButton, {
      props: { label: 'Fermer le panneau' },
      slots: { default: '<svg aria-hidden="true" />' },
    })
    const button = getByRole('button', { name: 'Fermer le panneau' })
    expect(button.classList.contains('ds-icon-button')).toBe(true)
    expect(button.classList.contains('ds-button')).toBe(true)
  })

  it('transmet variant/tone/size au Button sous-jacent', () => {
    const { getByRole } = render(IconButton, {
      props: { label: 'Ajouter', variant: 'solid', tone: 'accent', size: 'sm' },
      slots: { default: '<svg aria-hidden="true" />' },
    })
    const button = getByRole('button')
    expect(button.dataset.variant).toBe('solid')
    expect(button.dataset.tone).toBe('accent')
    expect(button.dataset.size).toBe('sm')
  })
})
