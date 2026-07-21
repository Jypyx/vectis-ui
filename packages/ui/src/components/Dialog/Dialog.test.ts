import { render } from '@testing-library/vue'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import Dialog from './Dialog.vue'

/*
 * jsdom ne couvre pas complètement l'API <dialog> (top-layer, ::backdrop).
 * On teste ici la LOGIQUE du composant (pont v-model ↔ API dialog, emits) ;
 * le comportement navigateur réel est couvert par les play functions Storybook.
 */
beforeAll(() => {
  if (typeof HTMLDialogElement.prototype.showModal !== 'function') {
    HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
      this.setAttribute('open', '')
    }
    HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
      this.removeAttribute('open')
      this.dispatchEvent(new Event('close'))
    }
  }
})

describe('Dialog', () => {
  it('ouvre via showModal quand open passe à true', async () => {
    const { container, rerender } = render(Dialog, {
      props: { open: false, title: 'Titre' },
      slots: { default: 'Contenu' },
    })
    const dialog = container.querySelector('dialog') as HTMLDialogElement
    const showModal = vi.spyOn(dialog, 'showModal')

    await rerender({ open: true })
    await nextTick()
    expect(showModal).toHaveBeenCalledOnce()
  })

  it("synchronise le modèle et émet close sur l'événement natif close (Esc…)", async () => {
    const { container, emitted } = render(Dialog, {
      props: { open: true, title: 'Titre' },
      slots: { default: 'Contenu' },
    })
    const dialog = container.querySelector('dialog') as HTMLDialogElement

    dialog.dispatchEvent(new Event('close'))
    await nextTick()
    expect(emitted('update:open')).toEqual([[false]])
    expect(emitted('close')).toHaveLength(1)
  })

  it('relie le titre via aria-labelledby', () => {
    const { container } = render(Dialog, {
      props: { open: false, title: 'Confirmer' },
      slots: { default: 'Contenu' },
    })
    const dialog = container.querySelector('dialog') as HTMLDialogElement
    const labelledby = dialog.getAttribute('aria-labelledby')
    expect(labelledby).toBeTruthy()
    // getElementById plutôt que querySelector : les useId() de Vue ne sont pas
    // des sélecteurs CSS valides sans échappement, et CSS.escape manque à jsdom
    expect(document.getElementById(labelledby ?? '')?.textContent).toContain('Confirmer')
  })

  it('masque le bouton de fermeture quand dismissible=false', () => {
    const { container } = render(Dialog, {
      props: { open: false, title: 'Titre', dismissible: false },
      slots: { default: 'Contenu' },
    })
    expect(container.querySelector('.ds-dialog-close')).toBeNull()
  })
})
