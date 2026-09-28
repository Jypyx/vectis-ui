import type { InjectionKey } from 'vue'

/**
 * Provided by a component that renders another with props it has ALREADY checked and reported
 * on: VDateInput for VDatePicker's bounds, VTimeInput for VTimePicker's step and restrictions,
 * both forwarded as they stand.
 */
export const hostWarnsKey: InjectionKey<true> = Symbol('vectisHostWarns')
