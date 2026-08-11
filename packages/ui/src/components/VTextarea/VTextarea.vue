<script setup lang="ts">
// @core
/**
 * A field for text running over several lines, with the same label, hint, icons,
 * counter, loading state and clear button as VInput, arranged around a real
 * `<textarea>`.
 *
 * Two things differ from its single-line counterpart. The field can grow with what
 * is typed into it, and that is pure CSS — a browser without `field-sizing` simply
 * keeps a fixed height with its usual scrollbar. And the counter is placed UNDER the
 * field rather than inside it, where several lines of text would run into it.
 *
 * As in VInput, the attributes it is given are split — `class` and `style` stay
 * outside, the rest goes to the textarea — validation stays the browser's, and the
 * only behavioural JavaScript is the v-model and the clear button, which has to hand
 * focus back to the field it just emptied.
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

interface TextareaProps {
  /** The size of the field, which sets its minimum height and its type scale. */
  size?: 'sm' | 'md' | 'lg'
  /** Takes 4px off the minimum height, leaving the padding, the text and the icons alone. */
  compact?: boolean
  /**
   * Lets the field grow as the text is typed, instead of scrolling inside a fixed
   * height. It is pure CSS; where the browser does not support it, the field simply
   * behaves like an ordinary textarea.
   */
  autoGrow?: boolean
  /**
   * Marks the field as invalid whatever the browser thinks — the route for a rule
   * only the server can check.
   */
  invalid?: boolean
  /** Makes the field unusable, greyed out through the colour tokens. */
  disabled?: boolean
  /**
   * Shows the text without allowing it to be changed. The field can still be focused
   * and copied from, and the clear button is hidden.
   */
  readonly?: boolean
  /** The label above the field, tied to it so that clicking it focuses the field. */
  label?: string
  /**
   * A line of help under the field, tied to the textarea for assistive technology so
   * that it is read out along with the label.
   */
  hint?: string
  /**
   * An icon inside the field, at the start. It is decorative by default and becomes a
   * real button as soon as a `@click:icon-start` listener is attached — in which case
   * it needs `iconStartLabel`. The `#start` slot replaces it.
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
   * What screen readers announce while the spinner turns. It falls back to the design
   * system dictionary.
   */
  loadingLabel?: string
  /**
   * Offers a cross that empties the field. It appears when there is something to
   * clear and the field can be edited.
   */
  clearable?: boolean
  /** What the clear button does, in words. It falls back to the design system dictionary. */
  clearLabel?: string
  /**
   * The maximum number of characters. By default this is the browser's own limit,
   * which simply refuses anything beyond it.
   */
  maxlength?: number
  /**
   * Turns that limit into a soft one: the reader may type past it, and the field goes
   * into error instead of silently refusing the keystrokes. It is reported through
   * the native validity, so a form cannot be submitted over the limit.
   */
  softLimit?: boolean
  /**
   * Shows how much has been typed, under the field: "12/80" against a limit, or just
   * "12" without one.
   */
  counter?: boolean
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<TextareaProps>(), {
  size: 'md',
  compact: false,
  autoGrow: false,
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
   * Content at the end of the field, which replaces `iconEnd`. It is hidden while the
   * field is loading, the spinner taking that place.
   */
  end?(): unknown
}>()

const model = defineModel<string>({ default: '' })

// `class` and `style` stay on the wrapper, where a consumer expects to style the
// field; every other attribute goes to the textarea, where it does something.
const { attrs, rootClass, rootStyle, forwardedAttrs: restAttrs } = useRootAttrs()

// The prop keeps priority; what it falls back to is the dictionary, so the default
// wording follows the language the design system is set to.
const m = useMessages()
const resolvedLoadingLabel = computed(() => props.loadingLabel ?? m.value.common.loading)
const resolvedClearLabel = computed(() => props.clearLabel ?? m.value.common.clear)

const { fieldId, hintId, describedBy } = useFieldIds(attrs, () => !!props.hint)

const { hasIconStartHandler, hasIconEndHandler } = useIconClickHandlers({
  name: 'VTextarea',
  iconStartLabel: props.iconStartLabel,
  iconEndLabel: props.iconEndLabel,
})

const controlEl = ref<HTMLTextAreaElement | null>(null)

const showClear = computed(
  () => props.clearable && model.value.length > 0 && !props.disabled && !props.readonly,
)

// @a11y @core — moving the focus back is the accessibility half of this handler.
// The cross vanishes the instant it empties the field, so without that call focus
// falls back to the page body and a keyboard user loses their place in the form.
function onClear() {
  model.value = ''
  emit('clear')
  controlEl.value?.focus()
}

const { counterText, over } = useTextLimit({
  el: controlEl,
  text: () => model.value,
  maxlength: () => props.maxlength,
  softLimit: () => props.softLimit,
})
</script>

