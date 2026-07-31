<script setup lang="ts">
// @core
/**
 * A complete text field: a label above, a hint below, icons inside — clickable ones
 * included — a character counter, a clear button and a loading state, all arranged
 * around a real `<input>`.
 *
 * The component is a wrapper around that input, so the attributes it is given are
 * split: `class` and `style` stay on the outer element, where a consumer expects to
 * style the field, and everything else is forwarded to the input, where `name`,
 * `required` and the aria-* actually do something.
 *
 * Validation stays the browser's. The field turns red through `:user-invalid`, which
 * only reacts once the reader has left it, and even the soft limit is reported by
 * marking the input invalid rather than by emitting an event of our own — so a
 * consumer's `<form>` sees exactly what it would see with a bare input.
 *
 * The behavioural JavaScript is limited to the v-model and to the clear button,
 * which has to move focus back to the field: it disappears the moment it is clicked,
 * and focus would otherwise fall back to the page.
 */
import { computed, ref } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconName, iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import VSpinner from '../VSpinner/VSpinner.vue'
import VTypography from '../VTypography/VTypography.vue'

import { useFieldIds } from '../../composables/useFieldIds'
import { useIconClickHandlers } from '../../composables/useIconClickHandlers'
import { useRootAttrs } from '../../composables/useRootAttrs'
import { useTextLimit } from '../../composables/useTextLimit'
import { useMessages } from '../../i18n/state'

interface InputProps {
  /** The height of the field: 32, 40 or 48 pixels. */
  size?: 'sm' | 'md' | 'lg'
  /** Takes 4px off the height, leaving the padding, the text and the icons as they are. */
  compact?: boolean
  /**
   * The native type of the input, which is also what tells a phone which keyboard to
   * offer — a numeric pad for `number`, an @ key for `email`.
   */
  type?: 'text' | 'email' | 'number' | 'password' | 'search' | 'tel' | 'url'
  /**
   * Marks the field as invalid whatever the browser thinks. This is the route for a
   * rule only the server can check; anything the browser can validate on its own
   * already colours the field without this prop.
   */
  invalid?: boolean
  /** Makes the field unusable, greyed out through the colour tokens. */
  disabled?: boolean
  /**
   * Shows the value without allowing it to be changed. The field can still be
   * focused and copied from, and it hides the clear button — unless `clearVisible`
   * answers that question explicitly.
   */
  readonly?: boolean
  /** The label above the field, tied to it so that clicking it focuses the field. */
  label?: string
  /**
   * A line of help under the field. It is tied to the input for assistive
   * technology, so it is read out along with the label.
   */
  hint?: string
  /**
   * An icon inside the field, at the start. It is decorative by default and becomes
   * a real button as soon as a `@click:icon-start` listener is attached — in which
   * case it needs `iconStartLabel`. The `#start` slot replaces it.
   */
  iconStart?: IconSource
  /**
   * The same at the end of the field. The `#end` slot replaces it, and the loading
   * spinner takes its place while it turns.
   */
  iconEnd?: IconSource
  /** What the start icon does, in words, once it is clickable. */
  iconStartLabel?: string
  /** What the end icon does, in words, once it is clickable. */
  iconEndLabel?: string
  /** Shows a spinner at the end of the field, in place of the end icon or slot. */
  loading?: boolean
  /**
   * What screen readers announce while the spinner turns. It falls back to the
   * design system dictionary.
   */
  loadingLabel?: string
  /**
   * Offers a cross that empties the field. It appears when there is something to
   * clear and the field can be edited.
   */
  clearable?: boolean
  /**
   * Decides whether the cross is shown, instead of letting the field work it out
   * from its own content — a read-only field included.
   *
   * It exists for the components built on top of this one, where what there is to
   * clear is not the text: VCombobox holds its selection as chips beside the field,
   * and a read-only date or time picker changes its value through a panel rather
   * than by typing.
   */
  clearVisible?: boolean
  /** What the clear button does, in words. It falls back to the design system dictionary. */
  clearLabel?: string
  /**
   * The maximum number of characters. By default this is the browser's own limit,
   * which simply refuses anything beyond it.
   */
  maxlength?: number
  /**
   * Turns that limit into a soft one: the reader may type past it, and the field
   * goes into error instead of silently refusing the keystrokes. It is reported
   * through the native validity, so a form cannot be submitted over the limit.
   */
  softLimit?: boolean
  /**
   * Shows how much has been typed, at the end of the field: "12/80" against a limit,
   * or just "12" without one.
   */
  counter?: boolean
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<InputProps>(), {
  size: 'md',
  compact: false,
  type: 'text',
  invalid: false,
  disabled: false,
  readonly: false,
  label: undefined,
  hint: undefined,
  iconStart: undefined,
  iconEnd: undefined,
  iconStartLabel: undefined,
  iconEndLabel: undefined,
  loading: false,
  loadingLabel: undefined,
  clearable: false,
  clearVisible: undefined,
  clearLabel: undefined,
  maxlength: undefined,
  softLimit: false,
  counter: false,
})

