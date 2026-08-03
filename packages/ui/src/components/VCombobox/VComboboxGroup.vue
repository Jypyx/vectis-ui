<script setup lang="ts">
import { useId } from 'vue'

/**
 * A named group of options (internal — rendered by `VCombobox` from a
 * `ComboboxGroup` entry of its `options` prop, never written by the consumer).
 *
 * `role="group"` is an ALLOWED child of a `role="listbox"` (ARIA 1.2): it is the
 * counterpart of the native `<optgroup>`. The label is neither focusable nor
 * selectable — VCombobox's keyboard navigation indexes `filtered`, a flat list of
 * options, and therefore never sees this node.
 */
interface ComboboxGroupProps {
  /** Name of the group (not selectable). */
  label: string
}

defineProps<ComboboxGroupProps>()

defineSlots<{
  /** The options of the group. */
  default(): unknown
}>()

const labelId = useId()
</script>

<template>
  <div role="group" class="v-combobox-group" :aria-labelledby="labelId">
    <span :id="labelId" class="v-combobox-group-label">{{ label }}</span>
    <slot />
  </div>
</template>

<style>
@layer vectis.components {
  /* `flex: none` (unlike `.v-menu-group`): VCombobox's panel is a bounded flex
     column (`max-block-size` + `overflow: auto`), where a group would be squashed —
     the same reason as `.v-combobox-state` and `.v-combobox-more`. */
  .v-combobox-group {
    display: flex;
    flex: none;
    flex-direction: column;
    gap: var(--vectis-space-1);
  }

  /* Section micro-label: the overline role (no forced capitals — the label's case
     belongs to the consumer). Indent AND height trace the options' recipe
     (`--control-padding-inline` and `--control-height`, inherited from the panel):
     the header holds the same height as a row, compact included, so the list's
     vertical rhythm does not break. Only the typography stays outside the scale (the
     overline role), hence the vertical centring. */
  .v-combobox-group-label {
    display: flex;
    align-items: center;
    min-height: var(--control-height);
    padding: var(--vectis-space-1) var(--control-padding-inline);
    font-size: var(--vectis-text-overline-size);
    font-weight: var(--vectis-text-overline-weight);
    letter-spacing: var(--vectis-text-overline-tracking);
    color: var(--vectis-color-text-muted);
  }
}
</style>
