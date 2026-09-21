<script setup lang="ts">
// @core
/**
 * A drop zone: a dashed rectangle taking files dragged onto it or chosen from a dialog, with
 * an optional list of what it holds. The v-model is a plain `File[]`, and the division of
 * labour matters — this component SHOWS and SCREENS, uploading is the parent's business.
 *
 * Four things need JS, each forced by the platform. A dialog opens ONLY from a real click on
 * a file input, and a `FileList` cannot be written from a template, so the input is a SOURCE
 * of files rather than a mirror of the value. `accept` has no say over a DROP. The input has
 * to be reset after every change, or the same file cannot be chosen twice running. And a
 * thumbnail needs an object URL, which then has to be released.
 *
 * The KEYBOARD is deliberately not among them: with the browse button hidden the zone
 * becomes a real `<button>`, so Enter, Space, focus, role and a disabled control's inertness
 * all come from the browser. The other incarnation, a plain container, exists for one reason
 * — a button inside a button is invalid markup and unusable by keyboard. The drag highlight,
 * the "or" separator and the side-by-side layout are CSS too.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

import VButton from '../VButton/VButton.vue'
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import { audio_file as audioFileIcon } from '../VIcon/icons/audio_file'
import { close as closeIcon } from '../VIcon/icons/close'
import { cloud_upload as cloudUploadIcon } from '../VIcon/icons/cloud_upload'
import { code as codeIcon } from '../VIcon/icons/code'
import { description as descriptionIcon } from '../VIcon/icons/description'
import { folder_zip as folderZipIcon } from '../VIcon/icons/folder_zip'
import { image as imageIcon } from '../VIcon/icons/image'
import { picture_as_pdf as pictureAsPdfIcon } from '../VIcon/icons/picture_as_pdf'
import { table_chart as tableChartIcon } from '../VIcon/icons/table_chart'
import { video_file as videoFileIcon } from '../VIcon/icons/video_file'
import type { IconSource } from '../VIcon/types'
import VIconButton from '../VIconButton/VIconButton.vue'
import VSpinner from '../VSpinner/VSpinner.vue'
import VTypography from '../VTypography/VTypography.vue'

import { useFileDrop } from '../../composables/useFileDrop'
import { useFileField } from '../../composables/useFileField'
import { useRootAttrs } from '../../composables/useRootAttrs'
import { useLocale, useMessages } from '../../i18n/state'
import { isDev } from '../../utils/env'
import { fileKey, formatBytes, type FileRejection } from '../../utils/file'
import { fileKind, type FilePickerKind } from './fileKind'

/** What the `#browse` slot receives. */
export interface FilePickerBrowseSlotProps {
  /** Opens the file dialog; a button of your own has no other way to. */
  open: () => void
  /** Whether the picker is disabled, for your button to follow. */
  disabled: boolean
}

/** What the `#remove` slot receives. */
export interface FilePickerRemoveSlotProps {
  /** The file the row stands for. */
  file: File
  /** Its position in the selection. */
  index: number
  /** Takes the file out of the selection, the only way to. */
  remove: () => void
  /** The ready-made accessible name of the control, the file's name included. */
  removeLabel: string
}

/** Where the files taken are listed: under the zone, beside it, or nowhere. */
export type FilePickerPreview = false | 'bottom' | 'end'

/**
 * Everything known about one row of the list. The same object is handed to both slots
 * that can replace part of a row, so the two can never be given different information.
 */
export interface FilePickerRow {
  /** The file itself. */
  file: File
  /** Its position in the list. */
  index: number
  /** What kind of file it is, as worked out from its type or its extension. */
  kind: FilePickerKind
  /**
   * The address of its image thumbnail, when there is one.
   *
   * It is absent on the server AND on the browser's first render, since those addresses
   * only exist in a browser and creating them during the first render would make the two
   * markups differ. It is absent as well for anything the browser fails to decode. Fall
   * back to the icon in that case.
   */
  thumbnail: string | undefined
  /** The icon standing for that kind of file, a consumer's override included. */
  icon: IconSource
  /** Its size, already written out in the reader's conventions. */
  sizeText: string
  /** Takes this file out of the list. */
  remove: () => void
}

