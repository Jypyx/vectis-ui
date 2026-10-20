<script setup lang="ts">
// @a11y
/**
 * Several measurements sharing one range, drawn as the parts of a single bar. ARIA has no meter
 * holding several values, so the bar is decorative and the legend, a list of labels and values in
 * text, carries the reading; the root is a group named by the label.
 */
import { computed, useId } from 'vue'

import { useAriaLabel, useLabelledBy } from '../../composables/useAriaLabel'
import { useLocale, useMessages } from '../../i18n/state'
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'

/** The colour of a part. */
export type MeterGroupTone = 'accent' | 'neutral' | 'success' | 'warning' | 'danger'

/** The thickness of the bar: 2, 4, 8, 12 or 20 pixels. */
export type MeterGroupSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/** Which way the bar fills. */
export type MeterGroupOrientation = 'horizontal' | 'vertical'

/** One part of the bar and its row in the legend. */
export interface MeterGroupItem {
  /** What the part is, written in the legend. */
  label: string
  /** Its amount, on the scale of `max`. A negative amount or one that is not a number counts as zero. */
  value: number
  /** Its colour. Without `tone` or `color`, a hue is derived from the part's position. */
  tone?: MeterGroupTone
  /** A colour of your own (hex, CSS name or `oklch()`), which replaces the tone. */
  color?: string
  /** An icon in the legend, in place of the colour swatch. */
  icon?: IconSource
}

/** What the item slots receive. */
export interface MeterGroupItemSlotProps {
  item: MeterGroupItem
  index: number
  /** The part's amount as a percentage of `max`, unrounded. */
  percent: number
}

/** What the value slot receives. */
export interface MeterGroupValueSlotProps {
  /** The sum of the amounts. */
  value: number
  /** The bound. */
  max: number
  /** The sum as a percentage of `max`, at most 100 and unrounded. */
  percent: number
}

interface MeterGroupProps {
  /** The parts, in the order they fill the bar. */
  items?: MeterGroupItem[]
  /**
   * The total the amounts are measured against. When they add up to more, the parts share the
   * whole bar in proportion.
   */
  max?: number
  /**
   * What is measured, shown above the bar and naming the group for screen readers. Without it,
   * the group is named from the design system dictionary; an `aria-label` or `aria-labelledby` of
   * your own takes precedence.
   */
  label?: string
  /** Hides the label visually. It still names the group for screen readers. */
  hideLabel?: boolean
  /** Writes the sum of the amounts after the label. */
  showValue?: boolean
  /** The sum as written, such as "96 GB of 128 GB". It replaces the formatted sum. */
  valueText?: string
  /**
   * Formats the sum and every amount for the current locale, such as a unit or a currency.
   * Without it, they are written as percentages of `max`.
   */
  formatOptions?: Intl.NumberFormatOptions
  /** Hides the legend visually. Screen readers still read it, the bar itself being silent. */
  hideLegend?: boolean
  /** The thickness of the bar. */
  size?: MeterGroupSize
  /**
   * Turns the bar upright, filling from the bottom up, with the legend beside it. Its length is
   * then a height set on the component.
   */
  orientation?: MeterGroupOrientation
}

const props = withDefaults(defineProps<MeterGroupProps>(), {
  items: () => [],
  max: 100,
  label: undefined,
  hideLabel: false,
  showValue: false,
  valueText: undefined,
  formatOptions: undefined,
  hideLegend: false,
  size: 'md',
  orientation: 'horizontal',
})

defineSlots<{
  /** What to write after the label instead of the formatted sum. */
  value?(props: MeterGroupValueSlotProps): unknown
  /** What to put before a legend row's label instead of its swatch or icon. It is decorative and hidden from screen readers. */
  'item-leading'?(props: MeterGroupItemSlotProps): unknown
  /** What to write instead of a legend row's label. */
  'item-label'?(props: MeterGroupItemSlotProps): unknown
  /** What to write instead of a legend row's formatted amount. */
  'item-value'?(props: MeterGroupItemSlotProps): unknown
}>()

const m = useMessages()
const locale = useLocale()
const labelId = useId()

const amounts = computed(() =>
  props.items.map(({ value }) => (Number.isFinite(value) ? Math.max(value, 0) : 0)),
)
const bound = computed(() => (Number.isFinite(props.max) ? Math.max(props.max, 0) : 100))
const sum = computed(() => amounts.value.reduce((total, amount) => total + amount, 0))
// The parts share the larger of the bound and the sum, so an overflow shrinks them all alike.
const scale = computed(() => Math.max(sum.value, bound.value) || 1)

