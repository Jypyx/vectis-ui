<script setup lang="ts">
// @a11y
/**
 * A clickable card is one real link, its title, stretched over the card by a pseudo-element:
 * the reader hears one link named by the title, and the controls inside the card stay separate
 * targets. Wrapping the whole card in an `<a>` would name the link with all its text and forbid
 * the buttons it holds.
 */

import { computed, watchEffect } from 'vue'

import VSkeletonLoader from '../VSkeletonLoader/VSkeletonLoader.vue'
import { useInertLink } from '../../composables/useInertLink'
import { useRootAttrs } from '../../composables/useRootAttrs'
import { isDev } from '../../utils/env'

/** How the card is set off from the page: a border, a shadow, or a muted fill. */
export type CardVariant = 'outline' | 'elevated' | 'filled'
/** Whether the media sits above the content or beside it. */
export type CardOrientation = 'vertical' | 'horizontal'
/** How much room the card leaves around and between its parts. */
export type CardSize = 'sm' | 'md' | 'lg'
/** The heading level of the title, when it should be part of the page outline. */
export type CardHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

interface CardProps {
  /**
   * How the card is set off from the page: a border (`outline`, the default), a shadow over a
   * raised surface (`elevated`), or a muted fill with no border (`filled`).
   */
  variant?: CardVariant
  /**
   * Where the `#media` slot sits: above the content (`vertical`, the default), or at its start
   * (`horizontal`). A horizontal card puts the media back above the content when it is too
   * narrow for both side by side.
   */
  orientation?: CardOrientation
  /** The padding of the card and the gaps between its parts. */
  size?: CardSize
  /** The title of the card. With `href`, it is the text of the card's link. */
  title?: string
  /** A line under the title. */
  subtitle?: string
  /**
   * Renders the title as a heading of this level, so that the card takes its place in the
   * page outline. Left out, the title is a paragraph.
   */
  headingLevel?: CardHeadingLevel
  /**
   * Makes the whole card a link to this address. The link is the title, whose clickable area
   * covers the card; buttons and links inside the card remain separate targets. It requires
   * `title`.
   */
  href?: string
  /**
   * Makes a linked card unusable: the link loses its address and is marked disabled, and the
   * title and media are dimmed. Controls in the slots are not affected.
   */
  disabled?: boolean
  /**
   * Replaces the content with placeholders, and the media too when there is one. The footer
   * is hidden until the content arrives.
   */
  loading?: boolean
  /**
   * Announces the loading to screen readers with this text. Left out, a loading card is
   * silent, so that a grid of them does not read out the same word a dozen times.
   */
  loadingText?: string
  /** The element the card is rendered as: `article`, `section` or `li` instead of a `div`. */
  as?: string
}

const props = withDefaults(defineProps<CardProps>(), {
  variant: 'outline',
  orientation: 'vertical',
  size: 'md',
  title: undefined,
  subtitle: undefined,
  headingLevel: undefined,
  href: undefined,
  disabled: false,
  loading: false,
  loadingText: undefined,
  as: 'div',
})

const slots = defineSlots<{
  /** The body of the card. */
  default?(): unknown
  /** An image, a video or an illustration, drawn edge to edge. */
  media?(): unknown
  /** Replaces the title and subtitle with content of your own. A linked card loses its link. */
  header?(): unknown
  /** Actions at the foot of the card, pushed to the bottom when the card is stretched. */
  footer?(): unknown
}>()

defineOptions({ inheritAttrs: false })

/*
 * A linked card follows the wrapper-root pattern: the link is the element that acts, so it
 * receives the forwarded attributes (`target`, `rel`, a router's click handler) and the root
 * keeps only `class` and `style`. A card that is not a link is a plain container and keeps all
 * of them.
 */
