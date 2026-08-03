import { render } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'

import Tooltip from './Tooltip.vue'

const Harness = defineComponent({
  components: { Tooltip },
  template: `
    <Tooltip text="Aide contextuelle" :delay="300">
      <template #default="{ triggerProps }">
        <button data-testid="trigger" v-bind="triggerProps">?</button>
      </template>
    </Tooltip>
  `,
})

describe('Tooltip', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('relie le déclencheur au tooltip par aria-describedby', () => {
    const { getByTestId, container } = render(Harness)
    const panel = container.querySelector('[role="tooltip"]') as HTMLElement
    expect(getByTestId('trigger').getAttribute('aria-describedby')).toBe(panel.id)
  })

  it("s'ouvre au survol après le délai, pas avant", async () => {
    const { container } = render(Harness)
    const wrapper = container.querySelector('.v-tooltip') as HTMLElement
    const panel = container.querySelector('[role="tooltip"]') as HTMLElement

    wrapper.dispatchEvent(new Event('pointerenter'))
    vi.advanceTimersByTime(200)
    expect(panel.hasAttribute('data-popover-open')).toBe(false)
    vi.advanceTimersByTime(150)
    expect(panel.hasAttribute('data-popover-open')).toBe(true)
  })

  it('se ferme quand le pointeur sort (délai en cours annulé compris)', () => {
    const { container } = render(Harness)
    const wrapper = container.querySelector('.v-tooltip') as HTMLElement
    const panel = container.querySelector('[role="tooltip"]') as HTMLElement

    wrapper.dispatchEvent(new Event('pointerenter'))
    vi.advanceTimersByTime(400)
    expect(panel.hasAttribute('data-popover-open')).toBe(true)

    wrapper.dispatchEvent(new Event('pointerleave'))
    expect(panel.hasAttribute('data-popover-open')).toBe(false)

    // délai annulé : entrer puis sortir avant l'échéance ne doit rien ouvrir
    wrapper.dispatchEvent(new Event('pointerenter'))
    wrapper.dispatchEvent(new Event('pointerleave'))
    vi.advanceTimersByTime(500)
    expect(panel.hasAttribute('data-popover-open')).toBe(false)
  })

  it('le focus ouvre immédiatement, Échap ferme (WCAG 1.4.13)', () => {
    const { container } = render(Harness)
    const wrapper = container.querySelector('.v-tooltip') as HTMLElement
    const panel = container.querySelector('[role="tooltip"]') as HTMLElement

    wrapper.dispatchEvent(new Event('focusin'))
    expect(panel.hasAttribute('data-popover-open')).toBe(true)

    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(panel.hasAttribute('data-popover-open')).toBe(false)
  })
})
