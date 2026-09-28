<script setup lang="ts">
// @keyboard @core
/**
 * Reuse segmented native buttons with aria-pressed. JavaScript synchronizes selection and
 * provides group keyboard navigation.
 */
import { computed, provide, ref } from 'vue'

import VButtonGroup from '../VButton/VButtonGroup.vue'
import { toggleKey } from './context'

import { toggleValue } from '../../utils/array'
import { arrowNavigate, navigableItems } from '../../utils/arrowNav'

import type { ItemValue } from '../../types'

/**
 * What identifies an item. It is the design system's own `ItemValue`, re-exported
 * under the family's name so a consumer typing a toggle need not reach for another module.
 */
export type ToggleValue = ItemValue
/**
 * What the v-model holds, which follows `multiple`: one value or nothing when a single
 * choice is allowed, and a list of them when several are.
 */
export type ToggleModelValue = ToggleValue | ToggleValue[] | null
/** How the items that are not selected are drawn. */
export type ToggleItemVariant = 'ghost' | 'outline'
/** How a selected item is drawn. */
export type ToggleSelectedVariant = 'solid' | 'soft' | 'ghost'
/** The colour of a selected item. */
export type ToggleTone = 'accent' | 'neutral' | 'danger'
/** The height of the items, from the scale every control shares. */
export type ToggleSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
/** Whether the items run across the page or down it. */
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
   * Stretches the row across the whole inline size of its parent, every item taking an equal
   * share of it, on the terms of VButtonGroup's own `fullWidth`.
   */
  fullWidth?: boolean
  /**
   * How the UNSELECTED items are drawn. It is named for the ITEMS because that is what it
   * paints: on VTabs and VDataTable `variant` names the decoration of the frame instead.
   */
  itemVariant?: ToggleItemVariant
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
   * What screen readers announce for the group, such as "Text alignment" or "Filters". It is
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
  fullWidth: false,
  itemVariant: 'ghost',
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
 * What is selected, and its shape follows `multiple`: a single value (or `null`, which is where
 * it starts) when one item may be chosen, and an array when several may. A null or scalar value
 * passed in `multiple` mode is read as an empty selection.
 */
const model = defineModel<ToggleModelValue>({ default: null })

function isSelected(value: ToggleValue): boolean {
  return props.multiple
    ? Array.isArray(model.value) && model.value.includes(value)
    : model.value === value
}

/*
 * With several choices allowed, the list is never changed in place: each write produces a new
 * one. That is what makes a consumer's own watchers and computed values notice; mutating the
 * existing list would leave some of them silent.
 */
function select(value: ToggleValue) {
  if (props.multiple) {
    const current = Array.isArray(model.value) ? model.value : []
    // `every` rather than a length of one: the removal takes out every copy of the value, so
    // a list holding it twice would otherwise be emptied past the guard.
    if (props.mandatory && current.length > 0 && current.every((v) => v === value)) return
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
  get itemVariant() {
    return props.itemVariant
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
 * Every visible item stays a stop in the tab order here; the VPagination model. The single-stop
 * treatment is reserved for the patterns that require it, a row of tabs or a radio group, and a
 * group of buttons is neither.
 */
function onKeydown(event: KeyboardEvent) {
  if (!(event.target as Element).matches('.v-toggle-item')) return
  const group = event.currentTarget as HTMLElement
  arrowNavigate(event, group, () => navigableItems(group, '.v-toggle-item:not(:disabled)'), {
    vertical: props.orientation === 'vertical',
  })
}

const groupRef = ref<InstanceType<typeof VButtonGroup> | null>(null)
const groupEl = computed(() => groupRef.value?.el ?? null)

// `focus` goes to the item that stands for the current choice, the one a keyboard user would
// expect to resume from.
defineExpose({
  /**
   * Moves the focus to the selected item (the first of them when several are), or to the
   * first item that can take it when nothing is selected.
   */
  focus: (options?: FocusOptions) => {
    const group = groupEl.value
    const enabled = '.v-toggle-item:not(:disabled, [aria-disabled="true"])'
    const item =
      group?.querySelector<HTMLElement>(`${enabled}[aria-pressed="true"]`) ??
      group?.querySelector<HTMLElement>(enabled)
    item?.focus(options)
  },
  /** The `role="group"` row, which is also where the consumer's attributes land. */
  el: groupEl,
})
</script>

<template>
  <!--
    Pass default group booleans as undefined so absent opinions do not force false over
    individual toggle items.
  -->
  <VButtonGroup
    ref="groupRef"
    class="v-toggle"
    :orientation="orientation"
    :detached="detached"
    :seamless="seamless"
    :full-width="fullWidth"
    :size="size"
    :compact="compact || undefined"
    :elevated="elevated || undefined"
    :disabled="disabled || undefined"
    :label="label"
    :data-item-variant="itemVariant"
    @keydown="onKeydown"
  >
    <slot />
  </VButtonGroup>
</template>

<style>
@layer vectis.components {
  /*
   * The `:not(:where(.v-overlay))` guard weighs nothing and keeps a panel from passing for an
   * item; the pair is one specificity, so the arbitration with the group's seamless rules holds
   * on both shapes. The frame of an `outline` row, which only that row has: the colour its
   * unselected items already paint.
   */
  .v-toggle[data-item-variant='outline'] {
    --toggle-frame: var(--vectis-color-border-strong);
  }

  .v-toggle[data-item-variant='outline'] > .v-toggle-item:is(:disabled, [aria-disabled='true']),
  .v-toggle[data-item-variant='outline']
    > :not(:where(.v-overlay, .v-button-group))
    .v-toggle-item:is(:disabled, [aria-disabled='true']):not(:where(.v-overlay *)) {
    --toggle-frame: var(--vectis-color-border);
  }

  /*
   * `soft` and `ghost` leave VButton's border transparent, which in an outline row opens a gap
   * in the frame for the whole width of the selected segment. Restoring it on all four sides is
   * what keeps the frame closed wherever the selection sits, in either orientation and in RTL.
   */
  .v-toggle[data-item-variant='outline']
    > .v-toggle-item[aria-pressed='true']:is([data-variant='soft'], [data-variant='ghost']),
  .v-toggle[data-item-variant='outline']
    > :not(:where(.v-overlay, .v-button-group))
    .v-toggle-item[aria-pressed='true']:is([data-variant='soft'], [data-variant='ghost']):not(
      :where(.v-overlay *)
    ) {
    border-color: var(--toggle-frame);
  }

  /*
   * The class is repeated to reach (0,6,0). The variant, hover and active rules reach (0,5,0),
   * and with the forcing turned off any of them that still won would paint its tone over the
   * selection, with HighlightText on top of it.
   */
  @media (forced-colors: active) {
    .v-toggle-item.v-toggle-item.v-toggle-item.v-toggle-item[aria-pressed='true']:not(:disabled) {
      forced-color-adjust: none;
      background-color: Highlight;
      color: HighlightText;
      border-color: Highlight;
      outline-color: CanvasText;
    }
  }
}
</style>
