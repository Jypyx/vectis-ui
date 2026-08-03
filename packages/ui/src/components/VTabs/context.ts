import type { InjectionKey } from 'vue'

import type { TabsActivation, TabsSize, TabsTone, TabsVariant } from './VTabs.vue'

/**
 * The VTabs → VTab / VTabPanel contract. The ids derive from a single `useId()` set
 * by the root: VTab and VTabPanel compute the same identifier from their `value`,
 * with no registry and no state exchange.
 *
 * `size`/`compact` travel through the injection (and not through CSS inheritance as
 * in VAccordion): every VTab renders a VButton, which sets `v-control[data-size]`
 * on its own element.
 */
export interface TabsContext {
  /** The selected value; undefined when the v-model references no tab. */
  readonly value: string | number | undefined
  select: (value: string | number) => void
  tabId: (value: string | number) => string
  panelId: (value: string | number) => string
  /** The #panels slot is provided: the tabs may set aria-controls. */
  readonly hasPanels: boolean
  readonly variant: TabsVariant
  readonly tone: TabsTone
  readonly size: TabsSize
  readonly compact: boolean
  readonly activation: TabsActivation
}

export const tabsKey: InjectionKey<TabsContext> = Symbol('v-tabs')

/**
 * `aria-controls` is a space-separated LIST of IDREFs: a value containing a blank
 * would reference two non-existent ids there. Characters hostile to selectors are
 * dropped along the way.
 */
const slug = (value: string | number) => String(value).replace(/[^\w-]+/g, '_')

export const tabIdFor = (base: string, value: string | number) => `${base}-tab-${slug(value)}`
export const panelIdFor = (base: string, value: string | number) => `${base}-panel-${slug(value)}`
