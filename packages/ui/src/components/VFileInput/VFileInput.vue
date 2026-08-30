<script setup lang="ts">
// @core
/**
 * Choosing files, presented as an ordinary form field: a read-only text field showing
 * what was picked, with the real file input hidden behind it. It is the shape of a
 * read-only date picker, without the panel.
 *
 * What was chosen is reported as a plain list of files, which is what lets a consumer
 * build whatever preview they like from it.
 *
 * The JavaScript here is imposed by the platform rather than chosen. A file dialog opens
 * ONLY from a real click on a real file input, and the list of files it holds cannot be
 * written from a template — so the visible field can never BE the native control, and
 * that control can only ever be a SOURCE of files, never a mirror of the value.
 *
 * Everything else follows from those two facts: the clicks and keys relayed to the
 * hidden input, the reset of that input after every change — without which the same file
 * cannot be picked twice in a row — and the screening of incoming files in code, since
 * the `accept` attribute has no say whatsoever over a drop.
 */
import { computed, ref, useId, watchEffect } from 'vue'

import VChip from '../VChip/VChip.vue'
import { attach_file as attachFileIcon } from '../VIcon/icons/attach_file'
import type { IconSource } from '../VIcon/types'
import VInput from '../VInput/VInput.vue'
import VTypography from '../VTypography/VTypography.vue'

import { useFileDrop } from '../../composables/useFileDrop'
import { useFileField } from '../../composables/useFileField'
import { useRootAttrs } from '../../composables/useRootAttrs'
import { useLocale, useMessages } from '../../i18n/state'
import { chipScaleFor } from '../../utils/chip'
import { isDev } from '../../utils/env'
import { formatBytes } from '../../utils/file'
import { truncateMiddle } from './truncate'

/** How the chosen files are shown inside the field when several are allowed. */
export type FileInputDisplay = 'text' | 'chip'

/** Why a file was turned away: its kind, its size, how many there already are, or the total. */
export type FileInputRejectReason = 'type' | 'size' | 'count' | 'total-size'

/** One file that was turned away, and the reason it was. */
export interface FileInputRejection {
  /** The file itself, so a message can name it. */
  file: File
  /** What it fell foul of. */
  reason: FileInputRejectReason
}

interface FileInputProps {
  /** Allows several files to be chosen. With one only, every extra file is turned away. */
  multiple?: boolean
  /**
   * Which kinds of file are accepted, in the browser's own syntax (`image/*,.pdf`).
   *
   * It is applied TWICE, and it has to be: as an attribute, which is what filters the
   * system's file dialog, and again in code, which is the only thing that can filter a
   * file DROPPED on the component — the attribute has no say over a drop.
   */
  accept?: string
  /**
   * How the chosen files are shown: their names joined by commas, or one dismissible
   * chip each. It only means something when several files are allowed; a single name is
   * always text.
   */
  display?: FileInputDisplay
  /** The largest ONE file may be, in bytes. */
  maxSize?: number
  /** The largest the whole selection may be, in bytes. */
  maxTotalSize?: number
  /** How many files may be chosen at most. */
  maxFiles?: number
  /** Shows how much has been chosen under the field: "3 files (1.2 MB)". */
  counter?: boolean
  /** The icon at the end of the field, which opens the file dialog. */
  attachIcon?: IconSource
  /** Accepts files dropped onto the component, as well as chosen through the dialog. */
  droppable?: boolean
  /** The height of the field: 32, 40 or 48 pixels. */
  size?: 'sm' | 'md' | 'lg'
  /** Takes 4px off the height, leaving the padding, the text and the icons as they are. */
  compact?: boolean
  /** Makes the field unusable, greyed out through the colour tokens. */
  disabled?: boolean
  /**
   * Shows what was chosen without allowing it to change: no dialog, no drop, no removal.
   */
  readonly?: boolean
  /**
   * Marks the field as invalid — for a rule of your own, since nothing here is checked
   * by the browser.
   */
  invalid?: boolean
  /** The label above the field, tied to it so that clicking it focuses the field. */
  label?: string
  /**
   * A line of help under the field, to the left of the counter. It is tied to the field
   * for assistive technology.
   */
  hint?: string
  /**
   * What the field says while nothing is chosen. It falls back to the design system
   * dictionary.
   */
  placeholder?: string
  /** Offers a cross that empties the selection. */
  clearable?: boolean
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<FileInputProps>(), {
  multiple: false,
  accept: undefined,
  display: 'text',
  maxSize: undefined,
  maxTotalSize: undefined,
  maxFiles: undefined,
  counter: false,
  attachIcon: () => attachFileIcon,
  droppable: true,
  size: 'md',
  compact: false,
  disabled: false,
  readonly: false,
  invalid: false,
  label: undefined,
  hint: undefined,
  placeholder: undefined,
  // On by default, unlike an ordinary field: what is in a picker cannot be erased by
  // typing, so without the cross there would be no way to empty it — the same reasoning
  // as in a read-only date picker.
  clearable: true,
})

