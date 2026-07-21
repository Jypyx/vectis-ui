import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick } from 'vue'

import Popover from './Popover.vue'

describe('Popover', () => {
  it('lie le déclencheur au panneau via popovertarget (slot scopé)', () => {
    const Harness = defineComponent({
      components: { Popover },
      template: `
        <Popover>
          <template #trigger="{ triggerProps }">
            <button data-testid="trigger" v-bind="triggerProps">Ouvrir</button>
          </template>
          Contenu
        </Popover>
      `,
    })
    const { getByTestId, container } = render(Harness)
    const panel = container.querySelector('[popover]') as HTMLElement
    expect(getByTestId('trigger').getAttribute('popovertarget')).toBe(panel.id)
    expect(panel.id).not.toBe('')
  })

  it('v-model:open=true appelle showPopover', async () => {
    const { container, rerender } = render(Popover, {
      props: { open: false },
      slots: { trigger: '<button>t</button>', default: 'Contenu' },
    })
    const panel = container.querySelector('[popover]') as HTMLElement
    expect(panel.hasAttribute('data-popover-open')).toBe(false)

    await rerender({ open: true })
    await nextTick()
    expect(panel.hasAttribute('data-popover-open')).toBe(true)
  })

  it('la fermeture native (light dismiss) resynchronise le modèle', async () => {
    const { container, emitted } = render(Popover, {
      props: { open: true },
      slots: { trigger: '<button>t</button>', default: 'Contenu' },
    })
    const panel = container.querySelector('[popover]') as HTMLElement
    await nextTick()
    expect(panel.hasAttribute('data-popover-open')).toBe(true)

    panel.hidePopover()
    await nextTick()
    expect(emitted('update:open').at(-1)).toEqual([false])
  })

  it('pose data-placement pour le CSS', () => {
    const { container } = render(Popover, {
      props: { placement: 'top-end' },
      slots: { trigger: '<button>t</button>', default: 'Contenu' },
    })
    expect(container.querySelector('[popover]')?.getAttribute('data-placement')).toBe('top-end')
  })
})
