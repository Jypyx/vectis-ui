import { render } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'

import VTooltip from './VTooltip.vue'

const Harness = defineComponent({
  components: { VTooltip },
  template: `
    <VTooltip text="Aide contextuelle" :delay="300">
      <template #default="{ triggerProps }">
        <button data-testid="trigger" v-bind="triggerProps">?</button>
      </template>
    </VTooltip>
  `,
})

describe('VTooltip', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('links the trigger to the tooltip through aria-describedby', () => {
    const { getByTestId, container } = render(Harness)
    const panel = container.querySelector('[role="tooltip"]') as HTMLElement
    expect(getByTestId('trigger').getAttribute('aria-describedby')).toBe(panel.id)
  })

  it('opens on hover after the delay, not before', async () => {
    const { container } = render(Harness)
    const wrapper = container.querySelector('.v-tooltip') as HTMLElement
    const panel = container.querySelector('[role="tooltip"]') as HTMLElement

    wrapper.dispatchEvent(new Event('pointerenter'))
    vi.advanceTimersByTime(200)
    expect(panel.hasAttribute('data-popover-open')).toBe(false)
    vi.advanceTimersByTime(150)
    expect(panel.hasAttribute('data-popover-open')).toBe(true)
  })

  it('closes when the pointer leaves (including cancelling a pending delay)', () => {
    const { container } = render(Harness)
    const wrapper = container.querySelector('.v-tooltip') as HTMLElement
    const panel = container.querySelector('[role="tooltip"]') as HTMLElement

    wrapper.dispatchEvent(new Event('pointerenter'))
    vi.advanceTimersByTime(400)
    expect(panel.hasAttribute('data-popover-open')).toBe(true)

    wrapper.dispatchEvent(new Event('pointerleave'))
    expect(panel.hasAttribute('data-popover-open')).toBe(false)

    // delay cancelled: entering then leaving before it fires must open nothing
    wrapper.dispatchEvent(new Event('pointerenter'))
    wrapper.dispatchEvent(new Event('pointerleave'))
    vi.advanceTimersByTime(500)
    expect(panel.hasAttribute('data-popover-open')).toBe(false)
  })

  it('focus opens immediately, Escape closes (WCAG 1.4.13)', () => {
    const { container } = render(Harness)
    const wrapper = container.querySelector('.v-tooltip') as HTMLElement
    const panel = container.querySelector('[role="tooltip"]') as HTMLElement

    wrapper.dispatchEvent(new Event('focusin'))
    expect(panel.hasAttribute('data-popover-open')).toBe(true)

    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(panel.hasAttribute('data-popover-open')).toBe(false)
  })
})
