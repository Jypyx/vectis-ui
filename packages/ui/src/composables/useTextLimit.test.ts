import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import VInput from '../components/VInput/VInput.vue'

describe('useTextLimit', () => {
  // Without a soft limit the composable owns no error, so it must leave the one a consumer
  // set (a server verdict) where it is when the field re-renders.
  it('leaves a consumer validity message alone when there is no soft limit', async () => {
    const { getByRole, rerender } = render(VInput, { props: { modelValue: '', maxlength: 5 } })
    const input = getByRole('textbox') as HTMLInputElement
    input.setCustomValidity('Already taken')
    await rerender({ maxlength: 10 })
    await nextTick()
    expect(input.validationMessage).toBe('Already taken')
  })

  it('clears its own error when the soft limit is turned off', async () => {
    const { getByRole, rerender } = render(VInput, {
      props: { modelValue: 'abcdef', maxlength: 3, softLimit: true },
    })
    const input = getByRole('textbox') as HTMLInputElement
    await nextTick()
    expect(input.validationMessage).not.toBe('')
    await rerender({ softLimit: false })
    await nextTick()
    expect(input.validationMessage).toBe('')
  })
})
