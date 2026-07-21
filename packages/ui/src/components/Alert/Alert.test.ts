import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import Alert from './Alert.vue'

describe('Alert', () => {
  it('role="status" pour info/success, role="alert" pour warning/danger', () => {
    const { getByRole, rerender } = render(Alert, {
      props: { tone: 'info' },
      slots: { default: 'Message' },
    })
    expect(getByRole('status')).toBeTruthy()
    return rerender({ tone: 'danger' }).then(() => {
      expect(getByRole('alert')).toBeTruthy()
    })
  })

  it('dismiss est émis mais la visibilité reste au consommateur', async () => {
    const { getByRole, getByText, emitted } = render(Alert, {
      props: { tone: 'info', dismissible: true, title: 'Titre' },
      slots: { default: 'Message' },
    })
    await fireEvent.click(getByRole('button', { name: 'Fermer' }))
    expect(emitted('dismiss')).toHaveLength(1)
    expect(getByText('Message')).toBeTruthy()
  })

  it('sans dismissible, pas de bouton de fermeture', () => {
    const { queryByRole } = render(Alert, {
      props: { tone: 'success' },
      slots: { default: 'Message' },
    })
    expect(queryByRole('button')).toBeNull()
  })
})
