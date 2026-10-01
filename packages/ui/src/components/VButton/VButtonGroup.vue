<script setup lang="ts">
/**
 * Group shape overrides individual buttons; tone is a fallback and disabled is cumulative. CSS
 * joins borders without changing native activation.
 */
import { provide, ref } from 'vue'

import type { ButtonSize, ButtonTone, ButtonVariant } from './VButton.vue'
import { buttonGroupKey } from './context'

import { useAriaLabel } from '../../composables/useAriaLabel'

/** Which way the row runs. */
export type ButtonGroupOrientation = 'horizontal' | 'vertical'

interface ButtonGroupProps {
  /**
   * The direction the buttons are joined in: a row by default, or a column under
   * `vertical`.
   */
  orientation?: ButtonGroupOrientation
  /**
   * Leaves the buttons as separate ones, with a gap between them and each keeping its
   * own corners, instead of joining them into a segmented control.
   */
  detached?: boolean
  /**
   * Draws a line between the joined buttons, so the row reads as segments rather than as one
   * frame. It has no effect under `detached`.
   */
  bordered?: boolean
  /**
   * Stretches the row across the whole inline size of its parent, every segment taking an equal
   * share of that width.
   */
  fullWidth?: boolean
  /**
   * How much visual weight every segment carries, on the values of VButton's own
   * `variant`: `solid`, `outline`, `ghost` or `soft`. It wins over the variant a
   * button inside was given.
   */
  variant?: ButtonVariant
  /** The colour the segments take, among `accent`, `neutral` and `danger`. */
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
  /**
   * Makes every segment unusable. A button that disables itself stays disabled either
   * way: the two answers add up rather than one overruling the other.
   */
  disabled?: boolean
  /**
   * What screen readers announce for the row, which is a `role="group"`: "Text formatting",
   * "View". A consumer `aria-label` or `aria-labelledby` wins over it.
   */
  label?: string
}

const props = withDefaults(defineProps<ButtonGroupProps>(), {
  // `detached`, `bordered` and `fullWidth` are the group's own layout, and take a real
  // default like the orientation does. The six that follow travel down to the buttons,
  // and are `undefined` by default, the booleans included: it is `undefined`, and not
  // `false`, that means the group has no opinion and lets the button keep its own.
  orientation: 'horizontal',
  detached: false,
  bordered: false,
  fullWidth: false,
  variant: undefined,
  tone: undefined,
  size: undefined,
  compact: undefined,
  elevated: undefined,
  disabled: undefined,
  label: undefined,
})

const ariaLabel = useAriaLabel(() => props.label)

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
  get disabled() {
    return props.disabled
  },
})

const groupEl = ref<HTMLElement | null>(null)

// A template ref on this component is not a safe way to its element: the comment above the
// root makes the template a fragment in development, where `$el` is a text anchor. VToggle,
// whose root this group is, reads the element from here.
defineExpose({
  /** The `role="group"` element. */
  el: groupEl,
})
</script>

<template>
  <!--
    `data-bordered` is withheld under `detached`, so the DOM never carries a claim the markup
    cannot honour: apart, the buttons share no edge for a line to sit on.
  -->
  <div
    ref="groupEl"
    class="v-button-group"
    role="group"
    :aria-label="ariaLabel"
    :data-orientation="orientation"
    :data-detached="detached ? '' : undefined"
    :data-bordered="bordered && !detached ? '' : undefined"
    :data-full-width="fullWidth ? '' : undefined"
  >
    <slot />
  </div>
</template>

