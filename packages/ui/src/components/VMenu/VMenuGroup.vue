<script setup lang="ts">
/**
 * A named section inside a menu: "Sort by", "Recent files". The name is announced as
 * the group's label rather than being read as one more item, and it is plain text: it
 * cannot be chosen, and the arrow keys walk straight past it.
 */

import { useId, useSlots, watchEffect } from 'vue'

import { isDev } from '../../utils/env'

interface MenuGroupProps {
  /**
   * The name of the section, replaced by the `#label` slot. One of the two is REQUIRED:
   * it is what names the group, and a section named by neither points its
   * `aria-labelledby` at an empty element. It is a heading, not a command: nothing
   * happens on click.
   */
  label?: string
}

const props = withDefaults(defineProps<MenuGroupProps>(), {
  label: undefined,
})

defineSlots<{
  /** The commands belonging to this section. */
  default(): unknown
  /** A name made of markup, replacing the `label` prop. */
  label?(): unknown
}>()

// @a11y @ssr
// The generated id ties the group to its own label, and matches between server and
// client by construction, Vue's `useId` guaranteeing exactly that.
const labelId = useId()

// @devwarn
// A group named by neither points its `aria-labelledby` at an empty element, and a
// screen reader announces an unnamed group with nothing on screen to say so.
if (isDev) {
  const slots = useSlots()
  watchEffect(() => {
    if (!props.label && !slots.label)
      console.warn('[VMenuGroup] needs a name: give it a `label` or a `#label` slot.')
  })
}
</script>

<template>
  <div role="group" class="v-menu-group" :aria-labelledby="labelId">
    <span :id="labelId" class="v-menu-group-label"
      ><slot name="label">{{ label }}</slot></span
    >
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

  .v-menu-group-label {
    display: flex;
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
