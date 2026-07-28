import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

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

  it('format numeric (défaut) filtre les caractères non numériques', async () => {
    const { getAllByRole, emitted } = renderOtp()
    const input = getAllByRole('textbox')[0] as HTMLInputElement
    await fireEvent.update(input, 'a')
    expect(input.value).toBe('')
    expect(emitted()).not.toHaveProperty('update:modelValue')
  })

  it('format alpha filtre les chiffres et force les majuscules', async () => {
    const { getAllByRole, emitted } = renderOtp({ format: 'alpha' })
    const inputs = getAllByRole('textbox') as HTMLInputElement[]
    await fireEvent.update(inputs[0]!, '3')
    expect(emitted()).not.toHaveProperty('update:modelValue')
    await fireEvent.update(inputs[0]!, 'a')
    expect(inputs[0]!.value).toBe('A')
    expect(emitted('update:modelValue').at(-1)).toEqual(['A'])
  })

  it('format alphanumeric accepte lettres et chiffres, en majuscules', async () => {
    const { getAllByRole, emitted } = renderOtp({ format: 'alphanumeric', length: 4 })
    const inputs = getAllByRole('textbox') as HTMLInputElement[]
    await fireEvent.update(inputs[0]!, 'a1b2')
    expect(emitted('update:modelValue').at(-1)).toEqual(['A1B2'])
    expect(emitted('complete')).toEqual([['A1B2']])
  })

  it('Backspace sur case vide efface la précédente et y retourne', async () => {
    const { getAllByRole, emitted } = renderOtp({ modelValue: '12' })
    const inputs = getAllByRole('textbox') as HTMLInputElement[]
    inputs[2]!.focus()
    await fireEvent.keyDown(inputs[2]!, { key: 'Backspace' })
    expect(emitted('update:modelValue').at(-1)).toEqual(['1'])
    expect(document.activeElement).toBe(inputs[1])
  })

  it('pattern : les # deviennent des cases, les littéraux du texte décoratif', () => {
    const { container, getAllByRole } = renderOtp({ pattern: '###.###.###' })
    const inputs = getAllByRole('textbox')
    expect(inputs).toHaveLength(9)
    expect(inputs[3]?.getAttribute('aria-label')).toBe('Caractère 4 sur 9')
    const literals = container.querySelectorAll('.ds-otp-literal')
    expect(literals).toHaveLength(2)
    expect(literals[0]?.textContent).toBe('.')
    expect(literals[0]?.getAttribute('aria-hidden')).toBe('true')
  })

  it('pattern prime sur length', () => {
    expect(renderOtp({ pattern: '##-##', length: 6 }).getAllByRole('textbox')).toHaveLength(4)
  })

  it('pattern sans # replie sur length (avec avertissement DEV)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(renderOtp({ pattern: 'abc', length: 6 }).getAllByRole('textbox')).toHaveLength(6)
    expect(warn).toHaveBeenCalledOnce()
    warn.mockRestore()
  })

  it('collage de la chaîne formatée : les littéraux sont consommés', async () => {
    const { getAllByRole, emitted } = renderOtp({ pattern: '###.###.###' })
    const inputs = getAllByRole('textbox') as HTMLInputElement[]
    await fireEvent.update(inputs[0]!, '123.456.789')
    expect(emitted('update:modelValue').at(-1)).toEqual(['123456789'])
    expect(emitted('complete')).toEqual([['123456789']])
  })

  it('collage avec préfixe littéral (« GT-123 » sur GT-###) ne garde que les cases', async () => {
    const { getAllByRole, emitted } = renderOtp({ pattern: 'GT-###' })
    const inputs = getAllByRole('textbox') as HTMLInputElement[]
    await fireEvent.update(inputs[0]!, 'GT-123')
    expect(emitted('update:modelValue').at(-1)).toEqual(['123'])
    expect(emitted('complete')).toEqual([['123']])
  })

  it('Backspace traverse un littéral : efface le slot précédent', async () => {
    const { getAllByRole, emitted } = renderOtp({ pattern: '##-##', modelValue: '12' })
    const inputs = getAllByRole('textbox') as HTMLInputElement[]
    inputs[2]!.focus()
    await fireEvent.keyDown(inputs[2]!, { key: 'Backspace' })
    expect(emitted('update:modelValue').at(-1)).toEqual(['1'])
    expect(document.activeElement).toBe(inputs[1])
  })

  it('separatorIcon remplace les littéraux par une icône', () => {
    const { container } = renderOtp({ pattern: '##-##', separatorIcon: 'horizontal_rule' })
    const literal = container.querySelector('.ds-otp-literal')
    expect(literal?.textContent).not.toContain('-')
    expect(literal?.querySelector('.ds-icon-symbol')?.textContent).toBe('horizontal_rule')
  })

  it('pose data-size/data-compact/data-disabled sur la racine', () => {
    const { getByRole, getAllByRole } = renderOtp({ size: 'sm', compact: true, disabled: true })
    const group = getByRole('group')
    expect(group.getAttribute('data-size')).toBe('sm')
    expect(group.hasAttribute('data-compact')).toBe(true)
    expect(group.hasAttribute('data-disabled')).toBe(true)
    expect((getAllByRole('textbox')[0] as HTMLInputElement).disabled).toBe(true)
  })
})
