<script setup lang="ts">
/**
 * Joins several VButtons or VIconButtons into one segmented control: the borders
 * they share are merged into a single line, and only the two ends of the group keep
 * their rounded corners, so the row reads as one object rather than as buttons
 * placed side by side.
 *
 * Since the row is one object, how it is drawn is its own decision: the group hands
 * its variant, size, compact and elevated down to every button inside, and each of
 * them wins over what the button was given. The tone travels the other way, as a
 * fallback a button can refuse, so that one segment in the row can be the destructive
 * one. The rule and its reasons are written out in `context.ts`.
 *
 * Naming none of them leaves every child exactly as it would have rendered on its
 * own: the context then holds `undefined` throughout, and `undefined` is what hands a
 * prop back to its owner.
 */
import { provide } from 'vue'

import type { ButtonSize, ButtonTone, ButtonVariant } from './VButton.vue'
import { buttonGroupKey } from './context'

interface ButtonGroupProps {
  /**
   * The direction the buttons are joined in: a row by default, or a column under
   * `vertical`.
   */
  orientation?: 'horizontal' | 'vertical'
  /**
   * How much visual weight every segment carries, on the values of VButton's own
   * `variant`: `solid`, `outline`, `ghost` or `soft`. It wins over the variant a
   * button inside was given.
   */
  variant?: ButtonVariant
  /**
   * The colour the segments take, among `accent`, `neutral` and `danger`. This one is
   * a fallback rather than an order: a button that names a tone of its own keeps it,
   * which is what lets a single destructive action stand out in the row.
   */
  tone?: ButtonTone
  /**
   * The height of the segments, from the size scale shared by every control:
   * `xs`, `sm`, `md`, `lg` or `xl`. It wins over the size a button inside was given.
   */
  size?: ButtonSize
  /**
   * Takes 4px off the height of every segment. It wins over the value a button inside
   * was given.
   */
  compact?: boolean
  /**
   * Raises every segment off the page, on the terms of VButton's own `elevated`. It
   * wins over the value a button inside was given.
   */
  elevated?: boolean
}

const props = withDefaults(defineProps<ButtonGroupProps>(), {
  orientation: 'horizontal',
  // All five are `undefined` by default, the booleans included: it is `undefined`, and
  // not `false`, that means the group has no opinion and lets the button keep its own.
  variant: undefined,
  tone: undefined,
  size: undefined,
  compact: undefined,
  elevated: undefined,
})

defineSlots<{
  /** The VButtons and VIconButtons to join together. */
  default(): unknown
}>()

// Getters, so the group's props stay reactive on the other side of the injection.
provide(buttonGroupKey, {
  get variant() {
    return props.variant
  },
  get tone() {
    return props.tone
  },
  get size() {
    return props.size
  },
  get compact() {
    return props.compact
  },
  get elevated() {
    return props.elevated
  },
})
</script>

<template>
  <!--
    The size travels through the injection alone, and the root deliberately carries
    neither `v-control` nor `data-size`, where VAvatarGroup carries both: nothing in
    this sheet reads a `--control-*` variable, and `v-control` set a second time above
    a subtree that already has it re-derives `--control-height` from the base height,
    dropping the compact its buttons had applied (styles/control-size.css).
  -->
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
