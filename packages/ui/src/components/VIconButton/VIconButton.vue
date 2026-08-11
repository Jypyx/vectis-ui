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
import type { ButtonHTMLAttributes } from 'vue'

import VButton from '../VButton/VButton.vue'
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
  /** How much visual weight the button carries — the VButton variants. */
  variant?: 'solid' | 'outline' | 'ghost' | 'soft'
  /** What the action means, in colour — the VButton tones. */
  tone?: 'accent' | 'neutral' | 'danger'
  /** Raises the button with a shadow, and a raised surface on ghost and outline. */
  elevated?: boolean
  /** The size of the square, taken from the scale shared by every control. */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Takes 4px off both sides of the square, which stays square. */
  compact?: boolean
  /** The native type of the button. */
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

withDefaults(defineProps<IconButtonProps>(), {
  variant: 'ghost',
  tone: 'neutral',
  elevated: false,
  size: 'md',
  compact: false,
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
</script>

<template>
  <VButton
    class="v-icon-button"
    :variant="variant"
    :tone="tone"
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
}
</style>
