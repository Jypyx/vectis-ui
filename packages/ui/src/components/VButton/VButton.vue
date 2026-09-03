<script setup lang="ts">
// @a11y — the component's ONLY behavioural JS, and it exists entirely for
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

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import VSpinner from '../VSpinner/VSpinner.vue'

interface ButtonProps {
  /**
   * How much visual weight the button carries: `solid` is filled with the tone,
   * `soft` uses a tinted background, `outline` keeps only a border, and `ghost`
   * shows nothing until it is hovered. Inside a VButtonGroup the group's own variant
   * wins over this one.
   */
  variant?: 'solid' | 'outline' | 'ghost' | 'soft'
  /**
   * What the action means: `accent` for the ordinary one, `neutral` for a secondary
   * one, `danger` for one that destroys something. On a button a tone is an
   * intention, which is why states such as success or warning are not offered here.
   * Left out inside a VButtonGroup it takes the group's tone, which is the point of
   * not defaulting it here; on its own it is `accent`.
   */
  tone?: 'accent' | 'neutral' | 'danger'
  /**
   * Raises the button off the page: a shadow that grows on hover and settles back
   * when pressed, whatever the variant. On `ghost` and `outline`, which have no
   * background of their own, it also paints the raised surface — in the dark theme
   * a shadow lying straight on the page background has nothing casting it. Inside a
   * VButtonGroup the group's own value wins over this one.
   */
  elevated?: boolean
  /**
   * The height of the button, taken from the size scale shared by every control.
   * Inside a VButtonGroup the group's own size wins over this one.
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /**
   * Takes 4px off the height, leaving the padding, the text and the icons as they
   * are. Inside a VButtonGroup the group's own value wins over this one.
   */
  compact?: boolean
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

/*
 * The three unions a VButtonGroup has to name in order to hand them down. They are
 * DERIVED from the props above rather than declared and then referenced there: the
 * documentation site prints a type as the source spells it (apps/docs, build-api.ts),
 * so writing `variant?: ButtonVariant` would replace the four values with a name the
 * reader cannot look up on the page they are most likely to be reading.
 */
export type ButtonVariant = NonNullable<ButtonProps['variant']>
export type ButtonTone = NonNullable<ButtonProps['tone']>
export type ButtonSize = NonNullable<ButtonProps['size']>

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'solid',
  // TRAP — the only one of the five with no default. `tone` is the prop a button keeps
  // against its group, so `undefined` has to stay distinguishable from an explicit
  // `accent`, which would otherwise silence the group for every button in the row.
  tone: undefined,
  elevated: false,
  size: 'md',
  compact: false,
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
const resolvedVariant = computed<ButtonVariant>(() => group?.variant ?? props.variant)
const resolvedSize = computed<ButtonSize>(() => group?.size ?? props.size)
const resolvedCompact = computed(() => group?.compact ?? props.compact)
const resolvedElevated = computed(() => group?.elevated ?? props.elevated)
const resolvedTone = computed<ButtonTone>(() => props.tone ?? group?.tone ?? 'accent')

const isLink = computed(() => props.href !== undefined)
const isInert = computed(() => props.disabled || props.loading)
const isInertLink = computed(() => isLink.value && isInert.value)
const passedAttrs = computed(() => {
  if (!isInertLink.value) return attrs
  const rest = { ...(attrs as Record<string, unknown>) }
  delete rest.onClick
  return rest
})
</script>

<template>
  <component
    :is="isLink ? 'a' : 'button'"
    v-bind="passedAttrs"
    class="v-button v-control v-tone"
    :href="isLink && !isInert ? href : undefined"
    :type="isLink ? undefined : type"
    :disabled="isLink ? undefined : disabled || loading"
    :aria-disabled="isInertLink ? 'true' : undefined"
    :data-variant="resolvedVariant"
    :data-tone="resolvedTone"
    :data-elevated="resolvedElevated ? '' : undefined"
    :data-size="resolvedSize"
    :data-compact="resolvedCompact ? '' : undefined"
    :data-loading="loading ? '' : undefined"
    :aria-busy="loading || undefined"
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
    height: var(--control-height);
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

  .v-button:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  /* The tone table itself lives in styles/tones.css, on the `v-tone` class in the
     vectis.tokens layer, and is shared with VChip and VToast. VButton overrides not
     a single one of its values: it is the reference those values were written for. */

  .v-button[data-variant='solid'] {
    background: var(--tone-bg-solid);
    color: var(--tone-text-solid);
  }

  .v-button[data-variant='solid']:hover:not(:disabled, [aria-disabled='true']) {
    background: var(--tone-bg-solid-hover);
  }

  .v-button[data-variant='solid']:active:not(:disabled, [aria-disabled='true']) {
    background: var(--tone-bg-solid-active);
  }

  .v-button[data-variant='outline'] {
    background: transparent;
    color: var(--tone-text-tinted);
    border-color: var(--tone-border-soft);
  }

  .v-button[data-variant='ghost'] {
    background: transparent;
    color: var(--tone-text-tinted);
  }

  /* The `:not([data-elevated])` is what makes these rules DISJOINT from the
     elevation rules below, rather than merely less specific than them. Nothing then
     arbitrates the background of a raised ghost by a one-step specificity margin,
     so a declaration added to either set later cannot silently leak into the other
     case. */
  .v-button[data-variant='outline']:not([data-elevated]):hover:not(
      :disabled,
      [aria-disabled='true']
    ),
  .v-button[data-variant='ghost']:not([data-elevated]):hover:not(
      :disabled,
      [aria-disabled='true']
    ) {
    background: var(--tone-bg-soft);
  }

  .v-button[data-variant='outline']:not([data-elevated]):active:not(
      :disabled,
      [aria-disabled='true']
    ),
  .v-button[data-variant='ghost']:not([data-elevated]):active:not(
      :disabled,
      [aria-disabled='true']
    ) {
    background: color-mix(in oklab, var(--tone-bg-soft), var(--tone-text-tinted) 8%);
  }

  .v-button[data-variant='soft'] {
    background: var(--tone-bg-soft);
    color: var(--tone-text-tinted);
  }

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
       iconStart: the button's width does not jump when it starts loading. The
       font-size is set to that same size so that VSpinner's own box, which measures
       1em, coincides with this one — VSpinner then draws its ring inside it at the
       proportion Material Symbols gives `progress_activity`, which is what makes the
       spinner and the icon it replaces read at the same size. */
    width: var(--vectis-icon-size);
    height: var(--vectis-icon-size);
    font-size: var(--vectis-icon-size);
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
