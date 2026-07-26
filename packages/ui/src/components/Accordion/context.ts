import type { InjectionKey } from 'vue'

/**
 * Contrat parent→items : le nom partagé posé sur chaque <details> active le
 * mode exclusif NATIF (attribut `name`, Baseline 2024) — un seul item ouvert,
 * sans le moindre JS. Les icônes sont posées sur le groupe (densité et
 * iconographie homogènes) ; `compact` ne transite PAS ici, il descend par
 * héritage CSS (variables --_accordion-* posées sur la racine).
 */
export interface AccordionContext {
  /** Nom de groupe pour <details name> ; undefined = ouvertures multiples. */
  name: string | undefined
  /** Icône à l'état fermé : ligature Material ou URL. */
  expandIcon: string
  /** Icône à l'état ouvert ; undefined = rotation de `expandIcon`. */
  collapseIcon: string | undefined
}

export const accordionKey: InjectionKey<AccordionContext> = Symbol('ds-accordion')
