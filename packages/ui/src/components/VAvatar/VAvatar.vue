<script setup lang="ts">
/**
 * A round avatar standing for a person or an entity. It shows the best of what it
 * was given, in that order: the picture, failing that an icon, failing that the
 * initials taken from the name, and failing that whatever the default slot holds —
 * the escape hatch VAvatarGroup uses to render its "+X" overflow badge.
 *
 * Four things here genuinely need JavaScript. A picture that fails to download
 * reports it as a DOM event and nothing else, so the script listens for it and
 * hands over to the initials rather than leaving an empty circle. The initials and
 * the automatic colour are both computed from the name, which is arithmetic no
 * stylesheet can do. A disabled link has no native equivalent of a disabled
 * button, so it is turned inert by hand (its `href` is removed, `aria-disabled`
 * announces the state and the click handler is dropped). Finally the attributes
 * the consumer passes are split so that `style` never reaches the element
 * directly: the component has to merge its own `--avatar-hue`/`--custom-color`
 * into it first, and a plain fallthrough would overwrite them.
 */

import { computed, inject, ref, useAttrs, watch } from 'vue'
import type { StyleValue } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import { avatarGroupKey } from './context'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  /**
   * The picture to show. It is what the avatar prefers above everything else, and an image
   * that fails to load hands over to the icon or the initials rather than leaving a gap.
   */
  src?: string
  /**
   * The icon to show when there is no picture. It comes before the initials, so an avatar
   * given both an icon and a name shows the icon.
   */
  icon?: IconSource
  /**
   * The person's full name. It does three things at once: it names the avatar for assistive
   * technology, its initials are what shows when there is no picture and no icon, and it is
   * the seed the automatic colour is derived from — so the same person keeps the same colour
   * everywhere.
   */
  name?: string
  /**
   * The accessible name, when it should not simply be `name` — an avatar standing for a team
   * rather than a person, say. It wins over `name`.
   */
  alt?: string
  /**
   * A colour of your own, as a hex value, a CSS colour name or an `oklch()`. It REPLACES the
   * hue otherwise derived from `name`, and the text on it is always white, so a light colour
   * is the consumer's own risk.
   */
  color?: string
  /**
   * The diameter of the disc, from the size scale shared by every control. Leaving it out
   * inside a VAvatarGroup takes the group's size, which is the point of not defaulting it
   * here; on its own it is `md`.
   */
  size?: AvatarSize
  /** Takes 4px off the diameter, as it does on every other control. */
  compact?: boolean
  /**
   * Turns the avatar into an `<a>` pointing at this address. A disabled link becomes inert:
   * the address is dropped, so it can be neither focused nor followed.
   */
  href?: string
  /**
   * Turns the avatar into a `<button>`. It is ignored as soon as `href` makes it a link.
   * A VTooltip wrapping the avatar reaches this button through fallthrough.
   */
  clickable?: boolean
  /**
   * Makes an interactive avatar unusable: it stops responding, leaves the tab order and greys
   * out. It says nothing on a plain avatar, which was never interactive to begin with.
   */
  disabled?: boolean
}

const props = withDefaults(defineProps<AvatarProps>(), {
  src: undefined,
  icon: undefined,
  name: undefined,
  alt: undefined,
  color: undefined,
  size: undefined,
  compact: false,
  href: undefined,
  clickable: false,
  disabled: false,
})

defineSlots<{
  /** Fallback content (replaces the initials), e.g. VAvatarGroup's "+X". */
  default?(): unknown
}>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const group = inject(avatarGroupKey, null)

// Size/compact: the explicit prop, else the group's, else the default.
const resolvedSize = computed<AvatarSize>(() => props.size ?? group?.size ?? 'md')
const resolvedCompact = computed(() => props.compact || (group?.compact ?? false))

/* Interactivity priority: href > clickable > static. */
const isLink = computed(() => props.href !== undefined)
const isInteractive = computed(() => isLink.value || props.clickable)
const tag = computed(() => (isLink.value ? 'a' : props.clickable ? 'button' : 'span'))
const isInertLink = computed(() => isLink.value && props.disabled)

// @fallback — the image failed to load: the initials take over, so an avatar is
// never an empty box.
const failed = ref(false)
watch(
  () => props.src,
  () => {
    failed.value = false
  },
)
const showImage = computed(() => Boolean(props.src) && !failed.value)

const accessibleName = computed(() => props.alt ?? props.name)

const initials = computed(() => {
  if (!props.name) return ''
  return props.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase() ?? '')
    .join('')
})

/*
 * Auto hue: a pure JS hash of the name → an OKLCH hue (0–359). Only the hue is
 * inline (a unitless scalar); the CSS composes background/text with L/C fixed per
 * theme (light/dark adaptation without depending on contrast-color). A colour
 * computed outside the tokens, a deliberate exception. SSR-safe: no browser API.
 */
