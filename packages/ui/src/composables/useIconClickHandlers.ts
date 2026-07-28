import { getCurrentInstance } from 'vue'

import { isDev } from '../utils/env'

/**
 * Les icônes internes d'un champ deviennent des `<button>` dès qu'un listener
 * `@click:icon-start` / `@click:icon-end` est attaché. Ces emits étant déclarés,
 * Vue les retire de `$attrs` : leur présence ne se lit que dans `vnode.props`,
 * et dans les DEUX graphies (kebab côté template, camel côté fonction render).
 *
 * La liste est considérée STATIQUE : un listener ajouté dynamiquement après le
 * montage n'est pas re-détecté (cas marginal, assumé).
 *
 * Le garde-fou a11y est ici et pas chez l'appelant : un bouton sans nom
 * accessible est un défaut du pattern, pas du composant qui l'emploie.
 */
export function useIconClickHandlers(options: {
  /** Nom du composant, pour le message d'avertissement. */
  name: string
  iconStartLabel?: string
  iconEndLabel?: string
}): { hasIconStartHandler: boolean; hasIconEndHandler: boolean } {
  const vnodeProps = getCurrentInstance()?.vnode.props ?? {}
  const hasIconStartHandler =
    'onClick:iconStart' in vnodeProps || 'onClick:icon-start' in vnodeProps
  const hasIconEndHandler = 'onClick:iconEnd' in vnodeProps || 'onClick:icon-end' in vnodeProps

  if (isDev) {
    if (hasIconStartHandler && !options.iconStartLabel)
      console.warn(
        `[${options.name}] icône start cliquable sans iconStartLabel — fournir un libellé accessible.`,
      )
    if (hasIconEndHandler && !options.iconEndLabel)
      console.warn(
        `[${options.name}] icône end cliquable sans iconEndLabel — fournir un libellé accessible.`,
      )
  }

  return { hasIconStartHandler, hasIconEndHandler }
}
