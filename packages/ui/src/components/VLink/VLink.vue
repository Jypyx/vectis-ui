<script setup lang="ts">
// @a11y @core
/**
 * A native link painted in a tone. It takes its size from the text around it. An external link
 * opens in a new tab and says so, with an icon and words for assistive technology.
 */
import { computed, useAttrs } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import { open_in_new as openInNewIcon } from '../VIcon/icons/open_in_new'
import type { IconSource } from '../VIcon/types'
import { useInertLink } from '../../composables/useInertLink'
import { useMessages } from '../../i18n/state'

/**
 * The colour of the link. `neutral` takes the colour of the text; `inherit` takes the colour of
 * the parent and turns to the accent on hover.
 */
export type LinkTone = 'accent' | 'neutral' | 'danger' | 'success' | 'warning' | 'inherit'

/** When the link is underlined: always, on hover and focus only, or never. */
export type LinkUnderline = 'always' | 'hover' | 'none'

interface LinkProps {
  /** Where the link goes. */
  href: string
  /**
   * The colour of the link. `neutral` takes the colour of the text; `inherit` takes the colour of
   * the parent, muted text for instance, and turns to the accent on hover.
   */
  tone?: LinkTone
  /**
   * When the link is underlined. Keep `always` inside running text, where colour alone does not
   * tell a link apart; `hover` and `none` suit menus and lists of links.
   */
  underline?: LinkUnderline
  /**
   * Opens the link in a new tab, with `rel="noopener noreferrer"`, and says so: an icon, and
   * words for screen readers. A `target="_blank"` passed as an attribute says so too.
   */
  external?: boolean
  /** The icon marking an external link: an icon name, or an explicit render. */
  externalIcon?: IconSource
  /** Removes the icon of an external link. Screen readers still hear that it opens a new tab. */
  hideExternalIcon?: boolean
  /** Makes the link unusable: its address is removed and it is marked `aria-disabled`. */
  disabled?: boolean
}

// The attributes are bound by hand: on a disabled link, useInertLink drops the click listeners.
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<LinkProps>(), {
  tone: 'accent',
  underline: 'always',
  external: false,
  externalIcon: () => openInNewIcon,
  hideExternalIcon: false,
  disabled: false,
})

defineSlots<{
  /** The text of the link. */
  default(): unknown
}>()

const attrs = useAttrs()
const m = useMessages()

const link = useInertLink({
  href: () => props.href,
  inert: () => props.disabled,
  attrs: () => attrs,
})

const newTab = computed(() => props.external || attrs.target === '_blank')
</script>

<template>
  <!-- `target` and `rel` come before the forwarded attributes, which may replace them. -->
  <a
    class="v-link v-tone"
    :data-tone="tone"
    :data-underline="underline"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
    :aria-disabled="link.isInertLink.value ? 'true' : undefined"
    v-bind="link.attrs.value"
    :href="link.linkHref.value"
    ><slot /><template v-if="newTab"
      ><VIcon
        v-if="!hideExternalIcon"
        class="v-link-external"
        v-bind="iconProps(externalIcon)"
        mirrored
      /><span class="v-visually-hidden">{{ m.link.newTab }}</span></template
    ></a
  >
</template>

<style>
@layer vectis.components {
  /*
   * The size, weight and line height are the surrounding text's. The icon follows that size too,
   * whatever icon size an ancestor sets.
   */
  .v-link {
    --vectis-icon-size: 1em;

    border-radius: var(--vectis-radius-xs);
    color: var(--tone-text-tinted);
    text-decoration-line: none;
    text-decoration-color: color-mix(in oklab, currentcolor 50%, transparent);
    cursor: pointer;
    transition: text-decoration-color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-link[data-underline='always'],
  .v-link[data-underline='hover']:is(:hover, :focus-visible) {
    text-decoration-line: underline;
  }

  .v-link:hover {
    text-decoration-color: currentcolor;
  }

  /* No tone table: the link blends into its sentence, and only the hover singles it out. */
  .v-link[data-tone='inherit'] {
    color: inherit;
  }

  /* A disabled link keeps its subtle colour: the rule further down would lose to this one. */
  .v-link[data-tone='inherit']:hover:not([aria-disabled='true']) {
    color: var(--vectis-color-accent-text);
  }

  .v-link:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  .v-link-external {
    margin-inline-start: var(--vectis-space-1);
    vertical-align: middle;
  }

  .v-link[aria-disabled='true'] {
    color: var(--vectis-color-text-subtle);
    text-decoration-color: currentcolor;
    cursor: not-allowed;
  }

  @media (forced-colors: active) {
    .v-link[aria-disabled='true'] {
      color: GrayText;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .v-link {
      transition: none;
    }
  }
}
</style>
