<script setup lang="ts">
// @a11y
// The component's ONLY behavioural JS, and it exists entirely for
// accessibility: an <a> has no native `disabled`, so the inert-link bridge has to
// reproduce it by hand.
/**
 * The button that triggers an action, and the reference from which the tone and
 * variant tables of every other coloured component are taken.
 *
 * It renders a native <button>, or an <a> as soon as it is given an `href`, so
 * focus, keyboard activation and disabling all come from the browser. Its one piece
 * of behavioural code is the inert link: a link has no `disabled` attribute of its
 * own, so a disabled or loading <a> has its address removed — it can then be
 * neither focused nor followed — receives `aria-disabled` for assistive technology,
 * and has the click handlers it was given filtered out. Together these reproduce
 * the complete inertness that a <button disabled> gets for free.
 *
 * Inside a VButtonGroup it reads what the row decided: the group wins on the four
 * props that give the control its shape, the button keeps its own tone. The rule and
 * its reasons live in `context.ts`.
 */
import { computed, inject, useAttrs } from 'vue'
import type { ButtonHTMLAttributes } from 'vue'

import { buttonGroupKey } from './context'

import { useControlShape } from '../../composables/useControlShape'
import { useInertLink } from '../../composables/useInertLink'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import VSpinner from '../VSpinner/VSpinner.vue'

/*
 * The three unions a VButtonGroup has to name in order to hand them down, declared
 * BEFORE the interface and referenced from it. `build-api.ts` prints a type as the
 * source spells it, so this is what makes the documentation site name the type on the
 * Button page as it already does on the Chip, Tabs and Toggle ones — and what stops
 * the IconButton page from naming a type its own page leaves unnamed.
 */
/** How much visual weight the button carries. */
export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'soft'
/** What the action means, in colour. */
export type ButtonTone = 'accent' | 'neutral' | 'danger'
/** The height of the button, from the scale every control shares. */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps {
  /**
   * How much visual weight the button carries: `solid` is filled with the tone,
   * `soft` uses a tinted background, `outline` keeps only a border, and `ghost`
   * shows nothing until it is hovered. Inside a VButtonGroup the group's own variant
   * wins over this one.
   */
  variant?: ButtonVariant
  /**
   * What the action means: `accent` for the ordinary one, `neutral` for a secondary
   * one, `danger` for one that destroys something. On a button a tone is an
   * intention, which is why states such as success or warning are not offered here.
   * Left out inside a VButtonGroup it takes the group's tone, which is the point of
   * not defaulting it here; on its own it is `accent`.
   */
  tone?: ButtonTone
  /**
   * Raises the button off the page: a shadow that grows on hover and settles back
   * when pressed, whatever the variant. On `ghost` and `outline`, which have no
   * background of their own, it also paints the raised surface: in the dark theme
   * a shadow lying straight on the page background has nothing casting it. Inside a
   * VButtonGroup the group's own value wins over this one.
   */
  elevated?: boolean
  /**
   * The height of the button, taken from the size scale shared by every control.
   * Inside a VButtonGroup the group's own size wins over this one.
   */
  size?: ButtonSize
  /**
   * Takes 4px off the height, leaving the padding, the text and the icons as they
   * are. Inside a VButtonGroup the group's own value wins over this one.
   */
  compact?: boolean
  /**
   * Stretches the button to the whole inline size of its parent, instead of leaving
   * it only as wide as its content. The label stays centred, and the button becomes
   * block-level, so it no longer sits on a line of text.
   */
  fullWidth?: boolean
  /**
   * Turns the button into an `<a>` pointing at this address. A disabled or loading
   * link becomes inert: the address is dropped, so it can be neither focused nor
   * followed.
   */
  href?: string
  /** The native type of the button. It is ignored as soon as `href` makes it a link. */
  type?: ButtonHTMLAttributes['type']
  /**
   * Makes the button unusable: it stops responding, leaves the tab order and greys
   * out through the colour tokens.
   */
  disabled?: boolean
  /**
   * Shows a spinner, disables the button and announces it as busy. The spinner takes
   * the place of the start slot (`iconStart` / `#start`), so an icon and a spinner
   * are never displayed side by side.
   */
  loading?: boolean
  /** An icon before the label. The `#start` slot replaces it when both are given. */
  iconStart?: IconSource
  /** An icon after the label. The `#end` slot replaces it when both are given. */
  iconEnd?: IconSource
  /**
   * Renders `iconStart` and `iconEnd` in their filled form (the font's `FILL` axis).
   * It has no effect on the `#start`/`#end` slots, whose icons the consumer builds.
   */
  iconFilled?: boolean
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'solid',
  // TRAP — the only one of the five with no default. `tone` is the prop a button keeps
  // against its group, so `undefined` has to stay distinguishable from an explicit
  // `accent`, which would otherwise silence the group for every button in the row.
  tone: undefined,
  elevated: false,
  size: 'md',
  compact: false,
  fullWidth: false,
  href: undefined,
  type: 'button',
  disabled: false,
  loading: false,
  iconStart: undefined,
  iconEnd: undefined,
  iconFilled: false,
})