const emit = defineEmits<{
  /** The reader changed the selection — added something, removed something, cleared it. */
  change: [files: File[]]
  /**
   * A file was turned away and never joined the selection. It is emitted once PER file,
   * so a batch drop can be reported precisely.
   */
  reject: [rejection: FileInputRejection]
  /** The clear cross emptied the selection. */
  clear: []
}>()

defineSlots<{
  /**
   * Replaces the chip standing for one file.
   *
   * Three of the values it receives are what make it usable without regressions:
   * `label` is the name already shortened in the MIDDLE so that its extension survives,
   * `remove` is what takes the file out — without it the file could no longer be removed
   * at all — and the size and density are the ones worked out to sit inside the field,
   * which cannot be guessed from outside.
   */
  chip?(props: {
    file: File
    index: number
    label: string
    remove: () => void
    size: 'xs' | 'sm'
    compact: boolean
  }): unknown
  /**
   * Replaces the counter under the field. `text` is the sentence already built and
   * translated; the count and the total size are there for a wording of your own.
   */
  counter?(props: { count: number; size: number; text: string }): unknown
}>()

/**
 * Always a LIST of files, whether or not several are allowed — never a file on its own.
 * The shape of the value does not depend on a prop, so a consumer never has to narrow a
 * union TypeScript has no way of discriminating. With a single file it is simply a list
 * of at most one.
 */
const model = defineModel<File[]>({ default: () => [] })

