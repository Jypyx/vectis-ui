<script setup lang="ts">
import { computed, inject, ref, useAttrs, watch } from 'vue'
import type { StyleValue } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import { avatarGroupKey } from './context'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * A round avatar. Content cascade: image → icon → initials (derived from the name)
 * → default slot (the escape hatch, e.g. VAvatarGroup's "+X" aggregate).
 *
 * JS justified: detecting an image load failure (`error`) only exists as a DOM
 * event; the initials and the auto hue are derived from the name; the "inert link"
 * bridge (href removed + aria-disabled + onClick filtered); and the attrs split
 * (style kept out of the fallthrough so --avatar-hue/--custom-color can be injected
 * into it).
 */
interface AvatarProps {
  /** Image URL (priority 1). */
  src?: string
  /** Icon shown in the absence of an image (priority 2): a name, or an explicit render. */
  icon?: IconSource
  /** Full name — the default alt, the source of the initials and the seed of the auto hue. */
  name?: string
  /** Explicit alt/label (wins over `name`). */
  alt?: string
  /**
   * Custom colour (hex, CSS name or oklch()) which REPLACES the auto hue: set inline
   * as `--custom-color`. Otherwise, in the absence of an image, a deterministic OKLCH
   * hue is derived from `name`.
   */
  color?: string
  /** Default `md`. `undefined` = inherited from an enclosing VAvatarGroup. */
  size?: AvatarSize
  /** Height reduced by 4px (like the other controls). */
  compact?: boolean
  /** Rendered as `<a>`. disabled → an inert link (href removed + aria-disabled). */
  href?: string
  /** Rendered as `<button type="button">` (a VTooltip's #trigger slot plugs in through fallthrough). */
  clickable?: boolean
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
    /* Sizes/compact: explicit height through the shared v-control class
       (styles/control-size.css); the round square reuses --control-height. */
    --avatar-bg: var(--vectis-color-surface-muted);
    --avatar-text: var(--vectis-color-text-muted);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--control-height);
    block-size: var(--control-height);
    flex: none;
    overflow: hidden;
    /* Resets the <button> UA styles in clickable mode (border/padding) */
    padding: 0;
    border: none;
    background: var(--avatar-bg);
    color: var(--avatar-text);
    border-radius: var(--vectis-radius-full);
    font-family: var(--vectis-text-family);
    /* Initials: the control typography (a token of the size scale), never a raw
       ratio on the height — typography goes through tokens (philosophy #3) */
    font-size: var(--control-font-size);
    /* semibold: state emphasis, not a type role (initials are more legible at small
       sizes) */
    font-weight: var(--vectis-font-weight-semibold);
    line-height: var(--vectis-text-control-leading);
    text-decoration: none;
    user-select: none;
    /* Separation ring when stacked (transparent outside VAvatarGroup, which sets
       --avatar-ring-color) — it does not shrink the box (box-shadow, not border). */
    box-shadow: 0 0 0 var(--vectis-control-size-avatar-ring) var(--avatar-ring-color, transparent);
    transition:
      background-color var(--vectis-duration-fast) var(--vectis-ease-default),
      box-shadow var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  /* Auto hue (name, no custom colour): fixed L/C, the hue inline. */
  .v-avatar[data-auto] {
    --avatar-bg: oklch(0.9 0.06 var(--avatar-hue));
    --avatar-text: oklch(0.42 0.13 var(--avatar-hue));
  }

  /* Custom colour (--custom-color inline): wins, with a fixed white text (contrast
     is the consumer's responsibility). Block placed after data-auto. */
  .v-avatar[data-custom] {
    --avatar-bg: var(--custom-color);
    --avatar-text: var(--vectis-color-text-on-accent);
  }

  /* Dark: a tinted dark background + light text (the theme system is opt-in through
     [data-theme='dark'], never a media query — see tokens.css). */
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
