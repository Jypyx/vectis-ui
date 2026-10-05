<script setup lang="ts">
// @a11y @core
/**
 * An ordered list of the steps of a process, the current one marked with `aria-current="step"`.
 * It only shows where the reader stands: the content of each step is the consumer's, rendered
 * from the same model. Steps the reader may go back to are buttons; the others are plain text.
 */
import { computed, ref, watch } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { check as checkIcon } from '../VIcon/icons/check'
import { priority_high as priorityHighIcon } from '../VIcon/icons/priority_high'
import type { ItemValue } from '../../types'
import { useMessages } from '../../i18n/state'

/** Whether the steps run across or down. */
export type StepperOrientation = 'horizontal' | 'vertical'

/** How a step is drawn: done, current, in error, or still ahead. */
export type StepperStepState = 'completed' | 'active' | 'error' | 'upcoming'

/** One step of the process. */
export interface StepperStep {
  /** What the model holds while this step is current. */
  value: ItemValue
  /** The name of the step. */
  title: string
  /** A line under the title. */
  description?: string
  /** Marks the step as having a problem to fix. It wins over every other state. */
  error?: boolean
  /**
   * Whether the step is done. Left out, the steps before the current one are done and the others
   * are not.
   */
  completed?: boolean
  /** Takes the step out of reach: it is never a button. */
  disabled?: boolean
}

/** What the `#indicator` slot receives. */
export interface StepperIndicatorSlotProps {
  step: StepperStep
  /** The position of the step, from 0. */
  index: number
  state: StepperStepState
}

interface StepperProps {
  /** The steps, in order. */
  steps: StepperStep[]
  /** Whether the steps run across or down. */
  orientation?: StepperOrientation
  /**
   * Makes every step that is not disabled a button. By default only the steps already reached
   * are: the reader goes back freely, and forward only as far as they have been.
   */
  nonLinear?: boolean
  /**
   * What screen readers announce for the list of steps. It falls back to the design system
   * dictionary.
   */
  label?: string
}

const props = withDefaults(defineProps<StepperProps>(), {
  orientation: 'horizontal',
  nonLinear: false,
  label: undefined,
})

/** The value of the current step. Left out or unknown, the first step is current. */
const model = defineModel<ItemValue>()

defineSlots<{
  /** Replaces what the circle of a step shows: its number, a tick or an exclamation mark. */
  indicator?(props: StepperIndicatorSlotProps): unknown
}>()

const m = useMessages()
const resolvedLabel = computed(() => props.label ?? m.value.stepper.label)

const activeIndex = computed(() =>
  Math.max(
    0,
    props.steps.findIndex((step) => step.value === model.value),
  ),
)

// The furthest step reached so far: going back to the first step leaves the later ones open.
const furthest = ref(activeIndex.value)
watch(activeIndex, (index) => {
  furthest.value = Math.max(furthest.value, index)
})

const states = computed<StepperStepState[]>(() =>
  props.steps.map((step, index) => {
    if (step.error) return 'error'
    if (index === activeIndex.value) return 'active'
    return (step.completed ?? index < activeIndex.value) ? 'completed' : 'upcoming'
  }),
)

function reachable(step: StepperStep, index: number) {
  if (step.disabled) return false
  return props.nonLinear || index <= Math.max(furthest.value, activeIndex.value)
}

function select(step: StepperStep) {
  model.value = step.value
}
</script>

<template>
  <ol class="v-stepper" :data-orientation="orientation" :aria-label="resolvedLabel">
    <li
      v-for="(step, index) in steps"
      :key="step.value"
      class="v-stepper-step"
      :data-state="states[index]"
      :data-active="index === activeIndex ? '' : undefined"
      :data-disabled="step.disabled ? '' : undefined"
    >
      <component
        :is="reachable(step, index) ? 'button' : 'span'"
        :type="reachable(step, index) ? 'button' : undefined"
        class="v-stepper-trigger"
        :aria-current="index === activeIndex ? 'step' : undefined"
        @click="reachable(step, index) && select(step)"
      >
        <span class="v-stepper-indicator" aria-hidden="true">
          <slot name="indicator" :step="step" :index="index" :state="states[index]!">
            <VIcon v-if="states[index] === 'completed'" :name="checkIcon" />
            <VIcon v-else-if="states[index] === 'error'" :name="priorityHighIcon" />
            <template v-else>{{ index + 1 }}</template>
          </slot>
        </span>
        <span class="v-stepper-text">
          <span class="v-stepper-title">{{ step.title }}</span>
          <span v-if="step.description" class="v-stepper-description">
            {{ step.description }}
          </span>
          <!-- The tick and the exclamation mark are hidden: their meaning is said in words. -->
          <span v-if="states[index] === 'completed'" class="v-visually-hidden">
            {{ m.stepper.completed }}
          </span>
          <span v-else-if="states[index] === 'error'" class="v-visually-hidden">
            {{ m.stepper.error }}
          </span>
        </span>
      </component>
      <span v-if="index < steps.length - 1" class="v-stepper-connector" aria-hidden="true" />
    </li>
  </ol>
</template>

