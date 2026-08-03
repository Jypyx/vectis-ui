<script setup lang="ts">
import { computed, inject, provide, useId, useSlots } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import { sideNavigationKey } from './context'

import { useRootAttrs } from '../../composables/useRootAttrs'

/**
 * A sidebar navigation item. Two shapes, depending on whether the #items slot is
 * present:
 *
 * - BRANCH: native `<details>`/`<summary>` — state, activation keyboard, exclusivity
 *   between siblings (`<details name>`) and animation all come from the browser. The
 *   row IS the `<summary>`, which must contain everything displayed on the line: the
 *   #end slot therefore lives inside it, hence the click cancellation (without it,
 *   any click in that slot would toggle the branch). Documented corollary: put only
 *   NON-focusable content there (a chip, a badge, a counter) — a `<summary>`'s
 *   subtree serves as its accessible name and may be flattened by some screen
 *   readers.
 * - LEAF: the row is a CONTAINER and the action (`<a>`/`<button>`) is stretched over
 *   it by an absolute `::after`. The #end slot thus stays its SIBLING — never a
 *   control nested inside a link — while keeping the whole row clickable.
 */
interface SideNavigationItemProps {
  /** Secondary line under the label (the #sublabel slot wins). */
  sublabel?: string
  /**
   * Icon before the label: a Material Symbols Rounded name, or an explicit render
   * (`{ src }`, `{ component }`…). The #start slot wins.
   */
  icon?: IconSource
  /** A leaf rendered as `<a href>`; IGNORED when the #items slot is present. */
  href?: string
  /** Item of the current page: accent highlight + aria-current. */
  active?: boolean
  /** Inert item: greyed through tokens, out of the keyboard path. */
  disabled?: boolean
  /** Branch open on the first render (the state is then native). */
  defaultOpen?: boolean
}

// A structural root (<li>): without this split, `target`, `rel`, `download` and the
// `aria-*` would land on the <li> instead of the control.
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
 * Opening of a branch. With no v-model, the state stays the DOM's (`defaultOpen` as
 * the initial value): since the bound value never changes, Vue does not re-patch and
 * the native toggling stays sovereign.
 *
 * `null` — and not `undefined` — to distinguish "not bound": a model typed `boolean`
 * alone is declared `type: Boolean` at runtime, and an ABSENT boolean is cast to
 * `false` by Vue, which would overwrite `defaultOpen`. An explicit `default` disarms
 * that cast.
 */
const open = defineModel<boolean | null>('open', { default: null })

const emit = defineEmits<{
  /**
   * Emitted on the activation of an item WITHOUT subitems. Never declare a `click`
   * emit: Vue would remove it from `$attrs` and the consumer's `@click` would no
   * longer reach the link.
   */
  select: []
}>()

defineSlots<{
  /** Label of the item — MANDATORY. */
  default(): unknown
  /** Rich sublabel (wins over the `sublabel` prop). */
  sublabel?(): unknown
  /** Free content before the label (wins over `icon`). */
  start?(): unknown
  /** Free content on the right, before the chevron. */
  end?(): unknown
  /** Subitems (VSideNavigationItem/Group/Separator, recursive with no limit). */
  items?(): unknown
}>()

const { rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

const slots = useSlots()
/**
 * STATIC presence of the slot (VMenuItem's `hasSubmenu` model, VTabs' `hasPanels`):
 * deterministic in SSR, hence no reactive registry and no hydration mismatch. The
 * trade-off: a present but empty #items displays a chevron on an empty list.
 */
const hasChildren = computed(() => !!slots.items)
const tag = computed(() =>
  !hasChildren.value && props.href !== undefined ? ('a' as const) : ('button' as const),
)

const parent = inject(sideNavigationKey, null)

/** Icons set by the root; the item stays usable on its own. */
const expandIcon = computed(() => parent?.expandIcon ?? 'expand_more')
const collapseIcon = computed(() => parent?.collapseIcon)

// Group name of the CHILD <details>: fresh at each level, which is what makes
// exclusivity local to a level rather than global to the document.
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

// The <details> is the source of truth: the model is fed BY the DOM. The `toggle`
// event does not bubble, so it is listened for on the element itself and never comes
// up from a nested branch.
function onToggle(event: Event) {
  const value = (event.target as HTMLDetailsElement).open
  if (open.value !== value) open.value = value
}

const ariaCurrent = computed(() =>
  props.active ? (tag.value === 'a' && !hasChildren.value ? 'page' : 'true') : undefined,
)

/*
 * <summary> has no native `disabled` attribute: cancelling the click is the only way
 * to block the toggling (the keyboard, on the other hand, is covered by
 * `tabindex="-1"`). The VAccordionItem idiom — definitely not `pointer-events: none`,
 * which would kill `cursor: not-allowed`.
 */
function onSummaryClick(event: MouseEvent) {
  if (props.disabled) event.preventDefault()
}

/*
 * A branch's #end slot lives INSIDE the <summary>: `stopPropagation` would not be
 * enough there — toggling the <details> is not a listener but the click's DEFAULT
 * action, which only `preventDefault` cancels.
 *
 * Unless the click already targets an activable element: it is then its OWN
 * activation target, the <details> is not concerned, and cancelling the default
 * would break its navigation. The same filter as `useFieldPanel`'s
 * `onPanelMousedown`, for the same reason.
 */
function onEndClick(event: MouseEvent) {
  const target = event.target as Element | null
  if (!target?.closest('button, a, input, select, textarea, [tabindex]')) event.preventDefault()
}

function onActionClick(event: MouseEvent) {
  // <button disabled> does not receive the click; an inert link does.
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
        <!-- The slot lives INSIDE the <summary>, where ANY click toggles the
             <details>: without `onEndClick`, a badge would open the branch. -->
        <span v-if="$slots.end" class="v-side-nav-end" @click="onEndClick"
          ><slot name="end"
        /></span>
        <VIcon class="v-side-nav-chevron" v-bind="iconProps(expandIcon)" />
        <!-- Two chevrons rendered, swapped 100% in CSS on [open] (the VAccordion idiom) -->
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
   * DEPTH — a 100% CSS counter: no registry, no provide/inject, no inline style, no
   * `level` prop to pass by hand. The structure supplies two elements per level (<li>
   * then <ul>), and each element reads a name it does not DECLARE.
   *
   * ⚠ The single-name form — `--side-nav-level: calc(var(--side-nav-level, 0) + 1)` —
   * is a CYCLE (CSS Variables §3), including when the value read is the inherited
   * one: the property falls to "guaranteed-invalid", `var(--side-nav-level, 0)` falls
   * back to 0 everywhere and the tree displays FLAT, with no console error at all.
   */
  .v-side-nav-item {
    --side-nav-parent-level: var(--side-nav-level, 0);
  }

  .v-side-nav-children {
    --side-nav-level: calc(var(--side-nav-parent-level) + 1);
  }

  .v-side-nav-branch {
    /* The native folding: the animation lives on ::details-content, further down. */
    min-inline-size: 0;
  }

  .v-side-nav-row {
    /*
     * Size: the `--control-*` variables inherited from the <nav>, the only carrier of
     * `v-control` (styles/control-size.css) — the icons follow without a line of CSS,
     * `--vectis-icon-size`/`-opsz` being part of the same block.
     *
     * Composite typography, as in .v-menu-item: the SIZE comes from the scale, the
     * leading stays that of `body-md` (a unitless ratio, so it follows) and the weight
     * stays regular — the `control` recipe means medium/1, and a row may wrap and carry
     * a sublabel.
     *
     * The indent `calc` is written HERE and not in a variable set higher up: a custom
     * property is substituted on the element that DECLARES it, so a
     * `--side-nav-pad-start` set on the root would be frozen at level 0.
     */
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
    border-radius: var(--vectis-radius-sm);
    color: var(--vectis-color-text);
    font-size: var(--control-font-size);
    line-height: var(--vectis-text-body-md-leading);
    list-style: none;
    cursor: pointer;
  }

  /* The <summary>'s native marker: list-style is not enough on WebKit */
  .v-side-nav-row::-webkit-details-marker {
    display: none;
  }

  .v-side-nav-action {
    /* Leaf row: the action is a child, the indent stays carried by the row — it is
       the hover background that must stay full width. */
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
   * A clickable area extended to the WHOLE row, without wrapping the end slot.
   * Painted as a positioned descendant (CSS 2.1 App. E, step 8): it covers the
   * chevron, which is not positioned, but passes UNDER `.v-side-nav-end`, later in
   * the tree and positioned too.
   */
  .v-side-nav-action::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: var(--vectis-radius-sm);
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

  /* Positioned → painted above the extended clickable area, hence clickable. */
  .v-side-nav-end {
    position: relative;
    flex: none;
    display: flex;
    align-items: center;
    gap: var(--vectis-space-1);
  }

  /* Chevron: down when closed, flipped when open. A rotation on the vertical axis →
     no RTL mirroring (unlike VMenu's sideways chevron). */
  .v-side-nav-chevron {
    flex: none;
    color: var(--vectis-color-text-muted);
    transition: rotate var(--vectis-duration-base) var(--vectis-ease-default);
  }

  .v-side-nav-branch[open]:not([data-swap]) > .v-side-nav-row > .v-side-nav-chevron {
    rotate: 180deg;
  }

  /* Swapping the two chevrons (data-swap = collapseIcon provided) */
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
   * Focus: a branch is itself focusable; a leaf only is through its action, whose
   * ring is carried by the extended area — so it frames the whole row. A NEGATIVE
   * `outline-offset` in both cases: `::details-content` is in `overflow: clip`, and a
   * ring pulled outwards would be cropped there.
   */
  .v-side-nav-row:focus-visible,
  .v-side-nav-action:focus-visible::after {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: calc(var(--vectis-focus-ring-offset) * -1);
  }

  .v-side-nav-action:focus-visible {
    outline: none;
  }

  /* Current page */
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
    /* Slightly darkens the accent surface (the VMenuItem idiom) */
    background: color-mix(
      in oklab,
      var(--vectis-color-accent-surface),
      var(--vectis-color-accent-text) 8%
    );
  }

  /* A COLLAPSED branch containing the current page stays flagged. The `:has()` is
     deliberately descendant: it must match at any depth. */
  .v-side-nav-branch:not([open]):has(.v-side-nav-children [aria-current])
    > .v-side-nav-row:not([data-active]) {
    color: var(--vectis-color-accent-text);
  }

  /* Disabled: greys through tokens (never opacity) */
  .v-side-nav-row[data-disabled] {
    color: var(--vectis-color-text-subtle);
    cursor: not-allowed;
  }

  /* text-muted is darker than text-subtle: everything follows the label */
  .v-side-nav-row[data-disabled] .v-side-nav-icon,
  .v-side-nav-row[data-disabled] .v-side-nav-sublabel,
  .v-side-nav-row[data-disabled] .v-side-nav-chevron {
    color: inherit;
  }

  /* Animated opening in pure CSS (::details-content, progressive enhancement) */
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
