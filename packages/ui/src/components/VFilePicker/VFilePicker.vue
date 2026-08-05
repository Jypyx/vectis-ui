<script setup lang="ts">
/**
 * File selection: a hidden native `<input type="file">` and a read-only `VInput`
 * as the visible field — the `VDatePicker mode="readonly"` shape, minus the
 * popover. The selection is reported as a plain `File[]` v-model, which is what
 * lets the consumer build its own preview.
 *
 * The behavioural JS is forced by the platform, not chosen (philosophy rule 1):
 * a file dialog opens ONLY from a real click on an `<input type="file">`, and a
 * `FileList` cannot be written from a template — so the visible field can never
 * be the native control, and the native control can only ever be a SOURCE of
 * files, never a mirror of the model. Everything else follows: the click and key
 * relays, the reset of `input.value` (without which the same file cannot be
 * picked twice), and the acceptance pipeline — which has to exist in JS because
 * `accept` has no say over a drop.
 */
import { computed, ref, useId, watchEffect } from 'vue'

import VChip from '../VChip/VChip.vue'
import type { IconSource } from '../VIcon/types'
import VInput from '../VInput/VInput.vue'
import VTypography from '../VTypography/VTypography.vue'

import { useFileDrop } from '../../composables/useFileDrop'
import { useRootAttrs } from '../../composables/useRootAttrs'
import { useLocale, useMessages } from '../../i18n/state'
import { isDev } from '../../utils/env'
import { formatBytes, screenFiles } from '../../utils/file'
import { truncateMiddle } from './truncate'

/** Rendering of the selection inside the field, in `multiple` mode. */
export type FilePickerDisplay = 'text' | 'chip'

/** Why a file never entered the model. */
export type FilePickerRejectReason = 'type' | 'size' | 'count' | 'total-size'

/** Payload of the `reject` event: one per refused file. */
export interface FilePickerRejection {
  file: File
  reason: FilePickerRejectReason
}

interface FilePickerProps {
  /** Several files at once. In single mode every extra file is refused with `count`. */
  multiple?: boolean
  /**
   * Accepted types, in the native syntax (`image/*,.pdf`). Applied TWICE: as the
   * attribute, which filters the OS dialog, and in JS, which is the only thing
   * that filters a drop — the attribute has no say there.
   */
  accept?: string
  /**
   * Rendering of the selection: `text` (the default) joins the names with commas
   * inside the field, `chip` renders one dismissible VChip per file. Ignored
   * outside `multiple`, where a single name is always text.
   */
  display?: FilePickerDisplay
  /** Maximum size of ONE file, in bytes. Above it: refused with `size`. */
  maxSize?: number
  /** Maximum cumulated size of the selection, in bytes. Above it: refused with `total-size`. */
  maxTotalSize?: number
  /** Maximum number of files (`multiple` only). Beyond it: refused with `count`. */
  maxFiles?: number
  /** Counter under the field, on the right: "3 files (1.2 MB)". */
  counter?: boolean
  /** End icon, which opens the file dialog. Absent when readonly. */
  attachIcon?: IconSource
  /** Accepts files dropped on the component. */
  droppable?: boolean
  /** Field height: sm 32px, md 40px (the default), lg 48px. */
  size?: 'sm' | 'md' | 'lg'
  /** Height reduced by 4px; padding, type and icons unchanged. */
  compact?: boolean
  disabled?: boolean
  /** The selection is displayed but can no longer change: no dialog, no drop, no cross. */
  readonly?: boolean
  /** Forces the invalid state (your own validation) — sets aria-invalid. */
  invalid?: boolean
  /** Label above the field, associated through for/id. */
  label?: string
  /** Help text under the field, to the left of the counter, linked through aria-describedby. */
  hint?: string
  /** Text of the empty field. Default: the DS dictionary. */
  placeholder?: string
  /** Cross that empties the selection. */
  clearable?: boolean
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<FilePickerProps>(), {
  multiple: false,
  accept: undefined,
  display: 'text',
  maxSize: undefined,
  maxTotalSize: undefined,
  maxFiles: undefined,
  counter: false,
  attachIcon: 'attach_file',
  droppable: true,
  size: 'md',
  compact: false,
  disabled: false,
  readonly: false,
  invalid: false,
  label: undefined,
  hint: undefined,
  placeholder: undefined,
  // The value of a picker cannot be erased by typing (the VDatePicker choice).
  clearable: true,
})

