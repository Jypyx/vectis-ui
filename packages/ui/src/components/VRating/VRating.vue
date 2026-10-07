<script setup lang="ts">
// @a11y @core
/**
 * A rating chosen among native radios, one per icon, grouped in a `<fieldset>`: the browser
 * provides the arrow keys, form submission and `required`. Read-only, the icons become one image
 * whose name says the value, which may then be fractional.
 */
import { computed, ref, useAttrs, useId } from 'vue'

import VFieldset from '../VFieldset/VFieldset.vue'
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import { star as starIcon } from '../VIcon/icons/star'
import type { IconSource } from '../VIcon/types'
import { useLocale, useMessages } from '../../i18n/state'
import { customColorStyle } from '../../utils/css'
import { clamp } from '../../utils/number'

/** The size of the icons: 20, 24 or 32 pixels. */
export type RatingSize = 'sm' | 'md' | 'lg'

/** The colour of the filled icons. */
export type RatingTone = 'accent' | 'warning' | 'danger' | 'success' | 'neutral'

interface RatingProps {
  /** How many icons, and the highest value. */
  max?: number
  /**
   * The name of the group, shown as its legend. Without it, the group is named from the design
   * system dictionary.
   */
  label?: string
  /** Hides the label visually. It still names the group for assistive technology. */
  hideLabel?: boolean
  /** A line of help under the icons, read along with the group's name. */
  hint?: string
  /**
   * A message saying what is wrong, shown in place of the hint and read along with the group's
   * name. It is announced when it appears or changes.
   */
  error?: string
  /**
   * Marks the rating as invalid, which colours the icons and tells assistive technology so. It
   * is for a rule the browser cannot check by itself.
   */
  invalid?: boolean
  /** Requires a rating before the form is sent. An asterisk follows the label. */
  required?: boolean
  /** The name the value is sent under in a form. */
  name?: string
  /**
   * Lets the rating go back to none: clicking the current value again clears it, and a "No
   * rating" choice comes first for the keyboard.
   */
  clearable?: boolean
  /**
   * Shows the value without letting it change. The icons become a single image, and a fractional
   * value fills part of an icon.
   */
  readonly?: boolean
  /** Makes the rating unusable. */
  disabled?: boolean
  /** The size of the icons. */
  size?: RatingSize
  /** The colour of the filled icons. */
  tone?: RatingTone
  /**
   * A colour of your own for the filled icons (hex, CSS name or `oklch()`), which replaces the
   * tone. Its contrast with the background is yours to check.
   */
  color?: string
  /**
   * The icon: an icon name, or an explicit render. An empty one is drawn in outline and a filled
   * one with the icon's filled form.
   */
  icon?: IconSource
}

// The consumer's `aria-describedby` is merged with the hint and error references, and the
// merged list is bound after the other attributes, which fallthrough would overwrite.
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<RatingProps>(), {
  max: 5,
  label: undefined,
  hideLabel: false,
  hint: undefined,
  error: undefined,
  invalid: false,
  required: false,
  name: undefined,
  clearable: false,
  readonly: false,
  disabled: false,
  size: 'md',
  tone: 'accent',
  color: undefined,
  icon: () => starIcon,
})

/** The rating, from 1 to `max`, or `null` when there is none. Read-only, it may be fractional. */
const model = defineModel<number | null>({ default: null })

const attrs = useAttrs()
const m = useMessages()
const locale = useLocale()

const isInvalid = computed(() => props.invalid || !!props.error)

// Radios group by name, so the group needs one even when the form does not.
const uid = useId()
const groupName = computed(() => props.name ?? uid)

const values = computed(() => Array.from({ length: props.max }, (_, index) => index + 1))

const numberFormat = computed(
  () => new Intl.NumberFormat(locale.value, { maximumFractionDigits: 1 }),
)

const valueText = computed(() =>
  m.value.rating.value(
    numberFormat.value.format(clamp(model.value ?? 0, 0, props.max)),
    numberFormat.value.format(props.max),
  ),
)

/** How much of the icon for `value` is filled, from 0 to 1. */
function fill(value: number): number {
  return clamp((model.value ?? 0) - (value - 1), 0, 1)
}

// @core
// A click on the checked radio fires no change; it clears instead. Only a pointer click does:
// the keyboard reaches "No rating" with the arrows, and Space must not undo a choice.
function onClick(value: number, event: MouseEvent) {
  if (props.clearable && model.value === value && event.detail > 0) model.value = null
}

const fieldset = ref<InstanceType<typeof VFieldset> | null>(null)
const rootEl = computed(() => fieldset.value?.el ?? null)

defineExpose({
  /** Moves the focus to the checked radio, or to the first icon when there is no rating. */
  focus: (options?: FocusOptions) =>
    (
      rootEl.value?.querySelector<HTMLInputElement>('.v-rating-item input:checked') ??
      rootEl.value?.querySelector<HTMLInputElement>('.v-rating-item input')
    )?.focus(options),
  /** The `<fieldset>`, which also receives the consumer's attributes. */
  el: rootEl,
})
</script>