<style>
@layer vectis.components {
  .v-stepper {
    display: flex;
    margin: 0;
    padding: 0;
    list-style: none;
    font-family: var(--vectis-text-family);
  }

  /*
   * A horizontal stepper is a size container, which is what lets it shorten its labels below a
   * width. It therefore takes its width from its parent, never from its steps: in a row, give it
   * a `flex` basis of its own.
   */
  .v-stepper[data-orientation='horizontal'] {
    container-type: inline-size;
    container-name: v-stepper;
    align-items: center;
    gap: var(--vectis-space-2);
  }

  .v-stepper[data-orientation='vertical'] {
    flex-direction: column;
  }

  .v-stepper-step {
    display: flex;
    min-inline-size: 0;
  }

  .v-stepper[data-orientation='horizontal'] > .v-stepper-step {
    flex: 1 1 auto;
    align-items: center;
    gap: var(--vectis-space-2);
  }

  .v-stepper[data-orientation='horizontal'] > .v-stepper-step:last-child {
    flex: none;
  }

  .v-stepper[data-orientation='vertical'] > .v-stepper-step {
    flex-direction: column;
  }

  /* The circle is centred on the text beside it, a title alone or with its description. */
  .v-stepper-trigger {
    display: inline-flex;
    align-items: center;
    gap: var(--vectis-space-3);
    min-inline-size: 0;
    padding: var(--vectis-space-1);
    border: none;
    border-radius: var(--vectis-radius-interactive);
    background: none;
    color: inherit;
    font: inherit;
    text-align: start;
  }

  button.v-stepper-trigger {
    cursor: pointer;
  }

  button.v-stepper-trigger:hover {
    background: var(--vectis-color-surface-muted);
  }

  button.v-stepper-trigger:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  .v-stepper-indicator {
    --vectis-icon-size: var(--vectis-icon-size-md);

    display: grid;
    flex: none;
    place-items: center;
    inline-size: var(--vectis-control-size-stepper-indicator);
    block-size: var(--vectis-control-size-stepper-indicator);
    border: 1px solid var(--vectis-color-border-strong);
    border-radius: var(--vectis-radius-full);
    color: var(--vectis-color-text-muted);
    font-size: var(--vectis-text-label-size);
    font-weight: var(--vectis-text-label-weight);
    line-height: var(--vectis-text-label-leading);
    font-variant-numeric: tabular-nums;
  }

  .v-stepper-text {
    display: flex;
    flex-direction: column;
    min-inline-size: 0;
  }

  .v-stepper-title {
    color: var(--vectis-color-text-muted);
    font-size: var(--vectis-text-label-size);
    font-weight: var(--vectis-text-label-weight);
    line-height: var(--vectis-text-label-leading);
  }

  .v-stepper-description {
    color: var(--vectis-color-text-muted);
    font-size: var(--vectis-text-caption-size);
    font-weight: var(--vectis-text-caption-weight);
    line-height: var(--vectis-text-caption-leading);
  }

  .v-stepper-step:is([data-state='active'], [data-state='completed']) .v-stepper-title {
    color: var(--vectis-color-text);
  }

  .v-stepper-step[data-state='active'] .v-stepper-indicator {
    border-color: var(--vectis-color-accent);
    background: var(--vectis-color-accent);
    color: var(--vectis-color-text-on-accent);
  }

  .v-stepper-step[data-state='completed'] .v-stepper-indicator {
    border-color: var(--vectis-color-accent-border);
    background: var(--vectis-color-accent-surface);
    color: var(--vectis-color-accent-text);
  }

  .v-stepper-step[data-state='error'] .v-stepper-indicator {
    border-color: var(--vectis-color-danger);
    background: var(--vectis-color-danger);
    color: var(--vectis-color-text-on-accent);
  }

  .v-stepper-step[data-state='error'] .v-stepper-title {
    color: var(--vectis-color-danger-text);
  }

  /* Last of the colour rules, so that a disabled step reads as such whatever its state. */
  .v-stepper-step[data-disabled] .v-stepper-title,
  .v-stepper-step[data-disabled] .v-stepper-indicator {
    color: var(--vectis-color-text-subtle);
  }

  /* A border rather than a fill draws the line, which forced colours keep. */
  .v-stepper-connector {
    --stepper-connector-color: var(--vectis-color-border);

    flex: 1 1 var(--vectis-control-size-stepper-connector-min);
  }

  /* The line leaving a step that is done is drawn in the accent: the path walked so far. */
  .v-stepper-step[data-state='completed'] > .v-stepper-connector {
    --stepper-connector-color: var(--vectis-color-accent);
  }

  .v-stepper[data-orientation='horizontal'] .v-stepper-connector {
    min-inline-size: var(--vectis-control-size-stepper-connector-min);
    border-block-start: 1px solid var(--stepper-connector-color);
  }

  /* Down the indicator's centre, from one circle to the next. */
  .v-stepper[data-orientation='vertical'] .v-stepper-connector {
    min-block-size: var(--vectis-control-size-stepper-connector-min);
    border-inline-start: 1px solid var(--stepper-connector-color);
    margin-block: var(--vectis-space-1);
    margin-inline-start: calc(
      var(--vectis-space-1) + var(--vectis-control-size-stepper-indicator) / 2
    );
  }

  /*
   * Below this width, only the current step keeps its title on screen; the others keep their
   * circles, and their titles stay readable by assistive technology. The threshold is a literal,
   * a container query accepting no variables: about four steps with short titles fit above it.
   */
  @container v-stepper (max-width: 36rem) {
    .v-stepper-step:not([data-active]) .v-stepper-text {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  }

  /* The fills are dropped: the current step keeps a ring of its own. */
  @media (forced-colors: active) {
    .v-stepper-step[data-active] .v-stepper-indicator {
      outline: 1px solid Highlight;
      outline-offset: 1px;
    }
  }
}
</style>
