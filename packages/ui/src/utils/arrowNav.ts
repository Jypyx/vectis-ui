/**
 * Navigation clavier par flèches dans une rangée/colonne d'éléments frères.
 *
 * JS justifié : aucune primitive native ne déplace le focus entre des boutons
 * frères. Le contrat est le même partout dans le DS — les flèches et Home/End
 * ne font que **DÉPLACER le focus**, jamais activer : activer au focus
 * déclencherait une navigation ou une bascule de valeur involontaire. Un
 * composant qui veut l'activation au focus (Tabs en `activation: 'automatic'`)
 * la pose lui-même, dans son propre `@focus`.
 *
 * Incarnation unique pour Pagination, Tabs, Toggle et Menu.
 */

/**
 * Éléments navigables d'un conteneur : le sélecteur exclut les désactivés, et
 * le filtre `display` écarte ceux qu'une container query (Pagination) ou le
 * consommateur (Tabs, Toggle) a masqués — un élément masqué ne doit pas capter
 * le focus.
 */
export function navigableItems(container: HTMLElement, selector: string): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(selector)].filter(
    (el) => getComputedStyle(el).display !== 'none',
  )
}

/**
 * Traite ArrowUp/Down/Left/Right + Home/End sur `items` et déplace le focus.
 * Retourne `true` si la touche a été consommée (`preventDefault` déjà appliqué),
 * `false` sinon — l'appelant peut alors laisser passer l'événement.
 *
 * - Wrap modulo aux extrémités ; sans focus courant dans la liste, on repart du
 *   premier élément quel que soit le sens.
 * - Les flèches de l'axe INLINE sont physiques, donc inversées en RTL ; celles
 *   de l'axe block ne le sont pas (l'axe block ne se retourne pas).
 */
export function arrowNavigate(
  event: KeyboardEvent,
  container: HTMLElement,
  items: HTMLElement[],
  options: { vertical?: boolean } = {},
): boolean {
  const vertical = options.vertical ?? false
  const keys = vertical
    ? ['ArrowDown', 'ArrowUp', 'Home', 'End']
    : ['ArrowRight', 'ArrowLeft', 'Home', 'End']
  if (!keys.includes(event.key)) return false
  if (items.length === 0) return false
  event.preventDefault()

  const forward = vertical
    ? event.key === 'ArrowDown'
    : (event.key === 'ArrowRight') !== (getComputedStyle(container).direction === 'rtl')
  const current = items.indexOf(document.activeElement as HTMLElement)
  const next =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? items.length - 1
        : current === -1
          ? 0
          : (current + (forward ? 1 : -1) + items.length) % items.length
  items[next]?.focus()
  return true
}
