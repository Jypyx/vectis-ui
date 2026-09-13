/**
 * What a VTabs passes down to the tabs and panels inside it.
 *
 * A tab and its panel have to know each other's identifier, since each names the
 * other for assistive technology. Rather than a registry they fill in as they mount,
 * both DERIVE that identifier from one generated base and their own `value` — so they
 * agree without ever exchanging anything, and the server and the browser produce the
 * same markup.
 *
 * The size travels through here rather than through CSS inheritance, as it does in
 * VAccordion, for a concrete reason: each tab renders a button that declares its own
 * size on itself, so an inherited value would never reach it.
 */

import type { InjectionKey } from 'vue'

import type { TabsActivation, TabsSize, TabsTone, TabsVariant } from './VTabs.vue'

export interface TabsContext {
  /** The selected tab, or nothing when the v-model names no tab that exists. */
  readonly value: string | number | undefined
  /** Selects a tab. */
  select: (value: string | number) => void
  /** The identifier of a tab, so its panel can point at it. */
  tabId: (value: string | number) => string
  /** The identifier of a panel, so its tab can point at it. */
  panelId: (value: string | number) => string
  /**
   * Whether panels were given at all. Without them the tabs are a bar of buttons and
   * must not claim to control anything.
   */
  readonly hasPanels: boolean
  /** The frame the bar is drawn in. */
  readonly variant: TabsVariant
  /** The colour the selected tab takes. */
  readonly tone: TabsTone
  /** The height of the tabs. */
  readonly size: TabsSize
  /** The reduced density. */
  readonly compact: boolean
  /** Whether moving to a tab selects it, or merely focuses it. */
  readonly activation: TabsActivation
}

export const tabsKey: InjectionKey<TabsContext> = Symbol('v-tabs')

/**
 * Makes a tab's value safe to use inside an identifier. The attribute tying a tab to
 * its panel holds a LIST of identifiers separated by spaces, so a value containing a
 * space would be read there as two references, both to elements that do not exist.
 *
 * TRAP — the encoding has to be INJECTIVE, or two tabs get one identifier and a tab
 * points its panel reference at its neighbour's panel, with no error anywhere. So every
 * character outside `[A-Za-z0-9-]` is spelled out as its code point between two
 * underscores (the underscore itself included, which is what keeps `a b` and `a_b`
 * apart), and the TYPE leads the result, the number 1 and the string "1" being two
 * different tabs.
 */
const slug = (value: string | number) =>
  (typeof value === 'number' ? 'n-' : 's-') +
  String(value).replace(/[^A-Za-z0-9-]/gu, (char) => `_${char.codePointAt(0)!.toString(16)}_`)

export const tabIdFor = (base: string, value: string | number) => `${base}-tab-${slug(value)}`
export const panelIdFor = (base: string, value: string | number) => `${base}-panel-${slug(value)}`
