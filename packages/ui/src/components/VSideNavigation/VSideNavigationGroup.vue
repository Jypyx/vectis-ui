<script setup lang="ts">
import { useId } from 'vue'

interface SideNavigationGroupProps {
  /** The name of the section, replaced by the `#label` slot. */
  label?: string
}

withDefaults(defineProps<SideNavigationGroupProps>(), {
  label: undefined,
})

defineSlots<{
  /** The items belonging to this section. */
  default(): unknown
  /** A name made of markup, replacing the `label` prop. */
  label?(): unknown
}>()

const labelId = useId()
</script>

<template>
  <li class="v-side-nav-group">
    <span :id="labelId" class="v-side-nav-group-label"
      ><slot name="label">{{ label }}</slot></span
    >
    <ul class="v-side-nav-group-list" :aria-labelledby="labelId">
      <slot />
    </ul>
  </li>
</template>

<style>
@layer vectis.components {
  .v-side-nav-group + .v-side-nav-group,
  .v-side-nav-item + .v-side-nav-group {
    margin-block-start: var(--vectis-space-3);
  }

  /*
   * The indent repeats the rows' computation rather than sharing a variable with them: a custom
   * property set higher up would be frozen at level zero when substituted.
   */
  .v-side-nav-group-label {
    display: flex;
    align-items: center;
    min-block-size: var(--control-height);
    padding-block: var(--vectis-space-1);
    padding-inline: calc(
        var(--control-padding-inline) + var(--side-nav-level, 0) * var(--side-nav-indent)
      )
      var(--control-padding-inline);
    font-size: var(--vectis-text-overline-size);
    font-weight: var(--vectis-text-overline-weight);
    letter-spacing: var(--vectis-text-overline-tracking);
    color: var(--vectis-color-text-muted);
  }
}
</style>