const emit = defineEmits<{
  /** The start icon was clicked. Attaching this listener is what makes it a button. */
  'click:icon-start': [event: MouseEvent]
  /** The end icon was clicked. Attaching this listener is what makes it a button. */
  'click:icon-end': [event: MouseEvent]
  /** The clear button was pressed. The field has already been emptied. */
  clear: []
}>()

defineSlots<{
  /** Content at the start of the field, which replaces `iconStart`. */
  start?(): unknown
  /**
   * Content at the end of the field, which replaces `iconEnd`. It is hidden while
   * the field is loading, the spinner taking that place.
   */
  end?(): unknown
}>()

/**
 * The value, typed as text OR a number rather than text alone. On an
 * `<input type="number">` Vue converts the value to a number by itself, so a
 * string-only model would hand a number back to a consumer who passed a string in,
 * and Vue would report an invalid prop.
 */
const model = defineModel<string | number>({ default: '' })

/**
 * The value seen as text. Every measurement of its length — the counter, the soft
 * limit, whether the clear cross has anything to clear — goes through this, since a
 * number has no length of its own.
 */
const modelText = computed(() => String(model.value ?? ''))

const { attrs, rootClass, rootStyle, forwardedAttrs: restAttrs } = useRootAttrs()

// The prop keeps priority; what it falls back to is the dictionary, so the default
// wording follows the language the design system is set to.
const m = useMessages()
const resolvedLoadingLabel = computed(() => props.loadingLabel ?? m.value.common.loading)
const resolvedClearLabel = computed(() => props.clearLabel ?? m.value.common.clear)

const { fieldId, hintId, describedBy } = useFieldIds(attrs, () => !!props.hint)

const { hasIconStartHandler, hasIconEndHandler } = useIconClickHandlers({
  name: 'VInput',
  iconStartLabel: props.iconStartLabel,
  iconEndLabel: props.iconEndLabel,
})

const controlEl = ref<HTMLInputElement | null>(null)

const showClear = computed(() => {
  if (!props.clearable || props.disabled) return false
  // When `clearVisible` is supplied it is the consumer's EXPLICIT answer to "is
  // there anything to clear?", and it holds even on a read-only field: the value of
  // a read-only date or time picker changes through its panel rather than by typing.
  // Left out, the field answers for itself — it has text, and it can be edited.
  return props.clearVisible ?? (!props.readonly && modelText.value.length > 0)
})

// @a11y @core — moving the focus back is the accessibility half of this handler.
// The cross vanishes the instant it empties the field, so without that call focus
// falls back to the page body and a keyboard user loses their place in the form.
function onClear() {
  model.value = ''
  emit('clear')
  controlEl.value?.focus()
}

// The counter and the soft limit both measure `modelText` rather than the model
// itself, a number having no length.
const { counterText, over } = useTextLimit({
  el: controlEl,
  text: () => modelText.value,
  maxlength: () => props.maxlength,
  softLimit: () => props.softLimit,
})

// The real input is buried inside the wrapper, out of reach of whoever renders this
// component. These three exposed members are how the components built on top of it
// reach it — VCombobox refocuses the field and selects its text this way.
defineExpose({
  focus: (options?: FocusOptions) => controlEl.value?.focus(options),
  select: () => controlEl.value?.select(),
  el: controlEl,
})
</script>

