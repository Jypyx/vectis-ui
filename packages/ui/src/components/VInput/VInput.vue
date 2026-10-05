<script setup lang="ts">
// @core
/**
 * Native input owns typing and validity. JavaScript bridges the model and restores focus after
 * the clear button disappears.
 */
import { computed, inject, ref } from 'vue'

import VFieldAnnouncer from '../VField/VFieldAnnouncer.vue'
import VIcon from '../VIcon/VIcon.vue'
import { iconName, iconProps } from '../VIcon/iconProps'
import { close as closeIcon } from '../VIcon/icons/close'
import type { IconSource } from '../VIcon/types'
import VSpinner from '../VSpinner/VSpinner.vue'
import VTypography from '../VTypography/VTypography.vue'

import { useFieldIds } from '../../composables/useFieldIds'
import { useIconClickHandlers } from '../../composables/useIconClickHandlers'
import { useClearable } from '../../composables/useClearable'
import { useControlShape } from '../../composables/useControlShape'
import { useRootAttrs } from '../../composables/useRootAttrs'
import { useTextLimit } from '../../composables/useTextLimit'
import { useMessages } from '../../i18n/state'

import { inputGroupKey } from './context'

/** The height of the field: 32, 40 or 48 pixels. */
export type InputSize = 'sm' | 'md' | 'lg'

/** The native type of the input, which also decides the keyboard a phone offers. */
export type InputType = 'text' | 'email' | 'number' | 'password' | 'search' | 'tel' | 'url'

interface InputProps {
  /** The height of the field: 32, 40 or 48 pixels. */
  size?: InputSize
  /** Takes 4px off the height, leaving the padding, the text and the icons as they are. */
  compact?: boolean
  /**
   * The native type of the input, which is also what tells a phone which keyboard to
   * offer: a numeric pad for `number`, an @ key for `email`.
   */
  type?: InputType
  /** Marks the field as invalid whatever the browser thinks. */
  invalid?: boolean
  /** Makes the field unusable, greyed out through the colour tokens. */
  disabled?: boolean
  /**
   * Shows the value without allowing it to be changed. The field can still be
   * focused and copied from, and it hides the clear button, unless `clearVisible`
   * answers that question explicitly.
   */
  readonly?: boolean
  /**
   * Refuses the keyboard without drawing the field as read-only: the native attribute is set,
   * but the field keeps its ordinary look and its clear cross.
   */
  noTyping?: boolean
  /** The label above the field, tied to it so that clicking it focuses the field. */
  label?: string
  /**
   * A line of help under the field. It is tied to the input for assistive
   * technology, so it is read out along with the label.
   */
  hint?: string
  /**
   * A message saying what is wrong with the value, shown in place of the hint so that the field
   * does not grow. It marks the field invalid, is read along with it, and is announced when it
   * appears or changes.
   */
  error?: string
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
   * What screen readers announce while the spinner turns. It falls back to the
   * design system dictionary.
   */
  loadingText?: string
  /**
   * Offers a cross that empties the field. It appears when there is something to
   * clear and the field can be edited.
   */
  clearable?: boolean
  /**
   * Decides whether the cross is shown, instead of letting the field work it out
   * from its own content (a read-only field included).
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
   * Turns that limit into a soft one: the reader may type past it, and the field goes into
   * error instead of silently refusing the keystrokes.
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
  error: undefined,
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
  noTyping: false,
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
   * Content at the start of the field, rendered after `iconStart` rather than in its place,
   * which lets a field composed on top of this one put the chips standing for its values here
   * beside an icon it still wants drawn.
   */
  start?(): unknown
  /**
   * Controls of your own inside the field, placed before the field's own: the clear cross and
   * the end icon.
   */
  'value-end'?(): unknown
  /**
   * Content at the end of the field, which replaces `iconEnd`. It is hidden while
   * the field is loading, the spinner taking that place.
   */
  end?(): unknown
}>()

/** The value, typed as text or a number rather than text alone. */
const model = defineModel<string | number>({ default: '' })

/**
 * The value seen as text. Every measurement of its length; the counter, the soft limit, whether
 * the clear cross has anything to clear; goes through this, since a number has no length of its
 * own.
 */
const modelText = computed(() => String(model.value ?? ''))

const { attrs, rootClass, rootStyle, forwardedAttrs: restAttrs } = useRootAttrs()

// `disabled` is the one read as an or, the two answers being cumulative (VInput/context.ts).
const group = inject(inputGroupKey, null)
const {
  size: resolvedSize,
  compact: resolvedCompact,
  disabled: resolvedDisabled,
} = useControlShape(props, group)

