<script setup lang="ts">
// @keyboard @core
/**
 * A row of buttons where one — or several — stay pressed: choosing a text alignment,
 * a view, a set of filters. A single v-model holds what is chosen.
 *
 * Every item is a VButton, the selected one drawn in the group's tone and the others
 * quiet. The row itself is a VButtonGroup, which is where the drawing lives: joining the
 * items or leaving them apart, the lines between them, the shared size and the shared
 * elevation are that component's, and the props for them are handed straight over.
 * Nothing about hovering, focusing or disabling is written here either: it all comes
 * from VButton.
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
   * Takes the lines out from between the joined items, so the row reads as one frame
   * rather than as segments. It has no effect under `detached`, where the items are
   * separate buttons already.
   */
  seamless?: boolean
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
  /** Raises the row off the page, on the terms of VButtonGroup's own `elevated`. */
  elevated?: boolean
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
  seamless: false,
  orientation: 'horizontal',
  variant: 'ghost',
  selectedVariant: 'solid',
  tone: 'accent',
  size: 'md',
  compact: false,
  elevated: false,
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
 * The container is read from the event rather than kept as a reference: the root is a
 * VButtonGroup, so a template ref would hand back its component instance rather than the
 * element the items are navigated inside.
 */
function onKeydown(event: KeyboardEvent) {
  const group = event.currentTarget as HTMLElement
  arrowNavigate(event, group, navigableItems(group, '.v-toggle-item:not(:disabled)'), {
    vertical: props.orientation === 'vertical',
  })
}
</script>

<template>
  <!-- The row is a VButtonGroup, which merges the borders of its DIRECT button children
       — which is why an item renders the button as its own root, with no wrapper in
       between. It brings the role and the orientation attribute with it, and of the props
       handed to it here it forwards the last four to the buttons itself.

       `variant` is deliberately NOT among them, and neither is the tone: the group wins
       over a button that names its own variant, which would erase the one the selected
       item carries. Both stay with the items, through the context.

       `data-variant` is a plain attribute, and it is what tells the sheet an outline row
       from a ghost one — something the items cannot say for themselves, since the
       selected one carries its own variant rather than the row's. -->
  <VButtonGroup
    class="v-toggle"
    :orientation="orientation"
    :detached="detached"
    :seamless="seamless"
    :size="size"
    :compact="compact"
    :elevated="elevated"
    :disabled="disabled"
    :data-variant="variant"
    :aria-label="ariaLabel"
    @keydown="onKeydown"
  >
    <slot />
  </VButtonGroup>
</template>

<style>
@layer vectis.components {
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
   * either orientation and in RTL. It is not conditioned on `seamless`, and deliberately
   * so: the border is transparent whether the internal lines are drawn or not. Seamless,
   * the shared edges are cleared again by VButtonGroup's own (0,6,0) rules, which is why
   * they are written at that weight — a middle segment then keeps its top and bottom
   * alone.
   */
  .v-toggle[data-variant='outline']
    > .v-toggle-item[aria-pressed='true']:is([data-variant='soft'], [data-variant='ghost']) {
    border-color: var(--toggle-frame);
  }
}
</style>