<style>
@layer vectis.components {
  /*
   * `.v-overlay` appears in both guards, and neither is optional. A panel must not pass for a
   * segment: VMenu renders its panel as a SIBLING of its trigger, so a group holding a menu has
   * a child that is no segment at all.
   */
  .v-button-group {
    display: inline-flex;
    /* Gives every segment the same height in a row, and the same width in a column,
       whatever each button's own content measures. */
    align-items: stretch;
    /* Declared on every group although only a raised one ever moves its shadow: that is
       what lets the reduced-motion block cancel it with a bare selector rather than
       repeating the elevation `:has()` below. */
    transition: box-shadow var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-button-group[data-orientation='vertical'] {
    flex-direction: column;
  }

  /* An explicit display alongside the inline size, VButton's own full-width argument: an
     inline-level box sits on a line box, and the strut's descender would show as a few
     pixels of dead space under a row asked to fill its parent. */
  .v-button-group[data-full-width] {
    display: flex;
    inline-size: 100%;
  }

  /*
   * Grid tracks equalize complete border boxes; flex distributes content boxes and leaves
   * wrapped segments narrower by their missing padding.
   */
  .v-button-group[data-full-width][data-orientation='horizontal'] {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
  }

  /*
   * The two selectors are what keeps this out of a plain horizontal row, and that is not an
   * optimization. Nothing is stretched there: each segment is as wide as its own content, so a
   * percentage on the button would resolve against a wrapper whose width depends on that very
   * button, which is circular, and a wrapped segment would stop measuring its label.
   */
  .v-button-group[data-orientation='vertical']
    > :not(:where(.v-overlay, .v-button-group)):has(.v-button:not(:where(.v-overlay *)))
    :is(.v-button, :has(.v-button)):not(:where(.v-overlay, .v-overlay *)),
  .v-button-group[data-full-width][data-orientation='horizontal']
    > :not(:where(.v-overlay, .v-button-group)):has(.v-button:not(:where(.v-overlay *)))
    :is(.v-button, :has(.v-button)):not(:where(.v-overlay, .v-overlay *)) {
    inline-size: 100%;
  }

  /* Detached, the buttons are simply spaced: the base rule already gives the flex box
     and the vertical direction, so a gap and the cross-axis alignment are the whole
     difference. The vertical rule restores the stretching the base declares, which the
     centring above beats by one attribute. */
  .v-button-group[data-detached] {
    align-items: center;
    gap: var(--vectis-space-1);
  }

  .v-button-group[data-detached][data-orientation='vertical'] {
    align-items: stretch;
  }

  /*
   * The negative margin pulls each segment onto its neighbour so their two 1px borders collapse
   * into one line, over which the seam below is then laid: it draws the separation the filled
   * variants would otherwise lack (their border is transparent) and unifies the joint between
   * two outlined ones. Each block is scoped to one orientation on purpose.
   */
  .v-button-group:not([data-detached])[data-orientation='horizontal'] > .v-button:not(:first-child),
  .v-button-group:not([data-detached])[data-orientation='horizontal']
    > :not(:where(.v-overlay, .v-button-group)):has(.v-button:not(:where(.v-overlay *))):not(
      :first-child
    ) {
    margin-inline-start: -1px;
  }

  .v-button-group:not([data-detached])[data-orientation='horizontal'] > .v-button:not(:first-child),
  .v-button-group:not([data-detached])[data-orientation='horizontal']
    > :not(:where(.v-overlay, .v-button-group)):not(:first-child)
    .v-button:not(:where(.v-overlay *)) {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }

  /*
   * The first segment needs none of that: a panel is rendered after the trigger it belongs to,
   * so it can never take `:first-child` from a segment.
   */
  .v-button-group:not([data-detached])[data-orientation='horizontal']
    > .v-button:has(~ :not(.v-overlay)),
  .v-button-group:not([data-detached])[data-orientation='horizontal']
    > :not(:where(.v-overlay, .v-button-group)):has(~ :not(.v-overlay))
    .v-button:not(:where(.v-overlay *)) {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }

  .v-button-group:not([data-detached])[data-orientation='vertical'] > .v-button:not(:first-child),
  .v-button-group:not([data-detached])[data-orientation='vertical']
    > :not(:where(.v-overlay, .v-button-group)):has(.v-button:not(:where(.v-overlay *))):not(
      :first-child
    ) {
    margin-block-start: -1px;
  }

  .v-button-group:not([data-detached])[data-orientation='vertical'] > .v-button:not(:first-child),
  .v-button-group:not([data-detached])[data-orientation='vertical']
    > :not(:where(.v-overlay, .v-button-group)):not(:first-child)
    .v-button:not(:where(.v-overlay *)) {
    border-start-start-radius: 0;
    border-start-end-radius: 0;
  }

  .v-button-group:not([data-detached])[data-orientation='vertical']
    > .v-button:has(~ :not(.v-overlay)),
  .v-button-group:not([data-detached])[data-orientation='vertical']
    > :not(:where(.v-overlay, .v-button-group)):has(~ :not(.v-overlay))
    .v-button:not(:where(.v-overlay *)) {
    border-end-start-radius: 0;
    border-end-end-radius: 0;
  }

  /*
   * The seam is a box of its own, and not the neighbour's own border, because CSS joins two
   * adjacent borders at a MITRE: where a 1px border meets the transparent top and bottom ones
   * of a solid segment, its last pixel is cut on the diagonal and the bar ends in a notch at
   * each end. A box carrying that border on ONE side has no second border to join, so its ends
   * stay square.
   */
  .v-button-group > .v-button,
  .v-button-group > :not(:where(.v-overlay, .v-button-group)) .v-button:not(:where(.v-overlay *)) {
    position: relative;
  }

  /* Only the generating rule is guarded. The two orientation rules below place the insets
     of a pseudo-element that, unless the row is bordered, is never generated at all. */
  .v-button-group[data-bordered] > .v-button:not(:first-child)::before,
  .v-button-group[data-bordered]
    > :not(:where(.v-overlay, .v-button-group)):not(:first-child)
    .v-button:not(:where(.v-overlay *))::before {
    content: '';
    position: absolute;
  }

  .v-button-group[data-orientation='horizontal'] > .v-button:not(:first-child)::before,
  .v-button-group[data-orientation='horizontal']
    > :not(:where(.v-overlay, .v-button-group)):not(:first-child)
    .v-button:not(:where(.v-overlay *))::before {
    inset-block: -1px;
    inset-inline-start: -1px;
    border-inline-start: 1px solid var(--vectis-color-border);
  }

  .v-button-group[data-orientation='vertical'] > .v-button:not(:first-child)::before,
  .v-button-group[data-orientation='vertical']
    > :not(:where(.v-overlay, .v-button-group)):not(:first-child)
    .v-button:not(:where(.v-overlay *))::before {
    inset-inline: -1px;
    inset-block-start: -1px;
    border-block-start: 1px solid var(--vectis-color-border);
  }

  /*
   * Unless the row is bordered, the borders on both sides of every shared edge are cleared. The
   * `:not([data-detached])` guard is also what brings these to (0,6,0), and that weight is not
   * decoration. Without it they are (0,5,0), which TIES with the compound a component overrides
   * a segment's border through
   * (VToggle's outline frame,
   * `.v-toggle[data-item-variant='outline'] > .v-toggle-item[aria-pressed='true']:is(…)`), and
   * a tie between two sheets is settled by whichever the consumer's bundler put last.
   */
  .v-button-group:not([data-detached]):not([data-bordered])[data-orientation='horizontal']
    > .v-button:not(:first-child),
  .v-button-group:not([data-detached]):not([data-bordered])[data-orientation='horizontal']
    > :not(:where(.v-overlay, .v-button-group)):not(:first-child)
    .v-button:not(:where(.v-overlay *)) {
    border-inline-start-color: transparent;
  }

  .v-button-group:not([data-detached]):not([data-bordered])[data-orientation='horizontal']
    > .v-button:has(~ :not(.v-overlay)),
  .v-button-group:not([data-detached]):not([data-bordered])[data-orientation='horizontal']
    > :not(:where(.v-overlay, .v-button-group)):has(~ :not(.v-overlay))
    .v-button:not(:where(.v-overlay *)) {
    border-inline-end-color: transparent;
  }

  .v-button-group:not([data-detached]):not([data-bordered])[data-orientation='vertical']
    > .v-button:not(:first-child),
  .v-button-group:not([data-detached]):not([data-bordered])[data-orientation='vertical']
    > :not(:where(.v-overlay, .v-button-group)):not(:first-child)
    .v-button:not(:where(.v-overlay *)) {
    border-block-start-color: transparent;
  }

  .v-button-group:not([data-detached]):not([data-bordered])[data-orientation='vertical']
    > .v-button:has(~ :not(.v-overlay)),
  .v-button-group:not([data-detached]):not([data-bordered])[data-orientation='vertical']
    > :not(:where(.v-overlay, .v-button-group)):has(~ :not(.v-overlay))
    .v-button:not(:where(.v-overlay *)) {
    border-block-end-color: transparent;
  }

  /*
   * Its argument is a list, so a wrapped segment answers for itself, and since a selector list
   * takes the specificity of its heaviest member, the two branches leave the weight where it
   * was. The raised BACKGROUND stays with each button.
   */
  .v-button-group:not([data-detached]):has(
      > .v-button[data-elevated],
      > :not(:where(.v-overlay, .v-button-group)) .v-button[data-elevated]:not(:where(.v-overlay *))
    ) {
    border-radius: var(--vectis-radius-interactive);
    box-shadow: var(--vectis-shadow-sm);
  }

  .v-button-group:not([data-detached]):has(
      > .v-button[data-elevated]:hover:not(:disabled, [aria-disabled='true']),
      > :not(:where(.v-overlay, .v-button-group))
        .v-button[data-elevated]:hover:not(:disabled, [aria-disabled='true']):not(
          :where(.v-overlay *)
        )
    ) {
    box-shadow: var(--vectis-shadow-md);
  }

  /* After the hover rule and at equal specificity, the VButton order: pressing a
     raised segment settles the row back down. */
  .v-button-group:not([data-detached]):has(
      > .v-button[data-elevated]:active:not(:disabled, [aria-disabled='true']),
      > :not(:where(.v-overlay, .v-button-group))
        .v-button[data-elevated]:active:not(:disabled, [aria-disabled='true']):not(
          :where(.v-overlay *)
        )
    ) {
    box-shadow: var(--vectis-shadow-sm);
  }

  /*
   * VButton's own hover and active shadows are (0,4,0) on this very element, so at equal
   * specificity the winner would be whichever of the two sheets the consumer's bundler happened
   * to put last.
   */
  .v-button-group.v-button-group:not([data-detached]) > .v-button[data-elevated],
  .v-button-group.v-button-group:not([data-detached]) > .v-button[data-elevated]:hover,
  .v-button-group.v-button-group:not([data-detached]) > .v-button[data-elevated]:active,
  .v-button-group.v-button-group:not([data-detached])
    > :not(:where(.v-overlay, .v-button-group))
    .v-button[data-elevated]:not(:where(.v-overlay *)),
  .v-button-group.v-button-group:not([data-detached])
    > :not(:where(.v-overlay, .v-button-group))
    .v-button[data-elevated]:hover:not(:where(.v-overlay *)),
  .v-button-group.v-button-group:not([data-detached])
    > :not(:where(.v-overlay, .v-button-group))
    .v-button[data-elevated]:active:not(:where(.v-overlay *)) {
    box-shadow: none;
  }

  /*
   * Raise keyboard focus above the next segment to preserve the shared-edge ring. Do not raise
   * hover/active states, which would cover the neighbour's border seam.
   */
  .v-button-group > .v-button:focus-visible,
  .v-button-group
    > :not(:where(.v-overlay, .v-button-group))
    .v-button:focus-visible:not(:where(.v-overlay *)) {
    z-index: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .v-button-group {
      transition: none;
    }
  }
}
</style>
