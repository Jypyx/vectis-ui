<script setup lang="ts">
// @a11y
/**
 * Native buttons own activation and disabling. Links use useInertLink because anchors have no
 * disabled state; group shape overrides preserve individual tones.
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

/** How much visual weight the button carries. */
export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'soft'
/** What the action means, in colour. */
export type ButtonTone = 'accent' | 'neutral' | 'danger'
/** The height of the button, from the scale every control shares. */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps {
  /**
   * How much visual weight the button carries: `solid` is filled with the tone, `soft` uses a
   * tinted background, `outline` keeps only a border, and `ghost` shows nothing until it is
   * hovered.
   */
  variant?: ButtonVariant
  /**
   * What the action means: `accent` for the ordinary one, `neutral` for a secondary one,
   * `danger` for one that destroys something. Left out inside a VButtonGroup it takes the
   * group's tone, which is the point of not defaulting it here; on its own it is `accent`.
   */
  tone?: ButtonTone
  /**
   * Raises the button off the page: a shadow that grows on hover and settles back when pressed,
   * whatever the variant. Inside a VButtonGroup the group's own value wins over this one.
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
   * Stretches the button to the whole inline size of its parent, instead of leaving it only as
   * wide as its content.
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
  // The only one of the five with no default. `tone` is the prop a button keeps against its
  // group, so `undefined` has to stay distinguishable from an explicit `accent`, which would
  // otherwise silence the group for every button in the row.
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

  /*
   * At (0,2,0) it beats this sheet's own padding by weight, and it is the only rule that may
   * touch that padding on an icon-only button. A consumer of VButton restyling the padding of
   * its own buttons at (0,2,0) from another sheet would tie with it, and the bundler would
   * decide: such a rule has to exclude `[data-icon-only]`.
   */
  .v-button[data-icon-only] {
    min-inline-size: var(--control-height);
    padding-inline: 0;
  }

  .v-button:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  /* Tone and variant recipes are shared; component-specific interaction states remain here. */

  .v-button[data-variant='solid']:hover:not(:disabled, [aria-disabled='true']) {
    background: var(--tone-bg-solid-hover);
  }

  .v-button[data-variant='solid']:active:not(:disabled, [aria-disabled='true']) {
    background: var(--tone-bg-solid-active);
  }

  /*
   * Nothing then arbitrates the background of a raised ghost by a one-step specificity margin,
   * so a declaration added to either set later cannot silently leak into the other case.
   */
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

  /*
   * The `:is()` here is not decoration; it is what gives these rules a specificity of (0,3,0),
   * beating the (0,2,0) of the ghost and outline bases without depending on the order the rules
   * end up in.
   */
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

  /*
   * The shadow needs a rule of its own. No variant declares a shadow, so none of the three
   * rules above cancels one, and a disabled raised ghost would otherwise go on casting its
   * shadow-sm.
   */
  .v-button:is(:disabled, [aria-disabled='true']):not([data-loading])[data-elevated] {
    box-shadow: none;
  }

  .v-button-spinner {
    /*
     * Match the spinner box and font size to the icon it replaces so loading preserves button
     * width and visual scale.
     */
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
