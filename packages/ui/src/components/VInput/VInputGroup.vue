<script setup lang="ts">
// @a11y @core
/**
 * Joins two or more form controls into a single object: a country code against a phone
 * number, a search field against its magnifier. The shared borders melt into one line and
 * only the two ends of the row stay rounded.
 *
 * It does for fields what VButtonGroup does for buttons, with one structural difference that
 * shapes the whole sheet. For a button, the component's root IS the bordered box; for a
 * field it never is — `.v-input` is a column holding a label, the field and a hint, and the
 * bordered box is `.v-input-field`, a descendant. So the PULL that melts two borders lands
 * on the segment the row lays out, and the PAINT lands on the box that carries them.
 *
 * The row owns the label and the hint, and that is the reason this component exists rather
 * than a CSS recipe: a label above one segment alone pushes its box a line out of the row.
 * The group renders one for all of them and names itself with it, each segment taking an
 * `aria-label` instead — the ARIA pattern for a composed field.
 *
 * `role="group"` on a div, not `<fieldset>`/`<legend>`, and not only for consistency with
 * VButtonGroup and VToggle. The accessibility tree is identical either way: browsers map
 * `<fieldset>` to `role="group"` and `<legend>` to its accessible name. The layout is not. A
 * `<fieldset>` carries `min-inline-size: min-content` in the UA sheet, so it refuses to
 * shrink below its content, which is exactly the right segments in `flex: 1 1 0` are asking
 * for; and a rendered `<legend>` is pulled out of flow and painted into the border area.
 * The native primitive is the right answer when it buys something, and here it costs two
 * resets to impose the invisible UA behaviour that rule is meant to spare us.
 *
 * Horizontal only, and probably for good. A column of fields is a form, and the fields of a
 * form carry a label each: melting their borders would remove the very separation a form
 * needs. VButtonGroup has a vertical because a column of buttons is a toolbar.
 *
 * The behavioural JS is one development warning. The row cannot draw itself out of a segment
 * that brought its own label, and the misalignment is silent, so it says so.
 */
import { computed, provide, useId, useSlots } from 'vue'

import VTypography from '../VTypography/VTypography.vue'

import { buttonGroupKey } from '../VButton/context'

import { useRootAttrs } from '../../composables/useRootAttrs'
import { isDev } from '../../utils/env'
import { flattenSlot } from '../../utils/vnode'

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

// TRAP — every one of the three below defaults to `undefined`, the booleans included. It is
// `undefined`, and not `false`, that means "the group has no opinion", and that is what makes
// a bare VInputGroup change nothing about what it contains. Writing `false` here would force
// every segment out of compact and out of disabled, whatever it had asked for itself.
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
const slots = useSlots()

const labelId = useId()
const hintId = useId()

// @a11y — the canonical cascade, resolved HERE rather than left to fallthrough: the binding
// in the template comes after `v-bind="forwardedAttrs"` and would otherwise overwrite what
// the consumer wrote, so this computed has to hand their value back itself.
//
// An `aria-label` or an `aria-labelledby` written by the consumer names the group, and the
// VISIBLE label must not double it: `aria-labelledby` wins over `aria-label` in the
// accessible name computation, so emitting ours on top of a consumer's `aria-label` would
// silently cancel it.
const labelledBy = computed(() => {
  const own = attrs['aria-labelledby'] as string | undefined
  if (own !== undefined) return own
  return props.label !== undefined && attrs['aria-label'] === undefined ? labelId : undefined
})

// @a11y — `aria-describedby` is a LIST, so the hint is ADDED to whatever the consumer
// pointed at rather than replacing it (the `useFieldIds` idiom). This aggregation is also
// why the component takes `inheritAttrs: false` despite having a single root: left to
// fallthrough, a consumer's `aria-describedby` would overwrite ours and the hint would stop
// being announced, with nothing to show for it.
const describedBy = computed(
  () =>
    [attrs['aria-describedby'] as string | undefined, props.hint !== undefined ? hintId : undefined]
      .filter(Boolean)
      .join(' ') || undefined,
)

/**
 * The components whose `label` prop renders a real `<label>` above the field. VIconButton is
 * deliberately absent: its `label` is an accessible name for a control with no text, so
 * warning about it would be wrong.
 */
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

