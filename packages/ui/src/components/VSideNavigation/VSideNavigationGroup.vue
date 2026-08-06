<script setup lang="ts">
import { useId } from 'vue'

/**
 * A named section of the navigation — "Workspace", "Settings". The name is plain text:
 * it cannot be focused or clicked, and it names the sublist under it for assistive
 * technology.
 *
 * Unlike a menu group, it does NOT claim to be a group in ARIA terms. Such a role
 * cannot be a direct child of a list without breaking what that list is allowed to
 * contain. A NAMED sublist says exactly the same thing in strictly valid HTML — and it
 * gives a group the same shape as a branch, which is what keeps the styling uniform.
 *
 * A group is NOT a level of the hierarchy: it declares neither of the two variables
 * counting the depth, so that count passes through it untouched and the items inside
 * are indented as if the group were not there.
 */
interface SideNavigationGroupProps {
  /** The name of the section. The `#label` slot replaces it. */
  label: string
}

defineProps<SideNavigationGroupProps>()

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
   * The section heading takes the overline type role, without forcing capitals: how
   * the label is written is the consumer's decision.
   *
   * Its indent and its height are the rows' own recipe, so a heading occupies exactly
   * the height of a row — compact included — and the vertical rhythm of the list is
   * not broken by it. The type is the one thing staying outside that scale, which is
   * why the text has to be centred vertically by hand.
   *
   * TRAP — the indent repeats the rows' computation rather than sharing a variable
   * with them, and it has to: a custom property is substituted on the element that
   * DECLARES it, so a shared one set higher up would be frozen at level zero.
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
