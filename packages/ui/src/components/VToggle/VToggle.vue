<script setup lang="ts">
// @keyboard @core
/**
 * A row of buttons where one — or several — stay pressed: choosing a text alignment,
 * a view, a set of filters. A single v-model holds what is chosen.
 *
 * Every item is a VButton, the selected one drawn in the group's tone and the others
 * quiet, and by default the whole row is joined into one segmented control: a single
 * frame, with nothing between the segments until `divided` asks for it. Nothing about
 * hovering, focusing or disabling is written here: it all comes from VButton.
 *
 * The JavaScript covers the two things HTML has no answer for: what a click does to
 * the selection — toggling it off, or refusing to when the last choice may not be
 * given up — and moving between the items with the arrow keys.
 */
import { provide } from 'vue'

import VButtonGroup from '../VButton/VButtonGroup.vue'
import { toggleKey } from './context'

import { toggleValue } from '../../utils/array'
import { arrowNavigate, navigableItems } from '../../utils/arrowNav'

import { useAriaLabel } from '../../composables/useAriaLabel'

export type ToggleValue = string | number
/**
 * What the v-model holds, which follows `multiple`: one value or nothing when a single
 * choice is allowed, and a list of them when several are.
 */
export type ToggleModelValue = ToggleValue | ToggleValue[] | null
export type ToggleVariant = 'ghost' | 'outline'
export type ToggleSelectedVariant = 'solid' | 'soft' | 'ghost'
export type ToggleTone = 'accent' | 'neutral' | 'danger'
export type ToggleSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type ToggleOrientation = 'horizontal' | 'vertical'

interface ToggleProps {
  /** Allows several items to be chosen at once, which makes the v-model a list. */
  multiple?: boolean
  /**
   * Refuses to let the last chosen item be given up, so that something is always
   * selected once something has been. It is a guard and nothing more: it selects
   * nothing on its own at the start.
   */
  mandatory?: boolean
  /**
   * Leaves the items as separate buttons with a gap between them. Left out, they are
   * joined into one segmented control.
   */
  detached?: boolean
  /**
   * Draws a line between the joined items. Left out, they share their edges with
   * nothing between them. It has no effect under `detached`, where the items are
   * separate buttons already.
   */
  divided?: boolean
  /** Whether the items run across the page or down it. */
  orientation?: ToggleOrientation
  /**
   * How the UNSELECTED items are drawn. What the selected one takes is
   * `selectedVariant`.
   */
  variant?: ToggleVariant
  /**
   * How the SELECTED item is drawn, in the group's tone: filled, tinted, or the colour
   * of its text alone.
   */
  selectedVariant?: ToggleSelectedVariant
  /** The colour a selected item takes. The others stay neutral. */
  tone?: ToggleTone
  /** The height of the items, from the scale shared by every control. */
  size?: ToggleSize
  /** Takes 4px off the height of every item. */
  compact?: boolean
  /** Makes the whole group unusable. */
  disabled?: boolean
  /**
   * Draws the selected item's icon in its filled form, a common way of reinforcing
   * that it is the one in effect.
   */
  selectedIconFilled?: boolean
  /**
   * What screen readers announce for the group — "Text alignment", "Filters". It is
   * strongly recommended: no default could say what a group of buttons is for.
   */
  label?: string
}

const props = withDefaults(defineProps<ToggleProps>(), {
  multiple: false,
  mandatory: false,
  detached: false,
  divided: false,
  orientation: 'horizontal',
  variant: 'ghost',
  selectedVariant: 'solid',
  tone: 'accent',
  size: 'md',
  compact: false,
  disabled: false,
  selectedIconFilled: false,
  label: undefined,
})

defineSlots<{
  /** The items of the group. */
  default(): unknown
}>()

/**
 * What is selected, and its SHAPE follows `multiple`: a single value — or `null`, which is
 * where it starts — when one item may be chosen, and an array when several may. A null or
 * scalar value passed in `multiple` mode is read as an empty selection.
 *
 * The array is never mutated in place; each change is a new one, which is what wakes the
 * consumer's binding. Re-clicking the selected item deselects it unless `mandatory` is set.
 */
