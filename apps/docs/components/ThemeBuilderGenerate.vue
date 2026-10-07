<script setup lang="ts">
/** The Generate button and its dialog: the stylesheet and the icon setup, ready to copy. */
import { VButton, VDialog, VTab, VTabPanel, VTabs, VTextarea } from 'vectis-ui'
import { code as codeIcon } from 'vectis-ui/icons'

import { generatedCss, nuxtSnippet, vueSnippet, type SnippetNotes } from '~/theme-builder/output'

const { t } = useI18n()
const { config } = useThemeBuilder()
const { commandFor } = usePackageManager()
const { copy } = useCopyCode()

const open = ref(false)
const format = ref('css')

const notes = computed<SnippetNotes>(() => ({
  install: (command) => `${t('themeBuilder.install')} ${command}`,
  builtin: t('themeBuilder.builtinIcons'),
  universal: t('themeBuilder.universal'),
}))

/** Built while the dialog is open only; closed, nothing reads them. */
const files = computed(() => {
  if (!open.value) return []
  return [
    {
      value: 'css',
      label: 'CSS',
      file: 'theme.css',
      hint: 'themeBuilder.cssHint',
      code: generatedCss(config.value, {
        header: t('themeBuilder.cssHeader'),
        empty: t('themeBuilder.cssEmpty'),
      }),
    },
    {
      value: 'vue',
      label: 'Vue',
      file: 'main.ts',
      hint: 'themeBuilder.vueHint',
      code: vueSnippet(config.value, commandFor, notes.value),
    },
    {
      value: 'nuxt',
      label: 'Nuxt',
      file: 'nuxt.config.ts',
      hint: 'themeBuilder.nuxtHint',
      code: nuxtSnippet(config.value, commandFor, notes.value),
    },
  ]
})
</script>

<template>
  <VDialog
    v-model:open="open"
    :title="t('themeBuilder.dialogTitle')"
    :subtitle="t('themeBuilder.dialogSubtitle')"
    width="760px"
  >
    <template #trigger="{ triggerProps }">
      <VButton v-bind="triggerProps" :icon-start="codeIcon" full-width>
        {{ t('themeBuilder.generate') }}
      </VButton>
    </template>

    <VTabs v-model="format" :label="t('themeBuilder.formats')">
      <VTab v-for="file in files" :key="file.value" :value="file.value" :label="file.label" />
      <template #panels>
        <VTabPanel v-for="file in files" :key="file.value" :value="file.value">
          <div class="vd-tb-output">
            <DocsProse :keypath="file.hint" variant="body-sm" tone="muted" />
            <VTextarea
              :model-value="file.code"
              :label="file.file"
              readonly
              :rows="16"
              class="vd-tb-code"
            />
            <VButton
              variant="outline"
              tone="neutral"
              icon-start="content_copy"
              class="vd-tb-copy"
              @click="copy(file.code)"
            >
              {{ t('themeBuilder.copy') }}
            </VButton>
          </div>
        </VTabPanel>
      </template>
    </VTabs>
  </VDialog>
</template>

<style scoped>
.vd-tb-output {
  display: grid;
  gap: var(--vectis-space-3);
  padding-block-start: var(--vectis-space-4);
}
.vd-tb-code :deep(textarea) {
  font-family: var(--vectis-text-family-code);
  font-size: var(--vectis-text-code-size);
  white-space: pre;
}
.vd-tb-copy {
  justify-self: end;
}
</style>
