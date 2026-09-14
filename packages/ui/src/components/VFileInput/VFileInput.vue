<script setup lang="ts">
// @core
/**
 * File selection presented as an ordinary form field: a read-only VInput showing what was
 * picked, with the real file input hidden behind it — VDateInput's `readonly` shape, minus
 * the panel. The v-model is always a `File[]`, `multiple` or not, so a consumer never has to
 * narrow a union TypeScript cannot discriminate.
 *
 * The JS is imposed by the platform, not chosen. A dialog opens ONLY from a real click on a
 * file input, and a `FileList` cannot be written from a template — so the visible field can
 * never BE the native control, and that control is only ever a SOURCE of files.
 *
 * The rest follows: the relayed click, the reset after every change (without which the same
 * file cannot be picked twice running), and screening in code, `accept` having no say over
 * a drop.
 */
import { computed, inject, ref, useId } from 'vue'

import VChip from '../VChip/VChip.vue'
import type { ChipSize } from '../VChip/VChip.vue'
import { attach_file as attachFileIcon } from '../VIcon/icons/attach_file'
import type { IconSource } from '../VIcon/types'
import VInput from '../VInput/VInput.vue'
import { inputGroupKey } from '../VInput/context'
import VTypography from '../VTypography/VTypography.vue'

import { canClear } from '../../composables/useClearable'
import { useControlShape } from '../../composables/useControlShape'
import { useFileDrop } from '../../composables/useFileDrop'
import { useFileField } from '../../composables/useFileField'
import { iconStartListener } from '../../composables/useIconClickHandlers'
import { useRootAttrs } from '../../composables/useRootAttrs'
import { useLocale, useMessages } from '../../i18n/state'
import { chipScaleFor } from '../../utils/chip'
import { isDev } from '../../utils/env'
import { fileKey, formatBytes, type FileRejection } from '../../utils/file'
import { joinIds } from '../../utils/ids'
import { truncateMiddle } from './truncate'

/** How the chosen files are shown inside the field when several are allowed. */
export type FileInputDisplay = 'text' | 'chip'

/** The height of the field: 32, 40 or 48 pixels. */
export type FileInputSize = 'sm' | 'md' | 'lg'

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
  pickerIcon?: IconSource
  /** Refuses files dropped onto the component: only the dialog then adds any. */
  noDrop?: boolean
  /** The height of the field: 32, 40 or 48 pixels. */
  size?: FileInputSize
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
  /**
   * An icon inside the field, at the start. It is rendered before the chips rather than
   * in their place, so it survives a chip display. Decorative by default, it becomes a
   * real button as soon as a `@click:icon-start` listener is attached, in which case it
   * needs `iconStartLabel`.
   */
  iconStart?: IconSource
  /** What the start icon does, in words, once it is clickable. */
  iconStartLabel?: string
  /**
   * What the button at the end of the field does, in words. It names the button
   * `pickerIcon` renders, and falls back to the design system dictionary.
   */
  pickerIconLabel?: string
  /**
   * Shows a spinner at the end of the field, in place of the attach icon — while an
   * upload is under way, typically. It says that something is happening and changes
   * nothing else: files can still be dropped and the dialog still opens.
   */
  loading?: boolean
  /**
   * What screen readers announce while the spinner turns. It falls back to the design
   * system dictionary.
   */
  loadingLabel?: string
  /**
   * Offers a cross that empties the selection. Worth turning on here more than on an
   * ordinary field: what a picker holds cannot be erased by typing, so the cross is the
   * only way back out of a wrong choice.
   */
  clearable?: boolean
  /** What that cross does, in words. It falls back to the design system dictionary. */
  clearLabel?: string
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
  pickerIcon: () => attachFileIcon,
  noDrop: false,
  size: 'md',
  compact: false,
  disabled: false,
  readonly: false,
  invalid: false,
  label: undefined,
  hint: undefined,
  placeholder: undefined,
  iconStart: undefined,
  iconStartLabel: undefined,
  pickerIconLabel: undefined,
  loading: false,
  loadingLabel: undefined,
  clearable: false,
  clearLabel: undefined,
})

const emit = defineEmits<{
  /** The reader changed the selection — added something, removed something, cleared it. */
  change: [files: File[]]
  /**
   * A file was turned away and never joined the selection. It is emitted once PER file,
   * so a batch drop can be reported precisely.
   */
  reject: [rejection: FileRejection]
  /**
   * ONE file was taken out through its chip, with the file and the position it held.
   * `change` follows it with the whole list, as it does after every other change.
   */
  remove: [file: File, index: number]
  /** The clear cross emptied the selection. */
  clear: []
  /** The start icon was clicked. Attaching this listener is what makes it a button. */
  'click:icon-start': [event: MouseEvent]
}>()

