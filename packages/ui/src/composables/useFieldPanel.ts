import type { Ref } from 'vue'

import { useFocusoutDismiss } from './useFocusoutDismiss'
import { usePopover } from './usePopover'

/** Contrat minimal du champ interne : DatePicker/TimePicker exposent un `Input`. */
interface FocusableField {
  focus: () => void
}

export interface UseFieldPanelOptions {
  /** Racine du composant : périmètre du test de sortie de focus. */
  rootEl: Ref<HTMLElement | null>
  /** L'élément `[popover]`. */
  panelEl: Ref<HTMLElement | null>
  /** Le champ, pour lui rendre le focus à la fermeture. */
  fieldEl: Ref<FocusableField | null>
  disabled: () => boolean
  /** Place le focus DANS le panneau ouvert (appelé sous `requestAnimationFrame`). */
  focusInPanel: () => void
  /** Prologue d'ouverture (init d'un brouillon, remise à zéro d'une étape…). */
  onOpen?: () => void
  /** Épilogue de fermeture (vidage d'une live region…). */
  onClose?: () => void
}

/**
 * Coquille « champ en lecture seule + panneau flottant `popover="manual"` »,
 * partagée par DatePicker et TimePicker. Aucun des deux n'en est propriétaire :
 * c'est le même squelette, qui avait été recopié à l'identique (ouverture,
 * fermeture, sortie de focus, clic sur le contrôle, Échap/ArrowDown/Entrée).
 *
 * Un popover `manual` ne fait RIEN tout seul : ni light dismiss, ni déplacement
 * du focus, ni retour du focus au déclencheur. Tout ce qui suit est ce minimum,
 * et rien de plus — les comportements propres à chaque composant passent par
 * `onOpen`/`onClose`/`focusInPanel`.
 */
export function useFieldPanel(options: UseFieldPanelOptions) {
  // État d'ouverture alimenté par les événements du popover (cf. usePopover),
  // jamais écrit à la main : les gardes de `show`/`hide` évitent l'InvalidStateError.
  const { shown: open, syncShown, show, hide } = usePopover(options.panelEl)

  function openPanel() {
    if (options.disabled() || open.value) return
    options.onOpen?.()
    show()
    // Le focus DOM doit être déplacé à la main : le natif ne le fait pas pour un
    // popover `manual`. rAF : le panneau n'est pas encore peint au retour de show().
    requestAnimationFrame(() => options.focusInPanel())
  }

  function closePanel(refocus = false) {
    if (!open.value) return
    hide()
    options.onClose?.()
    if (refocus) options.fieldEl.value?.focus()
  }

  function onControlClick(event: MouseEvent) {
    // clic sur un bouton interne (croix/icône) : laisser son handler agir
    if ((event.target as HTMLElement).closest('.ds-input-action')) return
    if (options.disabled()) return
    openPanel()
  }

  /** Fermeture quand le focus sort du composant (panneau compris, descendant DOM). */
  const onFocusout = useFocusoutDismiss(options.rootEl, () => closePanel(false))

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (open.value) {
        event.preventDefault()
        closePanel(true)
      }
      return
    }
    // `defaultPrevented` : une Entrée déjà consommée DANS le panneau (sélection
    // d'un jour, commit du cadran) vient de le fermer — sans ce garde, elle le
    // rouvrirait aussitôt en atteignant la racine par bubbling.
    if (
      (event.key === 'ArrowDown' || event.key === 'Enter') &&
      !open.value &&
      !event.defaultPrevented
    ) {
      event.preventDefault()
      openPanel()
    }
  }

  return { open, syncShown, openPanel, closePanel, onControlClick, onFocusout, onKeydown }
}
