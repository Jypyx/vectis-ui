<script setup lang="ts">
// @core
/**
 * Native textarea owns editing and validity. JavaScript bridges the model, text limits and
 * clear-button focus; CSS controls optional content-based height.
 */
import { computed, ref } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconName, iconProps } from '../VIcon/iconProps'
import { close as closeIcon } from '../VIcon/icons/close'
import type { IconSource } from '../VIcon/types'
import VSpinner from '../VSpinner/VSpinner.vue'
import VTypography from '../VTypography/VTypography.vue'

import { useClearable } from '../../composables/useClearable'
import { useFieldIds } from '../../composables/useFieldIds'
import { useIconClickHandlers } from '../../composables/useIconClickHandlers'
import { useRootAttrs } from '../../composables/useRootAttrs'
import { useTextLimit } from '../../composables/useTextLimit'
import { useMessages } from '../../i18n/state'

/** The height of one line: 32, 40 or 48 pixels. */
export type TextareaSize = 'sm' | 'md' | 'lg'

interface TextareaProps {
  /** The size of the field, which sets its padding, its type scale and its icons. */
  size?: TextareaSize
  /**
   * Takes 4px off the field by tightening its padding, leaving the number of lines,
   * the type and the icons alone.
   */
  compact?: boolean
  /**
   * How many lines of text the field shows: the native `rows` attribute, which gives the field
   * its height.
   */
  rows?: number
  /**
   * Lets the field grow as the text is typed, instead of scrolling inside the height `rows`
   * gives it, which stays its starting height.
   */
  autoGrow?: boolean
  /**
   * Marks the field as invalid whatever the browser thinks: the route for a rule
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
   * An icon inside the field, at the start. It is decorative by default and becomes a real
   * button as soon as a `@click:icon-start` listener is attached, in which case it needs
   * `iconStartLabel`.
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
  loadingText?: string
  /**
   * Offers a cross that empties the field. It appears when there is something to
   * clear and the field can be edited.
   */
  clearable?: boolean
  /**
   * Decides whether the cross is shown, instead of letting the field work it out from its own
   * content (a read-only field included).
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
   * Turns that limit into a soft one: the reader may type past it, and the field goes into
   * error instead of silently refusing the keystrokes.
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
  rows: 5,
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
  loadingText: undefined,
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
  /**
   * Content at the start of the field, rendered after `iconStart` rather than in its
   * place, as in VInput.
   */
  start?(): unknown
  /**
   * Content at the end of the field, which replaces `iconEnd`. It is hidden while the
   * field is loading, the spinner taking that place.
   */
  end?(): unknown
  /**
   * Controls of your own inside the field, placed before the field's own: the clear cross and
   * the end icon.
   */
  'value-end'?(): unknown
}>()

/** The text in the field, empty to begin with. */
const model = defineModel<string>({ default: '' })

// HTML wants `rows` to be a positive integer, and it drops anything else on the floor:
// a 0, a negative or a fractional value would leave the browser falling back to its own
// default of two rows, which is neither what was asked for nor this component's default.
// Rounding and flooring here is what keeps the prop's contract out of the parser's hands.
const resolvedRows = computed(() => Math.max(1, Math.round(props.rows)))

// `class` and `style` stay on the wrapper, where a consumer expects to style the
// field; every other attribute goes to the textarea, where it does something.
const { attrs, rootClass, rootStyle, forwardedAttrs: restAttrs } = useRootAttrs()

// The prop keeps priority; what it falls back to is the dictionary, so the default
// wording follows the language the design system is set to.
const m = useMessages()
const resolvedClearLabel = computed(() => props.clearLabel ?? m.value.common.clear)

const { fieldId, hintId, counterId, describedBy } = useFieldIds(
  attrs,
  () => !!props.hint,
  () => props.counter,
)

// Every length measurement goes through this projection: a value straight from an API or
// a database is often `null`, and reading `.length` on it would throw at mount.
const modelText = computed(() => model.value ?? '')

const { hasIconStartHandler, hasIconEndHandler } = useIconClickHandlers({
  name: 'VTextarea',
  iconStartLabel: props.iconStartLabel,
  iconEndLabel: props.iconEndLabel,
})

const controlEl = ref<HTMLTextAreaElement | null>(null)

const { showClear, onClear } = useClearable({
  clearable: () => props.clearable,
  clearVisible: () => props.clearVisible,
  disabled: () => props.disabled,
  readonly: () => props.readonly,
  text: () => modelText.value,
  controlEl,
  onCleared: () => {
    model.value = ''
    emit('clear')
  },
})

