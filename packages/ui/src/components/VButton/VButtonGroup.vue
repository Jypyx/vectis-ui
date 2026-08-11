<script setup lang="ts">
/**
 * Joins several VButtons or VIconButtons into one segmented control: the borders
 * they share are merged into a single line, and only the two ends of the group keep
 * their rounded corners, so the row reads as one object rather than as buttons
 * placed side by side.
 *
 * Everything here is CSS — the group passes nothing down to its children, and each
 * button keeps the props it was given. Setting the same variant, tone and size on
 * all of them is therefore what makes the group look coherent.
 */
interface ButtonGroupProps {
  /**
   * The direction the buttons are joined in: a row by default, or a column under
   * `vertical`.
   */
  orientation?: 'horizontal' | 'vertical'
}

withDefaults(defineProps<ButtonGroupProps>(), {
  orientation: 'horizontal',
})

defineSlots<{
  /** The VButtons and VIconButtons to join together. */
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
    /* Gives every segment the same height in a row, and the same width in a column,
       whatever each button's own content measures. */
    align-items: stretch;
  }

  .v-button-group[data-orientation='vertical'] {
    flex-direction: column;
  }

  /* The negative margin pulls each segment onto its neighbour so their two 1px
     borders collapse into one, and that single line is then coloured as a neutral
     seam: it draws the separation the filled variants would otherwise lack (their
     border is transparent) and unifies the joint between two outlined ones.

     Each block is scoped to one orientation on purpose. Left unscoped, the
     horizontal rules would also flatten the side corners and borders in a vertical
     group, where those are precisely the edges that must stay round. */
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

  /* A button being hovered, focused or pressed rises above its neighbours. Since the
     segments overlap by one pixel, the one drawn later would otherwise clip its
     tinted border and, more visibly, cut through its focus ring. */
  .v-button-group > .v-button:hover,
  .v-button-group > .v-button:focus-visible,
  .v-button-group > .v-button:active {
    z-index: 1;
  }
}
</style>
