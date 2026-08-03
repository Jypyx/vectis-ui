<script setup lang="ts">
/**
 * Icon button: the same visual API as VButton, but square and with a MANDATORY
 * accessible label (an icon alone is not enough for screen readers).
 */
import type { ButtonHTMLAttributes } from 'vue'

import VButton from '../VButton/VButton.vue'
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'

interface IconButtonProps {
  /** Accessible label, set as aria-label. */
  label: string
  variant?: 'solid' | 'outline' | 'ghost' | 'elevated' | 'tonal'
  tone?: 'accent' | 'neutral' | 'danger' | 'success' | 'warning'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Height (and width) reduced by 4px. */
  compact?: boolean
  type?: ButtonHTMLAttributes['type']
  disabled?: boolean
  loading?: boolean
  /** The icon rendered: a name, or an explicit render (the default slot is the fallback). */
  icon?: IconSource
  /** Fills the `icon` (the font's `FILL` axis). */
  iconFilled?: boolean
}

withDefaults(defineProps<IconButtonProps>(), {
  variant: 'ghost',
  tone: 'neutral',
  size: 'md',
  compact: false,
  type: 'button',
  disabled: false,
  loading: false,
  icon: undefined,
  iconFilled: false,
})

defineSlots<{
  /** The icon (a VIcon component or an SVG with aria-hidden="true"), when `icon` is not given */
  default(): unknown
}>()
</script>

<template>
  <VButton
    class="v-icon-button"
    :variant="variant"
    :tone="tone"
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
   * The [data-size] selector beats VButton's padding rule whatever the bundled
   * CSS order (this file is still imported AFTER VButton in index.ts). The width
   * reads --control-height, set by the shared v-control class on that same
   * rendered element (compact included): a single rule covers every size.
   */
  .v-icon-button[data-size] {
    width: var(--control-height);
    padding-inline: 0;
  }
}
</style>