<template>
  <div
    class="v-textarea v-control"
    :class="rootClass"
    :style="rootStyle"
    :data-size="size"
    :data-compact="compact ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
  >
    <VTypography v-if="label" as="label" variant="label" class="v-textarea-label" :for="fieldId">
      {{ label }}
    </VTypography>

    <div class="v-textarea-field" :data-auto-grow="autoGrow ? '' : undefined">
      <slot name="start">
        <button
          v-if="iconStart && hasIconStartHandler"
          type="button"
          class="v-textarea-action"
          :aria-label="iconStartLabel ?? iconName(iconStart)"
          :disabled="disabled"
          @click="emit('click:icon-start', $event)"
        >
          <VIcon v-bind="iconProps(iconStart)" />
        </button>
        <VIcon v-else-if="iconStart" v-bind="iconProps(iconStart)" />
      </slot>

      <textarea
        v-bind="restAttrs"
        :id="fieldId"
        ref="controlEl"
        v-model="model"
        class="v-textarea-control"
        :maxlength="softLimit ? undefined : maxlength"
        :disabled="disabled"
        :readonly="readonly || undefined"
        :aria-invalid="invalid || undefined"
        :aria-describedby="describedBy"
      />

      <button
        v-if="showClear"
        type="button"
        class="v-textarea-action v-textarea-clear"
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
          class="v-textarea-action"
          :aria-label="iconEndLabel ?? iconName(iconEnd)"
          :disabled="disabled"
          @click="emit('click:icon-end', $event)"
        >
          <VIcon v-bind="iconProps(iconEnd)" />
        </button>
        <VIcon v-else-if="iconEnd" v-bind="iconProps(iconEnd)" />
      </slot>
    </div>

    <div v-if="hint || counter" class="v-textarea-meta">
      <VTypography v-if="hint" :id="hintId" variant="caption" tone="muted" class="v-textarea-hint">
        {{ hint }}
      </VTypography>
      <span v-if="counter" class="v-textarea-counter" :data-over="over ? '' : undefined">
        {{ counterText }}
      </span>
    </div>
  </div>
</template>

