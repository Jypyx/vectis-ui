import type { InjectionKey } from 'vue'

/**
 * Contrat parent→items : le nom partagé posé sur chaque <details> active le
 * mode exclusif NATIF (attribut `name`, Baseline 2024) — un seul item ouvert,
 * sans le moindre JS.
 */
export interface AccordionContext {
  /** Nom de groupe pour <details name> ; undefined = ouvertures multiples. */
  name: string | undefined
}

export const accordionKey: InjectionKey<AccordionContext> = Symbol('ds-accordion')