const { attrs, rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

const m = useMessages()
const locale = useLocale()

/*
 * The hidden input, the sorting of the consumer's attributes and the single entry point
 * into the value all live in `useFileField`, shared with VFilePicker.
 *
 * Here, the bucket meant for "the control the user deals with" goes to the visible
 * field: that is what they see, focus and click, so a consumer's own `<label for>` has
 * to point at it. The description attribute is pulled out of that bucket, because this
 * component re-assembles it further down.
 */
const {
  fileEl,
  nativeAttrs,
  controlAttrs: fieldAttrs,
  acceptFiles,
  onNativeChange,
  openPicker,
  resetNative,
} = useFileField({
  model,
  forwardedAttrs,
  enabled: () => !props.disabled && !props.readonly,
  multiple: () => props.multiple,
  limits: () => ({
    accept: props.accept,
    maxSize: props.maxSize,
    maxFiles: props.maxFiles,
    maxTotalSize: props.maxTotalSize,
  }),
  onReject: (rejection) => emit('reject', rejection),
  onChange: (files) => emit('change', files),
  excludeFromControl: ['aria-describedby'],
})

const inputRef = ref<InstanceType<typeof VInput> | null>(null)

// Chips only mean something for a list: a single file always shows as plain text.
const resolvedDisplay = computed<FileInputDisplay>(() => (props.multiple ? props.display : 'text'))

const displayText = computed(() =>
  resolvedDisplay.value === 'chip' ? '' : model.value.map((file) => file.name).join(', '),
)

const placeholderText = computed(() =>
  model.value.length > 0 ? undefined : (props.placeholder ?? m.value.fileInput.placeholder),
)

/*
 * Whether the clear cross is shown has to be answered EXPLICITLY here. The visible field
 * is read-only, and a read-only field hides its cross by default — rightly so, since its
 * text cannot be edited. Here the value comes from the file dialog rather than from
 * typing, so there is something to clear all the same.
 */
const canClear = computed(
  () => props.clearable && !props.disabled && !props.readonly && model.value.length > 0,
)

// @a11y @devwarn
/*
 * The icon disappears along with what it offers: a read-only field opens no dialog, so
 * an icon inviting one would be a lie — the same rule VDateInput follows for its
 * calendar.
 *
 * TRAP — its LABEL stays defined at all times, even when no icon is rendered. The helper
 * that detects a click handler on an icon warns AT SETUP if one is attached without a
 * label, and it has no way of knowing whether an icon exists.
 */
const endIcon = computed<IconSource | undefined>(() =>
  props.readonly ? undefined : props.attachIcon,
)

const totalSize = computed(() => model.value.reduce((sum, file) => sum + file.size, 0))

/*
 * The counter is assembled from three sources: the WORD comes from the dictionary, since
 * it is language; the SIZE is formatted by the platform, which knows the local
 * conventions; and the parentheses come from neither, being punctuation every language
 * shares — the same boundary VBadge's "99+" falls on.
 *
 * With nothing chosen it states the count alone: "0 files ()" would be noise.
 */
const counterText = computed(() => {
  const word = m.value.fileInput.files(model.value.length)
  return model.value.length === 0 ? word : `${word} (${formatBytes(totalSize.value, locale.value)})`
})

const hintId = useId()
const counterId = useId()

// @a11y
/*
 * What describes the field for a screen reader is a LIST of references, assembled here
 * rather than by VInput: the hint belongs to OUR row under the field, VInput having no
 * such row — its own counter sits inside the field.
 *
 * The counter is deliberately part of that list, unlike in VTextarea. When the files are
 * shown as chips the field's own text is EMPTY, and the counter is then the only spoken
 * summary of what has been chosen.
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

// The size, the density and the HEIGHT of the chips sitting inside the field, worked out
// once in `utils/chip.ts` and shared with VCombobox. The height is set inline rather than
// restated as a table of CSS rules: it belongs to the chips' own subtree, out of the
// field's reach, and the field has to force its input to that same height or it grows
// when focused.
const chipScale = computed(() => chipScaleFor(props.size, props.compact))

/**
 * What a chip shows for a file. The name is shortened in the MIDDLE rather than cut off
 * at the end, for two reasons.
 *
 * The chips WRAP, so there is no line for a long name to overflow: left whole it would
 * simply push the field onto two or three rows. And cutting the middle preserves the
 * extension, which is what tells the reader what kind of file it is — an ellipsis at the
 * end drops it first.
 *
 * The full name is never lost: the removal button is named with it, and the chip carries
 * it as a tooltip whenever the label was actually shortened.
 */
const chipLabel = (file: File) => truncateMiddle(file.name)

function onControlClick(event: MouseEvent) {
  // The field's own buttons already handle their clicks, and the click also reaches the
  // field itself. Without this guard the attach icon would open the dialog TWICE, and
  // the clear cross would reopen it immediately after emptying the selection.
  if ((event.target as HTMLElement).closest('button')) return
  openPicker()
}

function onFieldKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  // Cancelling the default on Enter also stops the form from being submitted: a
  // read-only text field is still a field, and Enter in one submits the form around it.
  event.preventDefault()
  openPicker()
}

function removeAt(index: number) {
  model.value = model.value.filter((_, i) => i !== index)
  resetNative()
  emit('change', model.value)
  // The removal button disappears along with its chip, so the focus would fall back to
  // the page body. Unlike the date and time pickers, nothing here opens on focus, so
  // this needs no guard against re-entering.
  inputRef.value?.focus()
}

/**
 * Empties the selection, and the hidden input with it — without that reset the same file
 * could not be chosen again straight afterwards.
 */
