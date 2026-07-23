import type { InjectionKey } from 'vue'

/**
 * Contrat racine→descendants : la sélection d'un item (même dans un sous-menu)
 * ferme TOUTE la pile. Fermer le panneau racine suffit : les sous-panneaux
 * sont ses descendants DOM, le popover les ferme en cascade.
 */
export interface DropdownContext {
  closeAll: () => void
}

export const dropdownKey: InjectionKey<DropdownContext> = Symbol('ds-dropdown')

/** Délai d'intention (ms) avant ouverture/fermeture d'un sous-menu au survol. */
export const SUBMENU_HOVER_DELAY = 150

/** Placements du panneau racine (API publique de Dropdown). */
export type DropdownPlacement =
  'bottom-start' | 'bottom-end' | 'bottom' | 'top-start' | 'top-end' | 'top'

/** Placements internes : les sous-menus s'ouvrent latéralement. */
export type DropdownPanelPlacement = DropdownPlacement | 'right-start'
