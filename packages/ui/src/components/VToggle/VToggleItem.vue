<script setup lang="ts">
/**
 * One item of a VToggle. It IS a VButton — the colour, the size, the focus ring and
 * the disabled state all come from there — and what this component adds is the one
 * attribute saying whether the button is currently pressed.
 *
 * That button is also this component's own root element, with nothing wrapped around
 * it, which is what lets the group merge the borders of neighbouring items: it only
 * joins its DIRECT children. It is also what brings the size, the density, the elevation
 * and a row-wide disabled state here with nothing asked for: the VButtonGroup the VToggle
 * renders hands them to every button it contains, this one included.
 *
 * Used outside a VToggle it renders as a plain neutral VButton that is never pressed: the
 * way it is drawn is the group's decision, and there is no group to take it.
 */
import { computed, inject } from 'vue'

import VButton from '../VButton/VButton.vue'
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import { toggleKey } from './context'
import type { ToggleValue } from './VToggle.vue'

interface ToggleItemProps {
  /**
   * What choosing this item means. It is what the group's v-model holds when the item
   * is selected, and it must be unique within the group.
   */
  value: ToggleValue
  /** The visible label. The default slot replaces it. */
  label?: string
  /** An icon before the label: an icon name, or an explicit render. */
  iconStart?: IconSource
  /**
   * An icon after the label. It is NOT switched to its filled form by the group's
   * `selectedIconFilled`, which names the icon standing for the item rather than one
   * trailing it; `iconFilled` fills it for good.
   */
  iconEnd?: IconSource
  /**
   * Renders `iconStart` and `iconEnd` in their filled form (the font's `FILL` axis), whether
   * the item is selected or not. The group's `selectedIconFilled` still fills the start icon
   * of the selected item when this is left out.
   */
  iconFilled?: boolean
  /**
   * Makes this item unusable: it no longer responds, the arrow keys skip over it, and
   * it greys out through the colour tokens.
   */
  disabled?: boolean
}

const props = withDefaults(defineProps<ToggleItemProps>(), {
  label: undefined,
  iconStart: undefined,
  iconEnd: undefined,
  iconFilled: false,
  disabled: false,
})

const slots = defineSlots<{
  /** The content of the item, replacing the `label` prop. */
  default?(): unknown
  /** Content before the label, which takes the place of `iconStart`. */
  start?(): unknown
  /** Content after the label, which takes the place of `iconEnd`. */
  end?(): unknown
}>()

const toggle = inject(toggleKey, null)

const selected = computed(() => toggle != null && toggle.isSelected(props.value))

// TRAP — a function read by the template, never a `computed`: `slots` is not reactive, so a
// computed would keep its first answer while a slot behind a `v-if` comes and goes.
/**
 * An icon, on either side, and no label at all: the item becomes a square, like a VIconButton.
 * The same definition as VChip's, and the square itself is VButton's `[data-icon-only]` rule.
 */
function iconOnly() {
  return (
    !props.label &&
    !slots.default &&
    Boolean(slots.start || slots.end || props.iconStart || props.iconEnd)
  )
}
</script>

<template>
  <!-- The pressed state is always rendered, false included: it is its PRESENCE that
       makes a screen reader announce the button as one that stays pressed, and an
       attribute appearing only when true would leave the unselected items announced
       as ordinary buttons.

       The filled form is asked of the icon directly, because VButton's own icon
       options have no effect on an icon handed to it through a slot. -->
  <VButton
    class="v-toggle-item"
    :aria-pressed="selected ? 'true' : 'false'"
    :variant="selected && toggle ? toggle.selectedVariant : toggle?.itemVariant"
    :tone="selected && toggle ? toggle.tone : 'neutral'"
    :disabled="disabled"
    :data-icon-only="iconOnly() ? '' : undefined"
    @click="toggle?.select(value)"
  >
    <template v-if="iconStart || $slots.start" #start>
      <slot name="start">
        <VIcon
          v-bind="iconProps(iconStart!)"
          :filled="iconFilled || (selected && toggle?.selectedIconFilled)"
        />
      </slot>
    </template>
    <template v-if="iconEnd || $slots.end" #end>
      <slot name="end"><VIcon v-bind="iconProps(iconEnd!)" :filled="iconFilled" /></slot>
    </template>
    <slot v-if="!iconOnly()">{{ label }}</slot>
  </VButton>
</template>
