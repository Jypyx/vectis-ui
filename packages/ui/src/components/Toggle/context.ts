import type { InjectionKey } from 'vue'

import type { ToggleSize, ToggleTone, ToggleValue, ToggleVariant } from './Toggle.vue'

/**
 * Contrat Toggle → ToggleItem. Getters : les props de la racine restent
 * réactives à travers l'injection (modèle Tabs). Pas d'ids ni de registre :
 * aucun aria-controls dans ce pattern, et la sélection est une pure
 * comparaison de valeurs — déterministe SSR/client.
 *
 * `isSelected` plutôt qu'un getter `value` brut : en `multiple` la comparaison
 * n'est pas une égalité simple, elle doit vivre côté racine.
 *
 * `size`/`compact` transitent par l'injection (et non par héritage CSS comme
 * dans Accordion) : chaque ToggleItem rend un Button, qui pose lui-même
 * `ds-control[data-size]` sur son propre élément.
 */
export interface ToggleContext {
  isSelected: (value: ToggleValue) => boolean
  select: (value: ToggleValue) => void
  readonly variant: ToggleVariant
  readonly tone: ToggleTone
  readonly size: ToggleSize
  readonly compact: boolean
  readonly disabled: boolean
  readonly selectedIconFilled: boolean
}

export const toggleKey: InjectionKey<ToggleContext> = Symbol('ds-toggle')
