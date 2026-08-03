import { ref } from 'vue'
import type { Ref } from 'vue'

import { useFocusoutDismiss } from './useFocusoutDismiss'

/** Contrat minimal du champ interne : DatePicker/TimePicker exposent un `Input`. */
interface FocusableField {
  focus: () => void
}

/** Contrat minimal du panneau : DatePicker/TimePicker rendent un `Popover`. */
interface PanelControl {
  show: () => void
  hide: () => void
}

export interface UseFieldPanelOptions {
  rootEl: Ref<HTMLElement | null>
  panelRef: Ref<PanelControl | null>
  fieldEl: Ref<FocusableField | null>
  disabled: () => boolean
  /** Place le focus DANS le panneau ouvert (appelé sous `requestAnimationFrame`). */
  focusInPanel: () => void
  /** Prologue d'ouverture (init d'un brouillon, remise à zéro d'une étape…). */
  onOpen?: () => void
  /** Épilogue de fermeture (vidage d'une live region…). */
  onClose?: () => void
  /**
   * Le focus doit-il entrer DANS le panneau à l'ouverture ? Défaut : oui. Un
   * champ de SAISIE (DatePicker `entry="input"`) ouvre son panneau sans déplacer
   * le curseur : le clavier continue d'écrire dans le champ, et la flèche bas
   * reste le seul chemin explicite vers le panneau.
   */
  focusOnOpen?: () => boolean
}

/**
 * Coquille « champ en lecture seule + panneau flottant `mode="manual"` »,
 * partagée par DatePicker et TimePicker. Aucun des deux n'en est propriétaire.
 *
 * Un popover `manual` ne fait RIEN tout seul : ni light dismiss, ni déplacement
 * du focus, ni retour du focus au déclencheur. Tout ce qui suit est ce minimum,
 * et rien de plus — les comportements propres à chaque composant passent par
 * `onOpen`/`onClose`/`focusInPanel`.
 *
 * Le panneau est ÉCRIT impérativement (`show`/`hide` de Popover) et LU par
 * modèle : `open` est à brancher en `v-model:open` sur le Popover, qui l'alimente
 * depuis les événements du DOM. L'écriture doit rester synchrone — le `rAF` qui
 * déplace le focus suppose que le panneau est déjà ouvert au moment où il est
 * armé ; passer par le modèle intercalerait un tick.
 */
export function useFieldPanel(options: UseFieldPanelOptions) {
  const open = ref(false)

  function openPanel(moveFocus = options.focusOnOpen?.() ?? true) {
    if (options.disabled() || open.value) return
    options.onOpen?.()
    options.panelRef.value?.show()
    // Le focus DOM doit être déplacé à la main : le natif ne le fait pas pour un
    // popover `manual`. rAF : le panneau n'est pas encore peint au retour de show().
    if (moveFocus) requestAnimationFrame(() => options.focusInPanel())
  }

  function closePanel(refocus = false) {
    if (!open.value) return
    options.panelRef.value?.hide()
    options.onClose?.()
    if (refocus) options.fieldEl.value?.focus()
  }

  function onControlClick(event: MouseEvent) {
    // clic sur un bouton interne (croix/icône) : laisser son handler agir
    if ((event.target as HTMLElement).closest('.v-input-action')) return
    if (options.disabled()) return
    openPanel()
  }

  /** Fermeture quand le focus sort du composant (panneau compris, descendant DOM). */
  const onFocusout = useFocusoutDismiss(options.rootEl, () => closePanel(false))

  /*
   * Clic sur une zone NON interactive du panneau (padding, gouttière entre les
   * cellules, barre de navigation hors boutons) : le navigateur retire le focus
   * de l'élément courant et le rend au <body>. Le `focusout` remonte alors à la
   * racine avec un `relatedTarget` nul — que `useFocusoutDismiss` lit, à raison,
   * comme une sortie — et ferme un panneau sur lequel on vient de cliquer.
   *
   * On garde donc le focus en place, mais SEULEMENT hors des éléments
   * interactifs : un `preventDefault` inconditionnel (celui du Combobox, dont le
   * focus ne quitte jamais le champ) priverait de focus les jours et les flèches
   * de navigation, et désynchroniserait le roving tabindex du Calendar.
   *
   * Invisible en jsdom, qui ne simule pas le focus au clic : couvert par des
   * play functions.
   */
  function onPanelMousedown(event: MouseEvent) {
    const target = event.target as HTMLElement | null
    if (!target?.closest('button, a, input, select, textarea, [tabindex]')) event.preventDefault()
  }

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
      // Ouverture au CLAVIER : le focus suit toujours, quel que soit
      // `focusOnOpen` — sans quoi la flèche bas ouvrirait un panneau que rien
      // n'atteindrait.
      openPanel(true)
    }
  }

  return {
    open,
    openPanel,
    closePanel,
    onControlClick,
    onFocusout,
    onKeydown,
    onPanelMousedown,
  }
}
