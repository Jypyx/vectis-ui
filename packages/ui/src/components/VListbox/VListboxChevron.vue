<script setup lang="ts">
/**
 * Draw the chevron at the end of a field owning a listbox, turned while the list is open. It is
 * decorative: the field itself says whether the list is expanded.
 */
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'

interface ListboxChevronProps {
  /** The icon to draw. */
  icon: IconSource
  /** Whether the list is open. */
  open?: boolean
}

withDefaults(defineProps<ListboxChevronProps>(), { open: false })
</script>

<template>
  <!-- `.v-input-icon-end` lets VInput pin it to the end of the field and reserve its room. -->
  <VIcon
    v-bind="iconProps(icon)"
    class="v-listbox-chevron v-input-icon-end"
    :data-open="open ? '' : undefined"
    aria-hidden="true"
  />
</template>

<style>
@layer vectis.components {
  .v-listbox-chevron {
    color: var(--vectis-color-text-muted);
    transition: rotate var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-listbox-chevron[data-open] {
    rotate: 180deg;
  }

  @media (prefers-reduced-motion: reduce) {
    .v-listbox-chevron {
      transition: none;
    }
  }
}
</style>
