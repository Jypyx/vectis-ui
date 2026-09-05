/**
 * What a VInputGroup passes down to the fields it joins. A joined row is one object, so the
 * shape of the controls in it is a decision that belongs to the row rather than to each of
 * its segments, and the group announces it once instead of the writer repeating the same
 * props on every child.
 *
 * The arbitration follows VButtonGroup's, minus the tone — a field has none:
 *
 * - `size` and `compact` are the SHAPE of the control, and the group wins. A segment of
 *   another height no longer lines up with its neighbours, and the merged border stops
 *   reading as a single object (`group?.x ?? props.x`).
 * - `disabled` is read as an OR (`group?.disabled || props.disabled`). The two answers are
 *   cumulative: a row switched off cannot have one of its segments opt back in, and a
 *   segment disabled on its own is not revived by a row that says nothing.
 *
 * Everything is exposed through getters, which is what keeps the group's props reactive on
 * the other side of the injection. Every member is optional: a group that sets none of them
 * provides `undefined` throughout, which `??` hands straight back to the child's own prop.
 *
 * A composed field resolves this twice — once for itself, once inside the VInput it renders
 * — and that is harmless: `group?.size ?? (group?.size ?? props.size)` is the first term
 * whenever the group names one, and the child's prop otherwise. The redundancy even helps, a
 * composed field that forgot to resolve still following the row through its inner VInput.
 *
 * TRAP — this key is injected in DEPTH, not only into direct children. It carries only what
 * a FIELD reads, never what a button would: the buttons of a floating panel are inside a
 * segment's subtree and would otherwise take the row's size. See `NO_BUTTON_GROUP`, which
 * VDateInput and VTimeInput provide for exactly that reason.
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
