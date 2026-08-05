<script setup lang="ts">
/**
 * Complete text field: label, internal (clickable) icons, counter, soft limit,
 * loading, clearable — around a styled native <input>. Wrapper-root: class/style
 * stay on the root, everything else is forwarded to the <input>. Validation stays
 * native (`:user-invalid`); the soft limit goes through setCustomValidity, never
 * through a custom event.
 *
 * Behavioural JS specific to the component: the v-model bridge and clear +
 * refocus (the button disappears on click, so focus would otherwise be lost).
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
  /** Field height: sm 32px, md 40px (default), lg 48px. */
  size?: 'sm' | 'md' | 'lg'
  /** Height reduced by 4px; padding, type and icons unchanged. */
  compact?: boolean
  /** Native input type — virtual keyboards adapt automatically. */
  type?: 'text' | 'email' | 'number' | 'password' | 'search' | 'tel' | 'url'
  /** Forces the invalid state (server-side validation) — sets aria-invalid. */
  invalid?: boolean
  disabled?: boolean
  /** Read-only: focusable, not editable; hides the clear button (unless an
      explicit `clearVisible`, which is authoritative). */
  readonly?: boolean
  /** Label above the field, associated through for/id. */
  label?: string
  /** Help text under the field, linked through aria-describedby. */
  hint?: string
  /** Icon on the left inside the field (the #start slot wins). Decorative; becomes
      a button if a @click:icon-start listener is attached. */
  iconStart?: IconSource
  /** Same on the right (the #end slot wins). Replaced by the spinner when loading. */
  iconEnd?: IconSource
  /** Accessible label of the start icon button (when clickable). */
  iconStartLabel?: string
  /** Accessible label of the end icon button (when clickable). */
  iconEndLabel?: string
  /** A VSpinner on the right, in place of iconEnd / #end. */
  loading?: boolean
  /** Spinner label for screen readers. Default: the DS dictionary. */
  loadingLabel?: string
  /** Cross button that empties the field (visible when non-empty, outside disabled/readonly). */
  clearable?: boolean
  /** Forces the cross's visibility (otherwise: a non-empty, editable field) —
      readonly included. Useful when the "content to clear" lives outside the text
      field (VCombobox: Chips) or changes by means other than typing (a read-only
      VDatePicker/VTimePicker: through its panel). */
  clearVisible?: boolean
  /** Accessible label of the clear button. Default: the DS dictionary. */
  clearLabel?: string
  /** Character limit. By default: the native maxlength attribute (input blocked). */
  maxlength?: number
  /** Soft limit: input may exceed maxlength and the field goes into error
      (setCustomValidity → :user-invalid) instead of blocking. */
  softLimit?: boolean
  /** Character counter ("12/80", or "12" without maxlength), on the right inside the field. */
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
  'click:icon-start': [event: MouseEvent]
  'click:icon-end': [event: MouseEvent]
  clear: []
}>()

defineSlots<{
  /** Content at the start of the field (wins over iconStart). */
  start?(): unknown
  /** Content at the end of the field (wins over iconEnd, hidden when loading). */
  end?(): unknown
}>()

/**
 * `string | number` rather than `string` alone: on an `<input type="number">`, Vue
 * automatically converts the `v-model` value to a number (`vModelText` casts as
 * soon as `el.type === 'number'`).
 */
const model = defineModel<string | number>({ default: '' })

/** Text projection of the model: every length measurement (counter, soft limit,
 * cross visibility) goes through it — a number has no `.length`. */
const modelText = computed(() => String(model.value ?? ''))

const { attrs, rootClass, rootStyle, forwardedAttrs: restAttrs } = useRootAttrs()

// Cascade prop > dictionary: the prop keeps priority, its default follows the DS
// locale.
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
  // A supplied `clearVisible` is the consumer's EXPLICIT answer to "is there
  // anything to clear?", readonly included: the value of a read-only VDatePicker /
  // VTimePicker changes through its panel, not through typing. Otherwise the
  // default is "field non-empty AND editable".
  return props.clearVisible ?? (!props.readonly && modelText.value.length > 0)
})

function onClear() {
  model.value = ''
  emit('clear')
  controlEl.value?.focus()
}

// Counter and soft limit: measured on `modelText`, since a number has no `.length`.
const { counterText, over } = useTextLimit({
  el: controlEl,
  text: () => modelText.value,
  maxlength: () => props.maxlength,
  softLimit: () => props.softLimit,
})

