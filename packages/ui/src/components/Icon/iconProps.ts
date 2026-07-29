import type { IconSource } from './types'

/**
 * Résout une source d'icône vers les props d'`Icon`.
 *
 * AUCUNE heuristique : une chaîne est TOUJOURS un nom d'icône ; une image ou un
 * composant se déclare explicitement (`{ src: '/logo.svg' }`). Ce helper a
 * longtemps deviné par regex `[./:]` qu'une chaîne contenant un point, un slash
 * ou un deux-points était une URL — ce qui interdisait les conventions de
 * nommage courantes (`mdi:close`, `fa6-solid:xmark`) : elles partaient en
 * `<img>` sans jamais atteindre le résolveur d'icônes.
 */
export const iconProps = (icon: IconSource) =>
  typeof icon === 'string' ? { name: icon } : { render: icon }

/**
 * Nom lisible d'une source, pour servir de libellé accessible de repli quand le
 * consommateur n'en fournit pas. `undefined` dès que la source est un rendu
 * explicite : un objet n'a pas de nom, et un `[object Object]` dans l'arbre
 * d'accessibilité serait pire que rien (`useIconClickHandlers` avertit alors).
 */
export const iconName = (icon: IconSource | undefined) =>
  typeof icon === 'string' ? icon : undefined