const model = defineModel<ToggleModelValue>({ default: null })

const ariaLabel = useAriaLabel(() => props.label)

function isSelected(value: ToggleValue): boolean {
  return props.multiple
    ? Array.isArray(model.value) && model.value.includes(value)
    : model.value === value
}

/*
 * What a click does to the selection.
 *
 * With several choices allowed, the list is NEVER changed in place: each write
 * produces a new one. That is what makes a consumer's own watchers and computed values
 * notice; mutating the existing list would leave some of them silent. A model still
 * holding a single value, or nothing, is treated as an empty list rather than
 * refused.
 *
 * There is no check for the disabled state here, and none is needed: a disabled button
 * emits no click at all.
 */
function select(value: ToggleValue) {
  if (props.multiple) {
    const current = Array.isArray(model.value) ? model.value : []
    if (props.mandatory && current.length === 1 && current.includes(value)) return
    model.value = toggleValue(current, value)
    return
  }
  if (model.value === value) {
    if (!props.mandatory) model.value = null
    return
  }
  model.value = value
}

provide(toggleKey, {
  isSelected,
  select,
  get variant() {
    return props.variant
  },
  get selectedVariant() {
    return props.selectedVariant
  },
  get tone() {
    return props.tone
  },
  get size() {
    return props.size
  },
  get compact() {
    return props.compact
  },
  get disabled() {
    return props.disabled
  },
  get selectedIconFilled() {
    return props.selectedIconFilled
  },
})

// @keyboard @a11y
/*
 * The arrow keys, through the shared implementation in `utils/arrowNav`.
 *
 * Every visible item stays a stop in the tab order here — the VPagination model. The
 * single-stop treatment is reserved for the patterns that require it, a row of tabs or
 * a radio group, and a group of buttons is neither. Disabled items are really disabled
 * buttons, which the selector leaves out.
 *
 * The container is read from the event rather than kept as a reference, because the
 * root is rendered dynamically: a reference would hand back sometimes a plain element,
 * sometimes a component instance.
 */
function onKeydown(event: KeyboardEvent) {
  const group = event.currentTarget as HTMLElement
  arrowNavigate(event, group, navigableItems(group, '.v-toggle-item:not(:disabled)'), {
    vertical: props.orientation === 'vertical',
  })
}
</script>

<template>
  <!-- Joined, the row is a VButtonGroup, which merges the borders of its DIRECT
       button children — which is why an item renders the button as its own root, with
       no wrapper in between.

       The orientation is passed through ONE key or the other, never both: an
       attribute bound to `undefined` would still be forwarded and would overwrite the
       one VButtonGroup sets for itself. So the group receives a prop, and the plain
       container an attribute.

       The role is needed for the plain container, and simply repeats what
       VButtonGroup already sets when the row is joined.

       `data-divided` goes on the joined branch alone, so the DOM never carries a
       claim the markup cannot honour: separated, there is no shared edge to draw a
       line on. `data-variant` goes on BOTH: it is what tells the sheet an outline
       row from a ghost one, which the items cannot say for themselves — the selected
       one carries its own variant, not the row's. -->
  <component
    :is="detached ? 'div' : VButtonGroup"
    v-bind="
      detached
        ? { 'data-orientation': orientation }
        : { orientation, 'data-divided': divided ? '' : undefined }
    "
    class="v-toggle"
    role="group"
    :data-variant="variant"
    :aria-label="ariaLabel"
    @keydown="onKeydown"
  >
    <slot />
  </component>
</template>

