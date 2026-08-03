import type { Ref } from 'vue'

/**
 * Handler `@focusout` de racine : ferme quand le focus quitte le composant,
 * panneau flottant compris — un popover est un descendant DOM de la racine même
 * quand il est peint en top layer, donc `contains` suffit et il n'y a rien à
 * observer côté document.
 *
 * `relatedTarget` nul = le focus part hors de la fenêtre (ou vers le body) :
 * c'est aussi une sortie, on ferme.
 *
 * Nécessaire parce qu'un popover `manual` n'a pas de light dismiss ; les
 * panneaux `auto` (VMenu) n'en ont pas besoin, le natif s'en charge.
 */
export function useFocusoutDismiss(
  root: Ref<HTMLElement | null>,
  close: () => void,
): (event: FocusEvent) => void {
  return (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null
    if (!next || !root.value?.contains(next)) close()
  }
}