interface FilePickerProps {
  /**
   * What the reader is being asked to drop, in one line. It is REQUIRED: a drop zone
   * with no instruction is just a rectangle.
   *
   * Note that this prop shadows the HTML attribute of the same name on the component
   * itself, an accepted trade-off: a tooltip on a drop zone would be redundant anyway.
   */
  title: string
  /** A second line under it, for the constraints in plain words: kinds, sizes, how many. */
  subtitle?: string
  /** The large icon at the top of the zone. */
  icon?: IconSource
  /**
   * Hides the separator and the browse button under the instruction. That changes the
   * zone's nature: it then becomes the control ITSELF, a real button, so Enter, Space
   * and the focus come from the platform rather than from a container that merely
   * reacts to clicks.
   */
  hideBrowse?: boolean
  /**
   * The wording drawn on the browse button, which is also its accessible name. It falls
   * back to the design system dictionary.
   */
  browseText?: string
  /**
   * Where the files taken are listed: under the zone, or beside it. Beside folds back
   * underneath when the COMPONENT is narrow, following the width it was given rather
   * than the width of the window.
   *
   * By default nothing is listed at all: the value is there for a parent that wants to
   * present it its own way.
   */
  preview?: FilePickerPreview
  /**
   * Shows the kind icon for every file in that list, images included: the way out when
   * a list holds many images, or very large ones.
   *
   * Left out, an image is shown as a thumbnail: it is given a temporary address, created
   * in the browser only and released as soon as the file leaves the list or the
   * component goes away.
   */
  hideThumbnails?: boolean
  /** Replaces the icon of one or more kinds of file. */
  typeIcons?: Partial<Record<FilePickerKind, IconSource>>
  /** The icon of the button removing a file from the list. */
  removeIcon?: IconSource
  /** Allows several files to be taken. With one only, every extra file is turned away. */
  multiple?: boolean
  /**
   * Which kinds of file are accepted, in the browser's own syntax (`image/*,.pdf`).
   *
   * It is applied TWICE, and it has to be: as an attribute, which is what filters the
   * system's file dialog, and again in code, which is the only thing that can filter a
   * DROPPED file, the attribute having no say over a drop.
   */
  accept?: string
  /** The largest ONE file may be, in bytes. */
  maxSize?: number
  /** The largest the whole selection may be, in bytes. */
  maxTotalSize?: number
  /** How many files may be taken at most. */
  maxFiles?: number
  /** Makes the zone unusable, greyed out through the colour tokens. */
  disabled?: boolean
  /**
   * Shows what was taken without allowing it to change: no dialog, no drop, no removal. Its
   * buttons stay reachable from the keyboard, announced as unavailable.
   */
  readonly?: boolean
  /**
   * Marks the zone as invalid, which colours its outline and is announced on the control
   * the reader reaches. It is for a rule of your own: nothing here is checked by the browser,
   * the real input being hidden.
   */
  invalid?: boolean
  /**
   * Shows a spinner in place of the zone icon, typically while an upload is under way.
   * It says that something is happening and changes nothing else: files can still be
   * dropped and the dialog still opens. `disabled` and `readonly` are the props that cut
   * those off.
   */
  loading?: boolean
  /**
   * What screen readers announce while the spinner turns. It falls back to the design
   * system dictionary.
   */
  loadingText?: string
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<FilePickerProps>(), {
  subtitle: undefined,
  icon: () => cloudUploadIcon,
  hideBrowse: false,
  browseText: undefined,
  preview: false,
  hideThumbnails: false,
  typeIcons: undefined,
  removeIcon: () => closeIcon,
  multiple: false,
  accept: undefined,
  maxSize: undefined,
  maxTotalSize: undefined,
  maxFiles: undefined,
  disabled: false,
  readonly: false,
  invalid: false,
  loading: false,
  loadingText: undefined,
})

const emit = defineEmits<{
  /** The reader changed the selection, by adding or removing something. */
  change: [files: File[]]
  /**
   * A file was turned away and never joined the selection. It is emitted once PER file,
   * so a batch drop can be reported precisely.
   */
  reject: [rejection: FileRejection]
  /**
   * One file was taken out, and which one. It exists alongside `change`, which only says
   * what is LEFT: an upload already in flight is aborted from here, without having to
   * compare two lists to find out what went.
   */
  remove: [file: File, index: number]
}>()

