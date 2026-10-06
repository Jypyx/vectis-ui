/**
 * Panels register what the group needs when it measures and moves them: their element, their
 * limits and their collapsed model. Positions come from the group, which clones each panel's
 * VNode with its `index` while rendering.
 */

import type { InjectionKey } from 'vue'

import type { ResizableOrientation, ResizableLength } from './VResizable.vue'

export interface ResizablePanelEntry {
  /** Which panel this is among its siblings. */
  readonly index: number
  readonly el: HTMLElement | null
  readonly minSize: ResizableLength
  readonly maxSize: ResizableLength | undefined
  readonly collapsible: boolean
  readonly collapsedSize: ResizableLength
  readonly collapsed: boolean
  /** Writes the panel's collapsed model on behalf of the group. */
  setCollapsed: (value: boolean) => void
}

export interface ResizableContext {
  readonly orientation: ResizableOrientation
  /** The size of a panel in percent, used as its `flex-grow` weight. */
  sizeAt: (index: number) => number
  register: (id: string, entry: ResizablePanelEntry) => void
  unregister: (id: string) => void
  /** Collapses or reopens a panel whose collapsed model was changed from outside the group. */
  toggle: (index: number, collapsed: boolean) => void
}

export const resizableKey: InjectionKey<ResizableContext> = Symbol('v-resizable')