defineSlots<{
  /**
   * Content at the start of the field, rendered after the chips standing for the chosen
   * files rather than in their place.
   */
  start?(): unknown
  /**
   * Controls of your own inside the field, placed before the ones the field owns — the
   * clear cross and the icon that opens the file dialog. Those two are this component's
   * own affordance, which is why there is no `#end` here: it would replace them.
   */
  'value-end'?(): unknown
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
    size: ChipSize
    compact: boolean
  }): unknown
  /**
   * Replaces the counter under the field. `text` is the sentence already built and
   * translated; the count and the total size in `bytes` are there for a wording of your own.
   */
  counter?(props: { count: number; bytes: number; text: string }): unknown
}>()

/**
 * Always a LIST of files, whether or not several are allowed — never a file on its own.
 * The shape of the value does not depend on a prop, so a consumer never has to narrow a
 * union TypeScript has no way of discriminating. With a single file it is simply a list
 * of at most one.
 */
const model = defineModel<File[]>({ default: () => [] })

const { attrs, rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

// Declared as this component's own event, `click:icon-start` is out of `$attrs`, so the
// listener is relayed to the field by hand — and only when the consumer wrote one.
const iconStartClick = iconStartListener((event) => emit('click:icon-start', event))

const m = useMessages()
const locale = useLocale()

// A VInputGroup joins several controls into one object, so the shape of this field is the
// row's decision rather than its own (VInput/context.ts). The chips read the resolved pair
// too, or they would come out one step off the field they sit in.
const group = inject(inputGroupKey, null)
const {
  size: resolvedSize,
  compact: resolvedCompact,
  disabled: resolvedDisabled,
} = useControlShape(props, group)

/*
 * The hidden input, the sorting of the consumer's attributes, the single entry point into
 * the value, the removal of a file and the emptying of all of them live in `useFileField`,
 * shared with VFilePicker.
 *
 * Here, the bucket meant for "the control the user deals with" goes to the visible
 * field: that is what they see, focus and click, so a consumer's own `<label for>` has
 * to point at it. The description attribute is pulled out of that bucket, because this
 * component re-assembles it further down.
 */
const {
  fileEl,
  enabled,
  nativeInputAttrs,
  controlAttrs,
  acceptFiles,
  openPicker,
  removeAt,
  clear,
} = useFileField({
  model,
  props,
  emit,
  forwardedAttrs,
  disabled: resolvedDisabled,
  excludeFromControl: ['aria-describedby'],
  onClear: () => emit('clear'),
  // Behind `isDev`, which a production build folds to false, so the message is dropped.
  warnings: isDev
    ? () => [
        props.display === 'chip' &&
          !props.multiple &&
          'display="chip" ignored without `multiple`: a single file shows as text.',
      ]
    : undefined,
})

/** What reaches the visible field: the consumer's own attributes, plus that listener. */
const fieldAttrs = computed(() => ({ ...controlAttrs.value, ...iconStartClick }))

const inputRef = ref<InstanceType<typeof VInput> | null>(null)
const rootEl = ref<HTMLElement | null>(null)

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
const clearVisible = computed(() => canClear(props, resolvedDisabled.value, model.value.length > 0))

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
  props.readonly ? undefined : props.pickerIcon,
)
const endIconLabel = computed(() => props.pickerIconLabel ?? m.value.fileInput.openPicker)
const resolvedClearLabel = computed(() => props.clearLabel ?? m.value.fileInput.clear)

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
const describedBy = computed(() =>
  joinIds(
    attrs['aria-describedby'] as string | undefined,
    !!props.hint && hintId,
    props.counter && counterId,
  ),
)

// The size, the density and the HEIGHT of the chips sitting inside the field, worked out
// once in `utils/chip.ts` and shared with VCombobox. The height is set inline rather than
// restated as a table of CSS rules: it belongs to the chips' own subtree, out of the
// field's reach, and the field has to force its input to that same height or it grows
// when focused.
const chipScale = computed(() => chipScaleFor(resolvedSize.value, resolvedCompact.value))

/**
 * What each chip shows for its file, worked out once per change of the selection rather
 * than on every render, which reads it three times per chip. The name is shortened in the
 * MIDDLE rather than cut off at the end, for two reasons.
 *
 * The chips WRAP, so there is no line for a long name to overflow: left whole it would
 * simply push the field onto two or three rows. And cutting the middle preserves the
 * extension, which is what tells the reader what kind of file it is — an ellipsis at the
 * end drops it first.
 *
 * The full name is never lost: the removal button is named with it, and the chip carries
 * it as a tooltip whenever the label was actually shortened.
 */
// Computed lazily, so a text display, which never reads it, never pays for it.
const chipLabels = computed(() => model.value.map((file) => truncateMiddle(file.name)))

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

function removeFile(index: number) {
  // The removal button disappears along with its chip, so the focus would fall back to
  // the page body. Unlike the date and time pickers, nothing here opens on focus, so
  // this needs no guard against re-entering.
  if (removeAt(index)) inputRef.value?.focus()
}

