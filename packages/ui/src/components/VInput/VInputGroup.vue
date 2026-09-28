<script setup lang="ts">
// @a11y @core
/**
 * Join functional field boxes rather than their label-and-hint wrappers. Context shares row
 * shape and disables descendants without changing their native controls.
 */
import { computed, provide, useId } from 'vue'

import VTypography from '../VTypography/VTypography.vue'

import { buttonGroupKey } from '../VButton/context'

import { useRootAttrs } from '../../composables/useRootAttrs'
import { useSlotNodes } from '../../composables/useSlotNodes'
import { isDev } from '../../utils/env'
import { joinIds } from '../../utils/ids'

import { inputGroupKey } from './context'

/** The heights a joined row offers, matching the field scale: 32, 40 or 48 pixels. */
export type InputGroupSize = 'sm' | 'md' | 'lg'

interface InputGroupProps {
  /**
   * The label above the row, rendered once for all of its segments and used as the
   * group's accessible name. A segment carrying one of its own is pushed out of line,
   * so name each of them with `aria-label` instead.
   */
  label?: string
  /**
   * A line of help under the row, tied to the group so assistive technology reads it
   * out along with the label.
   */
  hint?: string
  /**
   * The height every segment takes, whatever it names for itself: a row of controls of
   * two heights stops reading as one object. Left out, each segment keeps its own.
   */
  size?: InputGroupSize
  /** Takes 4px off the height of every segment, the way `compact` does on a lone field. */
  compact?: boolean
  /**
   * Makes the whole row unusable. It adds to what each segment says rather than
   * replacing it: a segment disabled on its own stays disabled under a row that says
   * nothing.
   */
  disabled?: boolean
}

defineOptions({ inheritAttrs: false })

// Every one of the three below defaults to `undefined`, the booleans included. It is
// `undefined`, and not `false`, that means "the group has no opinion", and that is what makes a
// bare VInputGroup change nothing about what it contains.
const props = withDefaults(defineProps<InputGroupProps>(), {
  label: undefined,
  hint: undefined,
  size: undefined,
  compact: undefined,
  disabled: undefined,
})

defineSlots<{
  /** The fields and buttons to join. Each one is a segment of the row. */
  default(): unknown
}>()

