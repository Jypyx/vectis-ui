<script setup lang="ts">
// @a11y — the MANDATORY label is the component's whole reason to exist alongside
// VButton: an icon on its own gives assistive technology no accessible name.
/**
 * A button showing an icon and nothing else, square rather than oblong. It offers
 * the same appearance options as VButton and forwards them to it.
 *
 * The one difference that matters is the `label` prop, which is REQUIRED here. A
 * picture says nothing to a screen reader, so the label is what names the action —
 * without it the button would be announced as just "button".
 */
import { computed, inject } from 'vue'
import type { ButtonHTMLAttributes } from 'vue'

import VButton from '../VButton/VButton.vue'
import type { ButtonTone } from '../VButton/VButton.vue'
import { buttonGroupKey } from '../VButton/context'
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'

interface IconButtonProps {
  /**
   * What the button does, in words. It becomes the `aria-label` and is the only
   * thing a screen reader has to go on, so it names the action ("Close", "Next
   * month") rather than the picture.
   */
  label: string
  /**
   * How much visual weight the button carries — the VButton variants. `ghost` by default,
   * and inside a VButtonGroup the group's own variant wins over it.
   */
  variant?: 'solid' | 'outline' | 'ghost' | 'soft'
  /**
   * What the action means, in colour — the VButton tones. An icon-only button is usually
   * secondary, which is why it starts neutral where VButton starts accent. Left out inside
   * a VButtonGroup it takes the group's tone; on its own it is `neutral`.
   */
  tone?: 'accent' | 'neutral' | 'danger'
  /** Raises the button with a shadow, and a raised surface on ghost and outline. */
  elevated?: boolean
  /** The size of the square, taken from the scale shared by every control. */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Takes 4px off both sides of the square, which stays square. */
  compact?: boolean
  /**
   * The silhouette: a square carrying the corner radius every control shares, or a
   * circle. The box itself is square either way — only the corners change.
   */
  shape?: 'square' | 'circular'
  /** The native type of the button, `button` by default. Ignored once `href` makes it a link. */
  type?: ButtonHTMLAttributes['type']
  /** Makes the button unusable, greyed out through the colour tokens. */
  disabled?: boolean
  /** Replaces the icon with a spinner and disables the button while it turns. */
  loading?: boolean
  /**
   * The icon to show: an icon name, or an explicit render. The default slot is the
   * way to supply one this prop cannot express.
   */
  icon?: IconSource
  /** Renders the icon in its filled form (the font's `FILL` axis). */
  iconFilled?: boolean
}

const props = withDefaults(defineProps<IconButtonProps>(), {
  variant: 'ghost',
  // No default, so that an absent tone stays distinguishable from an explicit one (see
  // the resolution below and VButton's own `tone`).
  tone: undefined,
  elevated: false,
  size: 'md',
  compact: false,
  shape: 'square',
  type: 'button',
  disabled: false,
  loading: false,
  icon: undefined,
  iconFilled: false,
})

defineSlots<{
  /**
   * The icon, when the `icon` prop cannot express it: a VIcon, or an inline SVG
   * marked `aria-hidden="true"` — the button is already named by its `label`.
   */
  default(): unknown
}>()

/*
 * The ONE prop a VButtonGroup cannot arbitrate on its own. The four others are handed
 * to VButton as they are and the group wins there over whatever arrives, so nothing has
 * to be resolved here; the tone goes the other way, the button's own answer first, and
 * VButton would take `accent` as its last resort where an icon-only button takes
 * `neutral`. Resolving it here is what keeps that difference.
 */
const group = inject(buttonGroupKey, null)
const resolvedTone = computed<ButtonTone>(() => props.tone ?? group?.tone ?? 'neutral')
</script>

<template>
  <!--
    `shape` is ours alone: VButton knows nothing about it, so the attribute travels
    through its $attrs down to the element it renders — the same route the
    v-icon-button class takes. Everything else is a real VButton prop and has to be
    forwarded by hand, an unforwarded one never reaching its data attribute.
  -->
  <VButton
    class="v-icon-button"
    :data-shape="shape"
    :variant="variant"
    :tone="resolvedTone"
    :elevated="elevated"
    :size="size"
    :compact="compact"
    :type="type"
    :disabled="disabled"
    :loading="loading"
    :aria-label="label"
  >
    <VIcon v-if="icon" v-bind="iconProps(icon)" :filled="iconFilled" />
    <slot v-else />
  </VButton>
</template>

<style>
@layer vectis.components {
  /*
   * Qualifying the selector with [data-size] is what makes this rule beat VButton's
   * padding whatever order the two sheets end up in — this component renders a
   * VButton, so both sets of rules apply to the very same element.
   *
   * The width reads --control-height, which the shared v-control class sets on that
   * element for the current size and density. One rule therefore covers the whole
   * scale, compact included, instead of a table repeating each value.
   */
  .v-icon-button[data-size] {
    width: var(--control-height);
    padding-inline: 0;
  }

  /*
   * Same qualification, same reason: [data-shape] takes the selector to (0,2,0), which
   * beats the border-radius VButton sets on that very element at (0,1,0) whatever the
   * consumer's bundler decides about the order of the two sheets.
   *
   * The `square` value writes nothing — it IS the radius VButton already applies, so a
   * consumer overriding --vectis-radius-interactive keeps a single place to change.
   * The token here is the pill one, the convention for a shape table (VChip, the
   * VSkeletonLoader shapes), --vectis-radius-full being reserved for the components
   * that are round by nature.
   */
  .v-icon-button[data-shape='circular'] {
    border-radius: var(--vectis-radius-pill);
  }
}
</style>