const percentOf = (amount: number) => (bound.value > 0 ? (amount / bound.value) * 100 : 0)
const totalPercent = computed(() => Math.min(percentOf(sum.value), 100))

const format = (amount: number, percent: number) =>
  props.formatOptions
    ? new Intl.NumberFormat(locale.value, props.formatOptions).format(amount)
    : m.value.progress.percent(Math.round(percent))

const totalText = computed(() => props.valueText ?? format(sum.value, totalPercent.value))
const remainder = computed(() => 1 - sum.value / scale.value)

/** The tone and colour attributes a part shares with its legend swatch. */
const colourOf = (item: MeterGroupItem, index: number) => ({
  'data-tone': item.tone ?? 'accent',
  'data-custom': item.color !== undefined ? '' : undefined,
  'data-derived': item.tone === undefined && item.color === undefined ? '' : undefined,
  style: { '--custom-color': item.color, '--meter-group-index': String(index) },
})

const ariaLabel = useAriaLabel(() => (props.label ? undefined : m.value.meterGroup.label))
const labelledBy = useLabelledBy(labelId, () => props.label)
</script>

<template>
  <div
    class="v-meter-group"
    role="group"
    :aria-labelledby="labelledBy"
    :aria-label="ariaLabel"
    :data-size="size"
    :data-orientation="orientation"
  >
    <div v-if="(label && !hideLabel) || showValue" class="v-meter-group-header">
      <span v-if="label && !hideLabel" :id="labelId" class="v-meter-group-label">{{ label }}</span>
      <span v-if="showValue" class="v-meter-group-value">
        <slot name="value" :value="sum" :max="bound" :percent="totalPercent">{{ totalText }}</slot>
      </span>
    </div>
    <span v-if="label && hideLabel" :id="labelId" class="v-visually-hidden">{{ label }}</span>
    <div class="v-meter-group-body">
      <div class="v-meter-group-track v-tone" data-tone="neutral" aria-hidden="true">
        <template v-for="(item, index) in items" :key="index">
          <span
            v-if="amounts[index]! > 0"
            class="v-meter-group-part v-tone"
            v-bind="colourOf(item, index)"
            :style="{ '--meter-group-share': String(amounts[index]! / scale) }"
          />
        </template>
        <span
          v-if="remainder > 0"
          class="v-meter-group-rest"
          :style="{ '--meter-group-share': String(remainder) }"
        />
      </div>
      <ul class="v-meter-group-legend" :class="{ 'v-visually-hidden': hideLegend }">
        <li v-for="(item, index) in items" :key="index" class="v-meter-group-item">
          <span
            class="v-meter-group-leading v-tone"
            v-bind="colourOf(item, index)"
            aria-hidden="true"
          >
            <slot
              name="item-leading"
              :item="item"
              :index="index"
              :percent="percentOf(amounts[index]!)"
            >
              <VIcon v-if="item.icon" v-bind="iconProps(item.icon)" />
              <span v-else class="v-meter-group-swatch" />
            </slot>
          </span>
          <span class="v-meter-group-item-label">
            <slot
              name="item-label"
              :item="item"
              :index="index"
              :percent="percentOf(amounts[index]!)"
            >
              {{ item.label }}
            </slot>
          </span>
          <!-- Separates the label from the amount in what screen readers read. -->
          {{ ' ' }}
          <span class="v-meter-group-item-value">
            <slot
              name="item-value"
              :item="item"
              :index="index"
              :percent="percentOf(amounts[index]!)"
            >
              {{ format(amounts[index]!, percentOf(amounts[index]!)) }}
            </slot>
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style>
@layer vectis.components {
  .v-meter-group {
    --meter-group-thickness: var(--vectis-control-size-bar-thickness-md);
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-1);
    min-inline-size: 0;
    font-family: var(--vectis-text-family);
  }

  .v-meter-group[data-size='xs'] {
    --meter-group-thickness: var(--vectis-control-size-bar-thickness-xs);
  }

  .v-meter-group[data-size='sm'] {
    --meter-group-thickness: var(--vectis-control-size-bar-thickness-sm);
  }

  .v-meter-group[data-size='lg'] {
    --meter-group-thickness: var(--vectis-control-size-bar-thickness-lg);
  }

  .v-meter-group[data-size='xl'] {
    --meter-group-thickness: var(--vectis-control-size-bar-thickness-xl);
  }

  .v-meter-group-header {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    column-gap: var(--vectis-space-2);
  }

  .v-meter-group-label {
    color: var(--vectis-color-text);
    font-size: var(--vectis-text-label-size);
    font-weight: var(--vectis-text-label-weight);
    line-height: var(--vectis-text-label-leading);
  }

  /* Pushed to the end even without a label before it. */
  .v-meter-group-value {
    margin-inline-start: auto;
    color: var(--vectis-color-text-muted);
    font-size: var(--vectis-text-body-md-size);
    font-weight: var(--vectis-text-body-md-weight);
    line-height: var(--vectis-text-body-md-leading);
    font-variant-numeric: tabular-nums;
  }

  .v-meter-group-body {
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-2);
  }

  /* The track is the neutral tone's soft background; the parts paint their own tone over it. */
  .v-meter-group-track {
    display: flex;
    block-size: var(--meter-group-thickness);
    overflow: hidden;
    border-radius: var(--vectis-radius-pill);
    background: var(--tone-bg-soft);
  }

  /*
   * Grown from a zero basis in proportion to their share, the parts and the empty rest divide the
   * track, and whatever gaps forced colours add, so the parts stay in exact proportion.
   */
  .v-meter-group-part,
  .v-meter-group-rest {
    flex: var(--meter-group-share) 1 0;
    min-inline-size: 0;
    transition: flex-grow var(--vectis-duration-base) var(--vectis-ease-default);
  }

  /*
   * A part with no tone or colour of its own turns the accent's hue by the golden angle for each
   * position, which keeps neighbouring hues apart for any number of parts; the first is the accent
   * itself. Lightness and chroma stay the accent's, so the parts follow the theme.
   */
  .v-meter-group-part,
  .v-meter-group-leading {
    --meter-group-colour: var(--tone-bg-solid);
  }

  .v-meter-group-part[data-derived],
  .v-meter-group-leading[data-derived] {
    --meter-group-colour: oklch(
      from var(--tone-bg-solid) l c calc(h + var(--meter-group-index) * 137.508)
    );
  }

  .v-meter-group-part {
    background: var(--meter-group-colour);
  }

  .v-meter-group-legend {
    display: flex;
    flex-wrap: wrap;
    column-gap: var(--vectis-space-4);
    row-gap: var(--vectis-space-1);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .v-meter-group-item {
    display: inline-flex;
    align-items: center;
    gap: var(--vectis-space-2);
    font-size: var(--vectis-text-body-sm-size);
    font-weight: var(--vectis-text-body-sm-weight);
    line-height: var(--vectis-text-body-sm-leading);
  }

  .v-meter-group-leading {
    display: inline-flex;
    color: var(--meter-group-colour);
  }

  .v-meter-group-swatch {
    inline-size: var(--vectis-control-size-meter-group-swatch);
    block-size: var(--vectis-control-size-meter-group-swatch);
    border-radius: var(--vectis-radius-pill);
    background: currentcolor;
  }

  .v-meter-group-item-label {
    color: var(--vectis-color-text);
  }

  .v-meter-group-item-value {
    color: var(--vectis-color-text-muted);
    font-variant-numeric: tabular-nums;
  }

  /*
   * Upright, the root carries the length and the legend stands beside the bar. A column filled
   * from its end puts the first part at the bottom, in either reading direction.
   */
  .v-meter-group[data-orientation='vertical'] {
    block-size: var(--vectis-control-size-bar-length);
  }

  .v-meter-group[data-orientation='vertical'] .v-meter-group-body {
    flex: 1 1 0;
    flex-direction: row;
    gap: var(--vectis-space-3);
    min-block-size: 0;
  }

  .v-meter-group[data-orientation='vertical'] .v-meter-group-track {
    flex-direction: column-reverse;
    flex-shrink: 0;
    inline-size: var(--meter-group-thickness);
    block-size: auto;
  }

  .v-meter-group[data-orientation='vertical'] .v-meter-group-part,
  .v-meter-group[data-orientation='vertical'] .v-meter-group-rest {
    min-inline-size: auto;
    min-block-size: 0;
  }

  .v-meter-group[data-orientation='vertical'] .v-meter-group-legend {
    flex-direction: column;
    flex-wrap: nowrap;
  }

  @media (prefers-reduced-motion: reduce) {
    .v-meter-group-part,
    .v-meter-group-rest {
      transition: none;
    }
  }

  /* Forced colours flatten every part to one system colour: only gaps keep them apart there. */
  @media (forced-colors: active) {
    .v-meter-group-track {
      gap: var(--vectis-control-size-meter-segment-gap);
      box-shadow: inset 0 0 0 var(--vectis-control-border-width) CanvasText;
    }

    .v-meter-group-part {
      forced-color-adjust: none;
      background: Highlight;
    }
  }
}
</style>
