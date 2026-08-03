<script setup lang="ts">
/**
 * One item of a VToggle. It IS a `VButton`: tone, variant, size, focus and
 * disabling all come from it, and only the toggle state (`aria-pressed`) is
 * added — it travels through VButton's fallthrough to the rendered <button>,
 * which therefore stays the direct child VButtonGroup's seam requires.
 *
 * The item still renders outside a `VToggle` (as VTab does outside VTabs), simply
 * never selected.
 */
import { computed, inject, useSlots } from 'vue'

import VButton from '../VButton/VButton.vue'
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import { toggleKey } from './context'
import type { ToggleValue } from './VToggle.vue'

interface ToggleItemProps {
  /** Identifies the item in the group's v-model. Unique within the group. */
  value: ToggleValue
  /** Visible label; the default slot wins. */
  label?: string
  /** Start icon: a name, or an explicit render. */
  icon?: IconSource
  /** Inert item: neither clickable nor reachable, greyed through tokens. */
  disabled?: boolean
}

const props = withDefaults(defineProps<ToggleItemProps>(), {
  label: undefined,
  icon: undefined,
  disabled: false,
})

defineSlots<{
  /** Free content of the item (replaces `label`). */
  default?(): unknown
}>()

const slots = useSlots()
const toggle = inject(toggleKey, null)

const selected = computed(() => toggle != null && toggle.isSelected(props.value))

/** No visible label: the item shrinks to a square, like a VIconButton. */
const iconOnly = computed(() => Boolean(props.icon) && !props.label && !slots.default)
</script>

<template>
  <!-- aria-pressed is always set (even at 'false'): its presence is what makes it
       announced as a toggle button. `filled` is set directly on VIcon: VButton's
       `iconFilled` prop has no effect on slots. -->
  <VButton
    class="v-toggle-item"
    :aria-pressed="selected ? 'true' : 'false'"
    :variant="selected ? 'solid' : (toggle?.variant ?? 'ghost')"
    :tone="selected ? (toggle?.tone ?? 'accent') : 'neutral'"
    :size="toggle?.size ?? 'md'"
    :compact="toggle?.compact ?? false"
    :disabled="disabled || toggle?.disabled"
    :data-icon-only="iconOnly ? '' : undefined"
    @click="toggle?.select(value)"
  >
    <template v-if="icon" #start>
      <VIcon v-bind="iconProps(icon)" :filled="selected && (toggle?.selectedIconFilled ?? false)" />
    </template>
    <slot v-if="!iconOnly">{{ label }}</slot>
  </VButton>
</template>

<style>
@layer vectis.components {
  /*
   * Item reduced to its icon: square, like VIconButton. [data-size] (always
   * rendered by VButton) qualifies the selector so it beats the padding of
   * .v-button[data-variant='…'] whatever the bundled CSS order.
   */
  .v-toggle-item[data-size][data-icon-only] {
    padding-inline: 0;
    min-inline-size: var(--control-height);
  }
}
</style>