const { attrs, rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

const {
  isLink,
  isInertLink,
  linkHref,
  attrs: linkAttrs,
} = useInertLink({
  href: () => props.href,
  inert: () => props.disabled,
  attrs: () => forwardedAttrs.value,
})

const rootAttrs = computed(() =>
  isLink.value ? { class: rootClass.value, style: rootStyle.value } : attrs,
)

const titleTag = computed(() => (props.headingLevel ? `h${props.headingLevel}` : 'p'))

// @devwarn
// The link is the title: without one, the card would hold an empty link.
if (isDev) {
  watchEffect(() => {
    if (props.href !== undefined && (!props.title || slots.header))
      console.warn(
        '[VCard] `href` needs the `title` prop, which becomes the text of the link; the `#header` slot replaces it and drops the link.',
      )
  })
}
</script>

<template>
  <component
    :is="as"
    v-bind="rootAttrs"
    class="v-card"
    :data-variant="variant"
    :data-orientation="orientation"
    :data-size="size"
    :data-interactive="isLink ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :aria-busy="loading || undefined"
  >
    <div v-if="$slots.media" class="v-card-media">
      <VSkeletonLoader v-if="loading" shape="surface" animation="pulse" />
      <slot v-else name="media" />
    </div>
    <div class="v-card-content">
      <template v-if="loading">
        <VSkeletonLoader v-if="title || subtitle || $slots.header" width="60%" />
        <VSkeletonLoader :lines="3" :label="loadingText" />
      </template>
      <template v-else>
        <div v-if="$slots.header || title || subtitle" class="v-card-header">
          <slot name="header">
            <component :is="titleTag" v-if="title" class="v-card-title">
              <a
                v-if="isLink"
                class="v-card-link"
                :aria-disabled="isInertLink ? 'true' : undefined"
                v-bind="linkAttrs"
                :href="linkHref"
                >{{ title }}</a
              >
              <template v-else>{{ title }}</template>
            </component>
            <p v-if="subtitle" class="v-card-subtitle">{{ subtitle }}</p>
          </slot>
        </div>
        <div v-if="$slots.default" class="v-card-body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="v-card-footer">
          <slot name="footer" />
        </div>
      </template>
    </div>
  </component>
</template>

<style>
@layer vectis.components {
  .v-card {
    --card-padding: var(--vectis-space-4);
    --card-gap: var(--vectis-space-3);

    position: relative;
    display: flex;
    flex-direction: column;
    /* Clips the media to the rounded corners, whichever side it ends up on. */
    overflow: clip;
    /* Transparent rather than absent: forced colours paint it, and the card keeps an edge. */
    border: 1px solid transparent;
    border-radius: var(--vectis-radius-surface);
    background: var(--vectis-color-surface);
    color: var(--vectis-color-text);
    font-family: var(--vectis-text-family);
    font-size: var(--vectis-text-body-md-size);
    font-weight: var(--vectis-text-body-md-weight);
    line-height: var(--vectis-text-body-md-leading);
    transition:
      border-color var(--vectis-duration-fast) var(--vectis-ease-default),
      box-shadow var(--vectis-duration-fast) var(--vectis-ease-default),
      background-color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-card[data-size='sm'] {
    --card-padding: var(--vectis-space-3);
    --card-gap: var(--vectis-space-2);
  }

  .v-card[data-size='lg'] {
    --card-padding: var(--vectis-space-6);
    --card-gap: var(--vectis-space-4);
  }

  .v-card[data-variant='outline'] {
    border-color: var(--vectis-color-border);
  }

  .v-card[data-variant='elevated'] {
    background: var(--vectis-color-surface-raised);
    box-shadow: var(--vectis-shadow-sm);
  }

  .v-card[data-variant='filled'] {
    background: var(--vectis-color-surface-muted);
  }

  /*
   * Side by side without a container query: the content's flex basis is its narrowest
   * comfortable width, and its huge grow factor keeps the media at its own basis. When the card
   * cannot fit both bases on one line, the content wraps under the media and both take the
   * full width. A container query would need size containment on the card, which collapses it
   * to nothing in any parent that sizes it from its content.
   */
  .v-card[data-orientation='horizontal'] {
    flex-flow: row wrap;
  }

  .v-card[data-orientation='horizontal'] > .v-card-media {
    flex: 1 1 var(--vectis-control-size-card-media);
  }

  .v-card[data-orientation='horizontal'] > .v-card-content {
    flex: 999 1 var(--vectis-control-size-card-body-min);
  }

  .v-card-media > :is(img, video, picture, svg, iframe) {
    display: block;
    inline-size: 100%;
    block-size: 100%;
    object-fit: cover;
  }

  /*
   * The placeholder has no intrinsic height: the percentage fills a media stretched beside the
   * content, and the minimum gives it the skeleton's surface height everywhere else.
   */
  .v-card-media > .v-skeleton-loader {
    block-size: 100%;
    min-block-size: var(--vectis-control-size-skeleton-surface);
  }

  .v-card-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: var(--card-gap);
    min-inline-size: 0;
    padding: var(--card-padding);
  }

  .v-card-header {
    display: flex;
    flex-direction: column;
  }

  .v-card-title {
    font-size: var(--vectis-text-heading-4-size);
    font-weight: var(--vectis-text-heading-4-weight);
    line-height: var(--vectis-text-heading-4-leading);
  }

  .v-card-subtitle {
    color: var(--vectis-color-text-muted);
    font-size: var(--vectis-text-body-sm-size);
    font-weight: var(--vectis-text-body-sm-weight);
    line-height: var(--vectis-text-body-sm-leading);
  }

  /* Pushed to the bottom, so that cards stretched to one height line their actions up. */
  .v-card-footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--vectis-space-2);
    margin-block-start: auto;
  }

  .v-card-link {
    color: inherit;
    text-decoration: none;
    outline: none;
  }

  /* The link's hit area: the whole card, which is its positioned ancestor. */
  .v-card-link::after {
    content: '';
    position: absolute;
    inset: 0;
  }

  /*
   * The controls inside a linked card are lifted above the stretched link so that they stay
   * their own targets. Consumer styles are unlayered and still override this positioning.
   */
  .v-card[data-interactive]
    :is(a[href], button, input, select, textarea, summary, label, [tabindex]):not(.v-card-link) {
    position: relative;
    z-index: 1;
  }

  /* The link draws no ring of its own; the card does, around the area that is clicked. */
  .v-card:has(.v-card-link:focus-visible) {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  .v-card[data-interactive][data-variant='outline']:not([data-disabled]):hover {
    border-color: var(--vectis-color-border-strong);
  }

  .v-card[data-interactive][data-variant='elevated']:not([data-disabled]):hover {
    box-shadow: var(--vectis-shadow-md);
  }

  .v-card[data-interactive][data-variant='filled']:not([data-disabled]):hover {
    background: color-mix(in oklab, var(--vectis-color-surface-muted), var(--vectis-color-text) 4%);
  }

  .v-card[data-interactive]:not([data-disabled]):hover .v-card-link {
    text-decoration: underline;
  }

  /*
   * Only the link, which carries `aria-disabled`, and the media are dimmed: the rest of the
   * text stays readable, since it is still content rather than a control.
   */
  .v-card[data-disabled] .v-card-link {
    color: var(--vectis-color-text-subtle);
    cursor: not-allowed;
  }

  .v-card[data-disabled] .v-card-media {
    opacity: 0.5;
  }

  @media (prefers-reduced-motion: reduce) {
    .v-card {
      transition: none;
    }
  }
}
</style>
