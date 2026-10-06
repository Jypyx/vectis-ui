<script setup lang="ts">
/**
 * Group generated options under their accessible label; groups and options are the listbox's
 * permitted children. The panel renders the heading among the group's rows, so the virtual mode
 * can measure it and leave it out like any other row.
 */

interface ListboxGroupProps {
  /** The name of the block. */
  label: string
  /**
   * The id of the heading rendered inside the group, which then names it. Without one, the
   * heading is out of the rendered window and the name is given as `aria-label`.
   */
  labelId?: string
}

defineProps<ListboxGroupProps>()

defineSlots<{
  /** The heading and the options belonging to this block. */
  default(): unknown
}>()
</script>

<template>
  <div
    role="group"
    class="v-listbox-group"
    :aria-labelledby="labelId"
    :aria-label="labelId ? undefined : label"
  >
    <slot />
  </div>
</template>

<style>
@layer vectis.components {
  /*
   * It refuses to shrink, where a menu group has no need to: this panel is a column of bounded
   * height that scrolls, and a block left free to shrink would be squashed to make its content
   * fit; the same reason the state rows and the foot of the list refuse it too. Its gap matches
   * the panel's, which the virtual mode relies on to size the space standing for hidden rows.
   */
  .v-listbox-group {
    display: flex;
    flex: none;
    flex-direction: column;
    gap: var(--vectis-space-1);
  }

  /* The heading is a row of the panel: it is not something that can be chosen. */
  .v-listbox-group-label {
    display: flex;
    flex: none;
    align-items: center;
    min-block-size: var(--control-height);
    padding-block: var(--vectis-space-1);
    padding-inline: var(--control-padding-inline);
    font-size: var(--vectis-text-overline-size);
    font-weight: var(--vectis-text-overline-weight);
    letter-spacing: var(--vectis-text-overline-tracking);
    color: var(--vectis-color-text-muted);
  }
}
</style>