<style>
@layer vectis.components {
  /*
   * These rules are for the separated row alone, and the exclusion is what makes that
   * true: when the row is joined, the root carries BOTH classes at once. Without it,
   * the centring here and the stretching VButtonGroup declares would collide at equal
   * specificity, and the winner would be decided by whichever sheet the consumer's
   * bundler put last.
   */
  .v-toggle:not(.v-button-group) {
    display: inline-flex;
    align-items: center;
    gap: var(--vectis-space-1);
  }

  .v-toggle:not(.v-button-group)[data-orientation='vertical'] {
    flex-direction: column;
    align-items: stretch;
  }

  /*
   * A joined row is ONE object: an outer frame, with nothing drawn inside it unless
   * `divided` asks for the internal lines. Two things have to go for that — the seam
   * VButtonGroup lays over each joint, and the items' own borders on the edges they
   * share.
   *
   * The seam is cancelled here rather than made conditional in VButtonGroup because
   * VPagination, the other consumer of that group, wants it. `content: none` does not
   * hide the bar, it stops the pseudo-element being generated at all, which is what
   * makes the group's two orientation rules moot: they only place its insets.
   *
   * The doubled qualification reaches (0,4,1) against VButtonGroup's (0,3,1). The two
   * sheets ship as separate files and the consumer's bundler decides their order, so a
   * cancel at equal specificity would be a coin toss.
   */
  .v-toggle.v-button-group:not([data-divided]) > .v-button::before {
    content: none;
  }

  /*
   * BOTH sides of every shared edge, never just one: the segments overlap by 1px, so a
   * neighbour's border sits in the very same pixel column. Clearing one side alone
   * leaves the other showing through wherever the item painted on top has no
   * background of its own, which is precisely the `ghost` and `outline` case.
   *
   * The COLOUR goes transparent rather than the border going away: every box keeps its
   * 1px on all four sides, so nothing in the row changes width and the corners stay
   * where VButtonGroup rounded them.
   *
   * At (0,6,0) these beat the frame rule below whatever order the two are read in, and
   * that is the whole arbitration: an internal edge is never part of the frame.
   */
  .v-toggle.v-button-group:not([data-divided])[data-orientation='horizontal']
    > .v-button:not(:first-child) {
    border-inline-start-color: transparent;
  }

  .v-toggle.v-button-group:not([data-divided])[data-orientation='horizontal']
    > .v-button:not(:last-child) {
    border-inline-end-color: transparent;
  }

  .v-toggle.v-button-group:not([data-divided])[data-orientation='vertical']
    > .v-button:not(:first-child) {
    border-block-start-color: transparent;
  }

  .v-toggle.v-button-group:not([data-divided])[data-orientation='vertical']
    > .v-button:not(:last-child) {
    border-block-end-color: transparent;
  }

  /*
   * The frame of an `outline` row, which only that row has: the colour its unselected
   * items already paint. They are drawn in the NEUTRAL tone, so this is what their
   * `--tone-border-soft` resolves to — naming that variable here instead would read the
   * SELECTED item's tone and tint one segment of the frame accent or red.
   *
   * It is a variable on the root rather than a value in the rule below because a
   * disabled segment greys, and VButton greys an outline border to a different token.
   * Nothing else declares it, so the two rules never arbitrate a border-color between
   * them.
   */
  .v-toggle[data-variant='outline'] {
    --toggle-frame: var(--vectis-color-border-strong);
  }

  .v-toggle[data-variant='outline'] > .v-toggle-item:is(:disabled, [aria-disabled='true']) {
    --toggle-frame: var(--vectis-color-border);
  }

  /*
   * `soft` and `ghost` leave VButton's border transparent, which in an outline row
   * opens a gap in the frame for the whole width of the selected segment. Restoring it
   * on all four sides is what keeps the frame closed wherever the selection sits, in
   * either orientation and in RTL; the shared edges are then cleared again by the
   * (0,6,0) rules above, so a middle segment keeps its top and bottom alone.
   */
  .v-toggle[data-variant='outline']
    > .v-toggle-item[aria-pressed='true']:is([data-variant='soft'], [data-variant='ghost']) {
    border-color: var(--toggle-frame);
  }
}
</style>
