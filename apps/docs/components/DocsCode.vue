<script setup lang="ts">
/**
 * Render and copy the supplied source string directly so clipboard content does not depend on
 * DOM text extraction.
 */
import { VIconButton, VTypography } from 'vectis-ui'

const props = defineProps<{
  /** Shown in the header, uppercased by the `overline` role: `vue`, `ts`, `css`, `bash`… */
  lang: string
  /** The sample itself. A leading newline and trailing blanks are trimmed, so a template literal can be written on its own lines. */
  code: string
}>()

defineSlots<{
  /** Optional control between the language tag and the copy button. */
  head?(): unknown
}>()

const { t } = useI18n()
const { copy, trim } = useCopyCode()

const text = computed(() => trim(props.code))
</script>

<template>
  <div class="vd-code">
    <div class="vd-code-head">
      <VTypography variant="overline" tone="muted" class="vd-code-lang">{{ lang }}</VTypography>
      <slot name="head" />
      <VIconButton
        :label="t('common.code.copy')"
        icon="content_copy"
        variant="ghost"
        tone="neutral"
        size="sm"
        class="vd-code-copy"
        @click="copy(code)"
      />
    </div>
    <pre>{{ text }}</pre>
  </div>
</template>
