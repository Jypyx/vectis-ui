<script setup lang="ts">
/**
 * A code sample, with its language and a button that copies it.
 *
 * The code arrives as a PROP rather than through a slot, and that is what makes the samples
 * safe to write: Vue's interpolation escapes the text, so a `<template>` or a `<VButton>` in
 * an example is written literally instead of as `&lt;`. It also means the copy button has the
 * exact string to hand and never has to read `innerText` back out of the DOM.
 */
import { VIconButton, toast } from '@vectis/ui'

const props = defineProps<{
  /** Shown in the header, uppercased by CSS: `vue`, `ts`, `css`, `bash`… */
  lang: string
  /** The sample itself. A leading newline and trailing blanks are trimmed, so a template literal can be written on its own lines. */
  code: string
}>()

const { t } = useI18n()

const text = computed(() => props.code.replace(/^\n/, '').replace(/\s+$/, ''))

async function copy() {
  try {
    await navigator.clipboard.writeText(text.value)
  } catch {
    // A refused clipboard (an insecure origin, a permission policy) must not be reported as
    // a success — saying nothing is the honest outcome, and the sample is still selectable.
    return
  }
  toast({
    message: t('common.code.copied'),
    placement: 'bottom-center',
    duration: 1600,
    closable: false,
  })
}
</script>

<template>
  <div class="vd-code">
    <div class="vd-code-head">
      <span class="vd-code-lang">{{ lang }}</span>
      <VIconButton
        :label="t('common.code.copy')"
        icon="content_copy"
        variant="ghost"
        tone="neutral"
        size="sm"
        @click="copy"
      />
    </div>
    <pre>{{ text }}</pre>
  </div>
</template>
