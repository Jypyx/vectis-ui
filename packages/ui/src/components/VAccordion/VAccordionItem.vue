<script setup lang="ts">
/**
 * One section of an accordion: a heading the reader can click, and the content it
 * reveals. It is a native `<details>`/`<summary>` pair, so the browser owns the
 * open and closed state, the keyboard and the accessibility semantics. The only JS
 * is the `v-model:open` bridge, fed by the element, and the click a disabled summary
 * has to cancel, both shared with VSideNavigationItem through `useDetailsOpen`.
 *
 * The opening is animated entirely in CSS, with `::details-content` and
 * `interpolate-size` (`styles/disclosure.css`). Both are recent additions to the
 * language: where they are missing the section simply appears at once, which is the
 * intended fallback.
 */

import { computed, inject } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import { expand_more as expandMoreIcon } from '../VIcon/icons/expand_more'
import type { IconSource } from '../VIcon/types'
import VTypography from '../VTypography/VTypography.vue'
import { accordionKey } from './context'

import { useDetailsOpen } from '../../composables/useDetailsOpen'

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
   * (`{ src }`, `{ component }`…). The `#icon` slot replaces it.
   *
   * It carries no side in its name because there is only one: the end of the row belongs
   * to the chevron, so there is nothing for a start to be told apart from. That is the
   * rule every single-icon component of the design system follows, and its slot is named
   * `#icon` for the same reason.
   */
  icon?: IconSource
  /**
   * Renders the section already open. Only its initial value is read: the browser
   * owns the state afterwards, so changing this prop later will not close a section
   * the reader has opened. Bind `v-model:open` to drive it instead.
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
  icon: undefined,
  defaultOpen: false,
  disabled: false,
})

/**
 * Whether the section is open, when the consumer wants to drive or observe it. Left
 * unbound, the browser keeps that state to itself, `defaultOpen` giving only the initial
 * value.
 *
 * TRAP — "not bound" is written as `null` and not `undefined`. A model typed as a plain
 * boolean is declared as such at runtime, and Vue casts an ABSENT boolean prop to
 * `false`, which would silently overwrite `defaultOpen`. The explicit default disarms
 * that cast.
 */
const open = defineModel<boolean | null>('open', { default: null })

defineSlots<{
  /** The content revealed when the section is open. */
  default(): unknown
  /** A title made of markup, which replaces the `title` prop. */
  title?(): unknown
  /** A subtitle made of markup, which replaces the `subtitle` prop. */
  subtitle?(): unknown
  /** Free content before the title, which takes the place of `icon`. */
  icon?(): unknown
}>()

const accordion = inject(accordionKey, null)

/**
 * Both icons are chosen on the enclosing group. The chevron fallback is what keeps
 * an item rendering correctly when it is used outside a VAccordion.
 */
const expandIcon = computed(() => accordion?.expandIcon ?? expandMoreIcon)
const collapseIcon = computed(() => accordion?.collapseIcon)

const { openAttr, onToggle, onSummaryClick } = useDetailsOpen(open, {
  defaultOpen: () => props.defaultOpen,
  disabled: () => props.disabled,
})
</script>

<template>
  <details
    class="v-accordion-item v-disclosure"
    :name="accordion?.name"
    :open="openAttr"
    :data-swap="collapseIcon ? '' : undefined"
    @toggle="onToggle"
  >
    <summary
      class="v-accordion-summary"
      :data-disabled="disabled ? '' : undefined"
      :aria-disabled="disabled || undefined"
      :tabindex="disabled ? -1 : undefined"
      @click="onSummaryClick"
    >
      <slot name="icon">
        <VIcon v-if="icon" class="v-accordion-icon" v-bind="iconProps(icon)" />
      </slot>
      <span class="v-accordion-heading">
        <span class="v-accordion-title"
          ><slot name="title">{{ title }}</slot></span
        >
        <VTypography
          v-if="subtitle !== undefined || $slots.subtitle"
          as="span"
          variant="caption"
          tone="muted"
          class="v-accordion-subtitle"
          ><slot name="subtitle">{{ subtitle }}</slot></VTypography
        >
      </span>
      <VIcon class="v-accordion-chevron v-disclosure-chevron" v-bind="iconProps(expandIcon)" />
      <!-- Both icons are always in the DOM; [open] decides which one shows, in CSS alone -->
      <VIcon
        v-if="collapseIcon"
        class="v-accordion-chevron v-accordion-chevron-open v-disclosure-chevron v-disclosure-chevron-open"
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
    cursor: pointer;
    font-size: var(--vectis-text-label-size);
    font-weight: var(--vectis-text-label-weight);
    color: var(--vectis-color-text);
  }

  .v-accordion-summary:hover:not([data-disabled]) {
    background: var(--vectis-color-surface-muted);
  }

  .v-accordion-summary:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: calc(-1 * var(--vectis-focus-ring-width));
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

  .v-accordion-icon {
    flex: none;
    color: var(--vectis-color-text-muted);
  }

  /* A disabled item greys out through the colour tokens and never through
     `opacity`, the rule every control in the DS follows. */
  .v-accordion-summary[data-disabled] {
    color: var(--vectis-color-text-subtle);
    cursor: not-allowed;
  }

  /* The icon and the subtitle default to text-muted, which is DARKER than the
     text-subtle a disabled title takes: left to themselves they would come out
     stronger than the label they belong to, so they inherit it instead. The chevron
     gets the same treatment from `styles/disclosure.css`. */
  .v-accordion-summary[data-disabled] .v-accordion-icon,
  .v-accordion-summary[data-disabled] .v-accordion-subtitle {
    color: inherit;
  }

  .v-accordion-content {
    padding: var(--accordion-content-pad-start, var(--vectis-space-2))
      var(--accordion-pad-inline, var(--vectis-space-5))
      var(--accordion-pad-block, var(--vectis-space-4));
    font-size: var(--vectis-text-body-md-size);
    line-height: var(--vectis-text-body-md-leading);
    color: var(--vectis-color-text-muted);
  }

  /* The disclosure animation, the chevron's rotation or swap and the WebKit marker come
     from `styles/disclosure.css`, reduced-motion block included. */
}
</style>