defineSlots<{
  /** The label of the button. */
  default(): unknown
  /**
   * Content placed before the label, usually an icon. Mark it `aria-hidden` when it
   * only repeats what the label already says.
   */
  start?(): unknown
  /** Content placed after the label. */
  end?(): unknown
}>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const group = inject(buttonGroupKey, null)

// The shape of the segmented control belongs to the row: the group is read first, and a
// group that named nothing hands the prop straight back. The tone goes the other way,
// the button's own answer first (see context.ts).
const {
  size: resolvedSize,
  compact: resolvedCompact,
  disabled: resolvedDisabled,
} = useControlShape<ButtonSize>(props, group)
const resolvedVariant = computed<ButtonVariant>(() => group?.variant ?? props.variant)
const resolvedElevated = computed(() => group?.elevated ?? props.elevated)
// The tone goes the OTHER way, the button's own answer first: one action in a row can be
// the destructive one, and the row has to be able to say so (see context.ts).
const resolvedTone = computed<ButtonTone>(() => props.tone ?? group?.tone ?? 'accent')

const isInert = computed(() => resolvedDisabled.value || props.loading)
const {
  isLink,
  isInertLink,
  linkHref,
  attrs: passedAttrs,
} = useInertLink({
  href: () => props.href,
  inert: () => isInert.value,
  attrs: () => attrs,
})
</script>

<template>
  <component
    :is="isLink ? 'a' : 'button'"
    :aria-disabled="isInertLink ? 'true' : undefined"
    :aria-busy="loading || undefined"
    v-bind="passedAttrs"
    class="v-button v-control v-tone v-variant"
    :href="linkHref"
    :type="isLink ? undefined : type"
    :disabled="isLink ? undefined : isInert"
    :data-variant="resolvedVariant"
    :data-tone="resolvedTone"
    :data-elevated="resolvedElevated ? '' : undefined"
    :data-size="resolvedSize"
    :data-compact="resolvedCompact ? '' : undefined"
    :data-full-width="fullWidth ? '' : undefined"
    :data-loading="loading ? '' : undefined"
  >
    <!-- The button already carries aria-busy, so the spinner is hidden from
         assistive technology: its own role="status" would announce the same state a
         second time -->
    <span v-if="loading" class="v-button-spinner" aria-hidden="true">
      <VSpinner />
    </span>
    <slot v-else name="start">
      <VIcon v-if="iconStart" v-bind="iconProps(iconStart)" :filled="iconFilled" />
    </slot>
    <slot />
    <slot name="end">
      <VIcon v-if="iconEnd" v-bind="iconProps(iconEnd)" :filled="iconFilled" />
    </slot>
  </component>
</template>