<template>
  <VFieldset
    ref="fieldset"
    class="v-rating v-tone"
    :data-tone="tone"
    :data-custom="color !== undefined ? '' : undefined"
    :style="customColorStyle(color)"
    :data-size="size"
    :data-readonly="readonly ? '' : undefined"
    :data-invalid="isInvalid ? '' : undefined"
    :disabled="disabled"
    :aria-label="label ? undefined : m.rating.label"
    v-bind="attrs"
    :legend="label"
    :hint="hint"
    :error="error"
    :required="required"
    :hide-legend="hideLabel"
  >
    <span v-if="readonly" class="v-rating-items" role="img" :aria-label="valueText">
      <span
        v-for="value in values"
        :key="value"
        class="v-rating-item"
        :style="{ '--rating-value': fill(value) }"
      >
        <span class="v-rating-icon">
          <VIcon class="v-rating-empty" v-bind="iconProps(icon)" />
          <VIcon class="v-rating-filled" v-bind="iconProps(icon)" filled />
        </span>
      </span>
    </span>

    <span v-else class="v-rating-items">
      <label v-if="clearable" class="v-rating-clear">
        <input
          type="radio"
          class="v-hidden-input"
          :name="groupName"
          value=""
          :checked="model === null"
          @change="model = null"
        />
        <span class="v-visually-hidden">{{ m.rating.empty }}</span>
      </label>
      <label
        v-for="value in values"
        :key="value"
        class="v-rating-item"
        :style="{ '--rating-value': fill(value) }"
      >
        <input
          type="radio"
          class="v-hidden-input"
          :name="groupName"
          :value="value"
          :checked="model === value"
          :required="required"
          :aria-invalid="isInvalid ? 'true' : undefined"
          @change="model = value"
          @click="onClick(value, $event)"
        />
        <span class="v-rating-icon">
          <VIcon class="v-rating-empty" v-bind="iconProps(icon)" />
          <VIcon class="v-rating-filled" v-bind="iconProps(icon)" filled />
        </span>
        <span class="v-visually-hidden">{{
          m.rating.value(numberFormat.format(value), numberFormat.format(max))
        }}</span>
      </label>
    </span>
    <input v-if="readonly && name && model !== null" type="hidden" :name="name" :value="model" />
  </VFieldset>
</template>

<style>
@layer vectis.components {
  .v-rating[data-size='sm'] {
    --vectis-icon-size: var(--vectis-control-size-rating-sm);
  }

  .v-rating[data-size='md'] {
    --vectis-icon-size: var(--vectis-control-size-rating-md);
  }

  .v-rating[data-size='lg'] {
    --vectis-icon-size: var(--vectis-control-size-rating-lg);
  }

  /* Positioned: it holds the hidden "No rating" radio, which has no box of its own. */
  .v-rating-items {
    position: relative;
    display: inline-flex;
    border-radius: var(--vectis-radius-interactive);
  }

  /* The padding widens the target around the icon: 24px at the smallest size. */
  .v-rating-item {
    --rating-shown: var(--rating-value);

    position: relative;
    display: inline-flex;
    padding: calc(var(--vectis-space-1) / 2);
  }

  label.v-rating-item {
    cursor: pointer;
  }

  /*
   * Hovering previews the rating: the hovered icon and those before it fill, the others empty.
   * The value is read from `--rating-value`, written inline, into `--rating-shown`, which these
   * rules can override where the inline style could not be.
   */
  /* The emptying rule weighs (0,1,0) and the filling one (0,3,1), which wins where both match. */
  :where(.v-rating:not(:disabled) .v-rating-items:has(label.v-rating-item:hover)) > .v-rating-item {
    --rating-shown: 0;
  }

  :where(.v-rating:not(:disabled)) label.v-rating-item:is(:hover, :has(~ .v-rating-item:hover)) {
    --rating-shown: 1;
  }

  .v-rating-icon {
    display: inline-grid;
    border-radius: var(--vectis-radius-xs);
  }

  .v-rating-icon > .v-icon {
    grid-area: 1 / 1;
  }

  .v-rating-empty {
    color: var(--vectis-color-border-strong);
  }

  /* The filled icon is clipped from the end, so a fraction fills the start of the icon. */
  .v-rating-filled {
    color: var(--tone-bg-solid);
    clip-path: inset(0 calc((1 - var(--rating-shown)) * 100%) 0 0);
  }

  .v-rating-filled:dir(rtl) {
    clip-path: inset(0 0 0 calc((1 - var(--rating-shown)) * 100%));
  }

  .v-rating-item .v-hidden-input:focus-visible + .v-rating-icon {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  /* "No rating" has no icon of its own: its focus rings the whole row. */
  .v-rating-items:has(.v-rating-clear .v-hidden-input:focus-visible) {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  .v-rating[data-invalid] .v-rating-empty {
    color: var(--vectis-color-danger);
  }

  .v-rating:disabled .v-rating-empty {
    color: var(--vectis-color-border);
  }

  .v-rating:disabled .v-rating-filled {
    color: var(--vectis-color-text-subtle);
  }

  .v-rating:disabled label.v-rating-item {
    cursor: not-allowed;
  }

  @media (forced-colors: active) {
    .v-rating-filled {
      color: Highlight;
    }

    .v-rating:disabled .v-rating-filled {
      color: GrayText;
    }
  }
}
</style>
