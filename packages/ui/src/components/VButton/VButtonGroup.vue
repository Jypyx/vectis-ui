<script setup lang="ts">
/**
 * Joins several VButtons or VIconButtons into one segmented control: the borders
 * they share are merged into a single line, and only the two ends of the group keep
 * their rounded corners, so the row reads as one object rather than as buttons
 * placed side by side.
 *
 * How that object is drawn is settled here, in three decisions. `detached` leaves the
 * buttons apart, with a gap and their own corners, instead of joining them at all.
 * `seamless` keeps them joined but takes the lines out from between them, so the row
 * becomes a single frame. Everything else is the joined default.
 *
 * `fullWidth` is the row's width rather than its drawing: the group fills its parent, and
 * the segments divide that width into equal shares instead of each measuring its own
 * label, which is what a segmented control standing on a line of its own is asked for.
 *
 * Since the row is one object, how its segments are drawn is its decision too: the group
 * hands its variant, size, compact and elevated down to every button inside, and each of
 * them wins over what the button was given. The tone travels the other way, as a
 * fallback a button can refuse, so that one segment in the row can be the destructive
 * one, and `disabled` is cumulative rather than either. The rules and their reasons are
 * written out in `context.ts`.
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
   * Leaves the buttons as separate ones, with a gap between them and each keeping its
   * own corners, instead of joining them into a segmented control.
   */
  detached?: boolean
  /**
   * Takes the lines out from between the joined buttons, so the row reads as one frame
   * rather than as segments. It has no effect under `detached`, where the buttons are
   * apart already and there is no shared edge to draw on.
   */
  seamless?: boolean
  /**
   * Stretches the row across the whole inline size of its parent, every segment taking
   * an equal share of that width. A segment never shrinks below its own label, so a row
   * of labels too long for the parent overflows it rather than being crushed. Under
   * `vertical` it is the width alone: the segments already stretch across the column.
   */
  fullWidth?: boolean
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
  /**
   * Makes every segment unusable. A button that disables itself stays disabled either
   * way: the two answers add up rather than one overruling the other.
   */
  disabled?: boolean
}

