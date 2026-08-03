<script setup lang="ts">
import { useId } from 'vue'

/**
 * A named section of the navigation. The label is not focusable: it is text, and the
 * list it heads is named through `aria-labelledby`.
 *
 * No `role="group"` (unlike VMenuGroup): it cannot be a direct child of a `<ul>`
 * without breaking its required owned elements. A NAMED `<ul>` says the same thing,
 * in strictly valid HTML — and a group then takes exactly the same shape as a
 * branch.
 *
 * A group does NOT count as a hierarchy level: it declares neither of the two
 * depth-counter variables, which the level crosses intact.
 */
interface SideNavigationGroupProps {
  /** Name of the section (the #label slot wins). */
  label: string
}

defineProps<SideNavigationGroupProps>()

defineSlots<{
  /** The items of the section. */
  default(): unknown
  /** Rich name (wins over the `label` prop). */
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
   * Section micro-label: the overline role (no forced capitals — the label's case
   * belongs to the consumer). Indent AND height trace the rows' recipe — the header
   * holds the same height as a row, compact included (`--control-height` already
   * derives from it), so the list's vertical rhythm does not break; only the
   * typography stays outside the scale (the overline role), hence the vertical
   * centring.
   *
   * The indent repeats the rows' `calc`, deliberately: a custom property is
   * substituted on the element that DECLARES it, so a shared variable set higher up
   * would be frozen at level 0.
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