function clearValue() {
  model.value = []
  resetNative()
  emit('clear')
  emit('change', model.value)
}

/* Files may be dropped on the component itself; there is no separate drop area here —
   that is what VFilePicker is for. */
const { dragging, onDragEnter, onDragOver, onDragLeave, onDrop } = useFileDrop(
  () => props.droppable && !props.disabled && !props.readonly,
  acceptFiles,
)

// @devwarn
if (isDev) {
  watchEffect(() => {
    if (props.display === 'chip' && !props.multiple)
      console.warn(
        '[VFileInput] display="chip" ignored without `multiple`: a single file shows as text.',
      )
    if (props.maxFiles !== undefined && !props.multiple)
      console.warn(
        '[VFileInput] `maxFiles` ignored without `multiple`: single mode already caps at one file.',
      )
    if (attrs.required !== undefined)
      console.warn(
        '[VFileInput] `required` lands on the hidden file input, which is not focusable: the browser blocks submission with no visible message. Validate the v-model yourself and use the `invalid` prop.',
      )
  })
}

defineExpose({
  /** Moves the focus to the visible field. */
  focus: (options?: FocusOptions) => inputRef.value?.focus(options),
  /**
   * Opens the file dialog. It only works when called from something the reader did — a
   * click, a key press: browsers refuse to open a file dialog by themselves.
   */
  open: openPicker,
})
</script>

<template>
  <div
    class="v-file-input"
    :class="rootClass"
    :style="[{ '--chip-height': chipScale.height }, rootStyle]"
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
      class="v-file-input-native"
      tabindex="-1"
      aria-hidden="true"
      :accept="accept"
      :multiple="multiple || undefined"
      :disabled="disabled || undefined"
      @change="onNativeChange"
    />

    <div class="v-file-input-control" @click="onControlClick">
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
        :clear-label="m.fileInput.clear"
        :icon-end="endIcon"
        :icon-end-label="m.fileInput.attach"
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
              :size="chipScale.size"
              :compact="chipScale.compact"
            >
              <VChip
                tone="accent"
                :size="chipScale.size"
                :compact="chipScale.compact"
                :dismissible="!readonly && !disabled"
                :dismiss-label="m.fileInput.remove(file.name)"
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

    <div v-if="hint || counter" class="v-file-input-meta">
      <VTypography
        v-if="hint"
        :id="hintId"
        variant="caption"
        tone="muted"
        class="v-file-input-hint"
      >
        {{ hint }}
      </VTypography>
      <span v-if="counter" :id="counterId" class="v-file-input-counter">
        <slot name="counter" :count="model.length" :size="totalSize" :text="counterText">
          {{ counterText }}
        </slot>
      </span>
    </div>
  </div>
</template>

