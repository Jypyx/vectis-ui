import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import ProgressCircular from './ProgressCircular.vue'

describe('ProgressCircular', () => {
  it('normalise la valeur en % et expose le contrat ARIA', () => {
    const { getByRole } = render(ProgressCircular, {
      props: { value: 30, max: 60, label: 'Envoi' },
    })
    const bar = getByRole('progressbar')
    expect(bar.getAttribute('aria-valuenow')).toBe('50')
    expect(bar.getAttribute('aria-label')).toBe('Envoi')
    expect(bar.getAttribute('style')).toContain('--ds-progress-value: 50')
  })

  it('sans value : indéterminé (pas de aria-valuenow, data-indeterminate)', () => {
    const { getByRole } = render(ProgressCircular, { props: { label: 'Chargement' } })
    const bar = getByRole('progressbar')
    expect(bar.hasAttribute('aria-valuenow')).toBe(false)
    expect(bar.hasAttribute('data-indeterminate')).toBe(true)
  })

  it('borne la valeur entre 0 et 100', () => {
    const { getByRole } = render(ProgressCircular, {
      props: { value: 250, max: 100, label: 'x' },
    })
    expect(getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100')
  })
})
