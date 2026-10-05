/**
 * What the menu passes down to everything inside it. Choosing a command closes the whole menu,
 * however deep in a submenu it was, and closing the outermost panel is all it takes: the
 * submenus are rendered inside it, and the browser closes a stack of popovers from the outside
 * in.
 */

import type { InjectionKey } from 'vue'

export interface MenuContext {
  closeAll: () => void
}

export const menuKey: InjectionKey<MenuContext> = Symbol('v-menu')

/**
 * How long the pointer must rest on an item before its submenu opens, and how long it must stay
 * away before it closes, in milliseconds.
 */
export const SUBMENU_HOVER_DELAY = 150

// @a11y
/** Finds the element that opens a given panel. */
export function menuInvoker(id: string): HTMLElement | null {
  // @fallback
  /*
   * There the id is one we BUILD, so awkward characters can simply be dropped; here it is the
   * panel's real `id` attribute; a generated one, whose prefix the consumer can set through
   * `app.config.idPrefix`; and rewriting it would leave the selector looking for an element
   * that does not exist. Escaping the two characters able to close the quoted string is enough,
   * and it is deliberately not done with `CSS.escape`: jsdom provides no `CSS` object at all,
   * so that call would throw in every unit test.
   */
  return document.querySelector(`[popovertarget="${id.replace(/["\\]/g, '\\$&')}"]`)
}

/**
 * The anchor name tying a panel to the element that opens it, built from the panel id. Every
 * character a dashed ident cannot hold unescaped is encoded, underscore included, so two ids
 * cannot collide.
 */
export function menuAnchor(id: string): string {
  return `--menu-anchor-${id.replace(/[^A-Za-z0-9-]/gu, (char) => `_${char.codePointAt(0)!.toString(16)}_`)}`
}

/** The height of the rows: 32, 40 or 48 pixels. This is public API. */
export type MenuSize = 'sm' | 'md' | 'lg'

/** Where the menu itself may open, relative to its trigger. This is public API. */
export type MenuPlacement =
  'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end'

/**
 * The same list plus the sideways placement submenus use. It is internal: a submenu's
 * position is not the consumer's to choose.
 */
export type MenuPanelPlacement = MenuPlacement | 'right-start'
