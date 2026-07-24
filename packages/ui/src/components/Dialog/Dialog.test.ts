import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

import Dialog from './Dialog.vue'

/**
 * Logique uniquement (jsdom + stub showModal/close, voir vitest.setup.ts). Le
 * comportement navigateur réel (top-layer, ::backdrop, piège de focus, light
 * dismiss Échap/backdrop, séparateurs scroll-state) est couvert par les play
 * functions Storybook.
 */
function renderHarness(props: Record<string, unknown> = {}, slots = '') {
  const open = ref((props.open as boolean) ?? false)
  const Harness = defineComponent({
    components: { Dialog },
    setup: () => ({ open, props }),
    template: `
      <button data-testid="ext" @click="open = true">Ouvrir</button>
      <Dialog v-model:open="open" v-bind="props">
        <template #trigger="{ triggerProps }">
          <button data-testid="trigger" v-bind="triggerProps">Ouvrir</button>
        </template>
        Contenu de la modale.
        ${slots}
      </Dialog>
    `,
  })
  const utils = render(Harness)
  const dialog = utils.container.querySelector('.ds-dialog') as HTMLDialogElement
  return { open, dialog, ...utils }
}

describe('Dialog', () => {
  it('pose aria-labelledby/aria-describedby depuis title/subtitle', () => {
    const { dialog } = renderHarness({ title: 'Confirmer', subtitle: 'Action irréversible' })
    const labelId = dialog.getAttribute('aria-labelledby')
    const descId = dialog.getAttribute('aria-describedby')
    expect(labelId).toBeTruthy()
    expect(descId).toBeTruthy()
    expect(dialog.querySelector(`#${labelId}`)?.textContent).toBe('Confirmer')
    expect(dialog.querySelector(`#${descId}`)?.textContent).toBe('Action irréversible')
  })

  it('sans title/subtitle, aucun aria-labelledby/describedby', () => {
    const { dialog } = renderHarness()
    expect(dialog.hasAttribute('aria-labelledby')).toBe(false)
    expect(dialog.hasAttribute('aria-describedby')).toBe(false)
  })

  it('le trigger ouvre la modale et synchronise le v-model', async () => {
    const { open, dialog, getByTestId } = renderHarness()
    expect(dialog.open).toBe(false)
    getByTestId('trigger').click()
    await nextTick()
    expect(dialog.open).toBe(true)
    expect(open.value).toBe(true)
  })

  it('ouvre/ferme via le v-model (source de vérité)', async () => {
    const { open, dialog, getByTestId } = renderHarness()
    getByTestId('ext').click()
    await nextTick()
    expect(dialog.open).toBe(true)
    expect(open.value).toBe(true)
    open.value = false
    await nextTick()
    expect(dialog.open).toBe(false)
  })

  it('la croix ferme la modale (event close resynchronise le v-model)', async () => {
    const { open, dialog, getByRole } = renderHarness({ open: true })
    await nextTick()
    expect(dialog.open).toBe(true)
    getByRole('button', { name: 'Fermer' }).click()
    // fermeture via la croix : le v-model fait un aller-retour enfant → parent →
    // enfant avant que le watcher pilote le DOM (deux flushs).
    await nextTick()
    await nextTick()
    expect(open.value).toBe(false)
    expect(dialog.open).toBe(false)
  })

  it('closable=false masque la croix', () => {
    const { queryByRole } = renderHarness({ closable: false })
    expect(queryByRole('button', { name: 'Fermer' })).toBeNull()
  })

  it('closeLabel personnalise le nom accessible de la croix', () => {
    // modale ouverte : la croix (dans le <dialog>) est dans l'arbre a11y
    const { getByRole } = renderHarness({ open: true, closeLabel: 'Annuler' })
    expect(getByRole('button', { name: 'Annuler' })).toBeTruthy()
  })

  it('role=alertdialog est posé sur l’élément', () => {
    const { dialog } = renderHarness({ role: 'alertdialog' })
    expect(dialog.getAttribute('role')).toBe('alertdialog')
  })

  it('role dialog (défaut) : pas d’attribut role explicite (rôle natif)', () => {
    const { dialog } = renderHarness()
    expect(dialog.hasAttribute('role')).toBe(false)
  })

  it('closedby dérivé de closeOnBackdrop/closeOnEscape', () => {
    expect(renderHarness().dialog.getAttribute('closedby')).toBe('any')
    expect(renderHarness({ closeOnBackdrop: false }).dialog.getAttribute('closedby')).toBe(
      'closerequest',
    )
    expect(
      renderHarness({ closeOnBackdrop: false, closeOnEscape: false }).dialog.getAttribute(
        'closedby',
      ),
    ).toBe('none')
  })

  it('data-size reflète la prop size', () => {
    expect(renderHarness().dialog.getAttribute('data-size')).toBe('md')
    expect(renderHarness({ size: 'lg' }).dialog.getAttribute('data-size')).toBe('lg')
  })

  it('le footer n’est rendu que si le slot #footer est fourni', () => {
    expect(renderHarness().dialog.querySelector('.ds-dialog-footer')).toBeNull()
    const withFooter = renderHarness({}, '<template #footer><button>OK</button></template>')
    expect(withFooter.dialog.querySelector('.ds-dialog-footer')).not.toBeNull()
  })

  it('les attributs de fallthrough atterrissent sur le <dialog>', () => {
    const { dialog } = renderHarness({ 'data-qa': 'suppression' })
    expect(dialog.getAttribute('data-qa')).toBe('suppression')
  })
})
