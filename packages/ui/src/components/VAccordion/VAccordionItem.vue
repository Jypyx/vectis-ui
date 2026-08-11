<script setup lang="ts">
import { computed, inject } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import VTypography from '../VTypography/VTypography.vue'
import { accordionKey } from './context'

/**
 * One section of an accordion: a heading the reader can click, and the content it
 * reveals. It is a native `<details>`/`<summary>` pair, so the browser owns the
 * open and closed state, the keyboard and the accessibility semantics, and this
 * component adds no code of its own for any of them.
 *
 * The opening is animated entirely in CSS, with `::details-content` and
 * `interpolate-size`. Both are recent additions to the language: where they are
 * missing the section simply appears at once, which is the intended fallback.
 */
interface AccordionItemProps {
  /**
   * The heading of the section, the line that stays visible when it is closed. Use
   * the `#title` slot instead when the heading needs markup rather than plain text.
   */
  title?: string
  /**
   * A secondary line under the title, for a short explanation or a status. The
   * `#subtitle` slot replaces it when markup is needed.
   */
  subtitle?: string
  /**
   * An icon placed before the title: an icon name, or an explicit render
   * (`{ src }`, `{ component }`…).
   */
  iconStart?: IconSource
  /**
   * Renders the section already open. It only sets the state of the first render:
   * the browser owns it afterwards, so changing this prop later will not close a
   * section the reader has opened.
   */
  defaultOpen?: boolean
  /**
   * Makes the section inert. It can no longer be opened, the keyboard skips over
   * it, and it is greyed out through the colour tokens.
   */
  disabled?: boolean
}

const props = withDefaults(defineProps<AccordionItemProps>(), {
  title: undefined,
  subtitle: undefined,
  iconStart: undefined,
  defaultOpen: false,
  disabled: false,
})

defineSlots<{
  /** The content revealed when the section is open. */
  default(): unknown
  /** A title made of markup, which replaces the `title` prop. */
  title?(): unknown
  /** A subtitle made of markup, which replaces the `subtitle` prop. */
  subtitle?(): unknown
  /** Free content before the title, which takes the place of `iconStart`. */
  start?(): unknown
}>()

const accordion = inject(accordionKey, null)

/**
 * Both icons are chosen on the enclosing group. The chevron fallback is what keeps
 * an item rendering correctly when it is used outside a VAccordion.
 */
const expandIcon = computed(() => accordion?.expandIcon ?? 'expand_more')
const collapseIcon = computed(() => accordion?.collapseIcon)

// @a11y @core
/*
 * The component's only behavioural JS. A <summary> has no native `disabled`
 * attribute, so there is no other way to stop a click from toggling the
 * <details>. The keyboard needs no handler of its own: `tabindex="-1"` already
 * takes the summary out of the tab order.
 */
function onSummaryClick(event: MouseEvent) {
  if (props.disabled) event.preventDefault()
}
</script>

<template>
  <details
    class="v-accordion-item"
    :name="accordion?.name"
    :open="defaultOpen || undefined"
    :data-swap="collapseIcon ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
  >
    <summary
      class="v-accordion-summary"
      :aria-disabled="disabled || undefined"
      :tabindex="disabled ? -1 : undefined"
      @click="onSummaryClick"
    >
      <slot name="start">
        <VIcon v-if="iconStart" class="v-accordion-icon-start" v-bind="iconProps(iconStart)" />
      </slot>
      <span class="v-accordion-heading">
        <span class="v-accordion-title"
          ><slot name="title">{{ title }}</slot></span
        >
        <VTypography
          v-if="subtitle || $slots.subtitle"
          as="span"
          variant="caption"
          tone="muted"
          class="v-accordion-subtitle"
          ><slot name="subtitle">{{ subtitle }}</slot></VTypography
        >
      </span>
      <VIcon class="v-accordion-icon" v-bind="iconProps(expandIcon)" />
      <!-- Both icons are always in the DOM; [open] decides which one shows, in CSS alone -->
      <VIcon
        v-if="collapseIcon"
        class="v-accordion-icon v-accordion-icon-open"
        v-bind="iconProps(collapseIcon)"
      />
    </summary>
    <div class="v-accordion-content">
      <slot />
    </div>
  </details>
</template>