<style>
@layer vectis.components {
  /* Positioned so the hidden file input, which has no size at all, has something to be
     placed against. */
  .v-file-input {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-1);
    width: 100%;
    font-family: var(--vectis-text-family);
  }

  /* The real file input is a SOURCE of files and not a control anyone deals with. It is
     hidden with `opacity` and never with `display: none`, the design system's rule for a
     hidden form control, which has to stay submittable; it is given no size and made
     deaf to the pointer, so it can never swallow a click meant for the field. Taking it
     out of the tab order and hiding it from screen readers, in the template, is what
     leaves the visible field as the single stop and the single announcement. */
  .v-file-input-native {
    position: absolute;
    inline-size: 0;
    block-size: 0;
    opacity: 0;
    pointer-events: none;
  }

  .v-file-input:not([data-disabled]):not([data-readonly]) .v-file-input-control,
  .v-file-input:not([data-disabled]):not([data-readonly])[data-display='text'] .v-input-control {
    cursor: pointer;
  }

  /* An ellipsis DOES work on an input, and a read-only one never scrolls by itself, so a
     long list of names is simply cut short. No tooltip is added for the rest: it would be
     announced as a description repeating the value the field already shows, and the
     complete list is what the model is for. */
  .v-file-input[data-display='text'] .v-input-control {
    text-overflow: ellipsis;
  }

  /* While a file is being dragged over it, the field is highlighted by redefining the
     very variable VInput uses for its own border colour — so the two can never disagree.
     The selector is one step more specific than VInput's, which is what makes it win
     whatever order the two sheets end up in. */
  .v-file-input[data-dragging] .v-input-field {
    --field-border-color: var(--vectis-color-accent);

    background: var(--vectis-color-accent-surface);
  }

  /* Shown as chips, the field holds them and lets them WRAP onto several rows, so it
     grows instead of scrolling.

     Two things have to be forced for that to hold together. The input inside is given
     the chips' own height rather than the full height it inherits, or its natural height
     would stretch every row it shares. And the padding at the end reserves exactly the
     room the icons take, since those are lifted out of the wrapping flow just below.

     That reservation is written as what the flow itself produces when the files are
     shown as text and nothing is lifted out: one glyph's width per action from the
     field's padding, one gap between two of them. It reads from the same two variables
     as the insets further down, so the room reserved and the glyphs it protects cannot
     drift apart. */
  .v-file-input[data-display='chip'] .v-input-field {
    position: relative;
    flex-wrap: wrap;
    height: auto;
    min-height: var(--control-height);
    padding-block: var(--vectis-space-1);
    padding-inline-end: calc(
      var(--control-padding-inline-field) + var(--vectis-icon-size) + var(--control-gap)
    );
  }

  .v-file-input[data-display='chip'][data-can-clear] .v-input-field {
    padding-inline-end: calc(
      var(--control-padding-inline-field) + 2 * var(--vectis-icon-size) + 2 * var(--control-gap)
    );
  }

  .v-file-input[data-display='chip'] .v-input-control {
    height: var(--chip-height);
  }

  /* The two icons are lifted out of the wrapping flow — the same recipe VCombobox uses —
     so that they stay pinned to the end of the field and vertically centred whatever the
     chips do. VInput renders the clear cross FIRST and the end icon after it, which is
     why the icon has to be addressed by excluding the cross. */
  .v-file-input[data-display='chip'] .v-input-clear,
  .v-file-input[data-display='chip'] .v-input-action:not(.v-input-clear) {
    position: absolute;
    top: 50%;
    translate: 0 -50%;
  }

  .v-file-input[data-display='chip'] .v-input-action:not(.v-input-clear) {
    inset-inline-end: var(--control-padding-inline-field);
  }

  /* This is the ONE place where the spacing between the two icons has to be written by
     hand. Everywhere else the field's own flow produces it for free, and the two must
     agree, or the same component would show two different gaps depending on how the
     files are displayed.

     So it is written as exactly what that flow produces: the end icon occupies one
     glyph's width from the field's padding, then one gap separates the two.

     TRAP — this reads in GLYPHS and not in buttons. VInput gives its inner buttons a
     negative margin equal to half the difference between the two, which makes an inset
     land on the glyph's edge rather than on the button's. Measuring in button widths
     instead pushes the cross a whole gap too far, with nothing anywhere to signal it. */
  .v-file-input[data-display='chip'] .v-input-clear {
    inset-inline-end: calc(
      var(--control-padding-inline-field) + var(--vectis-icon-size) + var(--control-gap)
    );
  }

  .v-file-input-meta {
    display: flex;
    align-items: baseline;
    gap: var(--vectis-space-2);
  }

  /* The counter stays styled locally: tabular-nums is not a typographic role.
     No overflow state — an over-limit file never enters the model, so the
     counter cannot overflow. */
  .v-file-input-counter {
    margin-inline-start: auto;
    font-size: var(--vectis-text-caption-size);
    color: var(--vectis-color-text-muted);
    font-variant-numeric: tabular-nums;
  }

  .v-file-input[data-disabled] .v-file-input-hint,
  .v-file-input[data-disabled] .v-file-input-counter {
    color: var(--vectis-color-text-subtle);
  }
}
</style>