defineSlots<{
  /**
   * The large icon, for an illustration the icon props cannot express.
   *
   * It must stay non-interactive, and so must the two below: with the browse button
   * hidden, the zone IS a button, and nothing interactive may sit inside one.
   */
  icon?(): unknown
  /** The instruction. Text and inline elements only, for the same reason. */
  title?(): unknown
  /** The second line. Same contract as the instruction. */
  subtitle?(): unknown
  /**
   * The browse button. Call the `open` it receives: without it a button of your own
   * could no longer open the file dialog at all.
   */
  browse?(props: FilePickerBrowseSlotProps): unknown
  /**
   * A WHOLE row of the list, the way out for a row showing its own upload progress. It
   * receives everything the standard row was given, so nothing has to be worked out
   * again.
   */
  item?(props: FilePickerRow): unknown
  /**
   * The square at the start of a row alone: for a thumbnail produced by your server, a
   * video's poster frame, or a format the browser cannot decode.
   */
  thumbnail?(props: FilePickerRow): unknown
  /**
   * The control that removes a row. Two of the values it receives are not optional in
   * practice: `remove` is the only thing that can take the file out, and `removeLabel` is
   * the ready-made accessible name, the file's own included, without which the button
   * would be announced as nothing at all.
   */
  remove?(props: FilePickerRemoveSlotProps): unknown
}>()

// `get` reads an explicit `null` as the empty list: the default applies only to a model
// that was never given, and `files = ref(null)` is a common start in untyped code.
/**
 * Always a LIST of files, whether or not several are allowed, and never a file on its own.
 * The shape of the value does not depend on a prop, so a consumer never has to narrow a
 * union TypeScript has no way of discriminating. With a single file it is simply a list
 * of at most one.
 */
const model = defineModel<File[]>({ default: () => [], get: (files) => files ?? [] })

