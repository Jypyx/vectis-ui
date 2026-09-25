import type { InjectionKey } from 'vue'

/**
 * Provided by a component that renders another with props it has ALREADY checked and
 * reported on: VDateInput for VDatePicker's bounds, VTimeInput for VTimePicker's step and
 * restrictions, both forwarded as they stand. The component inside then keeps those warnings
 * to itself. The consumer wrote the host, and a second copy of the same sentence under a
 * name they never typed is noise.
 *
 * A module of its own and not a line in `env.ts`: that one is in nearly every closure, where a
 * key only four components read added bytes to all of them.
 */
export const hostWarnsKey: InjectionKey<true> = Symbol('vectisHostWarns')
