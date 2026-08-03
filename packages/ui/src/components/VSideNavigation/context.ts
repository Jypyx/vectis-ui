import type { InjectionKey } from 'vue'

import type { IconSource } from '../VIcon/types'

/**
 * The level→level contract of VSideNavigation. Each `VSideNavigationItem` injects
 * the context of ITS level and provides a new one to its subitems: that is what
 * makes exclusivity local to a level rather than global.
 *
 * What deliberately does NOT travel here:
 * - `size`/`compact`, carried by the CSS inheritance of the `--control-*` (the
 *   `v-control` class is only set on the <nav>) — putting them here would be a second
 *   incarnation of the same information;
 * - the DEPTH, carried by the cascade (a CSS counter with two alternating names, see
 *   VSideNavigationItem.vue): no registry, no inline style.
 */
export interface SideNavigationContext {
  /**
   * Name shared by this level's sibling <details> (the native `name` attribute,
   * Baseline 2024): a single one open at a time, with no JS at all. `undefined` =
   * multiple open.
   */
  name: string | undefined
  /** Exclusivity requested by the root; passed on to derive the sublevel names. */
  exclusive: boolean
  /** Chevron of collapsed branches: an icon name, or an explicit render. */
  expandIcon: IconSource
  /** Chevron of expanded branches; `undefined` = a rotation of `expandIcon`. */
  collapseIcon: IconSource | undefined
}

export const sideNavigationKey: InjectionKey<SideNavigationContext> = Symbol('v-side-navigation')
