import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import ProgressLinear from './ProgressLinear.vue'

describe('ProgressLinear', () => {
  it('expose value/max via <progress> natif', () => {
    const { getByRole } = render(ProgressLinear, {
      props: { value: 30, max: 60 },
      attrs: { 'aria-label': 'Progression' },
    })
    const progress = getByRole('progressbar') as HTMLProgressElement
    expect(progress.tagName).toBe('PROGRESS')
    expect(progress.value).toBe(30)
    expect(progress.max).toBe(60)
  })

  it('sans value : indéterminé natif (pas d’attribut value)', () => {
    const { getByRole } = render(ProgressLinear, {
      attrs: { 'aria-label': 'Chargement' },
    })
    expect(getByRole('progressbar').hasAttribute('value')).toBe(false)
  })
})
