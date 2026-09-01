/**
 * What the menu passes down to everything inside it. Choosing a command closes the
 * WHOLE menu, however deep in a submenu it was, and closing the outermost panel is
 * all it takes: the submenus are rendered inside it, and the browser closes a stack
 * of popovers from the outside in.
 */

import type { InjectionKey } from 'vue'

export interface MenuContext {
  closeAll: () => void
}

export const menuKey: InjectionKey<MenuContext> = Symbol('v-menu')

/**
 * How long the pointer must rest on an item before its submenu opens, and how long it
 * must stay away before it closes, in milliseconds. The wait is what stops every
 * panel crossed on the way elsewhere from flashing open.
 */
export const SUBMENU_HOVER_DELAY = 150

// @a11y
/**
 * Finds the element that opens a given panel — which is both what the panel positions
 * itself against and where the focus must return when it closes.
 *
 * It is found by searching the document rather than kept as a reference, because the
 * outermost panel's trigger is rendered by the consumer, in a slot the panel has no
 * access to.
 */
export function menuInvoker(id: string): HTMLElement | null {
  // @fallback
  /*
   * The id is ESCAPED rather than cleaned up the way VTabs does it. There the id is
   * one we BUILD, so awkward characters can simply be dropped; here it is the panel's
   * real `id` attribute — a generated one, whose prefix the consumer can set through
   * `app.config.idPrefix` — and rewriting it would leave the selector looking for an
   * element that does not exist.
   *
   * Escaping the two characters able to close the quoted string is enough, and it is
   * deliberately NOT done with `CSS.escape`: jsdom provides no `CSS` object at all, so
   * that call would throw in every unit test.
   */
  return document.querySelector(`[popovertarget="${id.replace(/["\\]/g, '\\$&')}"]`)
}

/** Where the menu itself may open, relative to its trigger. This is public API. */
export type MenuPlacement =
  'bottom-start' | 'bottom-end' | 'bottom' | 'top-start' | 'top-end' | 'top'

/**
 * The same list plus the sideways placement submenus use. It is internal: a submenu's
 * position is not the consumer's to choose.
 */
export type MenuPanelPlacement = MenuPlacement | 'right-start'
