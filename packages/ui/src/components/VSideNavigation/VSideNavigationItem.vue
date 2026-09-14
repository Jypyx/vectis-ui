<script setup lang="ts">
/**
 * One row of a sidebar navigation, in one of two shapes depending on whether it was given
 * subitems — and the difference runs deeper than it looks.
 *
 * A BRANCH is a `<details>`, so its open state, the toggle keyboard, the exclusivity with a
 * neighbouring section and the animation all come from the browser. Its row IS the
 * `<summary>`, which must contain the whole line, `#end` included — hence the click handler
 * there, or anything put in it would fold the branch. The documented consequence is that
 * only NON-focusable content belongs in it: a control would be nested inside a control (WCAG
 * 4.1.2, axe `nested-interactive`), and a `<summary>`'s subtree also serves as its
 * accessible name, which some screen readers flatten.
 *
 * A LEAF is the opposite: the row is a plain container with the action stretched over it by
 * an absolute `::after`, so the whole row is clickable while `#end` stays a SIBLING of the
 * action rather than inside it — which is what keeps a real control there legitimate.
 *
 * The branch's open state and its disabled summary go through `useDetailsOpen`, shared with
 * VAccordionItem.
 */

import { computed, h, inject, provide, renderSlot, useId, useSlots } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import { expand_more as expandMoreIcon } from '../VIcon/icons/expand_more'
import type { IconSource } from '../VIcon/types'
import { sideNavigationKey } from './context'

import { useDetailsOpen } from '../../composables/useDetailsOpen'
import { useRootAttrs } from '../../composables/useRootAttrs'

interface SideNavigationItemProps {
  /** What the row says, and where it goes. The default slot replaces it. */
  label?: string
  /** A second line under the label, for a status or a short explanation. */
  sublabel?: string
  /**
   * An icon before the label: an icon name, or an explicit render. The `#icon` slot
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
   * announced as the current page (`aria-current`).
   */
  current?: boolean
  /**
   * Makes the row unusable: it greys out through the colour tokens and leaves the
   * keyboard path.
   */
  disabled?: boolean
  /**
   * Renders a branch already open. Only its initial value is read: the browser owns the
   * state from then on, so changing this prop later will not fold a branch the reader
   * has opened. Bind `v-model:open` to drive it instead.
   */
  defaultOpen?: boolean
}

