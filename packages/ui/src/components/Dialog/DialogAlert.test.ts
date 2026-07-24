import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

import DialogAlert from './DialogAlert.vue'

function renderHarness(props: Record<string, unknown> = {}) {
  const open = ref((props.open as boolean) ?? true)
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
  const dialog = utils.container.querySelector('.ds-dialog') as HTMLDialogElement
  return { open, dialog, ...utils }
}

describe('DialogAlert', () => {
  it('pose role="alertdialog"', () => {
    expect(renderHarness().dialog.getAttribute('role')).toBe('alertdialog')
  })

  it('n’a pas de croix de fermeture', () => {
    const { queryByRole } = renderHarness()
    expect(queryByRole('button', { name: 'Fermer' })).toBeNull()
  })

  it('coupe tout light dismiss (closedby="none")', () => {
    expect(renderHarness().dialog.getAttribute('closedby')).toBe('none')
  })

  it('défaut size=sm', () => {
    expect(renderHarness().dialog.getAttribute('data-size')).toBe('sm')
  })

  it('reste piloté par le v-model (bouton d’action ferme)', async () => {
    const { open, dialog } = renderHarness()
    await nextTick()
    expect(dialog.open).toBe(true)
    open.value = false
    await nextTick()
    expect(dialog.open).toBe(false)
  })
})
