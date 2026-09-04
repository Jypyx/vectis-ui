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
 * Used outside a VToggle it still renders perfectly well, simply never selected, the
 * same way a tab does outside its row.
 */
import { computed, inject, useSlots } from 'vue'

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
  icon?: IconSource
  /**
   * Makes this item unusable: it no longer responds, the arrow keys skip over it, and
   * it greys out through the colour tokens.
   */
  disabled?: boolean
}

const props = withDefaults(defineProps<ToggleItemProps>(), {
  label: undefined,
  icon: undefined,
  disabled: false,
})

defineSlots<{
  /** The content of the item, replacing the `label` prop. */
  default?(): unknown
}>()

const slots = useSlots()
const toggle = inject(toggleKey, null)

const selected = computed(() => toggle != null && toggle.isSelected(props.value))

/** An icon and no label at all: the item becomes a square, like a VIconButton. */
const iconOnly = computed(() => Boolean(props.icon) && !props.label && !slots.default)
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
    :variant="selected ? (toggle?.selectedVariant ?? 'solid') : (toggle?.variant ?? 'ghost')"
    :tone="selected ? (toggle?.tone ?? 'accent') : 'neutral'"
    :disabled="disabled"
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
   * An item reduced to its icon becomes a square, like a VIconButton. The selector is
   * qualified by an attribute VButton always renders, which is what makes it beat that
   * button's own padding whatever order the two sheets end up in.
   */
  .v-toggle-item[data-size][data-icon-only] {
    padding-inline: 0;
    min-inline-size: var(--control-height);
  }
}
</style>