const props = withDefaults(defineProps<ButtonGroupProps>(), {
  // `detached`, `seamless` and `fullWidth` are the group's own layout, and take a real
  // default like the orientation does. The six that follow travel down to the buttons,
  // and are `undefined` by default, the booleans included: it is `undefined`, and not
  // `false`, that means the group has no opinion and lets the button keep its own.
  orientation: 'horizontal',
  detached: false,
  seamless: false,
  fullWidth: false,
  variant: undefined,
  tone: undefined,
  size: undefined,
  compact: undefined,
  elevated: undefined,
  disabled: undefined,
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
  get disabled() {
    return props.disabled
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

    `data-seamless` is withheld under `detached`, so the DOM never carries a claim the
    markup cannot honour: apart, the buttons share no edge for a line to sit on.
  -->
  <div
    class="v-button-group"
    role="group"
    :data-orientation="orientation"
    :data-detached="detached ? '' : undefined"
    :data-seamless="seamless && !detached ? '' : undefined"
    :data-full-width="fullWidth ? '' : undefined"
  >
    <slot />
  </div>
</template>

<style>
@layer vectis.components {
  /*
   * A SEGMENT is a direct child of the group, and it is not always the button. A
   * companion puts a wrapper between the two: VTooltip renders `.v-tooltip` around its
   * trigger, VPopover renders `.v-popover` around the `#trigger` slot, VBadge renders
   * `.v-badge-host` around the element it pins its pill to, and a consumer may add one of
   * their own. Written against the button alone, every rule in this sheet would step
   * aside for a segment carrying any of the three, and the row would quietly come apart
   * into buttons standing side by side.
   *
   * So each of them is written for BOTH shapes:
   *
   *   > .v-button<tests>                              the button IS the segment
   *   > :not(:where(.v-overlay))<tests> > .v-button   the button is one level in
   *
   * Where the declarations land is decided by what they do. The PULL, the negative margin
   * that collapses two borders into one line, belongs to the segment: that is the box the
   * group lays out. The PAINT, the corners and the seam and the borders and the shadow,
   * belongs to the button, which carries them. Swapped, a wrapped segment would either be
   * pulled twice or paint nothing. A full-width row needs neither: its shares are tracks,
   * declared on the group itself and blind to what stands in them.
   *
   * The tests weigh the same on both branches (`:not(:first-child)` and `:has(~ …)` are
   * (0,1,0) each, and `:where()` weighs nothing), so a pair is always ONE specificity:
   * every figure quoted below holds for its wrapped half as well.
   *
   * ONE wrapper deep, and no more: the second branch uses the child combinator. That is
   * also what keeps these rules out of a PANEL's content, since VPopover renders its
   * panel inside the wrapper and a button in there is two levels down. VMenu adds no
   * wrapper at all, so a menu combines with any of the three.
   *
   * TRAP — `:not(:where(.v-overlay))` is what stops a panel from passing for a segment.
   * VMenu renders its panel as a SIBLING of its trigger, so a group holding a menu has a
   * child that is no segment, and every panel in the design system carries that class.
   */
  .v-button-group {
    display: inline-flex;
    /* Gives every segment the same height in a row, and the same width in a column,
       whatever each button's own content measures. */
    align-items: stretch;
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

  /* Equal shares, and they are TRACKS rather than flex bases. A row that reads as one
     object cannot be cut into unequal pieces by whichever words happen to be in it, which
     rules out distributing the free space alone; and `flex: 1 1 0` cannot do it either,
     because flex shares out CONTENT boxes: a segment ends up as wide as its share PLUS
     the padding and border it carries, the same for three buttons but one button's worth
     of padding narrower for a segment wrapped in a tooltip, a popover or a badge, none of
     which pad anything. Measured at 34px on an `md` row. A `1fr` track is the share
     itself, whatever happens to stand in it.

     `1fr` is `minmax(auto, 1fr)`, so the automatic minimum is kept: a segment never
     shrinks below its label, and a row of labels too long for its parent overflows rather
     than crushing text nothing here could then truncate, a VButton having no label box to
     put an ellipsis on. A menu's panel takes no track either way — closed it is
     `display: none`, open it is fixed, and neither is a grid item.

     Horizontal only. In a column the width is the whole of it, the base `align-items:
     stretch` already giving every segment the full inline size. */
  .v-button-group[data-full-width][data-orientation='horizontal'] {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
  }

  /* A wrapped button fills the segment it sits in. The wrapper is what the group
     stretches, a column stretching every segment across it and a full-width row giving
     each an equal share, and the button would otherwise stay at the width of its own
     label and leave the rest of the segment blank. A no-op everywhere else, the segment
     being sized by that same button to begin with. */
  .v-button-group > :not(:where(.v-overlay)):has(> .v-button) > .v-button {
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

  /* The negative margin pulls each segment onto its neighbour so their two 1px borders
     collapse into one line, over which the seam below is then laid: it draws the
     separation the filled variants would otherwise lack (their border is transparent)
     and unifies the joint between two outlined ones.

     Each block is scoped to one orientation on purpose. Left unscoped, the
     horizontal rules would also flatten the side corners and borders in a vertical
     group, where those are precisely the edges that must stay round. */
  .v-button-group:not([data-detached])[data-orientation='horizontal'] > .v-button:not(:first-child),
  .v-button-group:not([data-detached])[data-orientation='horizontal']
    > :not(:where(.v-overlay)):has(> .v-button):not(:first-child) {
    margin-inline-start: -1px;
  }

  .v-button-group:not([data-detached])[data-orientation='horizontal'] > .v-button:not(:first-child),
  .v-button-group:not([data-detached])[data-orientation='horizontal']
    > :not(:where(.v-overlay)):not(:first-child)
    > .v-button {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }

  /* TRAP — the last segment is read as `:has(~ :not(.v-overlay))` and no longer as
     `:not(:last-child)`, and that is VMenu's doing: it renders its panel as a SIBLING of
     its trigger, so a menu closing a row would leave its trigger short of `:last-child`,
     and the row would lose its outer corner there with nothing in the DOM to say why.
     Asking whether a real SEGMENT follows, rather than whether anything does, makes the
     panel invisible to the count and weighs exactly what the test it replaces did.

     The first segment needs none of that: a panel is rendered after the trigger it
     belongs to, so it can never take `:first-child` from a segment. */
  .v-button-group:not([data-detached])[data-orientation='horizontal']
    > .v-button:has(~ :not(.v-overlay)),
  .v-button-group:not([data-detached])[data-orientation='horizontal']
    > :not(:where(.v-overlay)):has(~ :not(.v-overlay))
    > .v-button {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }

  .v-button-group:not([data-detached])[data-orientation='vertical'] > .v-button:not(:first-child),
  .v-button-group:not([data-detached])[data-orientation='vertical']
    > :not(:where(.v-overlay)):has(> .v-button):not(:first-child) {
    margin-block-start: -1px;
  }

  .v-button-group:not([data-detached])[data-orientation='vertical'] > .v-button:not(:first-child),
  .v-button-group:not([data-detached])[data-orientation='vertical']
    > :not(:where(.v-overlay)):not(:first-child)
    > .v-button {
    border-start-start-radius: 0;
    border-start-end-radius: 0;
  }

  .v-button-group:not([data-detached])[data-orientation='vertical']
    > .v-button:has(~ :not(.v-overlay)),
  .v-button-group:not([data-detached])[data-orientation='vertical']
    > :not(:where(.v-overlay)):has(~ :not(.v-overlay))
    > .v-button {
    border-end-start-radius: 0;
    border-end-end-radius: 0;
  }

  /* The seam is a box of its own, and not the neighbour's own border, because CSS joins
     two adjacent borders at a MITRE: where a 1px border meets the transparent top and
     bottom ones of a solid segment, its last pixel is cut on the diagonal and the bar
     ends in a notch at each end. A box carrying that border on ONE side has no second
     border to join, so its ends stay square.

     A BORDER and not a background, the VSeparator argument: Windows forced-colors
     forces a background to Canvas, where the separation would vanish, and a border
     colour to CanvasText, where it survives.

     Absolute, so the insets resolve against the PADDING box: -1px is exactly the width
     of the border, which lays the bar over the border area and gives it the full length
     of the border box. Every segment is positioned so that they all paint in the same
     phase, in document order, the way they did as plain flex items. */
  .v-button-group > .v-button,
  .v-button-group > :not(:where(.v-overlay)) > .v-button {
    position: relative;
  }

  /* Only the generating rule is guarded. The two orientation rules below place the insets
     of a pseudo-element that, apart or seamless, is never generated at all. */
  .v-button-group:not([data-detached]):not([data-seamless]) > .v-button:not(:first-child)::before,
  .v-button-group:not([data-detached]):not([data-seamless])
    > :not(:where(.v-overlay)):not(:first-child)
    > .v-button::before {
    content: '';
    position: absolute;
  }

  .v-button-group[data-orientation='horizontal'] > .v-button:not(:first-child)::before,
  .v-button-group[data-orientation='horizontal']
    > :not(:where(.v-overlay)):not(:first-child)
    > .v-button::before {
    inset-block: -1px;
    inset-inline-start: -1px;
    border-inline-start: 1px solid var(--vectis-color-border);
  }

  .v-button-group[data-orientation='vertical'] > .v-button:not(:first-child)::before,
  .v-button-group[data-orientation='vertical']
    > :not(:where(.v-overlay)):not(:first-child)
    > .v-button::before {
    inset-inline: -1px;
    inset-block-start: -1px;
    border-block-start: 1px solid var(--vectis-color-border);
  }

  /* Seamless, the row is ONE object: an outer frame with nothing drawn inside it. The
     seam above is not generated, and what is left to clear is the segments' own borders
     on the edges they share.

     BOTH sides of every shared edge, never just one: the segments overlap by 1px, so a
     neighbour's border sits in the very same pixel column. Clearing one side alone leaves
     the other showing through wherever the segment painted on top has no background of
     its own, which is precisely the `ghost` and `outline` case.

     The COLOUR goes transparent rather than the border going away: every box keeps its
     1px on all four sides, so nothing in the row changes width and the corners stay where
     they were rounded.

     TRAP — the class is doubled to reach (0,6,0), and that is not decoration. Written
     once these are (0,5,0), which TIES with the compound a component overrides a
     segment's border through (VToggle's outline frame, `.v-toggle[data-variant='outline']
     > .v-toggle-item[aria-pressed='true']:is(…)`), and a tie between two sheets is
     settled by whichever the consumer's bundler put last. An internal edge is never part
     of a frame, so the group has to win by construction. VToggle's rules are written for
     the wrapped shape too, and take the same class there, so the gap between the two
     holds whether an item is wrapped or not. */
  .v-button-group.v-button-group[data-seamless][data-orientation='horizontal']
    > .v-button:not(:first-child),
  .v-button-group.v-button-group[data-seamless][data-orientation='horizontal']
    > :not(:where(.v-overlay)):not(:first-child)
    > .v-button {
    border-inline-start-color: transparent;
  }

  .v-button-group.v-button-group[data-seamless][data-orientation='horizontal']
    > .v-button:has(~ :not(.v-overlay)),
  .v-button-group.v-button-group[data-seamless][data-orientation='horizontal']
    > :not(:where(.v-overlay)):has(~ :not(.v-overlay))
    > .v-button {
    border-inline-end-color: transparent;
  }

  .v-button-group.v-button-group[data-seamless][data-orientation='vertical']
    > .v-button:not(:first-child),
  .v-button-group.v-button-group[data-seamless][data-orientation='vertical']
    > :not(:where(.v-overlay)):not(:first-child)
    > .v-button {
    border-block-start-color: transparent;
  }

  .v-button-group.v-button-group[data-seamless][data-orientation='vertical']
    > .v-button:has(~ :not(.v-overlay)),
  .v-button-group.v-button-group[data-seamless][data-orientation='vertical']
    > :not(:where(.v-overlay)):has(~ :not(.v-overlay))
    > .v-button {
    border-block-end-color: transparent;
  }

  /* The elevation belongs to the ROW, not to each segment. Left to the buttons, every
     one of them casts a shadow onto the neighbour it overlaps, and the joints fill with
     a dark band instead of the whole reading as one object lifted off the page. So the
     group takes the shadow and the segments give theirs up, which also means the row
     rises as a whole when any of it is hovered.

     `:has()` rather than a data attribute on the root: the elevation reaches the
     buttons either from the group or one by one, and only the buttons know in the end.
     Its argument is a list, so a wrapped segment answers for itself, and since a
     selector list takes the specificity of its heaviest member, the two branches leave
     the weight where it was.

     The raised BACKGROUND stays with each button. It is what a ghost or an outline
     segment is painted on, and in the dark theme it is what the shadow needs in order
     to have something casting it.

     Detached, none of this applies and every rule steps aside: the buttons are apart, so
     there is no joint to fill and each of them casting its own shadow is right. */
  .v-button-group:not([data-detached]):has(
      > .v-button[data-elevated],
      > :not(:where(.v-overlay)) > .v-button[data-elevated]
    ) {
    border-radius: var(--vectis-radius-interactive);
    box-shadow: var(--vectis-shadow-sm);
    transition: box-shadow var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-button-group:not([data-detached]):has(
      > .v-button[data-elevated]:hover:not(:disabled, [aria-disabled='true']),
      > :not(:where(.v-overlay))
        > .v-button[data-elevated]:hover:not(:disabled, [aria-disabled='true'])
    ) {
    box-shadow: var(--vectis-shadow-md);
  }

  /* After the hover rule and at equal specificity, the VButton order: pressing a
     raised segment settles the row back down. */
  .v-button-group:not([data-detached]):has(
      > .v-button[data-elevated]:active:not(:disabled, [aria-disabled='true']),
      > :not(:where(.v-overlay))
        > .v-button[data-elevated]:active:not(:disabled, [aria-disabled='true'])
    ) {
    box-shadow: var(--vectis-shadow-sm);
  }

  /* The class is doubled to reach (0,6,0). VButton's own hover and active shadows are
     (0,4,0) on this very element, so at equal specificity the winner would be whichever
     of the two sheets the consumer's bundler happened to put last. */
  .v-button-group.v-button-group:not([data-detached]) > .v-button[data-elevated],
  .v-button-group.v-button-group:not([data-detached]) > .v-button[data-elevated]:hover,
  .v-button-group.v-button-group:not([data-detached]) > .v-button[data-elevated]:active,
  .v-button-group.v-button-group:not([data-detached])
    > :not(:where(.v-overlay))
    > .v-button[data-elevated],
  .v-button-group.v-button-group:not([data-detached])
    > :not(:where(.v-overlay))
    > .v-button[data-elevated]:hover,
  .v-button-group.v-button-group:not([data-detached])
    > :not(:where(.v-overlay))
    > .v-button[data-elevated]:active {
    box-shadow: none;
  }

  /* A FOCUSED segment rises above its neighbours, and it is the ONLY state that does.
     The ring is drawn outside the border box, so the next segment, painted later, would
     cut through it along the seam: removing this rule takes the keyboard focus ring away
     on one side of every segment but the last.

     Hover and active are deliberately not here, and putting them back is a visible bug:
     segments overlap by one pixel, and that pixel is the neighbour's own border, which
     is to say the seam. A raised segment paints its background over it, so the
     separation disappears on the far side of whichever segment the pointer is on, for
     the whole time it is there. A focused one covers it too, but under a ring that is
     drawing that edge itself.

     Wrapped, the `z-index` stays on the BUTTON and still counts among the segments: none
     of the three wrappers opens a stacking context, two being unpositioned and
     `.v-badge-host`, which is `position: relative`, keeping `z-index: auto`. Were one of
     them to take a `z-index`, this rule would raise the button inside that wrapper's own
     context and nothing on the page. */
  .v-button-group > .v-button:focus-visible,
  .v-button-group > :not(:where(.v-overlay)) > .v-button:focus-visible {
    z-index: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .v-button-group:not([data-detached]):has(
        > .v-button[data-elevated],
        > :not(:where(.v-overlay)) > .v-button[data-elevated]
      ) {
      transition: none;
    }
  }
}
</style>