// The prop keeps priority; what it falls back to is the dictionary, so the default
// wording follows the language the design system is set to.
const m = useMessages()
const resolvedClearLabel = computed(() => props.clearLabel ?? m.value.common.clear)

const { fieldId, hintId, counterId, errorId, describedBy } = useFieldIds(
  attrs,
  () => !!props.hint && !props.error,
  () => props.counter,
  () => !!props.error,
)

const { hasIconStartHandler, hasIconEndHandler } = useIconClickHandlers({
  name: 'VInput',
  iconStartLabel: props.iconStartLabel,
  iconEndLabel: props.iconEndLabel,
})

const controlEl = ref<HTMLInputElement | null>(null)

const { showClear, onClear } = useClearable({
  clearable: () => props.clearable,
  clearVisible: () => props.clearVisible,
  disabled: () => resolvedDisabled.value,
  readonly: () => props.readonly,
  text: () => modelText.value,
  controlEl,
  onCleared: () => {
    model.value = ''
    emit('clear')
  },
})

// The counter and the soft limit both measure `modelText` rather than the model
// itself, a number having no length.
const { counterText, over } = useTextLimit({
  el: controlEl,
  text: () => modelText.value,
  maxlength: () => props.maxlength,
  softLimit: () => props.softLimit,
})

// The real input sits inside the wrapper, out of reach of whoever renders this component. These
// three are how the components built on it get there; VCombobox refocuses the field and selects
// its text this way.
defineExpose({
  /** Moves the focus to the real input. */
  focus: (options?: FocusOptions) => controlEl.value?.focus(options),
  /** Selects everything in the field, as VCombobox does when it reopens its panel. */
  select: () => controlEl.value?.select(),
  /** The real `<input>`, for what neither of the two above covers. */
  el: controlEl,
})
</script>