const hue = computed(() => {
  if (!props.name) return null
  let hash = 0
  for (let i = 0; i < props.name.length; i++) {
    hash = (hash * 31 + props.name.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % 360
})
const isAuto = computed(() => props.color === undefined && hue.value !== null)

const rootStyle = computed<StyleValue>(() => [
  props.color !== undefined
    ? { '--custom-color': props.color }
    : isAuto.value
      ? { '--avatar-hue': String(hue.value) }
      : undefined,
  attrs.style as StyleValue,
])

// Fallthrough without `style` (handled by rootStyle); onClick removed on an inert link.
const passedAttrs = computed(() => {
  const rest = { ...(attrs as Record<string, unknown>) }
  delete rest.style
  if (isInertLink.value) delete rest.onClick
  return rest
})
</script>

<template>
  <component
    :is="tag"
    v-bind="passedAttrs"
    class="v-avatar v-control"
    :style="rootStyle"
    :data-size="resolvedSize"
    :data-compact="resolvedCompact ? '' : undefined"
    :data-custom="color !== undefined ? '' : undefined"
    :data-auto="isAuto ? '' : undefined"
    :href="isLink && !disabled ? href : undefined"
    :type="tag === 'button' ? 'button' : undefined"
    :disabled="tag === 'button' ? disabled : undefined"
    :aria-disabled="isInertLink ? 'true' : undefined"
    :role="!isInteractive && !showImage && accessibleName ? 'img' : undefined"
    :aria-label="!showImage ? accessibleName : undefined"
  >
    <img
      v-if="showImage"
      class="v-avatar-image"
      :src="src"
      :alt="alt ?? name ?? ''"
      @error="failed = true"
    />
    <VIcon v-else-if="icon" v-bind="iconProps(icon)" class="v-avatar-icon" />
    <slot v-else>
      <span class="v-avatar-initials" aria-hidden="true">{{ initials }}</span>
    </slot>
  </component>
</template>

<style>
@layer vectis.components {
  .v-avatar {
    --avatar-bg: var(--vectis-color-surface-muted);
    --avatar-text: var(--vectis-color-text-muted);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--control-height);
    block-size: var(--control-height);
    flex: none;
    overflow: hidden;
    padding: 0;
    border: none;
    background: var(--avatar-bg);
    color: var(--avatar-text);
    border-radius: var(--vectis-radius-full);
    font-family: var(--vectis-text-family);
    font-size: var(--control-font-size);
    font-weight: var(--vectis-font-weight-semibold);
    line-height: var(--vectis-text-control-leading);
    text-decoration: none;
    user-select: none;
    /* `--avatar-ring-color` is a contract with VAvatarGroup, which is the only thing that
       ever sets it — a private name shared across two sheets, like the `anchor-name`
       idents. The `transparent` fallback is what lets a lone avatar render ringless, and
       it is also what makes a divergence silent: rename it on one side and the discs in a
       group simply stop being separated, with no error and nothing missing from the box. */
    box-shadow: 0 0 0 var(--vectis-control-size-avatar-ring) var(--avatar-ring-color, transparent);
    transition:
      background-color var(--vectis-duration-fast) var(--vectis-ease-default),
      box-shadow var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  /* `--avatar-hue` is set inline by the script, which derives it from the name — so these
     pairs cannot be tokens: only the hue varies, and it is not known until render. The two
     themes are written out separately for the same reason relative colours are not used
     elsewhere in the library: OKLCH's lightness is perceptual, so the dark pair is a
     design decision rather than a delta off the light one. */
  .v-avatar[data-auto] {
    --avatar-bg: oklch(0.9 0.06 var(--avatar-hue));
    --avatar-text: oklch(0.42 0.13 var(--avatar-hue));
  }

  /* Custom colour (--custom-color inline): wins, with a fixed white text (contrast
     is the consumer's responsibility). */
  .v-avatar[data-custom] {
    --avatar-bg: var(--custom-color);
    --avatar-text: var(--vectis-color-text-on-accent);
  }

  [data-theme='dark'] .v-avatar[data-auto] {
    --avatar-bg: oklch(0.42 0.09 var(--avatar-hue));
    --avatar-text: oklch(0.92 0.05 var(--avatar-hue));
  }

  .v-avatar-image {
    inline-size: 100%;
    block-size: 100%;
    object-fit: cover;
  }

  /* The icon occupies ~55% of the disc (a unitless ratio, like the font-size). */
  .v-avatar-icon {
    --vectis-icon-size: calc(var(--control-height) * 0.55);
  }

  :is(a, button).v-avatar {
    cursor: pointer;
  }

  :is(a, button).v-avatar:hover:not([aria-disabled='true'], :disabled) {
    background: color-mix(in oklab, var(--avatar-bg), var(--vectis-color-text) 10%);
  }

  :is(a, button).v-avatar:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  .v-avatar:is(:disabled, [aria-disabled='true']) {
    cursor: not-allowed;
    background: var(--vectis-color-surface-muted);
    color: var(--vectis-color-text-subtle);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-avatar {
      transition: none;
    }
  }
}
</style>
