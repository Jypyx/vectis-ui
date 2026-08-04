<script setup lang="ts">
import { computed, inject } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import VTypography from '../VTypography/VTypography.vue'
import { accordionKey } from './context'

/**
 * Accordion item: native <details>/<summary> — state, keyboard and accessibility
 * for free. The opening animation uses `::details-content` + `interpolate-size`
 * (progressive enhancement: with no support, it opens instantly).
 */
interface AccordionItemProps {
  /** Title of the summary; replaceable through the #title slot. */
  title?: string
  /** Subtitle under the title; replaceable through the #subtitle slot. */
  subtitle?: string
  /** Icon before the title: a name, or an explicit render (`{ src }`, `{ component }`…). */
  iconStart?: IconSource
  /** Open on the first render (the state is then handled natively). */
  defaultOpen?: boolean
  /** Inert item: neither clickable nor keyboard-reachable, greyed through tokens. */
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
  /** The panel content */
  default(): unknown
  /** Rich title (replaces the `title` prop) */
  title?(): unknown
  /** Rich subtitle (replaces the `subtitle` prop) */
  subtitle?(): unknown
  /** Free content before the title (wins over `iconStart`) */
  start?(): unknown
}>()

const accordion = inject(accordionKey, null)

/** Icons set by the group; the item stays usable on its own. */
const expandIcon = computed(() => accordion?.expandIcon ?? 'expand_more')
const collapseIcon = computed(() => accordion?.collapseIcon)

/*
 * The component's only behavioural JS: <summary> has no native `disabled`
 * attribute, so the toggling of <details> cannot be blocked any other way — the
 * keyboard, on the other hand, is covered with no handler by `tabindex="-1"`.
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
      <!-- Two icons rendered, swapped 100% in CSS on [open] -->
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
    /* VIcon context: 20px whatever the density (only the paddings vary in compact),
       opsz 20 as in the md mapping of the size table */
    --vectis-icon-size: var(--vectis-icon-size-md);
    --vectis-icon-opsz: 20;

    display: flex;
    align-items: center;
    gap: var(--vectis-space-3);
    /* Density: variables inherited from the group, fallbacks = normal size */
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

  /*
   * Corners of the end summaries aligned on the group's inner radius (0 outside a
   * framed group): the outline follows the border-radius, so the ring becomes
   * parallel to the `overflow: hidden` clip instead of being cropped by it. The last
   * summary is only at the bottom edge while the panel is closed.
   */
  .v-accordion-item:first-child > .v-accordion-summary {
    border-start-start-radius: var(--accordion-corner-radius, 0);
    border-start-end-radius: var(--accordion-corner-radius, 0);
  }

  .v-accordion-item:last-child:not([open]) > .v-accordion-summary {
    border-end-start-radius: var(--accordion-corner-radius, 0);
    border-end-end-radius: var(--accordion-corner-radius, 0);
  }

  /* Text block: title alone, or title + subtitle stacked */
  .v-accordion-heading {
    flex: 1;
    display: flex;
    flex-direction: column;
    line-height: var(--vectis-text-label-leading);
  }

  /* Subtitle: rendered by VTypography (a muted caption) — the
     .v-accordion-subtitle class stays in place as a hook (the disabled state
     below). */

  /* A dedicated class (not .v-accordion-icon: rotation/swap are reserved for the chevron) */
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

  /* Swapping the two icons (data-swap = collapseIcon provided) */
  .v-accordion-item[data-swap][open]
    > .v-accordion-summary
    .v-accordion-icon:not(.v-accordion-icon-open),
  .v-accordion-item[data-swap]:not([open]) > .v-accordion-summary .v-accordion-icon-open {
    display: none;
  }

  /* Disabled: greys through tokens (never opacity) */
  .v-accordion-item[data-disabled] > .v-accordion-summary {
    color: var(--vectis-color-text-subtle);
    cursor: not-allowed;
  }

  /* text-muted is darker than text-subtle: icons and subtitle follow the title */
  .v-accordion-item[data-disabled] .v-accordion-icon,
  .v-accordion-item[data-disabled] .v-accordion-icon-start,
  .v-accordion-item[data-disabled] .v-accordion-subtitle {
    color: inherit;
  }

  /* Animated opening in pure CSS (::details-content, progressive enhancement) */
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
    /* Breathing room under the summary, reduced in compact (the group's variables) */
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
