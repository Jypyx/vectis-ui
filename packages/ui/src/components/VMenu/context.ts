import type { InjectionKey } from 'vue'

/**
 * The root→descendants contract: selecting an item (even inside a submenu) closes
 * the WHOLE stack. Closing the root panel is enough: the subpanels are its DOM
 * descendants, and the popover closes them in cascade.
 */
export interface MenuContext {
  closeAll: () => void
}

export const menuKey: InjectionKey<MenuContext> = Symbol('v-menu')

/** Hover intent delay (ms) before a submenu opens or closes. */
export const SUBMENU_HOVER_DELAY = 150

// @a11y
/**
 * The element invoking the panel `id` — that is, its implicit anchor and the target
 * of the focus return on closing. Found by DOM query rather than through a ref: a
 * root panel's invoker lives in the consumer's #trigger slot, out of the panel's
 * reach.
 */
export function menuInvoker(id: string): HTMLElement | null {
  // @fallback
  /*
   * The id is ESCAPED, not slugged like VTabs': there the id is BUILT, so hostile
   * characters can be dropped; here it is the panel's real `id` attribute (a
   * `useId()`, whose prefix the consumer sets through `app.config.idPrefix`), and
   * rewriting it would stop the selector matching the element it names.
   *
   * Escaping the two characters that can close the quoted attribute string is
   * enough, and it is deliberately NOT `CSS.escape`: jsdom implements no `CSS`
   * object at all, so that call is a ReferenceError in every unit test.
   */
  return document.querySelector(`[popovertarget="${id.replace(/["\\]/g, '\\$&')}"]`)
}

/** Placements of the root panel (VMenu's public API). */
export type MenuPlacement =
  'bottom-start' | 'bottom-end' | 'bottom' | 'top-start' | 'top-end' | 'top'

/** Internal placements: submenus open sideways. */
export type MenuPanelPlacement = MenuPlacement | 'right-start'
