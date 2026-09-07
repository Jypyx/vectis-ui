<script setup lang="ts">
import api from '~/content/api/file-picker'
import FilePickerAccept from '~/examples/file-picker/Accept.vue'
import filePickerAcceptSource from '~/examples/file-picker/Accept.vue?raw'
import FilePickerBasic from '~/examples/file-picker/Basic.vue'
import filePickerBasicSource from '~/examples/file-picker/Basic.vue?raw'
import FilePickerCustomIcons from '~/examples/file-picker/CustomIcons.vue'
import filePickerCustomIconsSource from '~/examples/file-picker/CustomIcons.vue?raw'
import FilePickerMaxSize from '~/examples/file-picker/MaxSize.vue'
import filePickerMaxSizeSource from '~/examples/file-picker/MaxSize.vue?raw'
import FilePickerPreview from '~/examples/file-picker/Preview.vue'
import filePickerPreviewSource from '~/examples/file-picker/Preview.vue?raw'
import FilePickerMultiple from '~/examples/file-picker/Multiple.vue'
import filePickerMultipleSource from '~/examples/file-picker/Multiple.vue?raw'
import FilePickerStates from '~/examples/file-picker/States.vue'
import filePickerStatesSource from '~/examples/file-picker/States.vue?raw'
import FilePickerThumbnails from '~/examples/file-picker/Thumbnails.vue'
import filePickerThumbnailsSource from '~/examples/file-picker/Thumbnails.vue?raw'
import FilePickerTitleAndSubtitle from '~/examples/file-picker/TitleAndSubtitle.vue'
import filePickerTitleAndSubtitleSource from '~/examples/file-picker/TitleAndSubtitle.vue?raw'
import FilePickerTotalSize from '~/examples/file-picker/TotalSize.vue'
import filePickerTotalSizeSource from '~/examples/file-picker/TotalSize.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('filePicker')
</script>

<template>
  <h1>{{ t('filePicker.title') }}</h1>
  <DocsProse class="vd-lead" keypath="filePicker.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="filePickerBasicSource" stack>
    <FilePickerBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="title-and-subtitle">{{ t('filePicker.examples.titleAndSubtitle.title') }}</h3>
  <DocsProse keypath="filePicker.examples.titleAndSubtitle.text" />
  <DocsExample :source="filePickerTitleAndSubtitleSource" stack>
    <FilePickerTitleAndSubtitle />
  </DocsExample>

  <h3 id="preview">{{ t('filePicker.examples.preview.title') }}</h3>
  <DocsProse keypath="filePicker.examples.preview.text" />
  <DocsExample :source="filePickerPreviewSource" stack>
    <FilePickerPreview />
  </DocsExample>

  <h3 id="custom-icons">{{ t('filePicker.examples.customIcons.title') }}</h3>
  <DocsProse keypath="filePicker.examples.customIcons.text" />
  <DocsExample :source="filePickerCustomIconsSource" stack>
    <FilePickerCustomIcons />
  </DocsExample>

  <h3 id="thumbnails">{{ t('filePicker.examples.thumbnails.title') }}</h3>
  <DocsProse keypath="filePicker.examples.thumbnails.text" />
  <DocsExample :source="filePickerThumbnailsSource" stack>
    <FilePickerThumbnails />
  </DocsExample>

  <h3 id="multiple">{{ t('filePicker.examples.multiple.title') }}</h3>
  <DocsProse keypath="filePicker.examples.multiple.text" />
  <DocsExample :source="filePickerMultipleSource" stack>
    <FilePickerMultiple />
  </DocsExample>

  <h3 id="accept">{{ t('filePicker.examples.accept.title') }}</h3>
  <DocsProse keypath="filePicker.examples.accept.text" />
  <DocsExample :source="filePickerAcceptSource" stack>
    <FilePickerAccept />
  </DocsExample>

  <h3 id="maximum-size">{{ t('filePicker.examples.maxSize.title') }}</h3>
  <DocsProse keypath="filePicker.examples.maxSize.text" />
  <DocsExample :source="filePickerMaxSizeSource" stack>
    <FilePickerMaxSize />
  </DocsExample>

  <h3 id="total-size-and-count">{{ t('filePicker.examples.totalSize.title') }}</h3>
  <DocsProse keypath="filePicker.examples.totalSize.text" />
  <DocsExample :source="filePickerTotalSizeSource" stack>
    <FilePickerTotalSize />
  </DocsExample>

  <h3 id="states">{{ t('filePicker.examples.states.title') }}</h3>
  <DocsProse keypath="filePicker.examples.states.text" />
  <DocsExample :source="filePickerStatesSource" stack>
    <FilePickerStates />
  </DocsExample>

  <DocsApi page="filePicker" :api="api" />
</template>