// @devwarn @ssr — the segments are read from the slot's VNODES, never from a registry the
// children would fill at mount: a registry is empty on the server and full in the browser.
//
// TRAP — the read has to stay inside this computed, and the computed has to be consumed by
// the render, which is what `<Segments />` does. Called from a `watchEffect`, which runs
// BEFORE the render, Vue warns "Slot invoked outside of the render function" on any slot
// passed as a raw function — which is exactly what a unit test passes.
const segments = computed(() => {
  const nodes = flattenSlot(slots.default?.())

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

// The group provides VButtonGroup's context TOO, which is what makes a VButton or a
// VIconButton segment follow the row's height without a new line in VButton: the arbitration
// there is already `group?.x ?? props.x`, exactly this one. Variant, tone and elevation stay
// `undefined` — in a row of fields those are the button's own decisions.
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
   * A SEGMENT is a direct child of the row, and it is almost never the box carrying the
   * border. For a button the two coincide; for a field they never do — VInput's bordered box
   * is `.v-input-field`, one level under its root, two or three under those of VCombobox,
   * VDateInput, VTimeInput and VFileInput. Companions add more: VTooltip renders `.v-tooltip`
   * around its trigger, VPopover `.v-popover`, VBadge `.v-badge-host`, and they stack.
   *
   * So every rule is written for BOTH forms:
   *
   *   > .v-button<tests>          the button IS the segment
   *   > WRAPPER<tests> BOX        the box is somewhere inside it
   *
   *   WRAPPER = :not(:where(.v-overlay, .v-button-group))
   *   BOX     = :is(.v-input-field, .v-button):not(:where(.v-overlay *, .v-button-group *))
   *
   * The PULL — the negative margin that melts two borders into one line — belongs to the
   * SEGMENT, the box the row lays out. The PAINT — the corners, the stacking order —
   * belongs to the BOX, which carries them. Swapped, a field would be pulled by its field
   * box while its root stayed put, and the row would show a one-pixel gap.
   *
   * The tests weigh the same on both sides, so a pair is always ONE specificity.
   *
   * TRAP — `.v-overlay` is in both guards and neither is optional. A panel must not pass for
   * a segment: VMenu renders its own as a SIBLING of its trigger. And a panel's CONTENT must
   * never be painted: an open VDatePicker carries buttons, a combobox list carries options,
   * and they would all take a segment's flattened corners.
   *
   * TRAP — `.v-button-group` is in both guards, and the case easy to miss is VTimeInput: in
   * 12 hour form it renders an AM/PM VToggle beside its field, and a VToggle IS a
   * `.v-button-group`. Without `.v-button-group *` in BOX, those two buttons would be
   * painted as segments of THIS row, on top of the row VToggle draws for itself.
   *
   * No doubled class is needed anywhere here, which is worth stating so nobody adds one "for
   * safety". Our corners weigh (0,3,0) against the (0,1,0) that `.v-input-field` and
   * `.v-button` put on themselves; `position: relative` matches the (0,2,0) of
   * `.v-combobox .v-input-field` at the same value; nothing else sets a `z-index` on these
   * elements. VButtonGroup's own (0,4,0) corners are unreachable — a button cannot be both a
   * direct child of `.v-input-group-row` and inside a `.v-button-group`, the WRAPPER guard
   * excludes it.
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

  /* The row carries NEITHER `v-control` NOR `data-size`: nothing in this sheet reads a
     `--control-*` variable, and `.v-control` set a second time above a subtree that already
     has it re-derives `--control-height` from the base height, dropping the compact its
     fields had applied (styles/control-size.css). */
  .v-input-group-row {
    display: flex;
    /* Same height whatever a segment measures. This changes nothing in an ordinary row,
       where everything is --control-height, and it is what stops a segment that GROWS from
       leaving its neighbours hanging at the top. */
    align-items: stretch;
  }

  /* A segment holding a field takes its share of the row and accepts shrinking below its own
     content: the intrinsic width of a field is that of its placeholder, which would push a
     row of two fields out of its parent. Everything else keeps its natural width, a button
     being measured by its label.

     The logic is written this way round because it is the one that enumerates nothing: a
     bare VButton, or one under two companions, has no `.v-input-field`, so it never stretches
     without our having to name it. The proportions belong to the consumer, an inline `flex`
     on the segment (style="flex: 0 0 9rem").

     A panel is not a segment and takes no share. Closed it is `display: none`, open it is
     fixed, so it is not a flex item either way — the guard is there so the selector says
     what it does. */
  .v-input-group-row > :not(:where(.v-overlay)) {
    flex: none;
    min-inline-size: 0;
  }

  .v-input-group-row > :not(:where(.v-overlay)):has(.v-input-field) {
    flex: 1 1 0;
  }

  /* Every box is positioned, so they all paint in the SAME phase and in document order.

     TRAP — without this rule the paint order would depend on which components the row
     happens to hold. `.v-combobox .v-input-field` is already `position: relative` (its
     chevron and its cross are absolute) where a bare `.v-input-field` is not, and a
     positioned element paints AFTER every in-flow block whatever the document order. So a
     combobox would paint over a VInput placed BEFORE it, and the joint would show the wrong
     one of the two borders. The symptom is a hairline that changes colour when the template
     is reordered, with nothing in the sheet to explain it. */
  .v-input-group-row > .v-button,
  .v-input-group-row
    > :not(:where(.v-overlay, .v-button-group))
    :is(.v-input-field, .v-button):not(:where(.v-overlay *, .v-button-group *)) {
    position: relative;
  }

  /* The pull: each segment rides one pixel onto the one before it, so their two 1px borders
     collapse into a single line.

     That line is why this row needs no seam, where VButtonGroup does. VButton's base is
     `border: 1px solid transparent`, so a row of solid buttons has no line to inherit and the
     seam is the only separation possible. A field carries a real opaque border, and melting
     it with its neighbour's PRODUCES the line — a seam here would double it, and in
     VButtonGroup's `--vectis-color-border` it would come out LIGHTER than the row's own
     outline. Under a filled button it would draw a grey hair across the accent, where the
     button's background covering the edge is exactly what an attached search button should
     look like. */
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

  /* TRAP — the last segment reads `:has(~ :not(.v-overlay))` and not `:not(:last-child)`,
     and that is VMenu's doing: it renders its panel as a SIBLING of its trigger, so a menu
     closing a row would leave its trigger without `:last-child` and the row would lose its
     outer corner with nothing in the DOM to say why. Asking whether a real SEGMENT follows
     weighs exactly what the test it replaces weighed. The first segment needs none of this:
     a panel is rendered AFTER its trigger. */
  .v-input-group-row > .v-button:has(~ :not(.v-overlay)),
  .v-input-group-row
    > :not(:where(.v-overlay, .v-button-group)):has(~ :not(.v-overlay))
    :is(.v-input-field, .v-button):not(:where(.v-overlay *, .v-button-group *)) {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }

  /* A field in error rises above its neighbours. Its red border shares a one-pixel column
     with the neighbour's grey one, and the neighbour, painted after it, would repaint it:
     the invalid field would lose that whole edge and read as open on one side.

     TRAP — this rule must stay ABOVE the focus rule. A field both invalid and focused
     matches the two, they weigh the same (0,4,0), and nothing but the source order arbitrates
     between them; it is the accent ring the reader has to see. And it is the two VALUES, 1
     and 2, that settle the other case: an invalid field NEXT TO a focused one. */
  .v-input-group-row
    > :not(:where(.v-overlay, .v-button-group))
    .v-input-field:is(
      :has(.v-input-control:user-invalid),
      :has(.v-input-control[aria-invalid='true'])
    ) {
    z-index: 1;
  }

  /* A focused segment rises above everything. The field draws its focus as its own 1px
     border PLUS a 1px shadow just outside the border box, and that shadow falls into the
     neighbour the pull brought over it: without this rule the accent edge disappears from
     one side of every segment but the last.

     Two tests, because the two kinds of segment mark focus differently. A field lights up as
     soon as its control has focus, pointer included — VInput's own `:has(.v-input-control:focus)`,
     deliberately not `:focus-within`, so a clickable icon inside it takes its own ring —
     where a button only rises for `:focus-visible`, which is when it draws one.

     Hover and active are deliberately absent, as in VButtonGroup: the overlapping pixel IS
     the edge, and a segment rising under the pointer would rub it out for as long as it is
     there. */
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
