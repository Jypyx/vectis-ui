import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

import VDialog from './VDialog.vue'

/**
 * Logique uniquement (jsdom + stub showModal/close, voir vitest.setup.ts). Le
 * comportement navigateur réel (top-layer, ::backdrop, piège de focus, light
 * dismiss Échap/backdrop, séparateurs scroll-state) est couvert par les play
 * functions Storybook.
 *
 * Montage paresseux : le <dialog> n'existe dans le DOM que pendant qu'il est
 * ouvert — les tests ouvrent donc la modale avant d'interroger l'élément.
 */
async function flush() {
  // l'ouverture enchaîne rendered=true → nextTick (montage) → showModal()
  await nextTick()
  await new Promise((r) => setTimeout(r))
  await nextTick()
}

function renderHarness(props: Record<string, unknown> = {}, slots = '') {
  const open = ref((props.open as boolean) ?? false)
  const Harness = defineComponent({
    components: { VDialog },
    setup: () => ({ open, props }),
    template: `
      <button data-testid="ext" @click="open = true">Ouvrir</button>
      <VDialog v-model:open="open" v-bind="props">
        <template #trigger="{ triggerProps }">
          <button data-testid="trigger" v-bind="triggerProps">Ouvrir</button>
        </template>
        Contenu de la modale.
        ${slots}
      </VDialog>
    `,
  })
  const utils = render(Harness)
  const getDialog = () => utils.container.querySelector('.v-dialog') as HTMLDialogElement | null
  return { open, getDialog, ...utils }
}

/** Ouvre la modale et renvoie l'élément <dialog> monté. */
async function openHarness(props: Record<string, unknown> = {}, slots = '') {
  const h = renderHarness(props, slots)
  h.open.value = true
  await flush()
  return { ...h, dialog: h.getDialog() as HTMLDialogElement }
}

describe('VDialog', () => {
  it('pose aria-labelledby/aria-describedby depuis title/subtitle', async () => {
    const { dialog } = await openHarness({ title: 'Confirmer', subtitle: 'Action irréversible' })
    const labelId = dialog.getAttribute('aria-labelledby')
    const descId = dialog.getAttribute('aria-describedby')
    expect(labelId).toBeTruthy()
    expect(descId).toBeTruthy()
    expect(dialog.querySelector(`#${labelId}`)?.textContent).toBe('Confirmer')
    expect(dialog.querySelector(`#${descId}`)?.textContent).toBe('Action irréversible')
  })

  it('sans title/subtitle, aucun aria-labelledby/describedby', async () => {
    const { dialog } = await openHarness()
    expect(dialog.hasAttribute('aria-labelledby')).toBe(false)
    expect(dialog.hasAttribute('aria-describedby')).toBe(false)
  })

  it('le trigger ouvre la modale et synchronise le v-model', async () => {
    const { open, getDialog, getByTestId } = renderHarness()
    expect(getDialog()).toBeNull()
    getByTestId('trigger').click()
    await flush()
    expect(getDialog()?.open).toBe(true)
    expect(open.value).toBe(true)
  })

  it('ouvre/ferme via le v-model (source de vérité)', async () => {
    const { open, getDialog } = renderHarness()
    open.value = true
    await flush()
    expect(getDialog()?.open).toBe(true)
    open.value = false
    await flush()
    expect(getDialog()).toBeNull()
  })

  it('la croix ferme la modale (event close resynchronise le v-model)', async () => {
    const { open, getDialog, getByRole } = await openHarness()
    expect(getDialog()?.open).toBe(true)
    getByRole('button', { name: 'Fermer' }).click()
    await flush()
    expect(open.value).toBe(false)
    expect(getDialog()).toBeNull()
  })

  it('closable=false masque la croix', async () => {
    const { queryByRole } = await openHarness({ closable: false })
    expect(queryByRole('button', { name: 'Fermer' })).toBeNull()
  })

  it('closeLabel personnalise le nom accessible de la croix', async () => {
    const { getByRole } = await openHarness({ closeLabel: 'Annuler' })
    expect(getByRole('button', { name: 'Annuler' })).toBeTruthy()
  })

  it('role=alertdialog est posé sur l’élément', async () => {
    const { dialog } = await openHarness({ role: 'alertdialog' })
    expect(dialog.getAttribute('role')).toBe('alertdialog')
  })

  it('role dialog (défaut) : pas d’attribut role explicite (rôle natif)', async () => {
    const { dialog } = await openHarness()
    expect(dialog.hasAttribute('role')).toBe(false)
  })

  it('closedby dérivé de closeOnBackdrop/closeOnEscape', async () => {
    expect((await openHarness()).dialog.getAttribute('closedby')).toBe('any')
    expect((await openHarness({ closeOnBackdrop: false })).dialog.getAttribute('closedby')).toBe(
      'closerequest',
    )
    expect(
      (await openHarness({ closeOnBackdrop: false, closeOnEscape: false })).dialog.getAttribute(
        'closedby',
      ),
    ).toBe('none')
  })

  it('width est posée en style inline --dialog-width', async () => {
    expect((await openHarness()).dialog.style.getPropertyValue('--dialog-width')).toBe('400px')
    expect(
      (await openHarness({ width: '640px' })).dialog.style.getPropertyValue('--dialog-width'),
    ).toBe('640px')
  })

  it('le footer n’est rendu que si le slot #footer est fourni', async () => {
    expect((await openHarness()).dialog.querySelector('.v-dialog-footer')).toBeNull()
    const withFooter = await openHarness({}, '<template #footer><button>OK</button></template>')
    expect(withFooter.dialog.querySelector('.v-dialog-footer')).not.toBeNull()
  })

  it('les attributs de fallthrough atterrissent sur le <dialog>', async () => {
    const { dialog } = await openHarness({ 'data-qa': 'suppression' })
    expect(dialog.getAttribute('data-qa')).toBe('suppression')
  })

  it('montage paresseux : absent fermé, présent ouvert, retiré après fermeture', async () => {
    const { open, getDialog } = renderHarness()
    expect(getDialog()).toBeNull()
    open.value = true
    await flush()
    expect(getDialog()).not.toBeNull()
    open.value = false
    await flush()
    expect(getDialog()).toBeNull()
  })
})
