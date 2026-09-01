/**
 * What each level of a VSideNavigation passes down to the level below it. An item
 * reads the context of ITS level and provides a fresh one to its own children, and
 * that renewal is precisely what keeps "only one section open at a time" local to a
 * level rather than global to the whole sidebar.
 *
 * Two things deliberately do NOT travel through here:
 *
 * - the size and the density, which the CSS variables carry by inheritance from the
 *   nav down; passing them here as well would be the same information in two places,
 *   free to disagree;
 * - the DEPTH of an item, which is counted by the cascade itself (see the alternating
 *   variables in VSideNavigationItem) — no registry, and no inline style.
 */

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