<template>
  <div
    class="v-input v-control"
    :class="rootClass"
    :style="rootStyle"
    :data-size="size"
    :data-compact="compact ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
  >
    <VTypography v-if="label" as="label" variant="label" class="v-input-label" :for="fieldId">
      {{ label }}
    </VTypography>

    <div class="v-input-field">
      <slot name="start">
        <button
          v-if="iconStart && hasIconStartHandler"
          type="button"
          class="v-input-action"
          :aria-label="iconStartLabel ?? iconName(iconStart)"
          :disabled="disabled"
          @click="emit('click:icon-start', $event)"
        >
          <VIcon v-bind="iconProps(iconStart)" />
        </button>
        <VIcon v-else-if="iconStart" v-bind="iconProps(iconStart)" />
      </slot>

      <input
        v-bind="restAttrs"
        :id="fieldId"
        ref="controlEl"
        v-model="model"
        class="v-input-control"
        :type="type"
        :maxlength="softLimit ? undefined : maxlength"
        :disabled="disabled"
        :readonly="readonly || undefined"
        :aria-invalid="invalid || undefined"
        :aria-describedby="describedBy"
      />

      <span v-if="counter" class="v-input-counter" :data-over="over ? '' : undefined">
        {{ counterText }}
      </span>

      <button
        v-if="showClear"
        type="button"
        class="v-input-action v-input-clear"
        :aria-label="resolvedClearLabel"
        @click="onClear"
      >
        <VIcon name="close" />
      </button>

      <VSpinner v-if="loading" :label="resolvedLoadingLabel" />
      <slot v-else name="end">
        <button
          v-if="iconEnd && hasIconEndHandler"
          type="button"
          class="v-input-action"
          :aria-label="iconEndLabel ?? iconName(iconEnd)"
          :disabled="disabled"
          @click="emit('click:icon-end', $event)"
        >
          <VIcon v-bind="iconProps(iconEnd)" />
        </button>
        <VIcon v-else-if="iconEnd" v-bind="iconProps(iconEnd)" />
      </slot>
    </div>

    <VTypography v-if="hint" :id="hintId" variant="caption" tone="muted" class="v-input-hint">
      {{ hint }}
    </VTypography>
  </div>
</template>

