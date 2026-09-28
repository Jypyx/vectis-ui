<script setup lang="ts">
/**
 * Branches use native details and leaves use links or buttons. JavaScript synchronizes open
 * state, disables summaries and makes disabled links inert.
 */

import { computed, h, inject, onBeforeUpdate, provide, ref, renderSlot, useId, useSlots } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import { expand_more as expandMoreIcon } from '../VIcon/icons/expand_more'
import type { IconSource } from '../VIcon/types'
import { sideNavigationKey } from './context'

import { useDetailsOpen } from '../../composables/useDetailsOpen'
import { useInertLink } from '../../composables/useInertLink'
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
  /** Renders a branch already open. Bind `v-model:open` to drive it instead. */
  defaultOpen?: boolean
}

// Without redirecting them, `target`, `rel`, `download` and the aria-* would land on that list
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

// "not bound" is written as `null` and not `undefined`. A model typed as a plain boolean is
// declared as such at runtime, and Vue casts an ABSENT boolean prop to `false`, which would
// silently overwrite `defaultOpen` on every branch.
/**
 * Whether the branch is open, when the consumer wants to drive or observe it. Left
 * unbound, the browser keeps that state to itself, `defaultOpen` giving only the initial
 * value. `null` means unbound.
 */
const open = defineModel<boolean | null>('open', { default: null })

const emit = defineEmits<{
  // Never declare a `click` emit alongside it. Vue removes a declared event from the forwarded
  // attributes, and a consumer's own `@click` would then stop reaching the link entirely.
  /** A row WITHOUT subitems was activated, by click or by keyboard. */
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
   * Free content at the end of the row, before the chevron: a counter, a badge. On a
   * BRANCH it must not be focusable, a control inside the header being a control nested
   * inside another.
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
 * Whether this row has subitems, read from the mere PRESENCE of the slot; the same device
 * VMenuItem and VTabs use.
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
// The test runs once, at setup: the server and the client take the same path because they see
// the same slot, which keeps `useId` in step across hydration, and also why the slot must not
// come and go later.
if (slots.children) {
  // The name shared by this row's children. It is minted afresh at every level, and that is
  // what keeps "one section open at a time" local to a level instead of applying across the
  // whole document.
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

const ariaCurrent = computed(() =>
  props.current ? (tag.value === 'a' ? 'page' : 'true') : undefined,
)

/*
 * `renderSlot` is what a compiled `<slot>` calls, so each fallback behaves exactly as it would
 * in the template.
 */
// @core
/*
 * The tick is what makes RowBody follow the slots at all. A functional component declaring no
 * props is never updated by its parent's re-render, and `slots` is not reactive, so a sublabel
 * added behind a `v-if` or a label captured by a render function stayed as first drawn.
 */
const slotTick = ref(0)
onBeforeUpdate(() => slotTick.value++)

const RowBody = () => (
  void slotTick.value,
  [
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
)

/*
 * Stopping the event from travelling would not help: folding is not a listener anyone
 * registered, it is the click's default action, and only cancelling that prevents it. The
 * exception is a click that already landed on something activable.
 */
// @core
function onEndClick(event: MouseEvent) {
  const target = event.target as Element | null
  if (!target?.closest('button, a, input, select, textarea, [tabindex]')) event.preventDefault()
}

// A template ref on the item reaches the list item, a layout box; what is focused and
// named is its row: the branch header, or the leaf's link or button.
const rowEl = ref<HTMLElement | null>(null)
const actionEl = ref<HTMLElement | null>(null)
const control = () => (hasChildren.value ? rowEl.value : actionEl.value)
defineExpose({
  /** Moves the focus to the row: the branch header, or the leaf's link or button. */
  focus: (options?: FocusOptions) => control()?.focus(options),
  /** That element, which is also where the consumer's attributes land. */
  get el() {
    return control()
  },
})

// @a11y
// A leaf link has no `disabled`: the address, the consumer's click listeners and the
// generic role of an `<a>` without `href` are handled by the shared inert link.
const link = useInertLink({
  href: () => (tag.value === 'a' ? props.href : undefined),
  inert: () => props.disabled,
  attrs: () => forwardedAttrs.value,
})

// @core
function onActionClick(event: MouseEvent) {
  // A disabled button never receives the click at all; an inert link does, so it is
  // cancelled here.
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
        ref="rowEl"
        class="v-side-nav-row"
        :data-current="current ? '' : undefined"
        :data-disabled="disabled ? '' : undefined"
        :aria-current="ariaCurrent"
        :aria-disabled="disabled || undefined"
        :tabindex="disabled ? -1 : undefined"
        v-bind="forwardedAttrs"
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
        ref="actionEl"
        class="v-side-nav-action"
        :type="tag === 'button' ? 'button' : undefined"
        :disabled="tag === 'button' ? disabled : undefined"
        :aria-disabled="link.isInertLink.value ? 'true' : undefined"
        :aria-current="ariaCurrent"
        v-bind="link.attrs.value"
        :href="link.linkHref.value"
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
   * The obvious one-name form, incrementing a variable by reading itself, is a CYCLE as far as
   * CSS is concerned, even though the value being read is the inherited one. The property then
   * falls to invalid, every read falls back to zero, and the whole tree renders FLAT; with
   * nothing in the console to say why.
   */
  .v-side-nav-item {
    --side-nav-parent-level: var(--side-nav-level, 0);
  }

  .v-side-nav-children {
    --side-nav-level: calc(var(--side-nav-parent-level) + 1);
  }

  .v-side-nav-row {
    /*
     * The indent is computed here and not stored in a variable set higher up. A custom property
     * is substituted on the element that DECLARES it, so a padding computed on the nav would be
     * frozen at level zero for the whole tree.
     */

    /*
     * The cap has to stay derived from --control-height. A browser scales down any radius it
     * cannot fit, so a row exactly one control tall already paints half that height under a
     * pill override; min() applies the same reduction to a row that grew past it.
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
   * This is what stretches the link over the whole row without having to wrap the end slot
   * inside it. It is an invisible box, positioned, so it is painted above the chevron; which is
   * not positioned; while passing UNDER the end slot, which is positioned too and comes later
   * in the document.
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

  .v-side-nav-row[data-current]:not([data-disabled]):hover {
    /*
     * The current row is already tinted, so its hover deepens that tint rather than replacing
     * it with the neutral highlight; the VMenuItem idiom.
     */
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
    > .v-side-nav-row:not([data-current], [data-disabled]) {
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

  /* Forced colours flatten the current row's tint to `Canvas` and its accent text to
     `CanvasText`, leaving a slightly bolder label as the only cue, and the mark on a closed
     branch is a colour alone. The current row takes the system selection pair, repeated to
     (0,4,0) above its own hover, and the closed branch underlines its label, a decoration
     the mode keeps. */
  @media (forced-colors: active) {
    .v-side-nav-row.v-side-nav-row.v-side-nav-row[data-current] {
      forced-color-adjust: none;
      background: Highlight;
      color: HighlightText;
    }

    .v-side-nav-row.v-side-nav-row.v-side-nav-row[data-current][data-disabled] {
      background: Canvas;
      color: GrayText;
    }

    .v-side-nav-branch:not([open]):has(.v-side-nav-children [aria-current])
      > .v-side-nav-row:not([data-current], [data-disabled])
      .v-side-nav-label {
      text-decoration: underline;
    }
  }

  /* The disclosure animation, the chevron's rotation or swap and the WebKit marker come
     from `styles/disclosure.css`, reduced-motion block included. */
}
</style>
