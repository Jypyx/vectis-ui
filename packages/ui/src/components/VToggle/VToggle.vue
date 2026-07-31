<script setup lang="ts">
// @keyboard @core
/**
 * A row of buttons where one — or several — stay pressed: choosing a text alignment,
 * a view, a set of filters. A single v-model holds what is chosen.
 *
 * Every item is a VButton, the selected one filled and the others quiet, and by
 * default the whole row is joined into one segmented control. Nothing about hovering,
 * focusing or disabling is written here: it all comes from VButton.
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
   * Joins the items into one segmented control. Turning it off leaves them as separate
   * buttons with a gap between them.
   */
  attached?: boolean
  /** Whether the items run across the page or down it. */
  orientation?: ToggleOrientation
  /**
   * How the UNSELECTED items are drawn. A selected item is always filled, whatever
   * this says.
   */
  variant?: ToggleVariant
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
  attached: true,
  orientation: 'horizontal',
  variant: 'ghost',
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
       VButtonGroup already sets when the row is joined. -->
  <component
    :is="attached ? VButtonGroup : 'div'"
    v-bind="attached ? { orientation } : { 'data-orientation': orientation }"
    class="v-toggle"
    role="group"
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
}
</style>
