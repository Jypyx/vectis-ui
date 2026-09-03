/**
 * What a VButtonGroup passes down to the buttons it joins. A segmented control is one
 * object, so how it is drawn is a decision that belongs to the row rather than to each
 * of its segments, and the group announces it once instead of the writer repeating the
 * same four props on every child.
 *
 * The arbitration is deliberately NOT symmetric:
 *
 * - `variant`, `size`, `compact` and `elevated` are the SHAPE of the control, and the
 *   group wins. A segment of another height, silhouette or elevation no longer lines up
 *   with its neighbours, and the merged border and shared corners stop reading as a
 *   single object (`group?.x ?? props.x`).
 * - `tone` is meaning rather than shape, so the button wins. One action in a row can be
 *   the destructive one, and the row has to be able to say so (`props.tone ?? group.tone
 *   ?? 'accent'`).
 *
 * Everything is exposed through getters, which is what keeps the group's props reactive
 * on the other side of the injection. Every member is optional: a group that sets none of
 * them provides `undefined` throughout, which `??` hands straight back to the child's own
 * prop, so a bare VButtonGroup changes nothing about what it contains. That is also what
 * makes a NESTED group shadow the outer one, VToggle rendering a VButtonGroup of its own.
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
}

export const buttonGroupKey: InjectionKey<ButtonGroupContext> = Symbol('v-button-group')
