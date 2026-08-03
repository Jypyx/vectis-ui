import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import Slider from './Slider.vue'

describe('Slider', () => {
  it('mode simple : un seul input range, v-model numérique', async () => {
    const { getAllByRole, emitted } = render(Slider, {
      props: { modelValue: 40, label: 'Volume' },
    })
    const sliders = getAllByRole('slider')
    expect(sliders).toHaveLength(1)
    await fireEvent.update(sliders[0]!, '55')
    expect(emitted('update:modelValue')).toEqual([[55]])
  })

  it('mode range : deux inputs nommés début/fin', () => {
    const { getByRole } = render(Slider, {
      props: { modelValue: [20, 60], range: true, label: 'Budget' },
    })
    expect(getByRole('slider', { name: 'Budget (début)' })).toBeTruthy()
    expect(getByRole('slider', { name: 'Budget (fin)' })).toBeTruthy()
  })

  it('empêche le croisement des deux curseurs', async () => {
    const { getByRole, emitted } = render(Slider, {
      props: { modelValue: [20, 60], range: true, label: 'Budget' },
    })
    // le curseur de début tente de dépasser la fin → recalé sur 60
    await fireEvent.update(getByRole('slider', { name: 'Budget (début)' }), '80')
    expect(emitted('update:modelValue')).toEqual([[[60, 60]]])
  })

  it('la piste de remplissage suit les valeurs (fractions unitless)', () => {
    const { container } = render(Slider, {
      props: { modelValue: [25, 75], range: true, label: 'x' },
    })
    const style = container.querySelector('.ds-slider')?.getAttribute('style') ?? ''
    expect(style).toContain('--start-fraction: 0.25')
    expect(style).toContain('--end-fraction: 0.75')
  })

  it('orientation : data-orientation posé uniquement en vertical', async () => {
    const { container, rerender } = render(Slider, {
      props: { modelValue: 40, label: 'x' },
    })
    const root = () => container.querySelector('.ds-slider')!
    expect(root().hasAttribute('data-orientation')).toBe(false)
    await rerender({ orientation: 'vertical' })
    expect(root().getAttribute('data-orientation')).toBe('vertical')
  })

  it('ticks : un point par pas, data-filled sous la valeur', () => {
    const { container } = render(Slider, {
      props: { modelValue: 50, ticks: true, step: 25, label: 'x' },
    })
    const ticks = container.querySelectorAll('.ds-slider-tick')
    expect(ticks).toHaveLength(5)
    const filled = container.querySelectorAll('.ds-slider-tick[data-filled]')
    // 0, 25, 50 remplis (≤ valeur)
    expect(filled).toHaveLength(3)
  })

  it('ticks range : remplis entre début et fin', () => {
    const { container } = render(Slider, {
      props: { modelValue: [25, 75], range: true, ticks: true, step: 25, label: 'x' },
    })
    const filled = container.querySelectorAll('.ds-slider-tick[data-filled]')
    expect(filled).toHaveLength(3)
  })

  it('ticks : garde-fou au-delà de 50 pas (aucun rendu)', () => {
    const { container } = render(Slider, {
      props: { modelValue: 50, ticks: true, step: 1, label: 'x' },
    })
    expect(container.querySelectorAll('.ds-slider-tick')).toHaveLength(0)
  })

  it('labels texte : rendus par pas et annoncés via aria-valuetext', async () => {
    const { container, getByRole } = render(Slider, {
      props: {
        modelValue: 2,
        min: 0,
        max: 4,
        step: 1,
        labels: ['XS', 'S', 'M', 'L', 'XL'],
        label: 'Taille',
      },
    })
    const rendered = [...container.querySelectorAll('.ds-slider-label')].map((el) => el.textContent)
    expect(rendered).toEqual(['XS', 'S', 'M', 'L', 'XL'])
    // labels implique ticks
    expect(container.querySelectorAll('.ds-slider-tick')).toHaveLength(5)
    const slider = getByRole('slider', { name: 'Taille' })
    expect(slider.getAttribute('aria-valuetext')).toBe('M')
    await fireEvent.update(slider, '3')
    expect(slider.getAttribute('aria-valuetext')).toBe('L')
  })

  it('labels icônes : Icon avec libellé accessible', () => {
    const { getByLabelText } = render(Slider, {
      props: {
        modelValue: 0,
        min: 0,
        max: 1,
        step: 1,
        labels: [
          { icon: 'volume_mute', label: 'Muet' },
          { icon: 'volume_up', label: 'Fort' },
        ],
        label: 'x',
      },
    })
    expect(getByLabelText('Muet')).toBeTruthy()
    expect(getByLabelText('Fort')).toBeTruthy()
  })

  it('inputs : un champ numérique en simple, commit au change avec clamp et snap', async () => {
    const { getAllByRole, getByRole, emitted } = render(Slider, {
      props: { modelValue: 40, inputs: true, step: 10, label: 'Volume' },
    })
    const fields = getAllByRole('spinbutton')
    expect(fields).toHaveLength(1)
    const field = getByRole('spinbutton', { name: 'Volume' }) as HTMLInputElement
    // hors bornes → clamp à max
    await fireEvent.update(field, '150')
    await fireEvent.change(field)
    expect(emitted('update:modelValue').at(-1)).toEqual([100])
    // valeur hors pas → snap (42 → 40)
    await fireEvent.update(field, '42')
    await fireEvent.change(field)
    expect(emitted('update:modelValue').at(-1)).toEqual([40])
  })

  it('inputs : champ vide → revert silencieux, aucune émission', async () => {
    const { getByRole, emitted } = render(Slider, {
      props: { modelValue: 40, inputs: true, label: 'Volume' },
    })
    const field = getByRole('spinbutton', { name: 'Volume' }) as HTMLInputElement
    await fireEvent.update(field, '')
    await fireEvent.change(field)
    expect(emitted('update:modelValue')).toBeUndefined()
    expect(field.value).toBe('40')
  })

  it('inputs range : deux champs, anti-croisement au commit', async () => {
    const { getAllByRole, getByRole, emitted } = render(Slider, {
      props: { modelValue: [20, 60], range: true, inputs: true, label: 'Budget' },
    })
    expect(getAllByRole('spinbutton')).toHaveLength(2)
    const start = getByRole('spinbutton', { name: 'Budget (début)' })
    await fireEvent.update(start, '80')
    await fireEvent.change(start)
    expect(emitted('update:modelValue').at(-1)).toEqual([[60, 60]])
  })

  it('tooltip : bulles présentes (1 en simple, 2 en range), masquées par défaut', () => {
    const simple = render(Slider, {
      props: { modelValue: 40, tooltip: true, label: 'x' },
    })
    expect(simple.container.querySelectorAll('.ds-slider-tooltip')).toHaveLength(1)
    expect(simple.container.querySelector('.ds-slider-tooltip')?.textContent).toBe('40')

    const range = render(Slider, {
      props: { modelValue: [20, 60], range: true, tooltip: true, label: 'x' },
    })
    expect(range.container.querySelectorAll('.ds-slider-tooltip')).toHaveLength(2)
  })

  it('tooltip : affiche le label du pas quand labels est fourni', () => {
    const { container } = render(Slider, {
      props: {
        modelValue: 1,
        min: 0,
        max: 2,
        step: 1,
        tooltip: true,
        labels: ['Bas', 'Milieu', 'Haut'],
        label: 'x',
      },
    })
    expect(container.querySelector('.ds-slider-tooltip')?.textContent).toBe('Milieu')
  })

  it('disabled : data-disabled sur la racine, contrôles désactivés', () => {
    const { container, getByRole } = render(Slider, {
      props: { modelValue: 40, disabled: true, inputs: true, label: 'Volume' },
    })
    expect(container.querySelector('.ds-slider[data-disabled]')).toBeTruthy()
    expect((getByRole('slider', { name: 'Volume' }) as HTMLInputElement).disabled).toBe(true)
    expect((getByRole('spinbutton', { name: 'Volume' }) as HTMLInputElement).disabled).toBe(true)
  })

  /* Les 4 libellés sont désormais des computed partagés entre le champ
     numérique et l'input range (ils étaient dupliqués dans le template) : la
     matrice complète est ce qui verrouille la factorisation. */
  describe('noms accessibles des poignées', () => {
    it('sans label : « Début »/« Fin » en range, « Valeur » sur le champ simple', () => {
      const range = render(Slider, {
        props: { modelValue: [20, 60], range: true, inputs: true },
      })
      expect(range.getByRole('slider', { name: 'Début' })).toBeTruthy()
      expect(range.getByRole('slider', { name: 'Fin' })).toBeTruthy()
      expect(range.getByRole('spinbutton', { name: 'Début' })).toBeTruthy()
      expect(range.getByRole('spinbutton', { name: 'Fin' })).toBeTruthy()

      const single = render(Slider, { props: { modelValue: 40, inputs: true } })
      // Hors range, la poignée EST la valeur : sans label du consommateur elle
      // reste sans nom, seul le champ numérique a besoin d'un repli.
      expect(single.getByRole('spinbutton', { name: 'Valeur' })).toBeTruthy()
    })

    it('avec label : suffixé « (début) »/« (fin) » en range, tel quel en simple', () => {
      const range = render(Slider, {
        props: { modelValue: [20, 60], range: true, inputs: true, label: 'Budget' },
      })
      expect(range.getByRole('slider', { name: 'Budget (début)' })).toBeTruthy()
      expect(range.getByRole('slider', { name: 'Budget (fin)' })).toBeTruthy()
      expect(range.getByRole('spinbutton', { name: 'Budget (début)' })).toBeTruthy()
      expect(range.getByRole('spinbutton', { name: 'Budget (fin)' })).toBeTruthy()

      const single = render(Slider, {
        props: { modelValue: 40, inputs: true, label: 'Volume' },
      })
      expect(single.getByRole('slider', { name: 'Volume' })).toBeTruthy()
      expect(single.getByRole('spinbutton', { name: 'Volume' })).toBeTruthy()
    })
  })
})
