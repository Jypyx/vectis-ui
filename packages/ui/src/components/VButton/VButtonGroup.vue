<script setup lang="ts">
/**
 * Visually joins several VButton/VIconButton into a segmented control: merged
 * borders, rounded corners only at the ends of the group. It is all CSS (no
 * provide/inject) — each button keeps its own props; setting the same
 * variant/tone/size on the children gives a coherent rendering.
 */
interface ButtonGroupProps {
  /** Direction of the joining. Defaults to horizontal. */
  orientation?: 'horizontal' | 'vertical'
}

withDefaults(defineProps<ButtonGroupProps>(), {
  orientation: 'horizontal',
})

defineSlots<{
  /** The VButton/VIconButton elements to join. */
  default(): unknown
}>()
</script>

<template>
  <div class="v-button-group" role="group" :data-orientation="orientation">
    <slot />
  </div>
</template>

<style>
@layer vectis.components {
  .v-button-group {
    display: inline-flex;
    /* equalizes heights (horizontal) or widths (vertical) across the segments */
    align-items: stretch;
  }

  .v-button-group[data-orientation='vertical'] {
    flex-direction: column;
  }

  /* Collapses the shared 1px border (negative margin) and lays a neutral seam
     that materializes the separation for the filled variants (transparent
     border) and unifies the joint of the outline ones. Each block is scoped to
     its orientation: otherwise the horizontal rules would also zero out the side
     corners and borders in vertical mode. */
  .v-button-group[data-orientation='horizontal'] > .v-button:not(:first-child) {
    margin-inline-start: -1px;
    border-inline-start-color: var(--vectis-color-border);
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }

  .v-button-group[data-orientation='horizontal'] > .v-button:not(:last-child) {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }

  .v-button-group[data-orientation='vertical'] > .v-button:not(:first-child) {
    margin-block-start: -1px;
    border-block-start-color: var(--vectis-color-border);
    border-start-start-radius: 0;
    border-start-end-radius: 0;
  }

  .v-button-group[data-orientation='vertical'] > .v-button:not(:last-child) {
    border-end-start-radius: 0;
    border-end-end-radius: 0;
  }

  /* The hovered/focused/active button rises above its neighbours: otherwise its
     tinted border and focus ring are clipped by the adjacent segment. */
  .v-button-group > .v-button:hover,
  .v-button-group > .v-button:focus-visible,
  .v-button-group > .v-button:active {
    z-index: 1;
  }
}
</style>
