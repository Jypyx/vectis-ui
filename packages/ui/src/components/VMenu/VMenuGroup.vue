<script setup lang="ts">
import { useId } from 'vue'

// @a11y @ssr — the whole script is one `useId()`, and it exists only to wire
// `aria-labelledby`. SSR-safe by construction: `useId` matches server and client.
/**
 * A named group of items (role="group" + aria-labelledby, the ARIA menu pattern).
 * The label is not selectable: plain text, outside the roving focus.
 */
interface MenuGroupProps {
  /** Name of the group (not selectable). */
  label: string
}

defineProps<MenuGroupProps>()

defineSlots<{
  /** The group's VMenuItem elements. */
  default(): unknown
}>()

const labelId = useId()
</script>

<template>
  <div role="group" class="v-menu-group" :aria-labelledby="labelId">
    <span :id="labelId" class="v-menu-group-label">{{ label }}</span>
    <slot />
  </div>
</template>

<style>
@layer vectis.components {
  .v-menu-group {
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-1);
  }

  /* Section micro-label: the overline role (no forced capitals — the label's case
     belongs to the consumer). Indent AND height trace the items' recipe
     (`--control-padding-inline` and `--control-height`, inherited from the panel):
     the header holds the same height as a row, compact included, so the list's
     vertical rhythm does not break. Only the typography stays outside the scale
     (the overline role), hence the vertical centring. */
  .v-menu-group-label {
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