const emit = defineEmits<{
  /** The selection changed through a user action (addition, removal, clear). */
  change: [files: File[]]
  /** A file was refused and never entered the model — one event per file. */
  reject: [rejection: FilePickerRejection]
  /** The clear cross emptied the selection. */
  clear: []
}>()

defineSlots<{
  /**
   * A file's chip in `display="chip"` (default: a dismissible `VChip` carrying
   * the name). `label` is the name shortened to fit a row (middle-truncated),
   * and `size`/`compact` are the ones computed to fit inside the field — reuse
   * all three to keep the template.
   */
  chip?(props: {
    file: File
    index: number
    label: string
    remove: () => void
    size: 'xs' | 'sm'
    compact: boolean
  }): unknown
  /** The counter's content. `text` is the ready-made string, `size` a byte count. */
  counter?(props: { count: number; size: number; text: string }): unknown
}>()

/**
 * Always a `File[]`, `multiple` or not: the shape of the model does not depend
 * on a prop, so a consumer never has to narrow a union that TypeScript cannot
 * discriminate. Single mode is a list of at most one.
 */
const model = defineModel<File[]>({ default: () => [] })

const { attrs, rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

/*
 * The wrapper-root pattern assumes ONE functional element; there are two here,
 * so the split has three buckets. `class`/`style` stay on the root, and the rest
 * is arbitrated by MEANING: the hidden file input is what the FORM sees (`name`,
 * `required`, `form`, `capture` describe submission and the OS picker), the
 * VInput is what the USER sees and focuses (`id`, the `aria-*`, `title`, the
 * `data-*`, every listener — a consumer's `<label for>` has to point at what
 * actually takes focus).
 *
 * The buckets are a PARTITION: nothing is applied twice. A duplicated `id` or
 * `aria-label` would break `for` and have the field announced twice.
 */
const NATIVE_ONLY = ['name', 'required', 'form', 'capture']

const nativeAttrs = computed(() =>
  Object.fromEntries(
    Object.entries(forwardedAttrs.value).filter(([key]) => NATIVE_ONLY.includes(key)),
  ),
)

const fieldAttrs = computed(() =>
  Object.fromEntries(
    Object.entries(forwardedAttrs.value).filter(
      // `aria-describedby` is pulled out of both: it is re-aggregated below, and
      // an explicit binding placed after `v-bind` would silently overwrite the
      // consumer's in mergeProps.
      ([key]) => !NATIVE_ONLY.includes(key) && key !== 'aria-describedby',
    ),
  ),
)

const m = useMessages()
const locale = useLocale()

const fileEl = ref<HTMLInputElement | null>(null)
const inputRef = ref<InstanceType<typeof VInput> | null>(null)

// `chip` only means something for a list: a single file always shows as text.
const resolvedDisplay = computed<FilePickerDisplay>(() => (props.multiple ? props.display : 'text'))

const displayText = computed(() =>
  resolvedDisplay.value === 'chip' ? '' : model.value.map((file) => file.name).join(', '),
)

const placeholderText = computed(() =>
  model.value.length > 0 ? undefined : (props.placeholder ?? m.value.filePicker.placeholder),
)

/*
 * `clearVisible` is indispensable: the field is read-only, and VInput then hides
 * the cross unless the consumer answers explicitly — here the value comes from
 * the dialog, never from typing.
 */
const canClear = computed(
  () => props.clearable && !props.disabled && !props.readonly && model.value.length > 0,
)

/*
 * The icon disappears with the affordance (the VDatePicker rule): read-only,
 * there is nothing to open. Its LABEL, on the other hand, stays defined at all
 * times — `useIconClickHandlers` warns AT SETUP as soon as a `@click:icon-end`
 * listener is attached without one, with no way to know whether an icon exists.
 */
const endIcon = computed<IconSource | undefined>(() =>
  props.readonly ? undefined : props.attachIcon,
)

const totalSize = computed(() => model.value.reduce((sum, file) => sum + file.size, 0))

/*
 * The WORD comes from the dictionary, the SIZE from Intl, the parentheses from
 * neither — universal punctuation, the same boundary as VBadge's `99+`. Empty,
 * the counter states the count alone: "0 files ()" would be noise.
 */
const counterText = computed(() => {
  const word = m.value.filePicker.files(model.value.length)
  return model.value.length === 0 ? word : `${word} (${formatBytes(totalSize.value, locale.value)})`
})

const hintId = useId()
const counterId = useId()

/*
 * `aria-describedby` is a LIST of IDREFs, and the hint belongs to OUR meta row
 * (VInput has no bottom row — its counter sits inside the field), so the
 * aggregation happens here rather than in VInput's `useFieldIds`.
 *
 * The counter is part of it, deliberately unlike VTextarea: in `display="chip"`
 * the field's value is empty, and the counter is then the only textual summary
 * of the state.
 */
const describedBy = computed(
  () =>
    [
      attrs['aria-describedby'] as string | undefined,
      props.hint ? hintId : undefined,
      props.counter ? counterId : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined,
)

/*
 * Chips one step below the field so they fit without making it grow (the
 * VCombobox mapping): xs up to `md`, sm at `lg`, the catch-up below the lowest
 * step of each pair going through `compact`. Any change here must be carried
 * over to the `--chip-height` rules in the CSS: that height lives inside the
 * VChip subtree, out of the field's reach.
 */
const chipSize = computed(() => (props.size === 'lg' ? 'sm' : 'xs'))
const chipCompact = computed(() => (props.size === 'lg' ? props.compact : props.size === 'sm'))

/**
 * A chip's visible label. Middle truncation rather than the field's
 * `text-overflow`, because chips WRAP: there is no line to overflow, and a long
 * name would simply push the field to two or three rows. Cutting the middle also
 * keeps the extension, which `text-overflow` drops first.
 *
 * The full name is never lost: the removal button's accessible name carries it,
 * and a `title` is set on the chip below whenever the label was actually cut.
 */
const chipLabel = (file: File) => truncateMiddle(file.name)

/**
 * The native input keeps the FileList of its last dialog. Without this reset,
 * re-picking the SAME file after a clear or a removal fires NO `change` (the
 * control's value never moved) and that file becomes unreachable. Every path
 * that touches the selection goes through here — a fully rejected batch
 * included, since a file refused once must stay re-pickable.
 */
function resetNative() {
  if (fileEl.value) fileEl.value.value = ''
}

/**
 * The single gate into the model: the native dialog and a drop both land here.
 * An over-limit file is REFUSED — it never enters the model, and each refusal is
 * reported through `reject`. No `setCustomValidity`: the visible field is
 * read-only, hence barred from constraint validation.
 *
 * The screening itself is pure (`utils/file.ts`), which is what keeps the order
 * of the refusals — a contract this component's docs state — testable without a
 * mount.
 */
function acceptFiles(incoming: File[]) {
  const current = props.multiple ? model.value : []
  const { accepted, rejected } = screenFiles(incoming, current, {
    accept: props.accept,
    maxSize: props.maxSize,
    // Single mode is a list capped at one: every extra file is refused with `count`.
    maxFiles: props.multiple ? props.maxFiles : 1,
    maxTotalSize: props.maxTotalSize,
  })

  for (const rejection of rejected) emit('reject', rejection)

  resetNative()
  if (accepted.length === 0) return

  model.value = [...current, ...accepted]
  emit('change', model.value)
}

function onNativeChange(event: Event) {
  acceptFiles([...((event.target as HTMLInputElement).files ?? [])])
}

/**
 * The one imperative call the component cannot avoid. `.click()` and NOT
 * `showPicker()`: both need a transient user activation, but `showPicker()`
 * additionally THROWS without one (and in a cross-origin iframe) where
 * `.click()` is simply inert — for nothing extra on a file input.
 */
function openPicker() {
  if (props.disabled || props.readonly) return
  fileEl.value?.click()
}

function onControlClick(event: MouseEvent) {
  // The field's own buttons carry their own handlers: without this guard the
  // attach icon would open the dialog twice, and the clear cross would reopen it
  // right after emptying.
  if ((event.target as HTMLElement).closest('button')) return
  openPicker()
}

function onFieldKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  // preventDefault on Enter also cancels the implicit submission: a read-only
  // text field is still a submit trigger.
  event.preventDefault()
  openPicker()
}

function removeAt(index: number) {
  model.value = model.value.filter((_, i) => i !== index)
  resetNative()
  emit('change', model.value)
  // The removal button vanishes with the chip, so focus would fall back to
  // <body>. Nothing opens on focus here, so no re-entrance guard is needed.
  inputRef.value?.focus()
}

/** VInput's `clear` event: the whole selection goes, the native input with it. */
function clearValue() {
  model.value = []
  resetNative()
  emit('clear')
  emit('change', model.value)
}

/* Drag & drop on the component itself, no separate dropzone. */
const { dragging, onDragEnter, onDragOver, onDragLeave, onDrop } = useFileDrop(
  () => props.droppable && !props.disabled && !props.readonly,
  acceptFiles,
)

if (isDev) {
  watchEffect(() => {
    if (props.display === 'chip' && !props.multiple)
      console.warn(
        '[VFilePicker] display="chip" ignored without `multiple`: a single file shows as text.',
      )
    if (props.maxFiles !== undefined && !props.multiple)
      console.warn(
        '[VFilePicker] `maxFiles` ignored without `multiple`: single mode already caps at one file.',
      )
    if (attrs.required !== undefined)
      console.warn(
        '[VFilePicker] `required` lands on the hidden file input, which is not focusable: the browser blocks submission with no visible message. Validate the v-model yourself and use the `invalid` prop.',
      )
  })
}

/** The visible field — refocusing it after a removal, or from the consumer. */
defineExpose({
  focus: (options?: FocusOptions) => inputRef.value?.focus(options),
  /** Opens the file dialog. Only works from a user gesture (browser rule). */
  open: openPicker,
})
</script>

<template>
  <div
    class="v-file-picker"
    :class="rootClass"
    :style="rootStyle"
    :data-size="size"
    :data-compact="compact ? '' : undefined"
    :data-display="resolvedDisplay"
    :data-disabled="disabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
    :data-dragging="dragging ? '' : undefined"
    :data-can-clear="canClear ? '' : undefined"
    @dragenter="onDragEnter"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <input
      v-bind="nativeAttrs"
      ref="fileEl"
      type="file"
      class="v-file-picker-native"
      tabindex="-1"
      aria-hidden="true"
      :accept="accept"
      :multiple="multiple || undefined"
      :disabled="disabled || undefined"
      @change="onNativeChange"
    />

    <div class="v-file-picker-control" @click="onControlClick">
      <VInput
        v-bind="fieldAttrs"
        ref="inputRef"
        :model-value="displayText"
        readonly
        :label="label"
        :placeholder="placeholderText"
        :size="size"
        :compact="compact"
        :disabled="disabled"
        :invalid="invalid"
        :clearable="clearable"
        :clear-visible="canClear"
        :clear-label="m.filePicker.clear"
        :icon-end="endIcon"
        :icon-end-label="m.filePicker.attach"
        :aria-describedby="describedBy"
        @click:icon-end="openPicker"
        @clear="clearValue"
        @keydown="onFieldKeydown"
      >
        <template v-if="resolvedDisplay === 'chip'" #start>
          <template v-for="(file, index) in model" :key="`${index}-${file.name}`">
            <slot
              name="chip"
              :file="file"
              :index="index"
              :label="chipLabel(file)"
              :remove="() => removeAt(index)"
              :size="chipSize"
              :compact="chipCompact"
            >
              <VChip
                tone="accent"
                :size="chipSize"
                :compact="chipCompact"
                :dismissible="!readonly && !disabled"
                :dismiss-label="m.filePicker.remove(file.name)"
                :disabled="disabled"
                :title="chipLabel(file) === file.name ? undefined : file.name"
                @dismiss="removeAt(index)"
                >{{ chipLabel(file) }}</VChip
              >
            </slot>
          </template>
        </template>
      </VInput>
    </div>

    <div v-if="hint || counter" class="v-file-picker-meta">
      <VTypography
        v-if="hint"
        :id="hintId"
        variant="caption"
        tone="muted"
        class="v-file-picker-hint"
      >
        {{ hint }}
      </VTypography>
      <span v-if="counter" :id="counterId" class="v-file-picker-counter">
        <slot name="counter" :count="model.length" :size="totalSize" :text="counterText">
          {{ counterText }}
        </slot>
      </span>
    </div>
  </div>
</template>

<style>
@layer vectis.components {
  /* position: relative anchors the zero-sized native input. */
  .v-file-picker {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-1);
    width: 100%;
    font-family: var(--vectis-text-family);
  }

  /* The native input is a SOURCE of files, not a control: `opacity: 0` and never
     `display: none` (the DS rule — a hidden form control has to stay
     submittable), zero-sized and pointer-events: none so it never intercepts a
     click meant for the field. `tabindex="-1"` + `aria-hidden` in the template
     keep the read-only VInput the single tab stop and the single announcement. */
  .v-file-picker-native {
    position: absolute;
    inline-size: 0;
    block-size: 0;
    opacity: 0;
    pointer-events: none;
  }

  .v-file-picker:not([data-disabled]):not([data-readonly]) .v-file-picker-control,
  .v-file-picker:not([data-disabled]):not([data-readonly])[data-display='text'] .v-input-control {
    cursor: pointer;
  }

  /* text-overflow DOES apply to an <input>, and a read-only field never scrolls
     on its own. No `title`: it would be announced as a description duplicating
     the value — the full list is what the File[] model is for. */
  .v-file-picker[data-display='text'] .v-input-control {
    text-overflow: ellipsis;
  }

  /* The drag state redefines VInput's own variable, so it can never disagree
     with the focus state. Specificity (0,2,0), out of reach of VInput's (0,1,0):
     the export order stays free. */
  .v-file-picker[data-dragging] .v-input-field {
    --field-border-color: var(--vectis-color-accent);

    background: var(--vectis-color-accent-surface);
  }

  /* chip display: the field hosts the Chips, which wrap. Their height is
     restated here as --chip-height because it lives inside the VChip subtree,
     out of the field's reach: these four rules must stay the exact mirror of
     chipSize/chipCompact in the script. Order is significant — equal
     specificity, so the compact variant comes last. */
  .v-file-picker[data-display='chip'] {
    --chip-height: var(--vectis-control-height-xs);
  }

  .v-file-picker[data-display='chip'][data-size='sm'] {
    --chip-height: calc(var(--vectis-control-height-xs) - var(--vectis-space-1));
  }

  .v-file-picker[data-display='chip'][data-size='lg'] {
    --chip-height: var(--vectis-control-height-sm);
  }

  .v-file-picker[data-display='chip'][data-size='lg'][data-compact] {
    --chip-height: calc(var(--vectis-control-height-sm) - var(--vectis-space-1));
  }

  /* The field grows with the Chips; the input is forced to the Chips' height
     instead of the 100% inherited from VInput, or its intrinsic height would
     stretch every row. The padding reserves the room taken by the end zone,
     which is out of the wrapping flow (below). */
  .v-file-picker[data-display='chip'] .v-input-field {
    position: relative;
    flex-wrap: wrap;
    height: auto;
    min-height: var(--control-height);
    padding-block: var(--vectis-space-1);
    padding-inline-end: calc(
      var(--control-padding-inline-field) + var(--control-action-size) + var(--vectis-space-2)
    );
  }

  .v-file-picker[data-display='chip'][data-can-clear] .v-input-field {
    padding-inline-end: calc(
      var(--control-padding-inline-field) + 2 * var(--control-action-size) + var(--vectis-space-2)
    );
  }

  .v-file-picker[data-display='chip'] .v-input-control {
    height: var(--chip-height);
  }

  /* The end zone taken out of the wrapping flow (the VCombobox recipe): the
     cross and the attach icon stay right-aligned and vertically centred whatever
     the Chips do. VInput renders the cross FIRST, then the end slot — hence the
     :not() to address the icon. */
  .v-file-picker[data-display='chip'] .v-input-clear,
  .v-file-picker[data-display='chip'] .v-input-action:not(.v-input-clear) {
    position: absolute;
    top: 50%;
    translate: 0 -50%;
  }

  .v-file-picker[data-display='chip'] .v-input-action:not(.v-input-clear) {
    inset-inline-end: var(--control-padding-inline-field);
  }

  .v-file-picker[data-display='chip'] .v-input-clear {
    inset-inline-end: calc(var(--control-padding-inline-field) + var(--control-action-size));
  }

  .v-file-picker-meta {
    display: flex;
    align-items: baseline;
    gap: var(--vectis-space-2);
  }

  /* The counter stays styled locally: tabular-nums is not a typographic role.
     No overflow state — an over-limit file never enters the model, so the
     counter cannot overflow. */
  .v-file-picker-counter {
    margin-inline-start: auto;
    font-size: var(--vectis-text-caption-size);
    color: var(--vectis-color-text-muted);
    font-variant-numeric: tabular-nums;
  }

  .v-file-picker[data-disabled] .v-file-picker-hint,
  .v-file-picker[data-disabled] .v-file-picker-counter {
    color: var(--vectis-color-text-subtle);
  }
}
</style>
