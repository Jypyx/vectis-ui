import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import Textarea from './Textarea.vue'

describe('Textarea', () => {
  it('synchronise v-model', async () => {
    const { getByRole, emitted } = render(Textarea, { props: { modelValue: '' } })
    await fireEvent.update(getByRole('textbox'), 'plusieurs\nlignes')
    expect(emitted('update:modelValue')).toEqual([['plusieurs\nlignes']])
  })

  it('pose data-auto-grow et aria-invalid selon les props', () => {
    const { getByRole } = render(Textarea, {
      props: { modelValue: '', autoGrow: true, invalid: true },
    })
    const textarea = getByRole('textbox')
    expect(textarea.hasAttribute('data-auto-grow')).toBe(true)
    expect(textarea.getAttribute('aria-invalid')).toBe('true')
  })
})
