<script setup lang="ts">
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import { check as checkIcon } from '../VIcon/icons/check'
import type { IconSource } from '../VIcon/types'

/**
 * One row of a VCombobox's list. It is internal to that component and never exported.
 *
 * The focus never comes here: it stays in the text field throughout, so the highlight is
 * told to this row rather than deduced from anything it holds. Choosing it does not close
 * the panel either — the component above decides that.
 *
 * TRAP — a disabled option does NOT carry the native attribute. It has to remain in the
 * accessibility tree the field walks through, and the native attribute would take it out
 * of it; `aria-disabled` says the same thing while leaving it in place.
 *
 * Its surface is deliberately reduced to what VCombobox actually uses. The label comes
 * through the slot rather than a prop, and there is a single icon, at the start: the end
 * of the row is taken by the selection tick.
 */
interface ComboboxOptionProps {
  /** An icon before the label: an icon name, or an explicit render. */
  icon?: IconSource
  /** Marks the option as one of the chosen ones, which also draws the tick. */
  selected?: boolean
  /** Marks the option as the one currently highlighted. The field decides this. */
  active?: boolean
  /** Shows the option without allowing it to be chosen. */
  disabled?: boolean
}

const props = withDefaults(defineProps<ComboboxOptionProps>(), {
  icon: undefined,
  selected: false,
  active: false,
  disabled: false,
})

const emit = defineEmits<{
  /** The option was clicked. What that does to the selection is the field's business. */
  select: []
}>()

defineSlots<{
  /** What the row shows. */
  default?(): unknown
}>()

function onClick() {
  if (props.disabled) return
  emit('select')
}
</script>

<template>
  <button
    type="button"
    role="option"
    tabindex="-1"
    class="v-combobox-option"
    :aria-selected="selected"
    :aria-disabled="disabled ? 'true' : undefined"
    :data-active="active ? '' : undefined"
    @click="onClick"
  >
    <VIcon v-if="icon" v-bind="iconProps(icon)" />
    <span class="v-combobox-option-label"><slot /></span>
    <VIcon v-if="selected" :name="checkIcon" class="v-combobox-option-check" />
  </button>
</template>

<style>
@layer vectis.components {
  .v-combobox-option {
    /* Every dimension is inherited from the panel, which carries the shared size class,
       and the icons follow through the same inheritance.

       The type is composite, exactly as in a menu row: the SIZE comes from the scale, the
       line height stays that of body text — a unitless ratio, so it follows the size —
       and the weight stays regular, since a row may wrap. */
    display: flex;
    align-items: center;
    gap: var(--control-gap);
    width: 100%;
    min-height: var(--control-height);
    padding: var(--vectis-space-1) var(--control-padding-inline);
    border: none;
    background: transparent;
    color: var(--vectis-color-text);
    border-radius: var(--vectis-radius-sm);
    font-family: inherit;
    font-size: var(--control-font-size);
    line-height: var(--vectis-text-body-md-leading);
    text-align: start;
    cursor: pointer;
  }

  /* The zero minimum is what allows a long label to be compressed at all: a flex item
     otherwise refuses to shrink below its own content. */
  .v-combobox-option-label {
    flex: 1;
    min-inline-size: 0;
  }

  /* A row is highlighted by the pointer resting on it, or by being the current one. There
     is deliberately no focus rule: the focus never arrives here, it stays in the field. */
  .v-combobox-option:hover:not([aria-disabled='true']),
  .v-combobox-option[data-active] {
    background: var(--vectis-color-surface-muted);
    outline: none;
  }

  .v-combobox-option[aria-selected='true'] {
    color: var(--vectis-color-accent-text);
  }

  /* Matched on the ARIA state and not on the native one, which this component
     deliberately never sets — see the introduction. */
  .v-combobox-option[aria-disabled='true'] {
    background: transparent;
    color: var(--vectis-color-text-subtle);
    cursor: not-allowed;
  }
}
</style>