const { attrs, rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

const labelId = useId()
const hintId = useId()

// @a11y
// In the template comes after `v-bind="forwardedAttrs"` and would otherwise overwrite what the
// consumer wrote, so this computed has to hand their value back itself. An `aria-label` or an
// `aria-labelledby` written by the consumer names the group, and the VISIBLE label must not
// double it: `aria-labelledby` wins over `aria-label` in the accessible name computation, so
// emitting ours on top of a consumer's `aria-label` would silently cancel it.
const labelledBy = computed(() => {
  const own = attrs['aria-labelledby'] as string | undefined
  if (own !== undefined) return own
  // TRUTHINESS, the test the template renders the label with: an empty `label=""` renders
  // no element, and naming the group after an id nothing carries leaves it nameless.
  return props.label && attrs['aria-label'] === undefined ? labelId : undefined
})

// @a11y
// This aggregation is also why the component takes `inheritAttrs: false` despite having a
// single root: left to fallthrough, a consumer's `aria-describedby` would overwrite ours and
// the hint would stop being announced, with nothing to show for it.
const describedBy = computed(() =>
  joinIds(attrs['aria-describedby'] as string | undefined, !!props.hint && hintId),
)

/** The components whose `label` prop renders a real `<label>` above the field. */
const LABELLED_FIELDS = new Set([
  'VInput',
  'VTextarea',
  'VCombobox',
  'VDateInput',
  'VTimeInput',
  'VFileInput',
])

// A dev warning fires from a computed that the render consumes, so a slot whose content
// depends on a model would repeat it on every keystroke. One line per offender is enough to
// be found and fixed.
const warned = new Set<string>()

// @devwarn @ssr
// The read has to stay inside a computed, and the computed has to be consumed by the render,
// which `<Segments />` does. Called from a `watchEffect`, which runs before the render, Vue
// warns "Slot invoked outside of the render function" on any slot passed as a raw function;
// which is exactly what a unit test passes.
const slotNodes = useSlotNodes()
const segments = computed(() => {
  const nodes = slotNodes.value

  if (isDev) {
    for (const node of nodes) {
      const type = node.type as { name?: string; __name?: string } | string
      const name =
        typeof type === 'object' && type !== null ? (type.name ?? type.__name) : undefined
      if (name === undefined || !LABELLED_FIELDS.has(name)) continue

      for (const prop of ['label', 'hint'] as const) {
        if (node.props?.[prop] === undefined || warned.has(`${name}.${prop}`)) continue
        warned.add(`${name}.${prop}`)
        console.warn(
          `[VInputGroup] <${name}> carries its own \`${prop}\`. The group renders one for the whole row, and a segment carrying one of its own is pushed a line out of the row. Move it to VInputGroup and name the segment with \`aria-label\`.`,
        )
      }
    }
  }

  return nodes
})

// A functional component is the only way to render VNodes that have already been captured:
// `<component :is>` expects a component definition rather than a vnode. Returning an array
// produces a Fragment, so no DOM element is inserted and the sheet's `>` combinator holds.
const Segments = () => segments.value

// Getters, so the group's props stay reactive on the other side of the injection.
const rowContext = {
  get size() {
    return props.size
  },
  get compact() {
    return props.compact
  },
  get disabled() {
    return props.disabled
  },
}

provide(inputGroupKey, rowContext)

// The group provides VButtonGroup's context TOO, which makes a VButton or a VIconButton segment
// follow the row's height without a new line in VButton: the arbitration there is already
// `group?.x ?? props.x`, exactly this one. Variant, tone and elevation stay `undefined`; in a
// row of fields those are the button's own decisions.
provide(buttonGroupKey, rowContext)
</script>

<template>
  <div
    class="v-input-group"
    :class="rootClass"
    :style="rootStyle"
    role="group"
    v-bind="forwardedAttrs"
    :aria-labelledby="labelledBy"
    :aria-describedby="describedBy"
    :data-disabled="disabled ? '' : undefined"
  >
    <!-- A span and not a `<label for>`: a label points at ONE control, and this names a row
         of them. The group takes it through aria-labelledby, the ARIA pattern for a
         composed field. -->
    <VTypography v-if="label" :id="labelId" as="span" variant="label" class="v-input-group-label">
      {{ label }}
    </VTypography>

    <div class="v-input-group-row">
      <Segments />
    </div>

    <VTypography v-if="hint" :id="hintId" variant="caption" tone="muted" class="v-input-group-hint">
      {{ hint }}
    </VTypography>
  </div>
</template>

<style>
@layer vectis.components {
  /*
   * `.v-overlay` is in both guards and neither is optional. A panel must not pass for a
   * segment: VMenu renders its own as a SIBLING of its trigger.
   */

  .v-input-group {
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-1);
    width: 100%;
    font-family: var(--vectis-text-family);
  }

  /* The label and the hint are rendered by VTypography, which carries their type. The
     classes stay as hooks: a consumer overrides through them, and the disabled state
     below reaches them that way. */

  /*
   * Do not put v-control on the row: rederiving its inherited height would reset compact
   * dimensions already applied by the fields.
   */
  .v-input-group-row {
    display: flex;
    /* Same height whatever a segment measures. This changes nothing in an ordinary row,
       where everything is --control-height, and it is what stops a segment that GROWS from
       leaving its neighbours hanging at the top. */
    align-items: stretch;
  }

  /*
   * The logic is written this way round because it is the one that enumerates nothing: a bare
   * VButton, or one under two companions, has no `.v-input-field`, so it never stretches
   * without our having to name it. The proportions belong to the consumer, an inline `flex` on
   * the segment (style="flex: 0 0 9rem").
   */
  .v-input-group-row > :not(:where(.v-overlay)) {
    flex: none;
    min-inline-size: 0;
  }

  /*
   * The field has to be the segment's own, never one inside a panel it opens: a VPopover
   * segment holding a VInput in its panel is a button, and stays its natural width.
   */
  .v-input-group-row > :not(:where(.v-overlay)):has(.v-input-field:not(:where(.v-overlay *))) {
    flex: 1 1 0;
  }

  /*
   * Without this rule the paint order would depend on which components the row happens to hold.
   * A combobox's field is already `position: relative` (VInput's `.v-input-end-pinned`, which
   * lifts its chevron and its cross out of the flow) where a bare `.v-input-field` is not, and
   * a positioned element paints after every in-flow block whatever the document order.
   */
  .v-input-group-row > .v-button,
  .v-input-group-row
    > :not(:where(.v-overlay, .v-button-group))
    :is(.v-input-field, .v-button):not(:where(.v-overlay *, .v-button-group *)) {
    position: relative;
  }

  /*
   * VButton's base is `border: 1px solid transparent`, so a row of solid buttons has no line to
   * inherit and the seam is the only separation possible. A field carries a real opaque border,
   * and melting it with its neighbour's PRODUCES the line; a seam here would double it, and in
   * VButtonGroup's `--vectis-color-border` it would come out LIGHTER than the row's own
   * outline.
   */
  .v-input-group-row > .v-button:not(:first-child),
  .v-input-group-row
    > :not(:where(.v-overlay, .v-button-group)):has(
      :is(.v-input-field, .v-button):not(:where(.v-overlay *, .v-button-group *))
    ):not(:first-child) {
    margin-inline-start: -1px;
  }

  /* Only the two outer corners of the row stay rounded. Logical properties throughout, so a
     right-to-left row rounds its other end with no second rule, and the pull above is
     `margin-inline-start`. */
  .v-input-group-row > .v-button:not(:first-child),
  .v-input-group-row
    > :not(:where(.v-overlay, .v-button-group)):not(:first-child)
    :is(.v-input-field, .v-button):not(:where(.v-overlay *, .v-button-group *)) {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }

  /*
   * The last segment reads `:has(~ :not(.v-overlay))` and not `:not(:last-child)`, and that is
   * VMenu's doing: it renders its panel as a SIBLING of its trigger, so a menu closing a row
   * would leave its trigger without `:last-child` and the row would lose its outer corner with
   * nothing in the DOM to say why. Asking whether a real SEGMENT follows weighs exactly what
   * the test it replaces weighed.
   */
  .v-input-group-row > .v-button:has(~ :not(.v-overlay)),
  .v-input-group-row
    > :not(:where(.v-overlay, .v-button-group)):has(~ :not(.v-overlay))
    :is(.v-input-field, .v-button):not(:where(.v-overlay *, .v-button-group *)) {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }

  /*
   * This rule must stay ABOVE the focus rule. A field both invalid and focused matches the two,
   * they weigh the same (0,4,0), and nothing but the source order arbitrates between them; it
   * is the accent ring the reader has to see.
   */
  .v-input-group-row
    > :not(:where(.v-overlay, .v-button-group))
    .v-input-field:is(
      :has(.v-input-control:user-invalid),
      :has(.v-input-control[aria-invalid='true'])
    ) {
    z-index: 1;
  }

  /*
   * The field draws its focus as its own 1px border PLUS a 1px shadow just outside the border
   * box, and that shadow falls into the neighbour the pull brought over it: without this rule
   * the accent edge disappears from one side of every segment but the last. Two tests, because
   * the two kinds of segment mark focus differently.
   */
  .v-input-group-row
    > :not(:where(.v-overlay, .v-button-group))
    .v-input-field:has(.v-input-control:focus),
  .v-input-group-row > .v-button:focus-visible,
  .v-input-group-row
    > :not(:where(.v-overlay, .v-button-group))
    .v-button:focus-visible:not(:where(.v-overlay *, .v-button-group *)) {
    z-index: 2;
  }

  /* VInput's rule, at the same values: through the colour tokens, never through opacity. */
  .v-input-group[data-disabled] :is(.v-input-group-label, .v-input-group-hint) {
    color: var(--vectis-color-text-subtle);
  }
}
</style>
