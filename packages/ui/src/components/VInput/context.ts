/**
 * Limit inherited context to fields so nested panel buttons do not take the surrounding row's
 * dimensions.
 */

import type { InjectionKey } from 'vue'

import type { InputGroupSize } from './VInputGroup.vue'

export interface InputGroupContext {
  /** The height of the segments. */
  readonly size?: InputGroupSize
  /** The reduced density. */
  readonly compact?: boolean
  /** Whether the whole row is unusable, which no segment can refuse. */
  readonly disabled?: boolean
}

export const inputGroupKey: InjectionKey<InputGroupContext> = Symbol('v-input-group')