const { counterText, over } = useTextLimit({
  el: controlEl,
  text: () => modelText.value,
  maxlength: () => props.maxlength,
  softLimit: () => props.softLimit,
})

defineExpose({
  /** Moves the focus to the real textarea. */
  focus: (options?: FocusOptions) => controlEl.value?.focus(options),
  /** Selects everything in the field. */
  select: () => controlEl.value?.select(),
  /** The real `<textarea>`, for what neither of the two above covers. */
  el: controlEl,
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

    <div
      class="v-textarea-field"
      :style="{ '--textarea-rows': resolvedRows }"
      :data-auto-grow="autoGrow ? '' : undefined"
    >
      <!--
        The start icon is rendered before the slot, where the end icon is the slot's own
        fallback. The asymmetry is VInput's, mirrored here so the two fields answer the same
        way: what a composed field puts in that zone is OTHER content beside the icon, not
        another way of drawing it.
      -->
      <button
        v-if="iconStart && hasIconStartHandler"
        type="button"
        class="v-textarea-action v-field-action v-textarea-icon-start"
        :aria-label="iconStartLabel ?? iconName(iconStart)"
        :disabled="disabled"
        @click="emit('click:icon-start', $event)"
      >
        <VIcon v-bind="iconProps(iconStart)" />
      </button>
      <VIcon v-else-if="iconStart" v-bind="iconProps(iconStart)" class="v-textarea-icon-start" />
      <slot name="start" />

      <textarea
        :id="fieldId"
        ref="controlEl"
        v-model="model"
        :aria-invalid="invalid || undefined"
        v-bind="restAttrs"
        class="v-textarea-control"
        :rows="resolvedRows"
        :maxlength="softLimit ? undefined : maxlength"
        :disabled="disabled"
        :readonly="readonly || undefined"
        :aria-describedby="describedBy"
      />

      <slot name="value-end" />

      <button
        v-if="showClear"
        type="button"
        class="v-textarea-action v-field-action v-textarea-clear"
        :aria-label="resolvedClearLabel"
        @click="onClear"
      >
        <VIcon :name="closeIcon" />
      </button>

      <VSpinner v-if="loading" :label="loadingText" />
      <slot v-else name="end">
        <button
          v-if="iconEnd && hasIconEndHandler"
          type="button"
          class="v-textarea-action v-field-action v-textarea-icon-end"
          :aria-label="iconEndLabel ?? iconName(iconEnd)"
          :disabled="disabled"
          @click="emit('click:icon-end', $event)"
        >
          <VIcon v-bind="iconProps(iconEnd)" />
        </button>
        <VIcon v-else-if="iconEnd" v-bind="iconProps(iconEnd)" class="v-textarea-icon-end" />
      </slot>
    </div>

    <div v-if="hint || counter" class="v-textarea-meta v-field-meta">
      <VTypography v-if="hint" :id="hintId" variant="caption" tone="muted" class="v-textarea-hint">
        {{ hint }}
      </VTypography>
      <span
        v-if="counter"
        :id="counterId"
        class="v-textarea-counter v-field-counter"
        :data-over="over ? '' : undefined"
      >
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

  /*
   * The .v-textarea-label and .v-textarea-hint classes remain as hooks: a consumer overrides
   * through them, and the disabled state below reaches them that way.
   */

  /*
   * This is the box that carries the border, the background, the focus ring and the resize
   * handle; which is why it also hides its overflow, `resize` having no effect on a box whose
   * overflow is visible. `--field-border-color` is the single source of truth for its colour,
   * and the hover, error and disabled states do nothing but redefine it.
   */
  .v-textarea-field {
    --field-border-color: var(--vectis-color-border-strong);

    /*
     * Nothing here restates the size scale: the `--control-*` variables are inherited from the
     * v-control root (styles/control-size.css), the icon context included. The field carries no
     * height of its own: it is the `rows` attribute on the textarea that sets one, and the
     * field is simply as tall as the control it wraps.
     */

    /*
     * The leading is named once and feeds two things that have to agree by construction: the
     * field's own `line-height`, and the first line box below, against which everything sitting
     * beside the text is offset.
     */
    --textarea-leading: var(--vectis-text-body-md-leading);

    /*
     * It is DERIVED and must never be written as `1lh`. The buttons happened to be right only
     * because the reset gives them `font: inherit`.
     */
    --textarea-line: calc(var(--control-font-size) * var(--textarea-leading));

    display: flex;
    align-items: flex-start;
    gap: var(--control-gap);
    padding-inline: var(--control-padding-inline-field);
    /*
     * Derive padding from control height minus borders and one line. Read the compact-adjusted
     * height so rows=1 matches VInput and each additional row adds one line.
     */
    padding-block: calc((var(--control-height) - 2px - var(--textarea-line)) / 2);
    background: var(--vectis-color-surface);
    color: var(--vectis-color-text);
    border: 1px solid var(--field-border-color);
    /*
     * The cap is what carries the VInput identity above into the OTHER row counts, and it has
     * to stay derived from --control-height. A browser scales down any radius it cannot fit, so
     * on a one-row field a pill override is already painted as half the control height; min()
     * applies that same reduction to a field that is taller.
     */
    border-radius: min(var(--vectis-radius-interactive), calc(var(--control-height) / 2));
    font-size: var(--control-font-size);
    /* Text running over several lines takes the body line height. The `control` type
       role, whose lines are set tight against one another, only makes sense for a
       single-line label. */
    line-height: var(--textarea-leading);
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
    outline: none; /* The focus ring is drawn by the field around it, not here */
    resize: none;
  }

  .v-textarea-control::placeholder {
    color: var(--vectis-color-text-subtle);
  }

  /*
   * The margin is SYMMETRIC, the VToast rule. It looks redundant under
   * `align-items: flex-start`, where only the start side moves anything, but the end side is
   * what keeps the item's OUTER box down to one line box.
   */
  .v-textarea-field > .v-icon,
  .v-textarea-field > .v-spinner {
    margin-block: calc((var(--textarea-line) - var(--vectis-icon-size)) / 2);
  }

  .v-textarea-field > .v-textarea-action {
    margin-block: calc((var(--textarea-line) - var(--control-action-size)) / 2);
  }

  /* A decorative icon is drawn in a muted grey, so it stays quieter than the text
     being typed beside it. */
  .v-textarea-field > .v-icon {
    color: var(--vectis-color-text-muted);
  }

  .v-textarea-field > .v-spinner {
    font-size: var(--vectis-icon-size);
  }

  /*
   * This block must stay first in the sequence of states: read-only, then hover, focus, invalid
   * and disabled. The read-only, focus, invalid and disabled selectors all weigh (0,3,0),
   * `:has()` taking the specificity of what it contains, so nothing but the source order
   * arbitrates between them.
   */
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

  /*
   * The selector watches the control's focus and not `:focus-within`, so that when one of the
   * field's own buttons takes keyboard focus, only that button's outline lights up: two
   * indicators at once would be unreadable. And it is `:focus` rather than `:focus-visible`,
   * because a text field shows its focus even when it was reached with the mouse.
   */
  .v-textarea-field:has(.v-textarea-control:focus) {
    --field-border-color: var(--vectis-color-accent);

    box-shadow: 0 0 0 1px var(--field-border-color);
    outline: var(--vectis-focus-ring-width) solid transparent;
  }

  /*
   * Only the colour variable is changed, which is why the border and the focus ring both turn
   * red without either being restated.
   */
  .v-textarea-field:has(.v-textarea-control:user-invalid),
  .v-textarea-field:has(.v-textarea-control[aria-invalid='true']) {
    --field-border-color: var(--vectis-color-danger);
  }

  /*
   * A disabled field greys out through the colour tokens, the same ones VCheckbox and VRadio
   * use, and never through opacity. It comes last in the sequence of states, which at equal
   * specificity is what makes it win over all of them, the error included: a disabled field is
   * not submitted, so it has nothing to report.
   */
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

  /*
   * A browser without support keeps the fixed height and its scrollbar, which is the intended
   * fallback.
   */
  .v-textarea-field[data-auto-grow] {
    resize: none;
  }

  /*
   * It is scoped to this branch and must not be lifted onto the control at large: a floor there
   * would stop the control shrinking with the resize handle, and the field, which hides its
   * overflow, would clip it instead of scrolling.
   */
  .v-textarea-field[data-auto-grow] .v-textarea-control {
    field-sizing: content;
    min-block-size: calc(var(--textarea-rows) * var(--textarea-line));
  }

  @media (prefers-reduced-motion: reduce) {
    .v-textarea-field {
      transition: none;
    }
  }
}
</style>