const { attrs, rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

const m = useMessages()
const locale = useLocale()

/*
 * The hidden input, the sorting of the consumer's attributes, the single entry point into
 * the value and the removal of a file live in `useFileField`, shared with VFileInput.
 *
 * Here, the bucket meant for "the control the user deals with" goes to the ZONE: that is
 * what they see, and what takes the focus once the browse button is hidden. Nothing is
 * pulled out of it, unlike in VFileInput — this component assembles no description of
 * its own.
 *
 * The zone becomes the control exactly when there is no browse button inside to be one,
 * which is what `hideBrowse` decides.
 */
const {
  fileEl,
  enabled: interactive,
  nativeInputAttrs,
  controlAttrs: zoneAttrs,
  acceptFiles,
  openPicker,
  removeAt: removeFile,
} = useFileField({
  model,
  props,
  emit,
  forwardedAttrs,
  // @a11y @devwarn
  // The name a consumer gives a plain container is ignored by assistive
  // technology, and axe reports it, so this one fails SILENTLY at runtime too. Behind
  // `isDev`, which a production build folds to false, so the message is dropped.
  warnings: isDev
    ? () => [
        !props.hideBrowse &&
          (attrs['aria-label'] !== undefined || attrs['aria-labelledby'] !== undefined) &&
          'an aria-label on the zone is inert while the browse button is shown: the zone is a plain container then, and axe reports aria-prohibited-attr. Name the zone through `title`, or set `hide-browse` to make the zone itself the control.',
      ]
    : undefined,
})

const zoneEl = ref<HTMLElement | null>(null)
const listEl = ref<HTMLUListElement | null>(null)
const showList = computed(() => props.preview !== false && model.value.length > 0)

/**
 * Which icon stands for which kind of file. A consumer overrides it entry by entry, so
 * replacing one icon does not mean restating the other seven.
 */
const KIND_ICONS: Record<FilePickerKind, IconSource> = {
  image: imageIcon,
  pdf: pictureAsPdfIcon,
  audio: audioFileIcon,
  video: videoFileIcon,
  archive: folderZipIcon,
  spreadsheet: tableChartIcon,
  code: codeIcon,
  file: descriptionIcon,
}

const iconForKind = (kind: FilePickerKind): IconSource =>
  props.typeIcons?.[kind] ?? KIND_ICONS[kind]

function onZoneClick(event: MouseEvent) {
  // The browse button already handles its own click, and that click also reaches the
  // zone: without this guard it would open the dialog twice. The test is inert when the
  // zone IS the button, there being nothing inside it to match.
  if (!props.hideBrowse && (event.target as HTMLElement).closest('button')) return
  openPicker()
}

const { dragging, onDragEnter, onDragOver, onDragLeave, onDrop } = useFileDrop(
  () => interactive.value,
  acceptFiles,
)

// @a11y
/**
 * What can be focused in the zone, whichever shape it has taken: the zone itself when it
 * is the button, and otherwise the first button inside it.
 *
 * It is found by searching the DOM rather than kept as a reference, because a consumer
 * may have replaced the browse button entirely — theirs is not ours to hold a reference
 * to, and it still has to be reachable.
 */
const rootEl = ref<HTMLElement | null>(null)

function focusTarget(): HTMLElement | null {
  const zone = zoneEl.value
  if (!zone) return null
  return zone.matches('button') ? zone : zone.querySelector('button')
}

// @a11y @core
/**
 * Takes a file out of the list, and catches the focus that was on its remove button.
 *
 * That button disappears with its row, so the focus would fall back to the page body.
 * It is moved instead to the row that takes its place, or to the browse control once
 * the list is empty. Waiting for the next tick is what makes the new row findable: the
 * page still shows the old one at the moment the value is written.
 */
async function removeAt(index: number) {
  if (!removeFile(index)) return

  await nextTick()
  const items = listEl.value?.querySelectorAll<HTMLElement>('.v-file-picker-item') ?? []
  const next = items[Math.min(index, items.length - 1)]?.querySelector('button')
  ;(next ?? focusTarget())?.focus()
}

/**
 * One temporary address per image, kept against THE FILE OBJECT ITSELF.
 *
 * Using the file as the key is safe, and that is worth knowing: Vue's reactivity only
 * wraps plain objects, arrays and collections, so a File travelling through the value
 * comes back with its identity intact — the exact opposite of VCombobox's option cache,
 * where comparing identities IS the bug. Keying by name would be wrong here: two files
 * picked from different folders can share one.
 *
 * The map is made reactive rather than held in a plain reference, which is what lets a
 * single row re-render when its address is ready, instead of replacing the whole map.
 */
const thumbUrls = reactive(new Map<File, string>())

/**
 * Whether a thumbnail can be drawn at all, decided on the type the BROWSER reports and
 * not on the kind derived from the extension. A `.heic` file counts as an image and
 * deserves the image icon, but no engine will decode it.
 */
const isThumbable = (file: File) => file.type.startsWith('image/')

// @ssr @core
/**
 * Brings the map into line with the list: releases the addresses of files that have
 * gone, and creates them for files that have arrived.
 *
 * TRAP — it is never called from setup, from a derived value or during rendering, only
 * once mounted, from a watcher and from handlers. That is what keeps the component
 * renderable on a server: the server draws the kind icon, and so does the browser's
 * first render, the map being empty until then — the same reasoning as today's date in
 * VDatePicker.
 */
function syncThumbnails() {
  // With no list rendered there is nothing to draw a thumbnail in, so no address is
  // created at all. This gate — and not a warning — is what makes the default
  // configuration cost strictly nothing.
  const wanted = new Set(
    !props.hideThumbnails && props.preview !== false
      ? model.value.filter((file) => isThumbable(file) && !undecodable.has(file))
      : [],
  )

  for (const [file, url] of thumbUrls) {
    if (wanted.has(file)) continue
    URL.revokeObjectURL(url)
    thumbUrls.delete(file)
  }
  for (const file of wanted) {
    if (!thumbUrls.has(file)) thumbUrls.set(file, URL.createObjectURL(file))
  }
}

// @fallback
/**
 * The image failed to decode — a format the browser does not read, a corrupt file, a
 * type that lied about itself. The address is released and the kind icon takes over: a
 * failure to draw must never leave an empty square in the list.
 */
function dropThumbnail(file: File) {
  const url = thumbUrls.get(file)
  if (!url) return
  URL.revokeObjectURL(url)
  thumbUrls.delete(file)
  undecodable.add(file)
}

/**
 * The files whose image failed once. They are still in the selection, so without this
 * `syncThumbnails` would hand each of them a new address on every change of the list, only
 * for the `<img>` to fail again. Weak, so a file that leaves takes its entry with it.
 */
const undecodable = new WeakSet<File>()

// @ssr
// The addresses are created in the browser only; the server and the browser's
// first render both show the kind icon, so the two markups agree.
onMounted(syncThumbnails)
/*
 * Watching deeply costs nothing here and covers a consumer who ADDS to the list rather
 * than replacing it: the walk stops at a File, which is neither a plain object nor a
 * collection, so it never descends past the array itself.
 */
watch([model, () => props.hideThumbnails, () => props.preview], syncThumbnails, { deep: true })
// Released BEFORE the component is torn down and never after — the same rule `useTimer`
// and VHotkeys follow.
onBeforeUnmount(() => {
  for (const url of thumbUrls.values()) URL.revokeObjectURL(url)
  thumbUrls.clear()
})

/**
 * Everything each row of the list needs, assembled in one place and once per change of the
 * list, the language, the icons or a thumbnail — not once per render. A drag over the zone
 * re-renders the component at the pointer's rate, and the rows would otherwise work out
 * their kind and their size again every time, for every slot that reads them.
 *
 * A Vue template has no way of declaring a reusable fragment, so this is also what keeps
 * the slots that can replace part of a row fed from a single source.
 */
const rows = computed<{ key: number; row: FilePickerRow; removeLabel: string }[]>(() =>
  showList.value
    ? model.value.map((file, index) => {
        const kind = fileKind(file)
        return {
          key: fileKey(file),
          row: {
            file,
            index,
            kind,
            thumbnail: thumbUrls.get(file),
            icon: iconForKind(kind),
            sizeText: formatBytes(file.size, locale.value),
            remove: () => removeAt(index),
          },
          removeLabel: m.value.common.remove(file.name),
        }
      })
    : [],
)

defineExpose({
  /** Moves the focus to the browse control: the button, or the zone when it is one. */
  focus: (options?: FocusOptions) => focusTarget()?.focus(options),
  /**
   * Opens the file dialog. It only works when called from something the reader did, a
   * click or a key press: browsers refuse to open a file dialog by themselves.
   */
  open: openPicker,
  /**
   * The zone's own box, for what neither of the two above covers. It is the wrapper and
   * not the hidden file input: that one is the FORM's element, this is the reader's.
   */
  el: rootEl,
})
</script>

<template>
  <div
    ref="rootEl"
    class="v-file-picker"
    :class="rootClass"
    :style="rootStyle"
    :data-preview="preview || undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
    :data-invalid="invalid ? '' : undefined"
    :data-dragging="dragging ? '' : undefined"
    @dragenter="onDragEnter"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <input v-bind="nativeInputAttrs" ref="fileEl" class="v-file-picker-native v-hidden-input" />

    <!-- TRAP — this wrapper is not decoration. The root is what the layout asks about
         its own width, and an element cannot ask about ITSELF: whatever flips has to be
         a descendant of it. Deleting this element makes the side-by-side layout
         silently stop folding, with no error anywhere. -->
    <div class="v-file-picker-body">
      <!-- A real button as soon as the zone IS the control: the role, Enter, Space, the
           focus and the complete inertness of a disabled control then come from the
           platform. A plain container otherwise — a button inside a button is invalid
           markup, and unreachable by keyboard. -->
      <component
        :is="hideBrowse ? 'button' : 'div'"
        ref="zoneEl"
        :aria-invalid="hideBrowse && invalid ? 'true' : undefined"
        :aria-disabled="hideBrowse && readonly ? 'true' : undefined"
        v-bind="zoneAttrs"
        class="v-file-picker-zone"
        :type="hideBrowse ? 'button' : undefined"
        :disabled="hideBrowse && disabled ? true : undefined"
        @click="onZoneClick"
      >
        <span class="v-file-picker-icon">
          <slot name="icon">
            <VSpinner v-if="loading" :label="loadingText" />
            <VIcon v-else v-bind="iconProps(icon)" />
          </slot>
        </span>

        <!-- Rendered as a span in BOTH shapes: a paragraph is not allowed inside a
             button, and the markup must not change form between the two — one shape
             means one set of CSS rules. -->
        <VTypography as="span" variant="subtitle" class="v-file-picker-title">
          <slot name="title">{{ title }}</slot>
        </VTypography>

        <VTypography
          v-if="subtitle || $slots.subtitle"
          as="span"
          variant="body-sm"
          class="v-file-picker-subtitle"
        >
          <slot name="subtitle">{{ subtitle }}</slot>
        </VTypography>

        <template v-if="!hideBrowse">
          <!-- Deliberately not hidden from screen readers: "or" is real text, and it
               reads naturally between the instruction and the button. The two rules on
               either side of it are pseudo-elements, and therefore decorative by
               construction. -->
          <span class="v-file-picker-separator">{{ m.filePicker.or }}</span>

          <slot name="browse" :open="openPicker" :disabled="!interactive">
            <!-- Read-only leaves it reachable, as every read-only control of the design
                 system is: unavailable rather than disabled. The invalid state is said on
                 it, the control the reader reaches, the zone being a plain container. -->
            <VButton
              class="v-file-picker-browse"
              variant="outline"
              tone="neutral"
              :disabled="disabled"
              :aria-disabled="readonly ? 'true' : undefined"
              :aria-invalid="invalid ? 'true' : undefined"
              @click="openPicker"
            >
              {{ browseText ?? m.filePicker.browse }}
            </VButton>
          </slot>
        </template>
      </component>

      <ul v-if="showList" ref="listEl" class="v-file-picker-list" :aria-label="m.filePicker.list">
        <li v-for="{ key, row, removeLabel } in rows" :key="key" class="v-file-picker-item">
          <slot name="item" v-bind="row">
            <span class="v-file-picker-thumb">
              <slot name="thumbnail" v-bind="row">
                <img
                  v-if="row.thumbnail"
                  class="v-file-picker-image"
                  :src="row.thumbnail"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  @error="dropThumbnail(row.file)"
                />
                <VIcon v-else v-bind="iconProps(row.icon)" />
              </slot>
            </span>

            <span class="v-file-picker-info">
              <span class="v-file-picker-name" :title="row.file.name">{{ row.file.name }}</span>
              <span class="v-file-picker-size">{{ row.sizeText }}</span>
            </span>

            <slot
              name="remove"
              :file="row.file"
              :index="row.index"
              :remove="row.remove"
              :remove-label="removeLabel"
            >
              <VIconButton
                class="v-file-picker-remove"
                size="sm"
                :icon="removeIcon"
                :label="removeLabel"
                :disabled="!interactive"
                @click="row.remove"
              />
            </slot>
          </slot>
        </li>
      </ul>
    </div>
  </div>
</template>

<style>
@layer vectis.components {
  /* These variables carry the component's name for a reason: they INHERIT, so a bare
     `--bg` or `--border-color` set by the host application on any ancestor would be
     picked up here instead — and nothing would catch it, since the unit tests evaluate
     no styles at all.

     They are declared on the ROOT so that the drag, disabled and read-only states each
     redefine them in ONE place, which is what makes those states structurally incapable
     of disagreeing with hover or focus. */
  .v-file-picker {
    --file-picker-border-color: var(--vectis-color-border-strong);
    --file-picker-bg: var(--vectis-color-surface-sunken);
    --file-picker-text: var(--vectis-color-text);
    --file-picker-text-muted: var(--vectis-color-text-muted);
    --file-picker-row-bg: var(--vectis-color-surface-raised);
    --file-picker-thumb-bg: var(--vectis-color-surface-muted);

    /* Positioned so the hidden file input, which has no size at all, has something to be
       placed against. */
    position: relative;
    display: block;
    inline-size: 100%;
    font-family: var(--vectis-text-family);
  }

  .v-file-picker-body {
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-4);
  }

  /* One set of rules serves both shapes the zone can take. All that has to be undone is
     what the browser gives a button — its own appearance, font and margin — since
     everything else is declared here regardless. The full width is part of that: a
     button shrinks to fit its content, where a container does not. */
  .v-file-picker-zone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--vectis-space-2);
    inline-size: 100%;
    min-block-size: var(--vectis-control-size-file-picker-min-block);
    margin: 0;
    padding: var(--vectis-space-6) var(--vectis-space-4);
    appearance: none;
    border: 1px dashed var(--file-picker-border-color);
    border-radius: var(--vectis-radius-surface);
    background: var(--file-picker-bg);
    color: var(--file-picker-text);
    font: inherit;
    text-align: center;
    transition:
      border-color var(--vectis-duration-fast) var(--vectis-ease-default),
      background-color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-file-picker:not([data-disabled]):not([data-readonly]) .v-file-picker-zone {
    cursor: pointer;
  }

  /* Not over an invalid zone: at (0,5,0) this rule outranks the invalid one below, and the
     pointer would paint the accent over the one cue that says something is wrong. */
  .v-file-picker:not([data-disabled]):not([data-readonly]):not([data-invalid])
    .v-file-picker-zone:hover {
    --file-picker-border-color: var(--vectis-color-accent);
  }

  /* Invalid redefines the variable the zone paints its outline with, the way the drag
     highlight does: the states can then never disagree about what colour the border is. */
  .v-file-picker[data-invalid] .v-file-picker-zone {
    --file-picker-border-color: var(--vectis-color-danger);
  }

  .v-file-picker-zone:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  /* While a file is being dragged over it, the zone is highlighted by redefining the
     very variables it paints itself with — so the highlight cannot disagree with the
     hover and focus states. */
  .v-file-picker[data-dragging] {
    --file-picker-border-color: var(--vectis-color-accent);
    --file-picker-bg: var(--vectis-color-accent-surface);
  }

  /* The large icon's size is set HERE, on its own wrapper, and never on the zone: set
     there it would inherit down and enlarge the browse button's icons as well. */
  .v-file-picker-icon {
    --vectis-icon-size: var(--vectis-control-size-file-picker-icon);

    /* The wrapper is floored at the icon's own size, whatever it holds. An illustration of
       your own in the `#icon` slot may be drawn smaller than the icon, and without that
       floor the zone would change height with it — the box has to be the icon's even when
       its content is not. A floor and not a fixed size, so a taller one still grows it
       rather than spilling out of it; the centring is what keeps a smaller content in the
       middle of the box instead of at its start. */
    min-inline-size: var(--vectis-control-size-file-picker-icon);
    min-block-size: var(--vectis-control-size-file-picker-icon);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--file-picker-text-muted);
  }

  /* The spinner standing in for the icon while loading takes the icon's box, the way it
     does in every field: a spinner's size is the box it occupies, and the icon size is
     set on this wrapper. */
  .v-file-picker-icon > .v-spinner {
    font-size: var(--vectis-icon-size);
  }

  .v-file-picker-subtitle {
    /* Set through VTypography's own colour variable rather than with a plain colour:
       there is then a single source, and the disabled state below overrides that same
       one instead of introducing a second. */
    --typography-color: var(--file-picker-text-muted);
  }

  /* The word set between two rules, entirely in CSS: the two lines are pseudo-elements
     sharing the row with the text between them. No extra element is added to the markup,
     and nothing decorative reaches the accessibility tree. */
  .v-file-picker-separator {
    display: flex;
    align-items: center;
    gap: var(--vectis-space-3);
    inline-size: 100%;
    margin-block-start: var(--vectis-space-2);
    color: var(--file-picker-text-muted);
    font-size: var(--vectis-text-caption-size);
  }

  .v-file-picker-separator::before,
  .v-file-picker-separator::after {
    content: '';
    flex: 1 1 0;
    border-block-start: 1px solid var(--vectis-color-border);
  }

  .v-file-picker-list {
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-2);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .v-file-picker-item {
    display: flex;
    align-items: center;
    gap: var(--vectis-space-3);
    padding: var(--vectis-space-2);
    border: 1px solid var(--vectis-color-border);
    border-radius: var(--vectis-radius-interactive);
    background: var(--file-picker-row-bg);
  }

  .v-file-picker-thumb {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    inline-size: var(--vectis-control-size-file-picker-thumb);
    block-size: var(--vectis-control-size-file-picker-thumb);
    overflow: hidden;
    border-radius: var(--vectis-radius-interactive);
    background: var(--file-picker-thumb-bg);
    color: var(--file-picker-text-muted);
  }

  .v-file-picker-image {
    display: block;
    inline-size: 100%;
    block-size: 100%;
    object-fit: cover;
  }

  /* The zero minimum is what makes the ellipsis below possible at all: a flex item
     refuses by default to shrink below its own content, so without it a long file name
     would widen the row instead of being cut short. */
  .v-file-picker-info {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-inline-size: 0;
    color: var(--file-picker-text);
  }

  .v-file-picker-name {
    overflow: hidden;
    font-size: var(--vectis-text-body-sm-size);
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  /* Figures of equal width, so the sizes line up down the column instead of wobbling.
     That is not a typographic role, so it stays a local rule — the same reasoning as
     VFileInput's counter. */
  .v-file-picker-size {
    color: var(--file-picker-text-muted);
    font-size: var(--vectis-text-caption-size);
    font-variant-numeric: tabular-nums;
  }

  /*
   * Making the component a query container is reserved for the side-by-side layout,
   * since only its rule below depends on it — and it is not free.
   *
   * A container of this kind computes its width WITHOUT looking at its content, so the
   * component would lose its natural width inside an automatically sized grid column or
   * an inline box. In the two other layouts it keeps it.
   */
  .v-file-picker[data-preview='end'] {
    container-type: inline-size;
    container-name: v-file-picker;
  }

  .v-file-picker[data-preview='end'] .v-file-picker-body {
    flex-direction: row;
    align-items: flex-start;
  }

  .v-file-picker[data-preview='end'] .v-file-picker-zone,
  .v-file-picker[data-preview='end'] .v-file-picker-list {
    flex: 1 1 0;
    min-inline-size: 0;
  }

  /*
   * The threshold is written as a literal length, a container query accepting no
   * variables. It is the width NEEDED to hold the two columns side by side, and not what
   * is left once they fold: the zone stops being readable below about 18rem — its
   * instruction wraps onto two lines and the button follows — a row needs about 15rem to
   * show a thumbnail, a name worth reading and its remove button, and there is a gutter
   * between them.
   */
  @container v-file-picker (max-width: 34rem) {
    .v-file-picker[data-preview='end'] .v-file-picker-body {
      flex-direction: column;
    }
  }

  /* A disabled zone greys out through the colour tokens and never through opacity.

     The pairing used is the design system's own for a disabled surface, exactly as
     VInput sets it: a lighter text would look more convincingly disabled, and would fall
     below the required contrast against that background — which the accessibility checks
     refuse.

     Both text variables take the SAME value here, so that the secondary line does not
     sink below the title on a surface that is already dimmed. */
  .v-file-picker[data-disabled] {
    --file-picker-border-color: var(--vectis-color-border);
    --file-picker-bg: var(--vectis-color-surface-muted);
    --file-picker-text: var(--vectis-color-text-muted);
    --file-picker-text-muted: var(--vectis-color-text-muted);
    --file-picker-row-bg: var(--vectis-color-surface-muted);
  }

  .v-file-picker[data-readonly] {
    --file-picker-border-color: var(--vectis-color-border);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-file-picker-zone {
      transition: none;
    }
  }

  /*
   * Under Windows forced colours the backgrounds are dropped and every border colour is
   * replaced, so the drag highlight — which is nothing but colour — would disappear
   * entirely. A change of border STYLE survives that: the dashed outline becomes solid
   * for as long as a file hovers over the zone.
   */
  @media (forced-colors: active) {
    .v-file-picker[data-dragging] .v-file-picker-zone {
      border-style: solid;
    }

    .v-file-picker-thumb {
      border: 1px solid;
    }
  }
}
</style>
