<script setup lang="ts">
/**
 * Complete text area: label, internal (clickable) icons, counter, soft limit,
 * loading, clearable — around a styled native <textarea>. A mirror of VInput,
 * with `autoGrow` (pure CSS, `field-sizing: content`) and the counter rendered
 * UNDER the field, never inside it. Wrapper-root: class/style stay on the root,
 * everything else is forwarded to the <textarea>. Validation stays native
 * (`:user-invalid`); the soft limit goes through setCustomValidity.
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

interface TextareaProps {
  /** Field height: sm 32px, md 40px (default), lg 48px. */
  size?: 'sm' | 'md' | 'lg'
  /** Minimum height reduced by 4px; padding, type and icons unchanged. */
  compact?: boolean
  /** Height that follows the content (field-sizing: content; unsupported = a plain textarea). */
  autoGrow?: boolean
  /** Forces the invalid state (server-side validation) — sets aria-invalid. */
  invalid?: boolean
  disabled?: boolean
  /** Read-only: focusable, not editable; hides the clear button. */
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
  /** A cross button that empties the field (visible when non-empty, outside disabled/readonly). */
  clearable?: boolean
  /** Accessible label of the clear button. Default: the DS dictionary. */
  clearLabel?: string
  /** Character limit. By default: the native maxlength attribute (input blocked). */
  maxlength?: number
  /** Soft limit: input may exceed maxlength and the field goes into error
      (setCustomValidity → :user-invalid) instead of blocking. */
  softLimit?: boolean
  /** Character counter ("12/80", or "12" without maxlength), under the field on the right. */
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

const model = defineModel<string>({ default: '' })

// class/style on the root; everything else on the native control
const { attrs, rootClass, rootStyle, forwardedAttrs: restAttrs } = useRootAttrs()

// Cascade prop > dictionary: the prop keeps priority, its default follows the DS
// locale.
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

  /* Label and hint: rendered by VTypography (label / muted caption) — the
     .v-textarea-label/.v-textarea-hint classes stay in place as hooks (consumer
     overrides, the disabled state below). */

  .v-textarea-meta {
    display: flex;
    align-items: baseline;
    gap: var(--vectis-space-2);
  }

  /* The counter stays styled locally: tabular-nums and the overflow state are not
     typographic roles. */
  .v-textarea-counter {
    margin-inline-start: auto;
    font-size: var(--vectis-text-caption-size);
    color: var(--vectis-color-text-muted);
    font-variant-numeric: tabular-nums;
  }

  .v-textarea-counter[data-over] {
    color: var(--vectis-color-danger-text);
  }

  /* The field carries the border, the background, the focus AND the resizing (resize
     requires overflow ≠ visible); --field-border-color is the single source of truth for
     the colour (hover/error/disabled redefine it) */
  .v-textarea-field {
    --field-border-color: var(--vectis-color-border-strong);

    /*
     * Sizes/compact: --control-* variables inherited from the root
     * v-control (styles/control-size.css), contexte de VIcon compris.
     * Minimum height = 2 lines: base + effective height — that is 2×base without
     * compact, 2×base - 4px with it (the effective height carries the delta).
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
    /* multi-line text: body leading (the `control` role at leading-none only holds
       for single-line labels) */
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
    outline: none; /* focus is carried by the field (focus-within) */
    resize: none; /* resizing is carried by the field */
  }

  .v-textarea-control::placeholder {
    color: var(--vectis-color-text-subtle);
  }

  /* icons and buttons centred on the first line of text */
  .v-textarea-field > .v-icon,
  .v-textarea-field > .v-spinner {
    margin-block-start: calc((1lh - var(--vectis-icon-size)) / 2);
  }

  .v-textarea-field > .v-textarea-action {
    margin-block-start: calc((1lh - var(--control-action-size)) / 2);
  }

  /* Decorative icons: dark grey, less present than the typed text */
  .v-textarea-field > .v-icon {
    color: var(--vectis-color-text-muted);
  }

  .v-textarea-field > .v-spinner {
    font-size: var(--vectis-icon-size);
  }

  /* Readonly: a slightly sunken background, normal text (the value stays
     readable), accent focus kept. [data-readonly] and never :read-only (which also
     matches :disabled).
     TRAP — this block must stay FIRST of the state sequence (readonly → hover →
     focus → invalid → disabled). Every state selector here weighs (0,3,0), :has()
     taking the specificity of its argument, so ONLY source order arbitrates them:
     moved back down, this one repaints the error border and the accent focus grey,
     with no console error. Only a readonly field's BASE colour belongs to it. */
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

  /* "2px border" focus: a 1px border + a 1px outer shadow of the same colour, with
     no layout jump. Only the CONTROL's focus is targeted (not :focus-within): when
     an internal button (clear, icon) has keyboard focus, only its own outline
     lights up — otherwise two simultaneous indicators, unreadable.
     :focus (not :focus-visible): a text field always shows its focus, mouse included.
     The transparent outline is the forced-colors safety net (Windows High Contrast drops
     box-shadows). */
  .v-textarea-field:has(.v-textarea-control:focus) {
    --field-border-color: var(--vectis-color-accent);

    box-shadow: 0 0 0 1px var(--field-border-color);
    outline: var(--vectis-focus-ring-width) solid transparent;
  }

  /* Invalid state: the native pseudo-class first, the prop (aria-invalid) second.
     Only the variable changes → both the border AND the focus ring go red. */
  .v-textarea-field:has(.v-textarea-control:user-invalid),
  .v-textarea-field:has(.v-textarea-control[aria-invalid='true']) {
    --field-border-color: var(--vectis-color-danger);
  }

  /* Internal buttons (clear, clickable icon): dark grey → black on hover, radius
     aligned with VButton (a square focus ring with rounded edges). The negative
     margin is DERIVED, never a literal: it is exactly the half-difference that
     centres the icon in the (wider) action box, so it cancels that inset and the
     glyph lands where a decorative .v-icon would — on the field's padding, and one
     --control-gap away from its neighbour. */
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

  /* Disabled: a grey shade with no opacity (the same tokens as VCheckbox/VRadio).
     Last of the state sequence: at equal specificity, it wins over all of them,
     the error included — a disabled field is not submitted, so it has nothing to
     report. */
  .v-textarea[data-disabled] .v-textarea-field {
    --field-border-color: var(--vectis-color-border);

    background: var(--vectis-color-surface-muted);
    color: var(--vectis-color-text-subtle);
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

  /* 100% CSS auto-grow: the control's height follows the content (progressive
     enhancement) and the field follows; no resize handle */
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