<template>
  <div
    class="v-input v-control"
    :class="rootClass"
    :style="rootStyle"
    :data-size="resolvedSize"
    :data-compact="resolvedCompact ? '' : undefined"
    :data-disabled="resolvedDisabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
  >
    <VTypography v-if="label" as="label" variant="label" class="v-input-label" :for="fieldId">
      {{ label }}
    </VTypography>

    <div class="v-input-field">
      <!--
        The start icon is rendered before the slot, where the end icon is the slot's own
        fallback. That asymmetry is what the composed fields need: VCombobox and VFileInput fill
        `#start` with the chips standing for their values, which is OTHER content in the same
        zone rather than another way of drawing the icon.
      -->
      <button
        v-if="iconStart && hasIconStartHandler"
        type="button"
        class="v-input-action v-field-action v-input-icon-start"
        :aria-label="iconStartLabel ?? iconName(iconStart)"
        :disabled="resolvedDisabled"
        @click="emit('click:icon-start', $event)"
      >
        <VIcon v-bind="iconProps(iconStart)" />
      </button>
      <VIcon v-else-if="iconStart" v-bind="iconProps(iconStart)" class="v-input-icon-start" />
      <slot name="start" />

      <input
        :id="fieldId"
        ref="controlEl"
        v-model="model"
        :aria-invalid="invalid || !!error || undefined"
        v-bind="restAttrs"
        class="v-input-control"
        :type="type"
        :maxlength="softLimit ? undefined : maxlength"
        :disabled="resolvedDisabled"
        :readonly="readonly || noTyping || undefined"
        :aria-describedby="describedBy"
      />

      <span
        v-if="counter"
        :id="counterId"
        class="v-input-counter v-field-counter"
        :data-over="over ? '' : undefined"
      >
        {{ counterText }}
      </span>

      <!-- Before the clear cross rather than after it, so that a consumer's control reads
           and tabs in the same order: what acts on the value sits next to the value, and
           the field's own controls stay together at the end. -->
      <slot name="value-end" />

      <button
        v-if="showClear"
        type="button"
        class="v-input-action v-field-action v-input-clear"
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
          class="v-input-action v-field-action v-input-icon-end"
          :aria-label="iconEndLabel ?? iconName(iconEnd)"
          :disabled="resolvedDisabled"
          @click="emit('click:icon-end', $event)"
        >
          <VIcon v-bind="iconProps(iconEnd)" />
        </button>
        <VIcon v-else-if="iconEnd" v-bind="iconProps(iconEnd)" class="v-input-icon-end" />
      </slot>
    </div>

    <span v-if="error" :id="errorId" class="v-field-error v-input-error">{{ error }}</span>
    <VTypography v-else-if="hint" :id="hintId" variant="caption" tone="muted" class="v-input-hint">
      {{ hint }}
    </VTypography>
    <VFieldAnnouncer :text="error" />
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

  /*
   * The .v-input-label and .v-input-hint classes remain as hooks: a consumer overrides through
   * them, and the disabled state below reaches them that way.
   */

  /*
   * This is the box that carries the border, the background and the focus ring.
   * `--field-border-color` is the single source of truth for its colour, and the hover, error
   * and disabled states do nothing but redefine it.
   */
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
    outline: none; /* The focus ring is drawn by the field around it, not here */
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

  /*
   * Its colour cannot be changed, but matching the field's radius at least stops it from
   * showing square corners inside a rounded box.
   */
  .v-input-control:-webkit-autofill {
    border-radius: var(--vectis-radius-interactive);
  }

  /*
   * This block must stay first in the sequence of states: read-only, then hover, focus, invalid
   * and disabled. The read-only, focus, invalid and disabled selectors all weigh (0,3,0),
   * `:has()` taking the specificity of what it contains, so nothing but the source order
   * arbitrates between them.
   */
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

  /*
   * The selector watches the control's focus and not `:focus-within`, so that when one of the
   * field's own buttons; the cross, a clickable icon; takes keyboard focus, only that button's
   * outline lights up: two indicators at once would be unreadable. And it is `:focus` rather
   * than `:focus-visible`, because a text field shows its focus even when it was reached with
   * the mouse.
   */
  .v-input-field:has(.v-input-control:focus) {
    --field-border-color: var(--vectis-color-accent);

    box-shadow: 0 0 0 1px var(--field-border-color);
    outline: var(--vectis-focus-ring-width) solid transparent;
  }

  /*
   * Only the colour variable is changed, which is why the border and the focus ring both turn
   * red without either being restated.
   */
  .v-input-field:has(.v-input-control:user-invalid),
  .v-input-field:has(.v-input-control[aria-invalid='true']) {
    --field-border-color: var(--vectis-color-danger);
  }

  /* Inside the box it must not shrink, or a long value would squeeze its figures. */
  .v-input-counter {
    flex: none;
  }

  /* A decorative icon is drawn in a muted grey, so it stays quieter than the text
     being typed beside it. */
  .v-input-field > .v-icon {
    color: var(--vectis-color-text-muted);
  }

  .v-input-field > .v-spinner {
    font-size: var(--vectis-icon-size);
  }

  /*
   * A disabled field greys out through the colour tokens, the same ones VCheckbox and VRadio
   * use, and never through opacity. It comes last in the sequence of states, which at equal
   * specificity is what makes it win over all of them, the error included: a disabled field is
   * not submitted, so it has nothing to report.
   */
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

  /*
   * They live in this sheet because it is the one both are guaranteed to load, being built on
   * VInput; the core sheet would charge every consumer for them. `.v-input-end-pinned` lifts
   * the clear cross and whatever carries `.v-input-icon-end`; the end icon, or a composed
   * field's own chevron and spinner; out of the flow, so they stay pinned to the end of the
   * field and vertically centred whatever the chips do.
   */
  .v-input-end-pinned .v-input-field {
    position: relative;
  }

  .v-input-end-pinned .v-input-field:has(> :is(.v-input-clear, .v-input-icon-end, .v-spinner)) {
    padding-inline-end: calc(
      var(--control-padding-inline-field) + var(--vectis-icon-size) + var(--control-gap)
    );
  }

  .v-input-end-pinned
    .v-input-field:has(> .v-input-clear):has(> :is(.v-input-icon-end, .v-spinner)) {
    padding-inline-end: calc(
      var(--control-padding-inline-field) + 2 * var(--vectis-icon-size) + 2 * var(--control-gap)
    );
  }

  .v-input-end-pinned :is(.v-input-clear, .v-input-icon-end) {
    position: absolute;
    inset-inline-end: var(--control-padding-inline-field);
    top: 50%;
    translate: 0 -50%;
  }

  /*
   * This inset reads in glyphs and not in buttons. The cross is one of the field's buttons,
   * whose negative margin; half the difference between icon and button; already cancels its own
   * overhang, so an inset lands on the glyph's edge.
   */
  .v-input-end-pinned .v-input-clear:has(~ :is(.v-input-icon-end, .v-spinner)) {
    inset-inline-end: calc(
      var(--control-padding-inline-field) + var(--vectis-icon-size) + var(--control-gap)
    );
  }

  /*
   * The control rule must stay at (0,2,0). VCombobox folds its search input away with a (0,3,0)
   * rule that zeroes this height, and at equal weight the winner would be whichever of the two
   * sheets a bundler put last.
   */
  .v-input-chips .v-input-field {
    flex-wrap: wrap;
    height: auto;
    min-height: var(--control-height);
    padding-block: var(--vectis-space-1);
  }

  .v-input-chips .v-input-control {
    height: var(--chip-height);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-input-field {
      transition: none;
    }
  }
}
</style>
