<script setup lang="ts">
/**
 * One row of a sidebar navigation, in one of two shapes depending on whether it was given
 * subitems — and the difference runs deeper than it looks.
 *
 * A BRANCH is a `<details>`, so its open state, the toggle keyboard, the exclusivity with a
 * neighbouring section and the animation all come from the browser. Its row IS the
 * `<summary>`, which must contain the whole line, `#end` included — hence the `@click.stop`
 * there, or anything put in it would fold the branch. The documented consequence is that
 * only NON-focusable content belongs in it: a control would be nested inside a control (WCAG
 * 4.1.2, axe `nested-interactive`), and a `<summary>`'s subtree also serves as its
 * accessible name, which some screen readers flatten.
 *
 * A LEAF is the opposite: the row is a plain container with the action stretched over it by
 * an absolute `::after`, so the whole row is clickable while `#end` stays a SIBLING of the
 * action rather than inside it — which is what keeps a real control there legitimate.
 */

import { computed, inject, provide, useId, useSlots } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import { expand_more as expandMoreIcon } from '../VIcon/icons/expand_more'
import type { IconSource } from '../VIcon/types'
import { sideNavigationKey } from './context'

import { useRootAttrs } from '../../composables/useRootAttrs'

interface SideNavigationItemProps {
  /** A second line under the label, for a status or a short explanation. */
  sublabel?: string
  /**
   * An icon before the label: an icon name, or an explicit render. The `#start` slot
   * replaces it.
   */
  icon?: IconSource
  /**
   * Where this row leads, which makes it a link. It is IGNORED on a row that has
   * subitems: such a row opens and closes rather than navigating.
   */
  href?: string
  /**
   * Marks this row as the page currently being viewed. It is highlighted, and
   * announced as the current page.
   */
  active?: boolean
  /**
   * Makes the row unusable: it greys out through the colour tokens and leaves the
   * keyboard path.
   */
  disabled?: boolean
  /**
   * Renders a branch already open. It sets the initial state only; the browser owns it
   * from then on.
   */
  defaultOpen?: boolean
}

// The root element is a list item, which is structure and not the control. Without
// redirecting them, `target`, `rel`, `download` and the aria-* would land on that list
// item instead of on the link or the branch header.
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<SideNavigationItemProps>(), {
  sublabel: undefined,
  icon: undefined,
  href: undefined,
  active: false,
  disabled: false,
  defaultOpen: false,
})

/**
 * Whether the branch is open, when the consumer wants to drive or observe it.
 *
 * Left unbound, the browser keeps that state entirely to itself, `defaultOpen` giving
 * only the initial value: the bound value never changes, so Vue never patches the
 * element back, and the native toggling stays sovereign.
 *
 * TRAP — "not bound" is written as `null` and not `undefined`. A model typed as a
 * plain boolean is declared as such at runtime, and Vue casts an ABSENT boolean prop
 * to `false`, which would silently overwrite `defaultOpen` on every branch. Giving it
 * an explicit default disarms that cast.
 */
const open = defineModel<boolean | null>('open', { default: null })

const emit = defineEmits<{
  /**
   * A row WITHOUT subitems was activated, by click or by keyboard.
   *
   * TRAP — never declare a `click` emit alongside it. Vue removes a declared event
   * from the forwarded attributes, and a consumer's own `@click` would then stop
   * reaching the link entirely.
   */
  select: []
}>()

defineSlots<{
  /** The label of the row. It is REQUIRED: a navigation row must say where it goes. */
  default(): unknown
  /** A second line made of markup, replacing the `sublabel` prop. */
  sublabel?(): unknown
  /** Free content before the label, which takes the place of `icon`. */
  start?(): unknown
  /**
   * Free content at the end of the row, before the chevron — a counter, a badge. On a
   * BRANCH it must not be focusable (see the introduction).
   */
  end?(): unknown
  /** The subitems, which turn this row into a branch. Nesting is not limited. */
  items?(): unknown
}>()

const { rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

const slots = useSlots()
/**
 * Whether this row has subitems, read from the mere PRESENCE of the slot — the same
 * device VMenuItem and VTabs use. The answer is the same on the server and in the
 * browser, so there is no registry to fill in and no hydration mismatch.
 *
 * The trade-off is that a slot present but empty still makes the row a branch, chevron
 * included, over an empty list.
 */
const hasChildren = computed(() => !!slots.items)
const tag = computed(() =>
  !hasChildren.value && props.href !== undefined ? ('a' as const) : ('button' as const),
)

const parent = inject(sideNavigationKey, null)

/**
 * Both chevrons are chosen on the navigation as a whole. The fallback is what keeps an
 * item rendering correctly when it is used outside one.
 */
const expandIcon = computed(() => parent?.expandIcon ?? expandMoreIcon)
const collapseIcon = computed(() => parent?.collapseIcon)

// The name shared by THIS row's children. It is minted afresh at every level, and that
// is what keeps "one section open at a time" local to a level instead of applying
// across the whole document.
const childrenName = useId()

provide(sideNavigationKey, {
  get name() {
    return parent?.exclusive ? childrenName : undefined
  },
  get exclusive() {
    return parent?.exclusive ?? false
  },
  get expandIcon() {
    return expandIcon.value
  },
  get collapseIcon() {
    return collapseIcon.value
  },
})

const openAttr = computed(() => (open.value ?? props.defaultOpen) || undefined)

// The element is the source of truth and the model is fed BY it, never the other way
// round. The event it fires does not bubble, which is convenient here: listening on
// the element itself cannot pick up a nested branch opening inside it.
function onToggle(event: Event) {
  const value = (event.target as HTMLDetailsElement).open
  if (open.value !== value) open.value = value
}

const ariaCurrent = computed(() =>
  props.active ? (tag.value === 'a' && !hasChildren.value ? 'page' : 'true') : undefined,
)

/*
 * A branch header has no `disabled` attribute of its own, so cancelling the click is
 * the only way to stop it from folding. The keyboard needs nothing here: taking the
 * header out of the tab order already covers it.
 *
 * The same solution as VAccordionItem, and deliberately not `pointer-events: none`,
 * which would also remove the forbidden cursor telling the reader why nothing happens.
 */
function onSummaryClick(event: MouseEvent) {
  if (props.disabled) event.preventDefault()
}

/*
 * A branch's end slot sits INSIDE the header, so a click there would fold the branch.
 * Stopping the event from travelling would not help: folding is not a listener anyone
 * registered, it is the click's DEFAULT action, and only cancelling that prevents it.
 *
 * The exception is a click that already landed on something activable. There the click
 * belongs to that control, the branch is not concerned, and cancelling the default
 * would break its own behaviour — a link would stop navigating. The same filter as in
 * `useFieldPanel`, for the same reason.
 */
function onEndClick(event: MouseEvent) {
  const target = event.target as Element | null
  if (!target?.closest('button, a, input, select, textarea, [tabindex]')) event.preventDefault()
}

function onActionClick(event: MouseEvent) {
  // A disabled button never receives the click at all; a link made inert by hand does,
  // so it is cancelled here.
  if (props.disabled) {
    event.preventDefault()
    return
  }
  emit('select')
}
</script>

<template>
  <li class="v-side-nav-item" :class="rootClass" :style="rootStyle">
    <details
      v-if="hasChildren"
      class="v-side-nav-branch"
      :name="parent?.name"
      :open="openAttr"
      :data-swap="collapseIcon ? '' : undefined"
      @toggle="onToggle"
    >
      <summary
        v-bind="forwardedAttrs"
        class="v-side-nav-row"
        :data-active="active ? '' : undefined"
        :data-disabled="disabled ? '' : undefined"
        :aria-current="ariaCurrent"
        :aria-disabled="disabled || undefined"
        :tabindex="disabled ? -1 : undefined"
        @click="onSummaryClick"
      >
        <slot name="start">
          <VIcon v-if="icon" class="v-side-nav-icon" v-bind="iconProps(icon)" />
        </slot>
        <span class="v-side-nav-content">
          <span class="v-side-nav-label"><slot /></span>
          <span v-if="sublabel !== undefined || $slots.sublabel" class="v-side-nav-sublabel">
            <slot name="sublabel">{{ sublabel }}</slot>
          </span>
        </span>
        <!-- This slot sits INSIDE the branch header, where ANY click folds the
             branch: without the handler, clicking a badge would close the section
             under it -->
        <span v-if="$slots.end" class="v-side-nav-end" @click="onEndClick"
          ><slot name="end"
        /></span>
        <VIcon class="v-side-nav-chevron" v-bind="iconProps(expandIcon)" />
        <!-- Both chevrons are always in the DOM; the open state decides which one
             shows, in CSS alone — the VAccordion idiom -->
        <VIcon
          v-if="collapseIcon"
          class="v-side-nav-chevron v-side-nav-chevron-open"
          v-bind="iconProps(collapseIcon)"
        />
      </summary>
      <ul class="v-side-nav-children">
        <slot name="items" />
      </ul>
    </details>

    <div
      v-else
      class="v-side-nav-row"
      :data-active="active ? '' : undefined"
      :data-disabled="disabled ? '' : undefined"
    >
      <component
        :is="tag"
        v-bind="forwardedAttrs"
        class="v-side-nav-action"
        :type="tag === 'button' ? 'button' : undefined"
        :disabled="tag === 'button' ? disabled : undefined"
        :href="tag === 'a' && !disabled ? href : undefined"
        :aria-disabled="tag === 'a' && disabled ? 'true' : undefined"
        :aria-current="ariaCurrent"
        @click="onActionClick"
      >
        <slot name="start">
          <VIcon v-if="icon" class="v-side-nav-icon" v-bind="iconProps(icon)" />
        </slot>
        <span class="v-side-nav-content">
          <span class="v-side-nav-label"><slot /></span>
          <span v-if="sublabel !== undefined || $slots.sublabel" class="v-side-nav-sublabel">
            <slot name="sublabel">{{ sublabel }}</slot>
          </span>
        </span>
      </component>
      <span v-if="$slots.end" class="v-side-nav-end"><slot name="end" /></span>
    </div>
  </li>
</template>

<style>
@layer vectis.components {
  /*
   * How deep an item sits, counted entirely in CSS: no registry, nothing provided down
   * the tree, no inline style, and no `level` prop for the consumer to keep track of.
   * The markup gives two elements per level — the item, then the list of its children —
   * and each of them reads a name the other DECLARES.
   *
   * TRAP — the obvious one-name form, incrementing a variable by reading itself, is a
   * CYCLE as far as CSS is concerned, even though the value being read is the inherited
   * one. The property then falls to invalid, every read falls back to zero, and the
   * whole tree renders FLAT — with nothing in the console to say why. The two
   * alternating names are what avoid it.
   */
  .v-side-nav-item {
    --side-nav-parent-level: var(--side-nav-level, 0);
  }

  .v-side-nav-children {
    --side-nav-level: calc(var(--side-nav-parent-level) + 1);
  }

  .v-side-nav-branch {
    /* Lets a long label wrap rather than widening the whole sidebar. The folding
       animation itself is further down. */
    min-inline-size: 0;
  }

  .v-side-nav-row {
    /*
     * Every dimension comes from the variables the nav sets and this row inherits — it
     * is the only element carrying the shared size class. The icons follow with nothing
     * written for them, their own variables belonging to that same block.
     *
     * The type is composite, as in a menu row: the SIZE comes from the scale, but the
     * line height stays that of body text — a unitless ratio, so it still follows the
     * size — and the weight stays regular. The full `control` type role would suit a
     * single-line label, and a navigation row may wrap and carry a second line.
     *
     * TRAP — the indent is computed HERE and not stored in a variable set higher up. A
     * custom property is substituted on the element that DECLARES it, so a padding
     * computed on the nav would be frozen at level zero for the whole tree.
     */

    /*
     * The corner takes the role every clickable box in the DS takes, so a brand that
     * squares its controls or rounds them into pills carries the sidebar along in the
     * one override.
     *
     * TRAP — the cap has to stay derived from --control-height. A browser scales down
     * any radius it cannot fit, so a row exactly one control tall already paints half
     * that height under a pill override; min() applies the same reduction to a row that
     * grew past it. Written bare, a row carrying a second line paints half of ITS OWN
     * height instead, and two rows of the same list come out with different corners. At
     * the shipped 6px this resolves to 6px on both sizes and under compact, so nothing
     * at the default value can see the line go — only the PillRadius play function can.
     *
     * The variable is what keeps the row and the stretched overlay below in step: that
     * overlay is positioned against this element, so the two are the same box, and its
     * ring is drawn on the radius found here.
     */
    --side-nav-row-radius: min(var(--vectis-radius-interactive), calc(var(--control-height) / 2));

    position: relative;
    display: flex;
    align-items: center;
    gap: var(--control-gap);
    min-block-size: var(--control-height);
    padding-block: var(--vectis-space-1);
    padding-inline: calc(
        var(--control-padding-inline) + var(--side-nav-level, 0) * var(--side-nav-indent)
      )
      var(--control-padding-inline);
    border-radius: var(--side-nav-row-radius);
    color: var(--vectis-color-text);
    font-size: var(--control-font-size);
    line-height: var(--vectis-text-body-md-leading);
    list-style: none;
    cursor: pointer;
  }

  /* Removing the browser's own disclosure triangle: setting the list style is not
     enough in WebKit, which draws it through this pseudo-element. */
  .v-side-nav-row::-webkit-details-marker {
    display: none;
  }

  .v-side-nav-action {
    /* On a leaf the link is a CHILD of the row, and the indent deliberately stays on
       the row itself: what has to run the full width is the hover background, not the
       link inside it. */
    flex: 1;
    min-inline-size: 0;
    display: flex;
    align-items: center;
    gap: var(--control-gap);
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    text-align: start;
    text-decoration: none;
    cursor: inherit;
  }

  /*
   * This is what stretches the link over the WHOLE row without having to wrap the end
   * slot inside it. It is an invisible box, positioned, so it is painted above the
   * chevron — which is not positioned — while passing UNDER the end slot, which is
   * positioned too and comes later in the document. That layering is exactly what
   * makes the whole row clickable while leaving a control in the end slot usable.
   */
  .v-side-nav-action::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: var(--side-nav-row-radius);
  }

  .v-side-nav-content {
    flex: 1;
    min-inline-size: 0;
    display: flex;
    flex-direction: column;
  }

  .v-side-nav-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .v-side-nav-sublabel {
    overflow: hidden;
    font-size: var(--vectis-text-caption-size);
    color: var(--vectis-color-text-muted);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .v-side-nav-icon {
    flex: none;
    color: var(--vectis-color-text-muted);
  }

  /* Positioned on purpose: that is what paints it above the stretched link, and
     therefore what keeps whatever it holds clickable. */
  .v-side-nav-end {
    position: relative;
    flex: none;
    display: flex;
    align-items: center;
    gap: var(--vectis-space-1);
  }

  /* The chevron points down when the branch is closed and flips when it opens. It
     turns around a horizontal axis, so unlike VMenu's sideways chevron it needs no
     mirroring in a right-to-left page. */
  .v-side-nav-chevron {
    flex: none;
    color: var(--vectis-color-text-muted);
    transition: rotate var(--vectis-duration-base) var(--vectis-ease-default);
  }

  .v-side-nav-branch[open]:not([data-swap]) > .v-side-nav-row > .v-side-nav-chevron {
    rotate: 180deg;
  }

  /* When the navigation supplied a second chevron, each state hides one of the two
     rendered icons instead of rotating a single one. */
  .v-side-nav-branch[data-swap][open]
    > .v-side-nav-row
    > .v-side-nav-chevron:not(.v-side-nav-chevron-open),
  .v-side-nav-branch[data-swap]:not([open]) > .v-side-nav-row > .v-side-nav-chevron-open {
    display: none;
  }

  .v-side-nav-row:hover:not([data-disabled]) {
    background: var(--vectis-color-surface-muted);
  }

  /*
   * A branch header takes focus itself; a leaf only takes it through its link, and the
   * ring is then drawn on the stretched box so that it frames the whole row rather than
   * just the text.
   *
   * The ring is pulled INWARDS in both cases: the content of a branch is clipped so it
   * can be animated open, and a ring drawn outside the row would be cut off there.
   */
  .v-side-nav-row:focus-visible,
  .v-side-nav-action:focus-visible::after {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: calc(var(--vectis-focus-ring-offset) * -1);
  }

  .v-side-nav-action:focus-visible {
    outline: none;
  }

  /* The row of the page currently being viewed. */
  .v-side-nav-row[data-active] {
    background: var(--vectis-color-accent-surface);
    color: var(--vectis-color-accent-text);
  }

  .v-side-nav-row[data-active] .v-side-nav-label {
    font-weight: var(--vectis-text-label-weight);
  }

  .v-side-nav-row[data-active] .v-side-nav-icon,
  .v-side-nav-row[data-active] .v-side-nav-sublabel,
  .v-side-nav-row[data-active] .v-side-nav-chevron {
    color: inherit;
  }

  .v-side-nav-row[data-active]:hover {
    /* The current row is already tinted, so its hover deepens that tint rather than
       replacing it with the neutral highlight — the VMenuItem idiom. */
    background: color-mix(
      in oklab,
      var(--vectis-color-accent-surface),
      var(--vectis-color-accent-text) 8%
    );
  }

  /* A CLOSED branch holding the current page keeps a mark of it, so the reader can see
     where they are without opening every section. The lookup is deliberately a
     descendant one: the page may be several levels down. */
  .v-side-nav-branch:not([open]):has(.v-side-nav-children [aria-current])
    > .v-side-nav-row:not([data-active]) {
    color: var(--vectis-color-accent-text);
  }

  /* A disabled row greys out through the colour tokens, never through opacity. */
  .v-side-nav-row[data-disabled] {
    color: var(--vectis-color-text-subtle);
    cursor: not-allowed;
  }

  /* The icon, the second line and the chevron default to a colour DARKER than the one
     a disabled label takes: left alone they would come out stronger than the label
     itself, so they inherit it instead. */
  .v-side-nav-row[data-disabled] .v-side-nav-icon,
  .v-side-nav-row[data-disabled] .v-side-nav-sublabel,
  .v-side-nav-row[data-disabled] .v-side-nav-chevron {
    color: inherit;
  }

  /* The opening animates in pure CSS, on the box the browser wraps a branch's content
     in. A browser without support opens the branch instantly, which is the intended
     fallback. */
  .v-side-nav-branch::details-content {
    block-size: 0;
    overflow: clip;
    transition:
      block-size var(--vectis-duration-base) var(--vectis-ease-default),
      content-visibility var(--vectis-duration-base) allow-discrete;
  }

  .v-side-nav-branch[open]::details-content {
    block-size: auto;
  }

  @media (prefers-reduced-motion: reduce) {
    .v-side-nav-chevron,
    .v-side-nav-branch::details-content {
      transition: none;
    }
  }
}
</style>