<style>
@layer vectis.components {
  .v-accordion-item {
    interpolate-size: allow-keywords;
  }

  .v-accordion-item + .v-accordion-item {
    border-block-start: 1px solid var(--vectis-color-border);
  }

  .v-accordion-summary {
    --vectis-icon-size: var(--vectis-icon-size-md);
    --vectis-icon-opsz: 20;

    display: flex;
    align-items: center;
    gap: var(--vectis-space-3);
    padding: var(--accordion-pad-block, var(--vectis-space-4))
      var(--accordion-pad-inline, var(--vectis-space-5));
    list-style: none;
    cursor: pointer;
    font-size: var(--vectis-text-label-size);
    font-weight: var(--vectis-text-label-weight);
    color: var(--vectis-color-text);
  }

  .v-accordion-summary::-webkit-details-marker {
    display: none;
  }

  .v-accordion-item:not([data-disabled]) > .v-accordion-summary:hover {
    background: var(--vectis-color-surface-muted);
  }

  .v-accordion-summary:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: calc(var(--vectis-focus-ring-offset) * -1);
  }

  .v-accordion-item:first-child > .v-accordion-summary {
    border-start-start-radius: var(--accordion-corner-radius, 0);
    border-start-end-radius: var(--accordion-corner-radius, 0);
  }

  .v-accordion-item:last-child:not([open]) > .v-accordion-summary {
    border-end-start-radius: var(--accordion-corner-radius, 0);
    border-end-end-radius: var(--accordion-corner-radius, 0);
  }

  .v-accordion-heading {
    flex: 1;
    display: flex;
    flex-direction: column;
    line-height: var(--vectis-text-label-leading);
  }

  .v-accordion-icon-start {
    flex: none;
    color: var(--vectis-color-text-muted);
  }

  .v-accordion-icon {
    flex: none;
    color: var(--vectis-color-text-muted);
    transition: rotate var(--vectis-duration-base) var(--vectis-ease-default);
  }

  .v-accordion-item[open]:not([data-swap]) > .v-accordion-summary .v-accordion-icon {
    rotate: 180deg;
  }

  /* data-swap marks an item whose group provided a collapseIcon: rather than
     rotating a single chevron, each state hides one of the two rendered icons. */
  .v-accordion-item[data-swap][open]
    > .v-accordion-summary
    .v-accordion-icon:not(.v-accordion-icon-open),
  .v-accordion-item[data-swap]:not([open]) > .v-accordion-summary .v-accordion-icon-open {
    display: none;
  }

  /* A disabled item greys out through the colour tokens and never through
     `opacity`, the rule every control in the DS follows. */
  .v-accordion-item[data-disabled] > .v-accordion-summary {
    color: var(--vectis-color-text-subtle);
    cursor: not-allowed;
  }

  /* The icons and the subtitle default to text-muted, which is DARKER than the
     text-subtle a disabled title takes: left to themselves they would come out
     stronger than the label they belong to, so they inherit it instead. */
  .v-accordion-item[data-disabled] .v-accordion-icon,
  .v-accordion-item[data-disabled] .v-accordion-icon-start,
  .v-accordion-item[data-disabled] .v-accordion-subtitle {
    color: inherit;
  }

  /* The opening animates in pure CSS: ::details-content targets the box the
     browser wraps the content in, and the `interpolate-size` declared on the item
     is what makes a transition towards `auto` possible at all. A browser missing
     either simply opens the section instantly. */
  .v-accordion-item::details-content {
    block-size: 0;
    overflow: clip;
    transition:
      block-size var(--vectis-duration-base) var(--vectis-ease-default),
      content-visibility var(--vectis-duration-base) allow-discrete;
  }

  .v-accordion-item[open]::details-content {
    block-size: auto;
  }

  .v-accordion-content {
    padding: var(--accordion-content-pad-start, var(--vectis-space-2))
      var(--accordion-pad-inline, var(--vectis-space-5))
      var(--accordion-pad-block, var(--vectis-space-4));
    font-size: var(--vectis-text-body-md-size);
    line-height: var(--vectis-text-body-md-leading);
    color: var(--vectis-color-text-muted);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-accordion-icon {
      transition: none;
    }

    .v-accordion-item::details-content {
      transition: none;
    }
  }
}
</style>
