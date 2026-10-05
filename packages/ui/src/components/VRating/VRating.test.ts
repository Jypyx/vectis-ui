import { fireEvent, render, waitFor } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, ref } from 'vue'

import VRating from './VRating.vue'

function renderHarness(template: string, bindings: Record<string, unknown> = {}) {
  const Harness = defineComponent({
    components: { VRating },
    setup: () => bindings,
    template,
  })
  return render(Harness)
}

function renderRating(attrs = '', initial: number | null = null) {
  const value = ref<number | null>(initial)
  const utils = renderHarness(`<VRating v-model="value" ${attrs} />`, { value })
  const radios = () => utils.getAllByRole<HTMLInputElement>('radio')
  return { value, radios, ...utils }
}

describe('VRating', () => {
  it('is a group of one radio per icon, named from the dictionary', () => {
    const { getByRole, radios } = renderRating()
    const group = getByRole('group', { name: 'Rating' })
    expect(group.tagName).toBe('FIELDSET')
    expect(radios().map((radio) => radio.value)).toEqual(['1', '2', '3', '4', '5'])
    expect(getByRole('radio', { name: '3 out of 5' })).toBeTruthy()
    // One name for all, so the browser groups them.
    expect(new Set(radios().map((radio) => radio.name)).size).toBe(1)
  })

  it('label becomes the legend, and max sets the number of icons', () => {
    const { getByRole, radios } = renderRating('label="Quality" :max="10"')
    expect(getByRole('group', { name: 'Quality' })).toBeTruthy()
    expect(radios()).toHaveLength(10)
    expect(getByRole('radio', { name: '7 out of 10' })).toBeTruthy()
  })

  it('checks the radio of the model and writes the chosen value', async () => {
    const { value, radios, getByRole } = renderRating('', 2)
    expect(radios()[1]!.checked).toBe(true)
    await fireEvent.click(getByRole('radio', { name: '4 out of 5' }))
    expect(value.value).toBe(4)
  })

  it('fills the icons up to the value', () => {
    const { container } = renderRating('', 3)
    const fills = [...container.querySelectorAll<HTMLElement>('.v-rating-item')].map((item) =>
      item.style.getPropertyValue('--rating-value'),
    )
    expect(fills).toEqual(['1', '1', '1', '0', '0'])
  })

  describe('clearable', () => {
    it('a click on the current value clears it', async () => {
      const { value, getByRole } = renderRating('clearable', 3)
      await fireEvent.click(getByRole('radio', { name: '3 out of 5' }), { detail: 1 })
      expect(value.value).toBeNull()
    })

    it('a keyboard click on the current value does not', async () => {
      const { value, getByRole } = renderRating('clearable', 3)
      await fireEvent.click(getByRole('radio', { name: '3 out of 5' }), { detail: 0 })
      expect(value.value).toBe(3)
    })

    it('adds a "No rating" radio first, checked when there is none', async () => {
      const { value, radios, getByRole } = renderRating('clearable', 2)
      expect(radios()[0]).toBe(getByRole('radio', { name: 'No rating' }))
      await fireEvent.click(getByRole('radio', { name: 'No rating' }))
      expect(value.value).toBeNull()
      expect(radios()[0]!.checked).toBe(true)
    })

    it('without it, the current value stays on a second click', async () => {
      const { value, getByRole, queryByRole } = renderRating('', 3)
      await fireEvent.click(getByRole('radio', { name: '3 out of 5' }), { detail: 1 })
      expect(value.value).toBe(3)
      expect(queryByRole('radio', { name: 'No rating' })).toBeNull()
    })
  })

  describe('readonly', () => {
    it('is one image saying the value, fractional and formatted', () => {
      const { getByRole, queryAllByRole, container } = renderRating('readonly', 3.75)
      expect(queryAllByRole('radio')).toHaveLength(0)
      expect(getByRole('img', { name: '3.8 out of 5' })).toBeTruthy()
      const fills = [...container.querySelectorAll<HTMLElement>('.v-rating-item')].map((item) =>
        Number(item.style.getPropertyValue('--rating-value')),
      )
      expect(fills).toEqual([1, 1, 1, 0.75, 0])
    })

    it('says zero when there is no rating, and sends a named value in a hidden input', () => {
      const empty = renderRating('readonly name="score"')
      expect(empty.getByRole('img', { name: '0 out of 5' })).toBeTruthy()
      expect(empty.container.querySelector('input[type="hidden"]')).toBeNull()
      const rated = renderRating('readonly name="score"', 4)
      const hidden = rated.container.querySelector<HTMLInputElement>('input[type="hidden"]')!
      expect([hidden.name, hidden.value]).toEqual(['score', '4'])
    })
  })

  describe('field', () => {
    it('describes the group with the hint, replaced by the error', async () => {
      const error = ref<string | undefined>(undefined)
      const { getByRole, getAllByRole } = renderHarness(
        '<VRating label="Quality" hint="Your overall impression" :error="error" />',
        { error },
      )
      const group = getByRole('group', { name: 'Quality' })
      const describedBy = () =>
        group
          .getAttribute('aria-describedby')!
          .split(' ')
          .map((id) => document.getElementById(id)!.textContent!.trim())
      expect(describedBy()).toEqual(['Your overall impression'])
      error.value = 'Choose a rating'
      await waitFor(() => expect(describedBy()).toEqual(['Choose a rating']))
      expect(getAllByRole('radio').every((radio) => radio.getAttribute('aria-invalid'))).toBe(true)
      const live = group.querySelector('[aria-live="polite"]')!
      await waitFor(() => expect(live.textContent).toContain('Choose a rating'))
    })

    it('required marks every radio and adds a hidden asterisk', () => {
      const { radios, container } = renderRating('label="Quality" required')
      expect(radios().every((radio) => radio.required)).toBe(true)
      expect(container.querySelector('.v-rating-required')!.getAttribute('aria-hidden')).toBe(
        'true',
      )
    })

    it('name is given to the radios, and disabled disables the whole group', () => {
      const { radios, getByRole } = renderRating('name="score" disabled')
      expect(radios().every((radio) => radio.name === 'score')).toBe(true)
      expect((getByRole('group') as HTMLFieldSetElement).disabled).toBe(true)
    })

    it('keeps the consumer attributes, merging aria-describedby', () => {
      const { getByRole } = renderHarness(
        '<div id="note">Note</div><VRating class="extra" data-x="1" aria-describedby="note" hint="Hint" />',
      )
      const group = getByRole('group')
      expect(group.classList.contains('extra')).toBe(true)
      expect(group.dataset.x).toBe('1')
      expect(group.getAttribute('aria-describedby')!.split(' ')[0]).toBe('note')
    })
  })

  it('color replaces the tone with a colour of its own', () => {
    const { getByRole } = renderRating('color="#e91e63"')
    const group = getByRole('group')
    expect(group.hasAttribute('data-custom')).toBe(true)
    expect(group.style.getPropertyValue('--custom-color')).toBe('#e91e63')
  })

  it('the icon prop replaces the star', () => {
    const { container } = renderRating('icon="favorite"')
    expect(container.querySelector('.v-rating-empty')!.getAttribute('data-icon')).toBe('favorite')
  })

  it('exposes focus, which reaches the checked radio, and the fieldset', () => {
    const rating = ref<InstanceType<typeof VRating> | null>(null)
    const { getByRole } = renderHarness('<VRating ref="rating" :model-value="2" />', { rating })
    rating.value!.focus()
    expect(document.activeElement).toBe(getByRole('radio', { name: '2 out of 5' }))
    expect(rating.value!.el).toBe(getByRole('group'))
  })
})
