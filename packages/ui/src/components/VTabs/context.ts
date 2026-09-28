/**
 * Derive tab/panel IDs from a shared base and value for SSR consistency. Pass size through
 * context because child buttons declare their own size.
 */

import type { InjectionKey } from 'vue'

import type { TabsActivation, TabsSize, TabsTone, TabsVariant } from './VTabs.vue'
import type { ItemValue } from '../../types'

export interface TabsContext {
  /** The selected tab, or nothing when the v-model names no tab that exists. */
  readonly value: ItemValue | undefined
  /** Selects a tab. */
  select: (value: ItemValue) => void
  /** The identifier of a tab, so its panel can point at it. */
  tabId: (value: ItemValue) => string
  /** The identifier of a panel, so its tab can point at it. */
  panelId: (value: ItemValue) => string
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
  /** Whether every tab is unusable, which no tab can refuse. */
  readonly disabled: boolean
  /** Whether moving to a tab selects it, or merely focuses it. */
  readonly activation: TabsActivation
}

export const tabsKey: InjectionKey<TabsContext> = Symbol('v-tabs')

/**
 * Encode type and every non-safe character, including underscore, so different values cannot
 * collide in tab/panel IDs.
 */
const slug = (value: ItemValue) =>
  (typeof value === 'number' ? 'n-' : 's-') +
  String(value).replace(/[^A-Za-z0-9-]/gu, (char) => `_${char.codePointAt(0)!.toString(16)}_`)

export const tabIdFor = (base: string, value: ItemValue) => `${base}-tab-${slug(value)}`
export const panelIdFor = (base: string, value: ItemValue) => `${base}-panel-${slug(value)}`
