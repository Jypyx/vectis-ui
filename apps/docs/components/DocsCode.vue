<script setup lang="ts">
/**
 * A code sample, with its language and a button that copies it.
 *
 * The code arrives as a PROP rather than through a slot, and that is what makes the samples
 * safe to write: Vue's interpolation escapes the text, so a `<template>` or a `<VButton>` in
 * an example is written literally instead of as `&lt;`. It also means the copy button has the
 * exact string to hand and never has to read `innerText` back out of the DOM.
 */
import { VIconButton, VTypography, snackbar } from 'vectis-ui'

const props = defineProps<{
  /** Shown in the header, uppercased by the `overline` role: `vue`, `ts`, `css`, `bash`… */
  lang: string
  /** The sample itself. A leading newline and trailing blanks are trimmed, so a template literal can be written on its own lines. */
  code: string
}>()

defineSlots<{
  /**
   * A control placed in the header, between the language tag and the copy button — the home
   * page's package-manager toggle is the only one today. It stays a slot rather than a prop
   * because the header is chrome this component owns while the CONTENT of such a control is
   * always the caller's: `code` arrives from outside, so whatever changes it belongs outside
   * too. Left unused, as it is by every other sample on the site, it renders nothing at all
   * and the header keeps its two-item layout.
   */
  head?(): unknown
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
  // No icon, and none is deduced from the tone: a confirmation of six words is read, not
  // scanned. No close cross either — a bar that tidies itself must not ask to be tidied, which
  // is why VSnackbar has none to turn off.
  snackbar({
    message: t('common.code.copied'),
    placement: 'bottom-center',
    duration: 1600,
  })
}
</script>

<template>
  <div class="vd-code">
    <div class="vd-code-head">
      <!--
        `overline` supplies the capitals, the tracking and the size; the class adds only the
        monospaced family, which is the one thing that role does not own and should not — what
        it names here is a language, not a word.
      -->
      <VTypography variant="overline" tone="muted" class="vd-code-lang">{{ lang }}</VTypography>
      <slot name="head" />
      <VIconButton
        :label="t('common.code.copy')"
        icon="content_copy"
        variant="ghost"
        tone="neutral"
        size="sm"
        class="vd-code-copy"
        @click="copy"
      />
    </div>
    <pre>{{ text }}</pre>
  </div>
</template>