<style>
@layer vectis.components {
  .v-textarea {
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-1);
    width: 100%;
    font-family: var(--vectis-text-family);
  }

  /* The label and the hint are rendered by VTypography, which carries their type. The
     .v-textarea-label and .v-textarea-hint classes remain as hooks: a consumer
     overrides through them, and the disabled state below reaches them that way. */

  .v-textarea-meta {
    display: flex;
    align-items: baseline;
    gap: var(--vectis-space-2);
  }

  /* The counter keeps its own local styling rather than going through VTypography:
     figures of equal width, so the number does not shift as it counts, and a colour
     that marks the overflow — neither of which is a typographic role. */
  .v-textarea-counter {
    margin-inline-start: auto;
    font-size: var(--vectis-text-caption-size);
    color: var(--vectis-color-text-muted);
    font-variant-numeric: tabular-nums;
  }

  .v-textarea-counter[data-over] {
    color: var(--vectis-color-danger-text);
  }

  /* This is the box that carries the border, the background, the focus ring and the
     resize handle — which is why it also hides its overflow, `resize` having no
     effect on a box whose overflow is visible. `--field-border-color` is the single
     source of truth for its colour, and the hover, error and disabled states do
     nothing but redefine it. */
  .v-textarea-field {
    --field-border-color: var(--vectis-color-border-strong);

    /*
     * Nothing here restates the size scale: the `--control-*` variables are inherited
     * from the v-control root (styles/control-size.css), the icon context included.
     *
     * The field is at least two lines tall, and that is written as the base height
     * plus the effective one: twice the base normally, and 4px less under compact,
     * since it is the effective height that carries the density delta.
     */
    --textarea-min-height: calc(var(--control-height-base) + var(--control-height));

    display: flex;
    align-items: flex-start;
    gap: var(--control-gap);
    min-height: var(--textarea-min-height);
    padding: var(--vectis-space-2) var(--control-padding-inline-field);
    background: var(--vectis-color-surface);
    color: var(--vectis-color-text);
    border: 1px solid var(--field-border-color);
    border-radius: var(--vectis-radius-interactive);
    font-size: var(--control-font-size);
    /* Text running over several lines takes the body line height. The `control` type
       role, whose lines are set tight against one another, only makes sense for a
       single-line label. */
    line-height: var(--vectis-text-body-md-leading);
    resize: vertical;
    overflow: hidden;
    transition:
      border-color var(--vectis-duration-fast) var(--vectis-ease-default),
      background-color var(--vectis-duration-fast) var(--vectis-ease-default),
      box-shadow var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-textarea-control {
    flex: 1;
    min-width: 0;
    align-self: stretch;
    padding: 0;
    border: none;
    background: none;
    color: inherit;
    font: inherit;
    outline: none; /* the focus ring is drawn by the field around it, not here */
    resize: none; /* the resize handle belongs to the field, so there is only one */
  }

  .v-textarea-control::placeholder {
    color: var(--vectis-color-text-subtle);
  }

  /* The icons and buttons align with the FIRST line of text rather than with the
     middle of a field whose height varies: half the difference between a line box and
     the element centres it there. */
  .v-textarea-field > .v-icon,
  .v-textarea-field > .v-spinner {
    margin-block-start: calc((1lh - var(--vectis-icon-size)) / 2);
  }

  .v-textarea-field > .v-textarea-action {
    margin-block-start: calc((1lh - var(--control-action-size)) / 2);
  }

  /* A decorative icon is drawn in a muted grey, so it stays quieter than the text
     being typed beside it. */
  .v-textarea-field > .v-icon {
    color: var(--vectis-color-text-muted);
  }

  .v-textarea-field > .v-spinner {
    font-size: var(--vectis-icon-size);
  }

  /* A read-only field sinks slightly into the page but keeps its text at full
     strength — the value is there to be read — and still shows the accent focus ring.
     The state is read from [data-readonly] and never from `:read-only`, which the
     browser also matches on a disabled field.

     TRAP — this block must stay FIRST in the sequence of states: read-only, then
     hover, focus, invalid and disabled. Every one of these selectors weighs (0,3,0),
     `:has()` taking the specificity of what it contains, so nothing but the source
     order arbitrates between them. Moved further down, this rule would repaint the
     error border and the accent focus ring grey, with no error anywhere. What belongs
     to a read-only field is its BASE colour alone. */
  .v-textarea[data-readonly] .v-textarea-field {
    --field-border-color: var(--vectis-color-border);

    background: var(--vectis-color-surface-sunken);
  }

  .v-textarea-field:hover:not(:has(.v-textarea-control:focus)):not(
      :has(
        .v-textarea-control:disabled,
        .v-textarea-control:user-invalid,
        .v-textarea-control[aria-invalid='true']
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

     The selector watches the CONTROL's focus and not `:focus-within`, so that when one
     of the field's own buttons takes keyboard focus, only that button's outline
     lights up: two indicators at once would be unreadable. And it is `:focus` rather
     than `:focus-visible`, because a text field shows its focus even when it was
     reached with the mouse.

     The transparent outline is the safety net for Windows forced colours, which drop
     box-shadows entirely; an outline survives and keeps the field marked. */
  .v-textarea-field:has(.v-textarea-control:focus) {
    --field-border-color: var(--vectis-color-accent);

    box-shadow: 0 0 0 1px var(--field-border-color);
    outline: var(--vectis-focus-ring-width) solid transparent;
  }

  /* The invalid state, from the browser's own verdict first and from the `invalid`
     prop second. Only the colour variable is changed, which is why the border AND the
     focus ring both turn red without either being restated. */
  .v-textarea-field:has(.v-textarea-control:user-invalid),
  .v-textarea-field:has(.v-textarea-control[aria-invalid='true']) {
    --field-border-color: var(--vectis-color-danger);
  }

  /* The field's own buttons — the clear cross, a clickable icon — go from muted grey
     to full strength on hover, and take VButton's radius so their focus ring has the
     same rounded corners as everything else.

     The negative margin is DERIVED and never written as a number: it is exactly half
     the difference between the icon and the wider box holding it. Subtracting it
     cancels that inset, so the glyph lands precisely where a decorative icon would
     have — against the field's padding, one --control-gap from its neighbour. */
  .v-textarea-action {
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

  .v-textarea-action:hover:not(:disabled) {
    color: var(--vectis-color-text);
  }

  .v-textarea-action:focus-visible {
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
  .v-textarea[data-disabled] .v-textarea-field {
    --field-border-color: var(--vectis-color-border);

    background: var(--vectis-color-surface-muted);
    color: var(--vectis-color-text-muted);
    cursor: not-allowed;
    resize: none;
  }

  .v-textarea[data-disabled] .v-textarea-label,
  .v-textarea[data-disabled] .v-textarea-hint,
  .v-textarea[data-disabled] .v-textarea-counter {
    color: var(--vectis-color-text-subtle);
  }

  .v-textarea[data-disabled] .v-textarea-action,
  .v-textarea[data-disabled] .v-textarea-field > .v-icon {
    color: inherit;
    cursor: not-allowed;
  }

  .v-textarea-control:disabled {
    cursor: not-allowed;
  }

  /* Growing with the content is pure CSS: `field-sizing` makes the textarea's height
     follow what is typed, and the field around it follows in turn. The resize handle
     goes, there being nothing left to resize by hand. A browser without support keeps
     the fixed height and its scrollbar, which is the intended fallback. */
  .v-textarea-field[data-auto-grow] {
    resize: none;
  }

  .v-textarea-field[data-auto-grow] .v-textarea-control {
    field-sizing: content;
  }

  /* Sizes: only padding-block stays local, the rest comes from v-control; it follows the
     (height - 1lh) / 2 formula at each notch */
  .v-textarea[data-size='sm'] .v-textarea-field {
    padding-block: var(--vectis-space-1);
  }

  .v-textarea[data-size='lg'] .v-textarea-field {
    padding-block: var(--vectis-space-3);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-textarea-field,
    .v-textarea-action {
      transition: none;
    }
  }
}
</style>