// The root element is a list item, which is structure and not the control. Without
// redirecting them, `target`, `rel`, `download` and the aria-* would land on that list
// item instead of on the link or the branch header.
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<SideNavigationItemProps>(), {
  label: undefined,
  sublabel: undefined,
  icon: undefined,
  href: undefined,
  current: false,
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
  /**
   * The label of the row, replacing the `label` prop. One of the two is REQUIRED: a
   * navigation row must say where it goes.
   */
  default?(): unknown
  /** A second line made of markup, replacing the `sublabel` prop. */
  sublabel?(): unknown
  /** Free content before the label, which takes the place of `icon`. */
  icon?(): unknown
  /**
   * Free content at the end of the row, before the chevron — a counter, a badge. On a
   * BRANCH it must not be focusable (see the introduction).
   */
  end?(): unknown
  /**
   * The subitems, which turn this row into a branch. Nesting is not limited. The slot
   * must be statically present or absent: whether a row is a branch is decided when it
   * is created.
   */
  children?(): unknown
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
const hasChildren = computed(() => !!slots.children)
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

// @ssr @core
// Only a BRANCH has children to hand a context to, so a leaf — most rows of a sidebar —
// mints no id and provides nothing. The test runs once, at setup: the server and the
// client take the same path because they see the same slot, which is what keeps `useId`
// in step across hydration, and also why the slot must not come and go later.
if (slots.children) {
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
}

const { openAttr, onToggle, onSummaryClick } = useDetailsOpen(open, {
  defaultOpen: () => props.defaultOpen,
  disabled: () => props.disabled,
})

// A link says "page"; a button, a branch header included, can only say "true".
const ariaCurrent = computed(() =>
  props.current ? (tag.value === 'a' ? 'page' : 'true') : undefined,
)

/*
 * The icon and the label column, identical in both row shapes. A functional component
 * rather than two copies of the markup, a Vue template having no reusable fragment.
 * `renderSlot` is what a compiled `<slot>` calls, so each fallback behaves exactly as it
 * would in the template.
 */
const RowBody = () => [
  renderSlot(slots, 'icon', {}, () =>
    props.icon ? [h(VIcon, { class: 'v-side-nav-icon', ...iconProps(props.icon) })] : [],
  ),
  h('span', { class: 'v-side-nav-content' }, [
    h('span', { class: 'v-side-nav-label' }, [
      renderSlot(slots, 'default', {}, () => [props.label]),
    ]),
    props.sublabel !== undefined || slots.sublabel
      ? h('span', { class: 'v-side-nav-sublabel' }, [
          renderSlot(slots, 'sublabel', {}, () => [props.sublabel]),
        ])
      : null,
  ]),
]

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
      class="v-side-nav-branch v-disclosure"
      :name="parent?.name"
      :open="openAttr"
      :data-swap="collapseIcon ? '' : undefined"
      @toggle="onToggle"
    >
      <summary
        v-bind="forwardedAttrs"
        class="v-side-nav-row"
        :data-current="current ? '' : undefined"
        :data-disabled="disabled ? '' : undefined"
        :aria-current="ariaCurrent"
        :aria-disabled="disabled || undefined"
        :tabindex="disabled ? -1 : undefined"
        @click="onSummaryClick"
      >
        <RowBody />
        <!-- This slot sits INSIDE the branch header, where ANY click folds the
             branch: without the handler, clicking a badge would close the section
             under it -->
        <span v-if="$slots.end" class="v-side-nav-end" @click="onEndClick"
          ><slot name="end"
        /></span>
        <VIcon class="v-side-nav-chevron v-disclosure-chevron" v-bind="iconProps(expandIcon)" />
        <!-- Both chevrons are always in the DOM; the open state decides which one
             shows, in CSS alone -->
        <VIcon
          v-if="collapseIcon"
          class="v-side-nav-chevron v-side-nav-chevron-open v-disclosure-chevron v-disclosure-chevron-open"
          v-bind="iconProps(collapseIcon)"
        />
      </summary>
      <ul class="v-side-nav-children">
        <slot name="children" />
      </ul>
    </details>

    <div
      v-else
      class="v-side-nav-row"
      :data-current="current ? '' : undefined"
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
        <RowBody />
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

  .v-side-nav-row {
    /*
     * Every dimension comes from the variables the nav sets and this row inherits — it
     * is the only element carrying the shared size class. The icons follow with nothing
     * written for them, their own variables belonging to that same block.
     *
     * The type is composite, as in a menu row: the SIZE comes from the scale, but the
     * line height stays that of body text — a unitless ratio, so it still follows the
     * size — and the weight stays regular. The full `control` type role would set its
     * lines tight against each other, and a row may carry a second line under the label.
     *
     * The label and that second line TRUNCATE rather than wrap: a sidebar has a fixed
     * width, and a row that grew a line would break the rhythm of the list. VMenuItem
     * follows the same recipe.
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
    cursor: pointer;
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
    outline-offset: calc(-1 * var(--vectis-focus-ring-width));
  }

  .v-side-nav-action:focus-visible {
    outline: none;
  }

  /* The row of the page currently being viewed. */
  .v-side-nav-row[data-current] {
    background: var(--vectis-color-accent-surface);
    color: var(--vectis-color-accent-text);
  }

  .v-side-nav-row[data-current] .v-side-nav-label {
    font-weight: var(--vectis-text-label-weight);
  }

  .v-side-nav-row[data-current] .v-side-nav-icon,
  .v-side-nav-row[data-current] .v-side-nav-sublabel,
  .v-side-nav-row[data-current] .v-side-nav-chevron {
    color: inherit;
  }

  .v-side-nav-row[data-current]:hover {
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
    > .v-side-nav-row:not([data-current]) {
    color: var(--vectis-color-accent-text);
  }

  /* A disabled row greys out through the colour tokens, never through opacity. */
  .v-side-nav-row[data-disabled] {
    color: var(--vectis-color-text-subtle);
    cursor: not-allowed;
  }

  /* The icon and the second line default to a colour DARKER than the one a disabled
     label takes: left alone they would come out stronger than the label itself, so they
     inherit it instead. The chevron gets the same treatment from `styles/disclosure.css`. */
  .v-side-nav-row[data-disabled] .v-side-nav-icon,
  .v-side-nav-row[data-disabled] .v-side-nav-sublabel {
    color: inherit;
  }

  /* The disclosure animation, the chevron's rotation or swap and the WebKit marker come
     from `styles/disclosure.css`, reduced-motion block included. */
}
</style>