/* Files may be dropped on the component itself; there is no separate drop area here —
   that is what VFilePicker is for. */
const { dragging, onDragEnter, onDragOver, onDragLeave, onDrop } = useFileDrop(
  () => !props.noDrop && enabled.value,
  acceptFiles,
)

defineExpose({
  /** Moves the focus to the visible field. */
  focus: (options?: FocusOptions) => inputRef.value?.focus(options),
  /**
   * Opens the file dialog. It only works when called from something the reader did — a
   * click, a key press: browsers refuse to open a file dialog by themselves.
   */
  open: openPicker,
  /**
   * The component's own box, for what neither of the two above covers. It is the wrapper
   * and not the hidden file input: that one is the FORM's element, this is the reader's.
   */
  el: rootEl,
})
</script>

<template>
  <div
    ref="rootEl"
    class="v-file-input"
    :class="rootClass"
    :style="[{ '--chip-height': chipScale.height }, rootStyle]"
    :data-size="resolvedSize"
    :data-compact="resolvedCompact ? '' : undefined"
    :data-display="resolvedDisplay"
    :data-disabled="resolvedDisabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
    :data-dragging="dragging ? '' : undefined"
    @dragenter="onDragEnter"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <input v-bind="nativeInputAttrs" ref="fileEl" class="v-file-input-native v-hidden-input" />

    <div class="v-file-input-control" @click="onControlClick">
      <!-- Shown as chips, the field takes VInput's two arrangements for chips: its end
           controls lifted out of the flow, and the chips wrapping onto several rows. -->
      <VInput
        v-bind="fieldAttrs"
        ref="inputRef"
        :class="{ 'v-input-end-pinned v-input-chips': resolvedDisplay === 'chip' }"
        :model-value="displayText"
        readonly
        :label="label"
        :placeholder="placeholderText"
        :size="resolvedSize"
        :compact="resolvedCompact"
        :disabled="resolvedDisabled"
        :invalid="invalid"
        :clearable="clearable"
        :clear-visible="clearVisible"
        :clear-label="resolvedClearLabel"
        :icon-start="iconStart"
        :icon-start-label="iconStartLabel"
        :loading="loading"
        :loading-label="loadingLabel"
        :icon-end="endIcon"
        :icon-end-label="endIconLabel"
        :aria-describedby="describedBy"
        @click:icon-end="openPicker"
        @clear="clear"
        @keydown="onFieldKeydown"
      >
        <template v-if="resolvedDisplay === 'chip' || $slots.start" #start>
          <template
            v-for="(file, index) in resolvedDisplay === 'chip' ? model : []"
            :key="fileKey(file)"
          >
            <slot
              name="chip"
              :file="file"
              :index="index"
              :label="chipLabels[index]!"
              :remove="() => removeFile(index)"
              :size="chipScale.size"
              :compact="chipScale.compact"
            >
              <VChip
                tone="accent"
                :size="chipScale.size"
                :compact="chipScale.compact"
                :dismissible="enabled"
                :dismiss-label="m.common.remove(file.name)"
                :disabled="resolvedDisabled"
                :title="chipLabels[index] === file.name ? undefined : file.name"
                @dismiss="removeFile(index)"
                >{{ chipLabels[index] }}</VChip
              >
            </slot>
          </template>
          <slot name="start" />
        </template>

        <template v-if="$slots['value-end']" #value-end><slot name="value-end" /></template>
      </VInput>
    </div>

    <div v-if="hint || counter" class="v-file-input-meta v-field-meta">
      <VTypography
        v-if="hint"
        :id="hintId"
        variant="caption"
        tone="muted"
        class="v-file-input-hint"
      >
        {{ hint }}
      </VTypography>
      <span v-if="counter" :id="counterId" class="v-file-input-counter v-field-counter">
        <slot name="counter" :count="model.length" :bytes="totalSize" :text="counterText">
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

  /* The real file input is a SOURCE of files and not a control anyone deals with: it
     wears `.v-hidden-input`, and taking it out of the tab order and hiding it from screen
     readers, in `useFileField`, is what leaves the visible field as the single stop and the
     single announcement. */
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

     TRAP — the selector weighs (0,4,0), one step above VInput's states, and it has to. The
     field inside is ALWAYS read-only, and VInput's read-only background weighs (0,3,0): at
     that weight the winner would be whichever of the two sheets a bundler put last. */
  .v-file-input[data-dragging] .v-input .v-input-field {
    --field-border-color: var(--vectis-color-accent);

    background: var(--vectis-color-accent-surface);
  }

  .v-file-input[data-disabled] .v-file-input-hint,
  .v-file-input[data-disabled] .v-file-input-counter {
    color: var(--vectis-color-text-subtle);
  }
}
</style>
