import type { InjectionKey } from 'vue'

/** Contrat parent→items : un item sélectionné demande la fermeture du menu. */
export interface DropdownMenuContext {
  close: () => void
}

export const dropdownMenuKey: InjectionKey<DropdownMenuContext> = Symbol('ds-dropdown-menu')
