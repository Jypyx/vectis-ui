import type { InjectionKey } from 'vue'

import type { IconSource } from '../Icon/types'

/**
 * Contrat niveau→niveau de la SideNavigation. Chaque `SideNavigationItem`
 * injecte le contexte de SON niveau et en fournit un nouveau à ses sous-items :
 * c'est ce qui rend l'exclusivité locale à un niveau plutôt que globale.
 *
 * Ce qui n'y transite PAS, délibérément :
 * - `size`/`compact`, portés par l'héritage CSS des `--control-*` (la classe
 *   `v-control` n'est posée que sur le <nav>) — les y mettre serait une
 *   seconde incarnation de la même information ;
 * - la PROFONDEUR, portée par la cascade (compteur CSS à deux noms alternés,
 *   cf. SideNavigationItem.vue) : ni registre, ni style inline.
 */
export interface SideNavigationContext {
  /**
   * Nom partagé par les <details> frères de ce niveau (attribut natif `name`,
   * Baseline 2024) : un seul ouvert à la fois, sans le moindre JS.
   * `undefined` = ouvertures multiples.
   */
  name: string | undefined
  /** Exclusivité demandée par la racine ; transmise pour en dériver les noms des sous-niveaux. */
  exclusive: boolean
  /** Chevron des branches repliées : nom d'icône, ou rendu explicite. */
  expandIcon: IconSource
  /** Chevron des branches dépliées ; `undefined` = rotation de `expandIcon`. */
  collapseIcon: IconSource | undefined
}

export const sideNavigationKey: InjectionKey<SideNavigationContext> = Symbol('v-side-navigation')
