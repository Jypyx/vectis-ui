/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VStepper',
      props: [
        { name: 'steps', type: 'StepperStep[]' },
        { name: 'orientation', type: 'StepperOrientation', values: "'horizontal' | 'vertical'", default: "'horizontal'" },
        { name: 'nonLinear', type: 'boolean', default: 'false' },
        { name: 'label', type: 'string' },
        { name: 'v-model', key: 'vModel', type: 'ItemValue' },
      ],
      slots: [
        { name: 'indicator', type: 'StepperIndicatorSlotProps' },
      ],
    },
  ],
  types: [
    {
      name: 'ItemValue',
      definition: `export type ItemValue = string | number`,
    },
    {
      name: 'StepperIndicatorSlotProps',
      definition: `export interface StepperIndicatorSlotProps {
  step: StepperStep
  index: number
  state: StepperStepState
}`,
    },
    {
      name: 'StepperStep',
      definition: `export interface StepperStep {
  value: ItemValue
  title: string
  description?: string
  error?: boolean
  completed?: boolean
  disabled?: boolean
}`,
    },
    {
      name: 'StepperStepState',
      definition: `export type StepperStepState = 'completed' | 'active' | 'error' | 'upcoming'`,
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-stepper-indicator', value: '2rem' },
    { name: '--vectis-control-size-stepper-connector-min', value: '1.5rem' },
  ],
} satisfies PageApi
