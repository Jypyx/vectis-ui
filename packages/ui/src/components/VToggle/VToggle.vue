<script setup lang="ts">
/**
 * A group of selectable buttons driven by a single v-model. Composed: every item
 * is a `VButton` (the selected one `solid`, the others `ghost`/`outline`) and
 * `attached` (the default) joins the whole thing in a VButtonGroup as a segmented
 * control. No state rule is redefined here — hover, focus, disabled and
 * `prefers-reduced-motion` all come from VButton.
 *
 * The behavioural JS is limited to the click → v-model bridge (`select`: the
 * single/multiple toggle plus the `mandatory` guard, not expressible in HTML/CSS)
 * and to keyboard navigation (arrows / Home / End), justified at the head of
 * `onKeydown`.
 */
import { provide } from 'vue'

import VButtonGroup from '../VButton/VButtonGroup.vue'
import { toggleKey } from './context'

import { toggleValue } from '../../utils/array'
import { arrowNavigate, navigableItems } from '../../utils/arrowNav'

import { useAriaLabel } from '../../composables/useAriaLabel'

export type ToggleValue = string | number
/** The v-model's type follows `multiple`: a lone value (or null) in single mode, an array in multiple. */
export type ToggleModelValue = ToggleValue | ToggleValue[] | null
export type ToggleVariant = 'ghost' | 'outline'
export type ToggleTone = 'accent' | 'neutral' | 'danger'
export type ToggleSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type ToggleOrientation = 'horizontal' | 'vertical'

interface ToggleProps {
  /** Multiple selection: the v-model becomes an array of values. */
  multiple?: boolean
  /**
   * The last selected value can never be deselected. Purely a guard against
   * deselection: it forces NO initial selection.
   */
  mandatory?: boolean
  /** Joins the items into a segmented control (VButtonGroup). `false`: separate buttons. */
  attached?: boolean
  orientation?: ToggleOrientation
  /** Variant of the NON-selected items. The selected item is always `solid`. */
  variant?: ToggleVariant
  /** Tone of the selected item; the unselected ones stay neutral. */
  tone?: ToggleTone
  size?: ToggleSize
  /** Height reduced by 4px, propagated to every item. */
  compact?: boolean
  /** Disables the whole group. */
  disabled?: boolean
  /** Fills the selected item's icon (the Material Symbols FILL axis). */
  selectedIconFilled?: boolean
  /** Accessible name of the group. Strongly recommended (no generic default makes sense). */
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
  /** The <VToggleItem> elements. */
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
 * Click → v-model bridge. In multiple mode the array is NEVER mutated in place: a
 * new reference on every write (the reactivity of consumer v-models); a null or
 * scalar v-model inherited from single mode is normalized to []. No `disabled`
 * guard: a <button disabled> emits no click.
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

/*
 * Keyboard navigation (shared implementation: `utils/arrowNav`). No roving
 * tabindex — every visible item is a tab stop (the VPagination model; roving is
 * reserved for tablist/radiogroup composites). Disabled items are
 * <button disabled>, excluded by the selector.
 *
 * `event.currentTarget` rather than a template ref: on `<component :is>`, a ref
 * would return sometimes an element (div), sometimes an instance (VButtonGroup).
 */
function onKeydown(event: KeyboardEvent) {
  const group = event.currentTarget as HTMLElement
  arrowNavigate(event, group, navigableItems(group, '.v-toggle-item:not(:disabled)'), {
    vertical: props.orientation === 'vertical',
  })
}
</script>

<template>
  <!-- attached: VButtonGroup merges the borders. It targets its DIRECT
       `.v-button` children — VToggleItem has the VButton as its root, never an
       intervening wrapper. `orientation`/`data-orientation` are mirrored through a
       SINGLE key (a binding, even `undefined`, would pass through by fallthrough
       and overwrite the data-orientation VButtonGroup sets itself): VButtonGroup
       gets its prop, the detached div gets the attribute directly. `role="group"`
       is required for the div branch and coincides with VButtonGroup's when
       attached. -->
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
   * Detached mode only. `:not(.v-button-group)`: when attached, the root carries
   * BOTH classes — without this guard, `align-items: center` would conflict by
   * order with VButtonGroup's `stretch` (same specificity). It also makes the
   * export order non-constraining.
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
