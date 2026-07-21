import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import InputOTP from './InputOTP.vue'

function renderOtp(props: Record<string, unknown> = {}) {
  return render(InputOTP, { props: { modelValue: '', ...props } })
}

describe('InputOTP', () => {
  it('rend N cases nommées, groupe étiqueté', () => {
    const { getByRole, getAllByRole } = renderOtp({ length: 4 })
    expect(getByRole('group', { name: 'Code de vérification' })).toBeTruthy()
    expect(getAllByRole('textbox')).toHaveLength(4)
    expect(getAllByRole('textbox')[0]?.getAttribute('autocomplete')).toBe('one-time-code')
  })

  it('la saisie remplit la case, avance le focus et synchronise le modèle', async () => {
    const { getAllByRole, emitted } = renderOtp()
    const inputs = getAllByRole('textbox') as HTMLInputElement[]
    await fireEvent.update(inputs[0]!, '1')
    expect(emitted('update:modelValue').at(-1)).toEqual(['1'])
    expect(document.activeElement).toBe(inputs[1])
  })

  it('un collage est distribué sur les cases et émet complete', async () => {
    const { getAllByRole, emitted } = renderOtp({ length: 4 })
    const inputs = getAllByRole('textbox') as HTMLInputElement[]
    await fireEvent.update(inputs[0]!, '1234')
    expect(emitted('update:modelValue').at(-1)).toEqual(['1234'])
    expect(emitted('complete')).toEqual([['1234']])
  })

  it('numeric filtre les caractères non numériques', async () => {
    const { getAllByRole, emitted } = renderOtp()
    const input = getAllByRole('textbox')[0] as HTMLInputElement
    await fireEvent.update(input, 'a')
    expect(input.value).toBe('')
    // la valeur reste vide : aucun update émis
    expect(emitted()).not.toHaveProperty('update:modelValue')
  })

  it('Backspace sur case vide efface la précédente et y retourne', async () => {
    const { getAllByRole, emitted } = renderOtp({ modelValue: '12' })
    const inputs = getAllByRole('textbox') as HTMLInputElement[]
    inputs[2]!.focus()
    await fireEvent.keyDown(inputs[2]!, { key: 'Backspace' })
    expect(emitted('update:modelValue').at(-1)).toEqual(['1'])
    expect(document.activeElement).toBe(inputs[1])
  })
})
