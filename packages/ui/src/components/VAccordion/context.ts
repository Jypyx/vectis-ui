import type { InjectionKey } from 'vue'

import type { IconSource } from '../VIcon/types'

/**
 * Contrat parent→items : le nom partagé posé sur chaque <details> active le
 * mode exclusif NATIF (attribut `name`, Baseline 2024) — un seul item ouvert,
 * sans le moindre JS. Les icônes sont posées sur le groupe (densité et
 * iconographie homogènes) ; `compact` ne transite PAS ici, il descend par
 * héritage CSS (variables --accordion-* posées sur la racine).
 */
export interface AccordionContext {
  /** Nom de groupe pour <details name> ; undefined = ouvertures multiples. */
  name: string | undefined
  /** Icône à l'état fermé : nom d'icône, ou rendu explicite. */
  expandIcon: IconSource
  /** Icône à l'état ouvert ; undefined = rotation de `expandIcon`. */
  collapseIcon: IconSource | undefined
}

export const accordionKey: InjectionKey<AccordionContext> = Symbol('v-accordion')