// The internal control is hidden by the wrapper: expose focus()/select()/el for
// the components that compose it (e.g. VCombobox, refocus + select-all).
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

  /* Label and hint: rendered by VTypography (label / muted caption) — the
     .v-input-label/.v-input-hint classes stay in place as hooks (consumer
     overrides, the disabled state below). */

  /* The field carries the border, the background and the focus; --field-border-color is
     the single source of truth for the colour (hover/error/disabled redefine it).
     Sizes/compact: --control-* variables inherited from the v-control root
     (styles/control-size.css), the VIcon context included. */
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
    outline: none; /* focus is carried by the field (focus-within) */
  }

  .v-input-control::placeholder {
    color: var(--vectis-color-text-subtle);
  }

  /* Native decorations neutralized: the internal controls come from the DS (the
     `clearable` cross, the icons) — WebKit's type=search cross, the type=number
     spinners and Edge's reveal eye would either duplicate them or clash
     visually. */
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

  /* The browser's autofill background is painted on the inner input: at least follow the
     field's radius (a trade-off, the colour stays the browser's) */
  .v-input-control:-webkit-autofill {
    border-radius: var(--vectis-radius-interactive);
  }

  /* Readonly: a slightly sunken background, normal text (the value stays
     readable), accent focus kept. [data-readonly] and never :read-only (which also
     matches :disabled).
     TRAP — this block must stay FIRST of the state sequence (readonly → hover →
     focus → invalid → disabled). Every state selector here weighs (0,3,0), :has()
     taking the specificity of its argument, so ONLY source order arbitrates them:
     moved back down, this one repaints the error border and the accent focus grey,
     with no console error. Only a readonly field's BASE colour belongs to it. */
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

  /* "2px border" focus: a 1px border + a 1px outer shadow of the same colour, with
     no layout jump. Only the CONTROL's focus is targeted (not :focus-within): when
     an internal button (clear, icon) has keyboard focus, only its own outline
     lights up — otherwise two simultaneous indicators, unreadable.
     :focus (not :focus-visible): a text field always shows its focus, mouse included.
     The transparent outline is the forced-colors safety net (Windows High Contrast drops
     box-shadows). */
  .v-input-field:has(.v-input-control:focus) {
    --field-border-color: var(--vectis-color-accent);

    box-shadow: 0 0 0 1px var(--field-border-color);
    outline: var(--vectis-focus-ring-width) solid transparent;
  }

  /* Invalid state: the native pseudo-class first, the prop (aria-invalid) second.
     Only the variable changes → both the border AND the focus ring go red. */
  .v-input-field:has(.v-input-control:user-invalid),
  .v-input-field:has(.v-input-control[aria-invalid='true']) {
    --field-border-color: var(--vectis-color-danger);
  }

  /* The counter stays styled locally: tabular-nums and the overflow state are not
     typographic roles. */
  .v-input-counter {
    flex: none;
    font-size: var(--vectis-text-caption-size);
    color: var(--vectis-color-text-muted);
    font-variant-numeric: tabular-nums;
  }

  .v-input-counter[data-over] {
    color: var(--vectis-color-danger-text);
  }

  /* Decorative icons: dark grey, less present than the typed text */
  .v-input-field > .v-icon {
    color: var(--vectis-color-text-muted);
  }

  .v-input-field > .v-spinner {
    font-size: var(--vectis-icon-size);
  }

  /* Internal buttons (clear, clickable icon): dark grey → black on hover, radius
     aligned with VButton (a square focus ring with rounded edges). The negative
     margin is DERIVED, never a literal: it is exactly the half-difference that
     centres the icon in the (wider) action box, so it cancels that inset and the
     glyph lands where a decorative .v-icon would — on the field's padding, and one
     --control-gap away from its neighbour. */
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

  /* Disabled: a grey shade with no opacity (the same tokens as VCheckbox/VRadio).
     Last of the state sequence: at equal specificity, it wins over all of them,
     the error included — a disabled field is not submitted, so it has nothing to
     report.
     `text-muted` and not `text-subtle` like the label and the hint below: those sit on
     the page surface, this sits on `surface-muted`, where subtle drops to 4.4:1. The
     control itself is exempt from the contrast rule (it is natively disabled) but the
     icons the field CONTAINS are not — and they inherit this colour. */
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
