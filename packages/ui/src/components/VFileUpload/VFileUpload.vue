<script setup lang="ts">
// @core
/**
 * A drop zone: a dashed rectangle that takes files by drag & drop or through a
 * hidden native `<input type="file">`, with an optional list of what has been
 * loaded. The selection is a plain `File[]` v-model — VFileUpload displays and
 * screens, the parent uploads.
 *
 * Four pieces of behavioural JS, each forced by the platform (philosophy rule 1):
 *
 * 1. a file dialog opens ONLY from a real click on an `<input type="file">`, and
 *    a `FileList` cannot be written from a template — hence the `.click()` relay,
 *    and the hidden input being a SOURCE of files, never a mirror of the model;
 * 2. `accept` has no say over a DROP (the browser hands `dataTransfer.files`
 *    over untouched) — hence the screening pipeline of `utils/file.ts`;
 * 3. `input.value` has to be reset, or the same file cannot be picked twice;
 * 4. a thumbnail has no HTML-only form: `<img src>` needs a URL, and a `File`
 *    only yields one through `URL.createObjectURL`, which then has to be revoked.
 *
 * What is deliberately NOT JS: the keyboard. When the browse button is hidden the
 * zone becomes a real `<button>`, so Enter, Space, focus, the role and the whole
 * inertness of `disabled` come from the platform. The `<div>` incarnation exists
 * for one reason only — a button inside a button is invalid markup, and an axe
 * `nested-interactive` violation. Neither is the drag state (local variables
 * redefined on the root), the "or" rules (pseudo-elements) or the `end` layout
 * (a container query).
 */
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
  watchEffect,
} from 'vue'

import VButton from '../VButton/VButton.vue'
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import VIconButton from '../VIconButton/VIconButton.vue'
import VTypography from '../VTypography/VTypography.vue'

import { useFileDrop } from '../../composables/useFileDrop'
import { useFileField } from '../../composables/useFileField'
import { useRootAttrs } from '../../composables/useRootAttrs'
import { useLocale, useMessages } from '../../i18n/state'
import { isDev } from '../../utils/env'
import { formatBytes } from '../../utils/file'
import { fileKind, type FileKind } from './fileKind'

/** Where the loaded files are listed, `false` being nowhere. */
export type FileUploadPreview = false | 'bottom' | 'end'

/** Why a file never entered the model. */
export type FileUploadRejectReason = 'type' | 'size' | 'count' | 'total-size'

/** Payload of the `reject` event: one per refused file. */
export interface FileUploadRejection {
  file: File
  reason: FileUploadRejectReason
}

/**
 * Everything a preview row derives, handed to `#item` and `#thumbnail` alike —
 * one factory, so the two slots can never drift apart.
 */
export interface FileUploadRow {
  file: File
  index: number
  kind: FileKind
  /**
   * The object URL of an image thumbnail. `undefined` on the server AND on the
   * first client render (see the object-URL lifecycle below), and for anything
   * the browser will not decode: render `icon` then.
   */
  thumbnail: string | undefined
  /** The resolved type icon, `typeIcons` override included. */
  icon: IconSource
  /** The size, already through `Intl`. */
  sizeText: string
  remove: () => void
}