<style>
@layer vectis.components {
  .v-input {
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-1);
    width: 100%;
    font-family: var(--vectis-text-family);
  }

  /* The label and the hint are rendered by VTypography, which carries their type. The
     .v-input-label and .v-input-hint classes remain as hooks: a consumer overrides
     through them, and the disabled state below reaches them that way. */

  /* This is the box that carries the border, the background and the focus ring.
     `--field-border-color` is the single source of truth for its colour, and the
     hover, error and disabled states do nothing but redefine it.

     Nothing here restates the size scale: the `--control-*` variables are inherited
     from the v-control root (styles/control-size.css), the icon context included. */
  .v-input-field {
    --field-border-color: var(--vectis-color-border-strong);

    display: flex;
    align-items: center;
    gap: var(--control-gap);
    height: var(--control-height);
    padding-inline: var(--control-padding-inline-field);
    background: var(--vectis-color-surface);
    color: var(--vectis-color-text);
    border: 1px solid var(--field-border-color);
    border-radius: var(--vectis-radius-interactive);
    font-size: var(--control-font-size);
    transition:
      border-color var(--vectis-duration-fast) var(--vectis-ease-default),
      background-color var(--vectis-duration-fast) var(--vectis-ease-default),
      box-shadow var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-input-control {
    flex: 1;
    min-width: 0;
    height: 100%;
    padding: 0;
    border: none;
    background: none;
    color: inherit;
    font: inherit;
    outline: none; /* the focus ring is drawn by the field around it, not here */
  }

  .v-input-control::placeholder {
    color: var(--vectis-color-text-subtle);
  }

  /* The browsers' own in-field controls are removed, because the design system draws
     its own: WebKit's search cross would sit beside the `clearable` one, the number
     spinners and Edge's password-reveal eye would clash with the icons. */
  .v-input-control::-webkit-search-cancel-button,
  .v-input-control::-webkit-search-decoration,
  .v-input-control::-webkit-search-results-button,
  .v-input-control::-webkit-search-results-decoration,
  .v-input-control::-webkit-inner-spin-button,
  .v-input-control::-webkit-outer-spin-button {
    -webkit-appearance: none;
    appearance: none;
  }

  .v-input-control[type='number'] {
    appearance: textfield;
  }

  .v-input-control::-ms-reveal {
    display: none;
  }

  /* The yellow autofill background is painted by the browser on the input itself,
     inside our field. Its colour cannot be changed, but matching the field's radius
     at least stops it from showing square corners inside a rounded box. */
  .v-input-control:-webkit-autofill {
    border-radius: var(--vectis-radius-interactive);
  }

  /* A read-only field sinks slightly into the page but keeps its text at full
     strength — the value is there to be read — and still shows the accent focus ring.
     The state is read from [data-readonly] and never from `:read-only`, which the
     browser also matches on a disabled field.

     TRAP — this block must stay FIRST in the sequence of states: read-only, then
     hover, focus, invalid and disabled. Every one of these selectors weighs (0,3,0),
     `:has()` taking the specificity of what it contains, so nothing but the source
     order arbitrates between them. Moved further down, this rule would repaint the
     error border and the accent focus ring grey, with no error anywhere. What
     belongs to a read-only field is its BASE colour alone. */
  .v-input[data-readonly] .v-input-field {
    --field-border-color: var(--vectis-color-border);

    background: var(--vectis-color-surface-sunken);
  }

  .v-input-field:hover:not(:has(.v-input-control:focus)):not(
      :has(
        .v-input-control:disabled,
        .v-input-control:user-invalid,
        .v-input-control[aria-invalid='true']
      )
    ) {
    --field-border-color: color-mix(
      in oklab,
      var(--vectis-color-border-strong),
      var(--vectis-color-text) 15%
    );
  }

  /* The focused field appears to have a two-pixel border: it is really its own 1px
     border plus a 1px shadow of the same colour just outside it, which costs no
     layout and therefore makes nothing jump.

     The selector watches the CONTROL's focus and not `:focus-within`, so that when
     one of the field's own buttons — the cross, a clickable icon — takes keyboard
     focus, only that button's outline lights up: two indicators at once would be
     unreadable. And it is `:focus` rather than `:focus-visible`, because a text field
     shows its focus even when it was reached with the mouse.

     The transparent outline is the safety net for Windows forced colours, which drop
     box-shadows entirely; an outline survives and keeps the field marked. */
  .v-input-field:has(.v-input-control:focus) {
    --field-border-color: var(--vectis-color-accent);

    box-shadow: 0 0 0 1px var(--field-border-color);
    outline: var(--vectis-focus-ring-width) solid transparent;
  }

  /* The invalid state, from the browser's own verdict first and from the `invalid`
     prop second. Only the colour variable is changed, which is why the border AND
     the focus ring both turn red without either being restated. */
  .v-input-field:has(.v-input-control:user-invalid),
  .v-input-field:has(.v-input-control[aria-invalid='true']) {
    --field-border-color: var(--vectis-color-danger);
  }

  /* The counter keeps its own local styling rather than going through VTypography:
     figures of equal width, so the number does not shift as it counts, and a colour
     that marks the overflow — neither of which is a typographic role. */
  .v-input-counter {
    flex: none;
    font-size: var(--vectis-text-caption-size);
    color: var(--vectis-color-text-muted);
    font-variant-numeric: tabular-nums;
  }

  .v-input-counter[data-over] {
    color: var(--vectis-color-danger-text);
  }

  /* A decorative icon is drawn in a muted grey, so it stays quieter than the text
     being typed beside it. */
  .v-input-field > .v-icon {
    color: var(--vectis-color-text-muted);
  }

  .v-input-field > .v-spinner {
    font-size: var(--vectis-icon-size);
  }

  /* The field's own buttons — the clear cross, a clickable icon — go from muted grey
     to full strength on hover, and take VButton's radius so their focus ring has the
     same rounded corners as everything else.

     The negative margin is DERIVED and never written as a number: it is exactly half
     the difference between the icon and the wider box holding it. Subtracting it
     cancels that inset, so the glyph lands precisely where a decorative icon would
     have — against the field's padding, one --control-gap from its neighbour. */
  .v-input-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--control-action-size);
    height: var(--control-action-size);
    margin-inline: calc((var(--vectis-icon-size) - var(--control-action-size)) / 2);
    padding: 0;
    border: none;
    background: transparent;
    color: var(--vectis-color-text-muted);
    border-radius: var(--vectis-radius-interactive);
    cursor: pointer;
    flex: none;
    transition: color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-input-action:hover:not(:disabled) {
    color: var(--vectis-color-text);
  }

  .v-input-action:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: calc(var(--vectis-focus-ring-offset) * -1);
  }

  /* A disabled field greys out through the colour tokens, the same ones VCheckbox and
     VRadio use, and never through opacity. It comes LAST in the sequence of states,
     which at equal specificity is what makes it win over all of them, the error
     included: a disabled field is not submitted, so it has nothing to report.

     The text here is `text-muted` and not the `text-subtle` used by the label and the
     hint below, because those sit on the page surface where this sits on
     `surface-muted` — against which subtle falls to a 4.4:1 contrast. The control
     itself is exempt from that rule, being natively disabled, but the icons the field
     CONTAINS are not, and they inherit this colour. */
  .v-input[data-disabled] .v-input-field {
    --field-border-color: var(--vectis-color-border);

    background: var(--vectis-color-surface-muted);
    color: var(--vectis-color-text-muted);
    cursor: not-allowed;
  }

  .v-input[data-disabled] .v-input-label,
  .v-input[data-disabled] .v-input-hint,
  .v-input[data-disabled] .v-input-counter {
    color: var(--vectis-color-text-subtle);
  }

  .v-input[data-disabled] .v-input-action,
  .v-input[data-disabled] .v-input-field > .v-icon {
    color: inherit;
    cursor: not-allowed;
  }

  .v-input-control:disabled {
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    .v-input-field,
    .v-input-action {
      transition: none;
    }
  }
}
</style>
