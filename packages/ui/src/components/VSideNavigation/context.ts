/** Share navigation behaviour only; CSS inheritance carries size, compact and branch depth. */

import type { InjectionKey } from 'vue'

import type { IconSource } from '../VIcon/types'

export interface SideNavigationContext {
  /**
   * The name shared by the collapsible sections of this level. Sections that share one
   * close each other, which the browser does entirely on its own. Nothing here means
   * several may stay open at once.
   */
  name: string | undefined
  /**
   * Whether the sidebar was asked for one-at-a-time behaviour. It is passed down so
   * that each level can mint a name of its own.
   */
  exclusive: boolean
  /** The chevron of a closed section: an icon name, or an explicit render. */
  expandIcon: IconSource
  /**
   * The chevron of an open section. Nothing here means the closed one is simply
   * rotated.
   */
  collapseIcon: IconSource | undefined
}

export const sideNavigationKey: InjectionKey<SideNavigationContext> = Symbol('v-side-navigation')
