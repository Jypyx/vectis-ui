import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import Chip from './Chip.vue'

describe('Chip', () => {
  it('statique sans interaction : aucun bouton', () => {
    const { queryByRole, getByText } = render(Chip, { slots: { default: 'Étiquette' } })
    expect(queryByRole('button')).toBeNull()
    expect(getByText('Étiquette')).toBeTruthy()
  })

  it('selectable : bouton aria-pressed synchronisé avec v-model:selected', async () => {
    const { getByRole, emitted } = render(Chip, {
      props: { selectable: true, selected: false },
      slots: { default: 'Filtre' },
    })
    const button = getByRole('button', { name: 'Filtre' })
    expect(button.getAttribute('aria-pressed')).toBe('false')
    await fireEvent.click(button)
    expect(emitted('update:selected')).toEqual([[true]])
  })

  it('dismissible : émet dismiss sans imbriquer de boutons', async () => {
    const { getAllByRole, emitted } = render(Chip, {
      props: { selectable: true, dismissible: true, selected: true },
      slots: { default: 'Tag' },
    })
    const buttons = getAllByRole('button')
    expect(buttons).toHaveLength(2)
    for (const b of buttons) expect(b.closest('button')).toBe(b)
    await fireEvent.click(getAllByRole('button', { name: 'Retirer' })[0]!)
    expect(emitted('dismiss')).toHaveLength(1)
  })
})
