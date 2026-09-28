/**
 * Group shape wins; each button may override tone. Disabled is cumulative so no child can
 * reactivate a disabled row.
 */

import type { InjectionKey } from 'vue'

import type { ButtonSize, ButtonTone, ButtonVariant } from './VButton.vue'

export interface ButtonGroupContext {
  /** How much visual weight every segment carries. */
  readonly variant?: ButtonVariant
  /** The colour a segment takes unless it names one of its own. */
  readonly tone?: ButtonTone
  /** The height of the segments. */
  readonly size?: ButtonSize
  /** The reduced density. */
  readonly compact?: boolean
  /** Whether the segments are raised off the page. */
  readonly elevated?: boolean
  /** Whether the whole row is unusable, which no segment can refuse. */
  readonly disabled?: boolean
}

export const buttonGroupKey: InjectionKey<ButtonGroupContext> = Symbol('v-button-group')

/**
 * The empty context a component provides to stop a row's at its own boundary. Every member
 * being `undefined`, `??` and `||` hand each button below it back its own prop.
 */
export const NO_BUTTON_GROUP: ButtonGroupContext = Object.freeze({})
