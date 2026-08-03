<script setup lang="ts">
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'

/**
 * A VCombobox option row (`role="option"`), an INTERNAL non-exported component. The
 * DOM focus stays in the field: the highlight comes from the `active` prop (set
 * through `aria-activedescendant`), never from focus. Selecting does not close the
 * panel — VCombobox decides.
 *
 * `disabled` does NOT set the native attribute: a disabled option must stay in the
 * accessibility tree the field walks, hence `aria-disabled`.
 *
 * A single root: `id` and the consumer's listeners (`@pointermove`…) arrive through
 * native fallthrough.
 *
 * The surface is deliberately reduced to what VCombobox uses: the label goes through
 * the #default slot (which VCombobox feeds from its own scoped `#option` slot), not
 * through a prop. A single icon slot, at the start — the end is taken by the
 * selection tick — hence `icon` and not `iconStart`.
 */
interface ComboboxOptionProps {
  /** Icon before the label: an icon name, or an explicit render (`{ src }`…). */
  icon?: IconSource
  /** Selected option (aria-selected + a tick). */
  selected?: boolean
  /** Active option (highlighted) — set by the field. */
  active?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<ComboboxOptionProps>(), {
  icon: undefined,
  selected: false,
  active: false,
  disabled: false,
})

const emit = defineEmits<{
  /** Emitted on activation (a click). */
  select: []
}>()

defineSlots<{
  /** Label of the option. */
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
    <VIcon v-if="selected" name="check" class="v-combobox-option-check" />
  </button>
</template>

<style>
@layer vectis.components {
  .v-combobox-option {
    /* Size: the `--control-*` inherited from the panel, which carries `v-control`
       (styles/control-size.css); the icons follow through the same inheritance.
       Composite typography as in VMenuItem: the scale's size, `body-md` leading (a
       unitless ratio) and a regular weight. */
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

  /* `min-inline-size: 0`: without it the flex item's automatic minimum would stop a
     long label from compressing. */
  .v-combobox-option-label {
    flex: 1;
    min-inline-size: 0;
  }

  /* The highlight comes from hover or from `active` (the focus never comes here: it
     stays in the field). */
  .v-combobox-option:hover:not([aria-disabled='true']),
  .v-combobox-option[data-active] {
    background: var(--vectis-color-surface-muted);
    outline: none;
  }

  .v-combobox-option[aria-selected='true'] {
    color: var(--vectis-color-accent-text);
  }

  /* No native `disabled` here (the option stays in the field's a11y tree) */
  .v-combobox-option[aria-disabled='true'] {
    background: transparent;
    color: var(--vectis-color-text-subtle);
    cursor: not-allowed;
  }
}
</style>