interface FileUploadProps {
  /**
   * The zone's headline — what the user is asked to drop. Required: a drop zone
   * without an instruction is a rectangle. Note: it shadows the global HTML
   * attribute of the same name on the component (an accepted trade-off).
   */
  title: string
  /** Second line, under the title: the constraints in plain words. */
  subtitle?: string
  /** The large icon at the top of the zone. */
  icon?: IconSource
  /**
   * The separator and the browse button. `false` keeps the top half alone: the
   * zone then becomes the control ITSELF (a real `<button>`, so Enter, Space and
   * focus are the platform's) instead of a plain clickable container.
   */
  showBrowse?: boolean
  /** Text of the browse button. Default: the DS dictionary. */
  browseLabel?: string
  /**
   * Where the loaded files are listed: `bottom` under the zone, `end` beside it
   * — `end` folds back underneath on a narrow CONTAINER (a container query: the
   * component follows the width it is given, never the viewport). `false` (the
   * default) renders no list at all: the v-model is what the parent previews.
   */
  preview?: FileUploadPreview
  /**
   * Image thumbnails in the preview list. Each image gets an object URL, created
   * on the client only and revoked when the file leaves the model or the
   * component unmounts. `false` shows the type icon for every file — the escape
   * hatch when a list holds many, or very large, images.
   */
  thumbnails?: boolean
  /**
   * Overrides the icon of one or more file kinds. Defaults, in order: `image`,
   * `picture_as_pdf`, `audio_file`, `video_file`, `folder_zip`, `table_chart`,
   * `code`, `description`.
   */
  typeIcons?: Partial<Record<FileKind, IconSource>>
  /** The icon of a preview row's remove button. */
  removeIcon?: IconSource
  /** Several files at once. In single mode every extra file is refused with `count`. */
  multiple?: boolean
  /**
   * Accepted types, in the native syntax (`image/*,.pdf`). Applied TWICE: as the
   * attribute, which filters the OS dialog, and in JS, which is the only thing
   * that filters a drop — the attribute has no say there.
   */
  accept?: string
  /** Maximum size of ONE file, in bytes. Above it: refused with `size`. */
  maxSize?: number
  /** Maximum cumulated size of the selection, in bytes. Above it: refused with `total-size`. */
  maxTotalSize?: number
  /** Maximum number of files (`multiple` only). Beyond it: refused with `count`. */
  maxFiles?: number
  disabled?: boolean
  /** The selection is displayed but can no longer change: no dialog, no drop, no removal. */
  readonly?: boolean
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<FileUploadProps>(), {
  subtitle: undefined,
  icon: 'cloud_upload',
  showBrowse: true,
  browseLabel: undefined,
  preview: false,
  thumbnails: true,
  typeIcons: undefined,
  removeIcon: 'close',
  multiple: false,
  accept: undefined,
  maxSize: undefined,
  maxTotalSize: undefined,
  maxFiles: undefined,
  disabled: false,
  readonly: false,
})

const emit = defineEmits<{
  /** The selection changed through a user action (addition, removal). */
  change: [files: File[]]
  /** A file was refused and never entered the model — one event per file. */
  reject: [rejection: FileUploadRejection]
  /**
   * A file was taken out of the list. Distinct from `change`, which only says
   * what is left: an upload in flight is aborted from here, without diffing.
   */
  remove: [file: File, index: number]
}>()

defineSlots<{
  /**
   * The large icon, for an illustration the `IconSource` contract cannot express.
   * Must stay non-interactive: with `showBrowse: false` the zone is a `<button>`.
   */
  icon?(): unknown
  /** The headline. Phrasing content only, same reason. */
  title?(): unknown
  /** The second line. Same contract as `#title`. */
  subtitle?(): unknown
  /**
   * The browse button. `open` is what makes the replacement usable — without it
   * a custom button could no longer open the dialog.
   */
  browse?(props: { open: () => void; disabled: boolean }): unknown
  /**
   * A WHOLE preview row, `<li>` contents included — the escape hatch for a row
   * carrying its own upload progress. It receives everything the default row
   * derives, so nothing has to be recomputed.
   */
  item?(props: FileUploadRow): unknown
  /**
   * The square alone — for a server-side thumbnail, a video poster, or a format
   * the browser cannot decode.
   */
  thumbnail?(props: FileUploadRow): unknown
  /**
   * A row's remove control. `remove` is indispensable (nothing else can take the
   * file out) and `label` is the ready-made accessible name, file name included —
   * a replacement that drops it leaves an unnamed button, which axe fails.
   */
  remove?(props: { file: File; index: number; remove: () => void; label: string }): unknown
}>()

/**
 * Always a `File[]`, `multiple` or not: the shape of the model does not depend on
 * a prop, so a consumer never has to narrow a union TypeScript cannot
 * discriminate. Single mode is a list of at most one.
 */
