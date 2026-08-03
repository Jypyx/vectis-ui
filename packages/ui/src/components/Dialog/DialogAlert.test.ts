import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

import DialogAlert from './DialogAlert.vue'

async function flush() {
  await nextTick()
  await new Promise((r) => setTimeout(r))
  await nextTick()
}

async function openHarness(props: Record<string, unknown> = {}) {
  const open = ref(true)
  const Harness = defineComponent({
    components: { DialogAlert },
    setup: () => ({ open, props }),
    template: `
      <DialogAlert v-model:open="open" v-bind="props">
        Voulez-vous vraiment supprimer ?
        <template #footer><button>Confirmer</button></template>
      </DialogAlert>
    `,
  })
  const utils = render(Harness)
  await flush()
  const dialog = utils.container.querySelector('.ds-dialog') as HTMLDialogElement
  return { open, dialog, ...utils }
}

describe('DialogAlert', () => {
  it('pose role="alertdialog"', async () => {
    expect((await openHarness()).dialog.getAttribute('role')).toBe('alertdialog')
  })

  it('n’a pas de croix de fermeture', async () => {
    const { queryByRole } = await openHarness()
    expect(queryByRole('button', { name: 'Fermer' })).toBeNull()
  })

  it('coupe tout light dismiss (closedby="none")', async () => {
    expect((await openHarness()).dialog.getAttribute('closedby')).toBe('none')
  })

  it('défaut width=400px', async () => {
    expect((await openHarness()).dialog.style.getPropertyValue('--dialog-width')).toBe('400px')
  })

  it('reste piloté par le v-model (bouton d’action ferme)', async () => {
    const { open, container } = await openHarness()
    expect(container.querySelector('.ds-dialog')).not.toBeNull()
    open.value = false
    await flush()
    expect(container.querySelector('.ds-dialog')).toBeNull()
  })
})