<style>
@layer vectis.components {
  .v-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--control-gap);
    block-size: var(--control-height);
    padding-inline: var(--control-padding-inline);
    border: 1px solid transparent;
    border-radius: var(--vectis-radius-interactive);
    font-family: var(--vectis-text-family);
    font-size: var(--control-font-size);
    font-weight: var(--vectis-text-control-weight);
    line-height: var(--vectis-text-control-leading);
    text-decoration: none;
    cursor: pointer;
    transition:
      background-color var(--vectis-duration-fast) var(--vectis-ease-default),
      border-color var(--vectis-duration-fast) var(--vectis-ease-default),
      color var(--vectis-duration-fast) var(--vectis-ease-default),
      box-shadow var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  /* An explicit display, rather than a width alone: an inline-level box sits on a line
     box, which would add the strut's descender under a button the consumer asked to
     fill its parent. Block-level, it measures the parent's content box exactly. */
  .v-button[data-full-width] {
    display: flex;
    inline-size: 100%;
  }

  /* An icon and no label: the button becomes a square, as wide as it is tall. The attribute
     is set by whatever renders the button that way — VIconButton always, a VTab or a
     VToggleItem given an icon and no label — and the rule lives here because this sheet
     owns the padding it cancels.

     A FLOOR rather than a width, so a box that is stretched (a column of segments, a
     full-width row) still fills its track, and an icon wider than the box still fits.

     TRAP — at (0,2,0) it beats this sheet's own padding by weight, and it is the only rule
     that may touch that padding on an icon-only button. A consumer of VButton restyling the
     padding of its own buttons at (0,2,0) from another sheet would tie with it, and the
     bundler would decide: such a rule has to exclude `[data-icon-only]`. */
  .v-button[data-icon-only] {
    min-inline-size: var(--control-height);
    padding-inline: 0;
  }

  .v-button:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  /* The tone table lives in styles/tones.css (`v-tone`, in the vectis.tokens layer) and the
     four ways of painting it in styles/variants.css (`v-variant`, in vectis.components).
     VButton overrides not a single one of their values: it is the reference they were
     written for, and what stays here is the STATES, which each component answers for
     itself. */

  .v-button[data-variant='solid']:hover:not(:disabled, [aria-disabled='true']) {
    background: var(--tone-bg-solid-hover);
  }

  .v-button[data-variant='solid']:active:not(:disabled, [aria-disabled='true']) {
    background: var(--tone-bg-solid-active);
  }

  /* The `:not([data-elevated])` is what makes these rules DISJOINT from the
     elevation rules below, rather than merely less specific than them. Nothing then
     arbitrates the background of a raised ghost by a one-step specificity margin,
     so a declaration added to either set later cannot silently leak into the other
     case. */
  .v-button:is([data-variant='outline'], [data-variant='ghost']):not([data-elevated]):hover:not(
      :disabled,
      [aria-disabled='true']
    ) {
    background: var(--tone-bg-soft);
  }

  /* One step of tint, reached two ways: pressing a ghost or an outline, which already sit on
     the soft surface while hovered, and hovering a soft one. A selector list keeps each
     member's own weight, so merging them moves no arbitration: the outline/ghost half is
     still (0,5,0) after its hover, the soft half still (0,4,0) before its active. */
  .v-button:is([data-variant='outline'], [data-variant='ghost']):not([data-elevated]):active:not(
      :disabled,
      [aria-disabled='true']
    ),
  .v-button[data-variant='soft']:hover:not(:disabled, [aria-disabled='true']) {
    background: color-mix(in oklab, var(--tone-bg-soft), var(--tone-text-tinted) 8%);
  }

  .v-button[data-variant='soft']:active:not(:disabled, [aria-disabled='true']) {
    background: color-mix(in oklab, var(--tone-bg-soft), var(--tone-text-tinted) 14%);
  }

  /* Elevation is ORTHOGONAL to the variant: the shadow scale applies to all four of
     them, while the raised surface is only painted on the two that have no
     background of their own. The `:is()` here is not decoration — it is what gives
     these rules a specificity of (0,3,0), beating the (0,2,0) of the ghost and
     outline bases without depending on the order the rules end up in. */
  .v-button[data-elevated] {
    box-shadow: var(--vectis-shadow-sm);
  }

  .v-button[data-elevated]:is([data-variant='ghost'], [data-variant='outline']) {
    background: var(--vectis-color-surface-raised);
  }

  .v-button[data-elevated]:hover:not(:disabled, [aria-disabled='true']) {
    box-shadow: var(--vectis-shadow-md);
  }

  .v-button[data-elevated]:is([data-variant='ghost'], [data-variant='outline']):hover:not(
      :disabled,
      [aria-disabled='true']
    ) {
    background: color-mix(in oklab, var(--vectis-color-surface-raised), var(--tone-text-tinted) 8%);
  }

  .v-button[data-elevated]:active:not(:disabled, [aria-disabled='true']) {
    box-shadow: var(--vectis-shadow-sm);
  }

  .v-button[data-elevated]:is([data-variant='ghost'], [data-variant='outline']):active:not(
      :disabled,
      [aria-disabled='true']
    ) {
    background: color-mix(
      in oklab,
      var(--vectis-color-surface-raised),
      var(--tone-text-tinted) 12%
    );
  }

  .v-button:is(:disabled, [aria-disabled='true']) {
    cursor: not-allowed;
  }

  .v-button[data-loading] {
    opacity: 0.5;
  }

  /* A disabled button that is not loading greys out through the colour tokens and
     never through opacity. These three rules are (0,4,0), so they already beat the
     (0,3,0) of the raised background whatever the order they are read in. */
  .v-button:is(:disabled, [aria-disabled='true']):not([data-loading]):is(
      [data-variant='solid'],
      [data-variant='soft']
    ) {
    background: var(--vectis-color-surface-muted);
    color: var(--vectis-color-text-subtle);
  }

  .v-button:is(:disabled, [aria-disabled='true']):not([data-loading])[data-variant='outline'] {
    background: transparent;
    color: var(--vectis-color-text-subtle);
    border-color: var(--vectis-color-border);
  }

  .v-button:is(:disabled, [aria-disabled='true']):not([data-loading])[data-variant='ghost'] {
    background: transparent;
    color: var(--vectis-color-text-subtle);
  }

  /* The shadow needs a rule of its OWN. No variant declares a shadow, so none of the
     three rules above cancels one, and a disabled raised ghost would otherwise go on
     casting its shadow-sm. */
  .v-button:is(:disabled, [aria-disabled='true']):not([data-loading])[data-elevated] {
    box-shadow: none;
  }

  .v-button-spinner {
    /* A box exactly the size of an icon, since the spinner takes the place of
       iconStart: a button with a start icon keeps its width when it starts loading
       (one with a label alone gains the spinner and the gap beside it). The
       font-size is set to that same size so that VSpinner's own box, which measures
       1em, coincides with this one — VSpinner then draws its ring inside it at the
       proportion Material Symbols gives `progress_activity`, which is what makes the
       spinner and the icon it replaces read at the same size. */
    font-size: var(--vectis-icon-size);
    /* 1em of the line above rather than the variable again: a relative icon size would
       otherwise be resolved twice, once against the button's text and once against this
       box's own enlarged font-size. */
    inline-size: 1em;
    block-size: 1em;
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  @media (prefers-reduced-motion: reduce) {
    .v-button {
      transition: none;
    }
  }
}
</style>