const model = defineModel<File[]>({ default: () => [] })

const { attrs, rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

const m = useMessages()
const locale = useLocale()

const interactive = computed(() => !props.disabled && !props.readonly)

/*
 * The hidden input, the three-bucket attribute split and the whole gate into the
 * model live in `useFileField` (shared with VFilePicker). Here the CONTROL bucket
 * is the ZONE — what the user sees, and what takes focus once the browse button is
 * hidden — and nothing is pulled out of it: unlike VFilePicker, this component
 * re-aggregates no `aria-describedby`.
 */
const {
  fileEl,
  nativeAttrs,
  controlAttrs: zoneAttrs,
  acceptFiles,
  onNativeChange,
  openPicker,
  resetNative,
} = useFileField({
  model,
  forwardedAttrs,
  enabled: () => interactive.value,
  multiple: () => props.multiple,
  limits: () => ({
    accept: props.accept,
    maxSize: props.maxSize,
    maxFiles: props.maxFiles,
    maxTotalSize: props.maxTotalSize,
  }),
  onReject: (rejection) => emit('reject', rejection),
  onChange: (files) => emit('change', files),
})

const zoneEl = ref<HTMLElement | null>(null)
const listEl = ref<HTMLUListElement | null>(null)
/** The zone is the control exactly when there is no button to carry the role. */
const zoneIsControl = computed(() => !props.showBrowse)
const showList = computed(() => props.preview !== false && model.value.length > 0)

/** Default kind → icon table. Overridden entry by entry through `typeIcons`, so a
    consumer can replace one glyph without restating the seven others. */
const KIND_ICONS: Record<FileKind, IconSource> = {
  image: 'image',
  pdf: 'picture_as_pdf',
  audio: 'audio_file',
  video: 'video_file',
  archive: 'folder_zip',
  spreadsheet: 'table_chart',
  code: 'code',
  file: 'description',
}

const iconForKind = (kind: FileKind): IconSource => props.typeIcons?.[kind] ?? KIND_ICONS[kind]

function onZoneClick(event: MouseEvent) {
  // The browse button carries its own handler: without this guard a click on it
  // would open the dialog twice. Inert when the zone IS the button — there is no
  // button inside it to match.
  if (!zoneIsControl.value && (event.target as HTMLElement).closest('button')) return
  openPicker()
}

const { dragging, onDragEnter, onDragOver, onDragLeave, onDrop } = useFileDrop(
  () => interactive.value,
  acceptFiles,
)

// @a11y
/**
 * The zone's focusable element, whatever the mode AND whatever `#browse`
 * rendered: the zone itself when it is the button, its first button otherwise. A
 * DOM query rather than a component ref — a `#browse` replacement has no ref of
 * ours, and it must still be reachable.
 */
function focusTarget(): HTMLElement | null {
  const zone = zoneEl.value
  if (!zone) return null
  return zone.matches('button') ? zone : zone.querySelector('button')
}

// @a11y @core
/**
 * The row that held focus is about to disappear, and focus would fall back to
 * <body>: it moves to the row that takes its place, or to the browse control once
 * the list empties. `nextTick` is what makes the new row queryable — the DOM is
 * still the old one when the model is written.
 */
async function removeAt(index: number) {
  const file = model.value[index]
  if (!file || !interactive.value) return

  model.value = model.value.filter((_, i) => i !== index)
  resetNative()
  emit('remove', file, index)
  emit('change', model.value)

  await nextTick()
  const items = listEl.value?.querySelectorAll<HTMLElement>('.v-file-upload-item') ?? []
  const next = items[Math.min(index, items.length - 1)]?.querySelector('button')
  ;(next ?? focusTarget())?.focus()
}

/**
 * One object URL per image, keyed BY THE FILE OBJECT ITSELF.
 *
 * The key is safe because a `File` is never proxied: `reactive()` only converts
 * Object/Array/Map/Set, so a File inside the model array comes back with its
 * identity intact — the exact opposite of VCombobox's option cache, where a
 * reactive proxy makes identity comparison a bug. Two files may share a name
 * across folders, so a name key WOULD collide.
 *
 * `reactive(Map)` and not a `shallowRef`: the collection handlers are what
 * re-render a single row when its URL lands, without replacing the whole map.
 *
 * **Trap**: `thumbUrls` and NOT `thumbnails` — every top-level binding of a
 * `<script setup>` is exposed to the template, where it would SHADOW the prop of
 * the same name (the VHotkeys `listening`/`attached` precedent).
 */
const thumbUrls = reactive(new Map<File, string>())

/** The BROWSER's own MIME, not the extension-derived kind: `.heic` resolves to
    the `image` kind (it deserves the image icon) but no engine decodes it. */
const isThumbable = (file: File) => file.type.startsWith('image/')

// @ssr @core
/**
 * Reconciles the map with the model: revoke what left, create what arrived.
 * Never called from `setup()`, a `computed` or the render — only from
 * `onMounted`, a `watch` and handlers, which is what makes the component SSR-safe
 * (philosophy rule 4). The server renders the type icon, and so does the FIRST
 * client render, the map being empty until mount: no hydration mismatch, the
 * `today` pattern of VCalendar.
 */
function syncThumbnails() {
  // `preview: false` renders no list, so an object URL there would be allocated
  // for something nothing displays — the gate, not a dev warning, is what makes
  // the default configuration a true no-op.
  const wanted = new Set(
    props.thumbnails && props.preview !== false ? model.value.filter(isThumbable) : [],
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
/** The <img> could not decode (HEIC, a corrupt file, a lying MIME): the URL goes
    and the type icon takes over — a rendering failure must not leave an empty
    square. */
function dropThumbnail(file: File) {
  const url = thumbUrls.get(file)
  if (!url) return
  URL.revokeObjectURL(url)
  thumbUrls.delete(file)
}

// @ssr — the object URLs are created on the client only; the server and the first
// client render both show the type icon, so there is no hydration mismatch.
onMounted(syncThumbnails)
/*
 * `deep` costs nothing here and covers a consumer who pushes into the model
 * array instead of replacing it: `traverse` stops at a `File`, which is neither
 * a plain object nor a collection, so the walk never descends past the array.
 */
watch([model, () => props.thumbnails, () => props.preview], syncThumbnails, { deep: true })
// onBeforeUnmount and never onUnmounted (the useTimer/VHotkeys rule).
onBeforeUnmount(() => {
  for (const url of thumbUrls.values()) URL.revokeObjectURL(url)
  thumbUrls.clear()
})

/** The slot payload of a row: a Vue template has no reusable fragment, so the
    factory is what keeps `#item` and `#thumbnail` fed from one place. */
function rowProps(file: File, index: number): FileUploadRow {
  const kind = fileKind(file)
  return {
    file,
    index,
    kind,
    thumbnail: thumbUrls.get(file),
    icon: iconForKind(kind),
    sizeText: formatBytes(file.size, locale.value),
    remove: () => removeAt(index),
  }
}

// @devwarn — the last two are @a11y guards: an unfocusable `required` and an
// `aria-label` on a <div>, both of which fail silently at runtime.
if (isDev) {
  watchEffect(() => {
    if (props.maxFiles !== undefined && !props.multiple)
      console.warn(
        '[VFileUpload] `maxFiles` ignored without `multiple`: single mode already caps at one file.',
      )
    if (attrs.required !== undefined)
      console.warn(
        '[VFileUpload] `required` lands on the hidden file input, which is not focusable: the browser blocks submission with no visible message. Validate the v-model yourself.',
      )
    if (
      props.showBrowse &&
      (attrs['aria-label'] !== undefined || attrs['aria-labelledby'] !== undefined)
    )
      console.warn(
        '[VFileUpload] an aria-label on the zone is inert while the browse button is shown: the zone is a plain container then, and axe reports aria-prohibited-attr. Name the zone through `title`, or set `showBrowse: false` to make the zone itself the control.',
      )
  })
}

defineExpose({
  /** Focuses the browse control — the button, or the zone when it is the button. */
  focus: (options?: FocusOptions) => focusTarget()?.focus(options),
  /** Opens the file dialog. Only works from a user gesture (browser rule). */
  open: openPicker,
})
</script>

<template>
  <div
    class="v-file-upload"
    :class="rootClass"
    :style="rootStyle"
    :data-preview="preview || undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
    :data-dragging="dragging ? '' : undefined"
    @dragenter="onDragEnter"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <input
      v-bind="nativeAttrs"
      ref="fileEl"
      type="file"
      class="v-file-upload-native"
      tabindex="-1"
      aria-hidden="true"
      :accept="accept"
      :multiple="multiple || undefined"
      :disabled="disabled || undefined"
      @change="onNativeChange"
    />

    <!-- Not decorative: the root is the query container, and an element cannot
         query ITSELF — the layout that flips has to live on a descendant.
         Deleting this wrapper makes the `end` container query silently inert. -->
    <div class="v-file-upload-body">
      <!-- A real <button> as soon as it is the control: role, Enter, Space, focus
           and inertness come from the platform. A <div> otherwise — a button
           inside a button is invalid markup and an axe `nested-interactive`. -->
      <component
        :is="zoneIsControl ? 'button' : 'div'"
        v-bind="zoneAttrs"
        ref="zoneEl"
        class="v-file-upload-zone"
        :type="zoneIsControl ? 'button' : undefined"
        :disabled="zoneIsControl && !interactive ? true : undefined"
        @click="onZoneClick"
      >
        <span class="v-file-upload-icon">
          <slot name="icon"><VIcon v-bind="iconProps(icon)" /></slot>
        </span>

        <!-- `as="span"` in BOTH modes: a <p> is flow content, invalid inside a
             <button>, and the markup must not change shape between the two. -->
        <VTypography as="span" variant="subtitle" class="v-file-upload-title">
          <slot name="title">{{ title }}</slot>
        </VTypography>

        <VTypography
          v-if="subtitle || $slots.subtitle"
          as="span"
          variant="body-sm"
          class="v-file-upload-subtitle"
        >
          <slot name="subtitle">{{ subtitle }}</slot>
        </VTypography>

        <template v-if="showBrowse">
          <!-- Not aria-hidden: "or" is real text, and it reads naturally between
               the instruction and the button. The two rules on either side are
               ::before/::after, decorative by construction. -->
          <span class="v-file-upload-separator">{{ m.fileUpload.or }}</span>

          <slot name="browse" :open="openPicker" :disabled="!interactive">
            <VButton
              class="v-file-upload-browse"
              variant="outline"
              tone="neutral"
              :disabled="!interactive"
              @click="openPicker"
            >
              {{ browseLabel ?? m.fileUpload.browse }}
            </VButton>
          </slot>
        </template>
      </component>

      <ul v-if="showList" ref="listEl" class="v-file-upload-list" :aria-label="m.fileUpload.list">
        <li
          v-for="(file, index) in model"
          :key="`${index}-${file.name}`"
          class="v-file-upload-item"
        >
          <slot name="item" v-bind="rowProps(file, index)">
            <span class="v-file-upload-thumb">
              <slot name="thumbnail" v-bind="rowProps(file, index)">
                <img
                  v-if="thumbUrls.get(file)"
                  class="v-file-upload-image"
                  :src="thumbUrls.get(file)"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  @error="dropThumbnail(file)"
                />
                <VIcon v-else v-bind="iconProps(iconForKind(fileKind(file)))" />
              </slot>
            </span>

            <span class="v-file-upload-info">
              <span class="v-file-upload-name" :title="file.name">{{ file.name }}</span>
              <span class="v-file-upload-size">{{ formatBytes(file.size, locale) }}</span>
            </span>

            <slot
              name="remove"
              :file="file"
              :index="index"
              :remove="() => removeAt(index)"
              :label="m.fileUpload.remove(file.name)"
            >
              <VIconButton
                class="v-file-upload-remove"
                size="sm"
                :icon="removeIcon"
                :label="m.fileUpload.remove(file.name)"
                :disabled="!interactive"
                @click="removeAt(index)"
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
  /* Locals QUALIFIED: they inherit, so a generic `--bg` or `--border-color` set
     by a host app on an ancestor would be captured here — and nothing would see
     it, jsdom evaluating no style. Declared on the ROOT so the drag, disabled
     and readonly states redefine them in ONE place, which is what makes them
     structurally unable to disagree with hover or focus. */
  .v-file-upload {
    --upload-border-color: var(--vectis-color-border-strong);
    --upload-bg: var(--vectis-color-surface-sunken);
    --upload-text: var(--vectis-color-text);
    --upload-text-muted: var(--vectis-color-text-muted);
    --upload-row-bg: var(--vectis-color-surface-raised);
    --upload-thumb-bg: var(--vectis-color-surface-muted);

    /* position: relative anchors the zero-sized native input. */
    position: relative;
    display: block;
    inline-size: 100%;
    font-family: var(--vectis-text-family);
  }

  /* The native input is a SOURCE of files, not a control: `opacity: 0` and never
     `display: none` (the DS rule — a hidden form control has to stay
     submittable), zero-sized and pointer-events: none so it never intercepts a
     click meant for the zone. */
  .v-file-upload-native {
    position: absolute;
    inline-size: 0;
    block-size: 0;
    opacity: 0;
    pointer-events: none;
  }

  .v-file-upload-body {
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-4);
  }

  /* One declaration table for both incarnations: the UA button styles are all
     that has to be neutralized (`appearance`, `font`, `margin`), everything else
     is set here anyway. `inline-size: 100%` because a <button> shrink-wraps. */
  .v-file-upload-zone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--vectis-space-2);
    inline-size: 100%;
    min-block-size: var(--vectis-control-size-upload-min-block);
    margin: 0;
    padding: var(--vectis-space-6) var(--vectis-space-4);
    appearance: none;
    border: 1px dashed var(--upload-border-color);
    border-radius: var(--vectis-radius-surface);
    background: var(--upload-bg);
    color: var(--upload-text);
    font: inherit;
    text-align: center;
    transition:
      border-color var(--vectis-duration-fast) var(--vectis-ease-default),
      background-color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-file-upload:not([data-disabled]):not([data-readonly]) .v-file-upload-zone {
    cursor: pointer;
  }

  .v-file-upload:not([data-disabled]):not([data-readonly]) .v-file-upload-zone:hover {
    --upload-border-color: var(--vectis-color-accent);
  }

  .v-file-upload-zone:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  /* The drag state redefines the very variables the zone paints itself with. */
  .v-file-upload[data-dragging] {
    --upload-border-color: var(--vectis-color-accent);
    --upload-bg: var(--vectis-color-accent-surface);
  }

  /* The only place --vectis-icon-size is set: on the wrapper, NEVER on the zone,
     where it would resize the browse button's icons too. */
  .v-file-upload-icon {
    --vectis-icon-size: var(--vectis-control-size-upload-icon);

    display: inline-flex;
    color: var(--upload-text-muted);
  }

  .v-file-upload-subtitle {
    /* VTypography's own variable rather than `color`: one source, and the
       disabled state below overrides the same thing rather than a second one. */
    --typography-color: var(--upload-text-muted);
  }

  /* The word between two rules, entirely in CSS: the pseudo-elements are two
     flex lines and the text is the anonymous item between them — no extra span,
     and nothing decorative reaches the accessibility tree. */
  .v-file-upload-separator {
    display: flex;
    align-items: center;
    gap: var(--vectis-space-3);
    inline-size: 100%;
    margin-block-start: var(--vectis-space-2);
    color: var(--upload-text-muted);
    font-size: var(--vectis-text-caption-size);
  }

  .v-file-upload-separator::before,
  .v-file-upload-separator::after {
    content: '';
    flex: 1 1 0;
    border-block-start: 1px solid var(--vectis-color-border);
  }

  .v-file-upload-list {
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-2);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .v-file-upload-item {
    display: flex;
    align-items: center;
    gap: var(--vectis-space-3);
    padding: var(--vectis-space-2);
    border: 1px solid var(--vectis-color-border);
    border-radius: var(--vectis-radius-interactive);
    background: var(--upload-row-bg);
  }

  .v-file-upload-thumb {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    inline-size: var(--vectis-control-size-upload-thumb);
    block-size: var(--vectis-control-size-upload-thumb);
    overflow: hidden;
    border-radius: var(--vectis-radius-interactive);
    background: var(--upload-thumb-bg);
    color: var(--upload-text-muted);
  }

  .v-file-upload-image {
    display: block;
    inline-size: 100%;
    block-size: 100%;
    object-fit: cover;
  }

  /* min-inline-size: 0 is what makes the ellipsis below possible: a flex item's
     automatic minimum size is its content, so without it the name pushes the row
     wider instead of being cut. */
  .v-file-upload-info {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-inline-size: 0;
    color: var(--upload-text);
  }

  .v-file-upload-name {
    overflow: hidden;
    font-size: var(--vectis-text-body-sm-size);
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  /* tabular-nums is not a typographic role, so it stays local (the VFilePicker
     counter precedent). */
  .v-file-upload-size {
    color: var(--upload-text-muted);
    font-size: var(--vectis-text-caption-size);
    font-variant-numeric: tabular-nums;
  }

  /*
   * Containment reserved for `end` (every @container below depends on it):
   * `container-type: inline-size` computes the inline size WITHOUT the content,
   * so the root would lose its intrinsic width in an `auto` grid column or an
   * inline-block. In `bottom` and `false` it keeps it.
   */
  .v-file-upload[data-preview='end'] {
    container-type: inline-size;
    container-name: v-file-upload;
  }

  .v-file-upload[data-preview='end'] .v-file-upload-body {
    flex-direction: row;
    align-items: flex-start;
  }

  .v-file-upload[data-preview='end'] .v-file-upload-zone,
  .v-file-upload[data-preview='end'] .v-file-upload-list {
    flex: 1 1 0;
    min-inline-size: 0;
  }

  /*
   * Threshold as a rem literal (@container accepts no var()). It is the width
   * NEEDED to hold the two columns, not what is left after folding: the zone
   * stops being readable under ~18rem (title on two lines plus the button), a row
   * needs ~15rem (thumbnail + gap + a name worth reading + the remove button +
   * padding), plus the 1rem gutter.
   */
  @container v-file-upload (max-width: 34rem) {
    .v-file-upload[data-preview='end'] .v-file-upload-body {
      flex-direction: column;
    }
  }

  /* States through TOKENS, never opacity. `text-muted` on `surface-muted` is the
     DS's disabled pairing (VInput sets exactly that): `text-subtle` would grey it
     further but fall under 4.5:1 on that background, and axe is blocking. Both
     locals take the same value, so the secondary line does not sink below the
     title on an already dimmed surface. */
  .v-file-upload[data-disabled] {
    --upload-border-color: var(--vectis-color-border);
    --upload-bg: var(--vectis-color-surface-muted);
    --upload-text: var(--vectis-color-text-muted);
    --upload-text-muted: var(--vectis-color-text-muted);
    --upload-row-bg: var(--vectis-color-surface-muted);
  }

  .v-file-upload[data-readonly] {
    --upload-border-color: var(--vectis-color-border);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-file-upload-zone {
      transition: none;
    }
  }

  /*
   * Forced colours drop backgrounds and force border colours, so the drag state —
   * signalled by colour alone — would vanish. A style change survives: the dashed
   * border goes solid while a drag hovers.
   */
  @media (forced-colors: active) {
    .v-file-upload[data-dragging] .v-file-upload-zone {
      border-style: solid;
    }

    .v-file-upload-thumb {
      border: 1px solid;
    }
  }
}
</style>
