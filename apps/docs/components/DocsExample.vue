<script setup lang="ts">
/**
 * A live example and the code that produces it, on one card, behind a toggle.
 *
 * The two are never written twice: the example is a real SFC under `examples/`, and the page
 * imports it once as a component and once through Vite's `?raw` for its source. What the reader
 * switches to is therefore the file that is running in front of them, down to its imports.
 *
 * `v-show` and not `v-if`: a demo with state of its own — a switch that has been flicked, a
 * dialog that is open — must still be in that state when the reader comes back from the code.
 *
 * The mode starts on the preview, which is a constant, so the server and the first client render
 * agree and there is nothing for hydration to disagree about.
 */
import { VToggle, VToggleItem, VIconButton, VTypography } from 'vectis-ui'

const props = defineProps<{
  /** The example's source, as `?raw` hands it over. */
  source: string
  /** Shown in the header and named on the copy: `vue` unless the example is not one. */
  lang?: string
  /** Stacks the preview in a column and stretches it, for fields and full-width examples. */
  stack?: boolean
}>()

const { t } = useI18n()
const { copy, trim } = useCopyCode()

const mode = ref<'preview' | 'code'>('preview')
const text = computed(() => trim(props.source))
</script>

<template>
  <div class="vd-example">
    <div class="vd-example-head">
      <!--
        `overline` supplies the capitals, the tracking and the size; the class adds only the
        monospaced family, which is the one thing that role does not own and should not — what
        it names here is a language, not a word.
      -->
      <VTypography variant="overline" tone="muted" class="vd-code-lang">
        {{ lang ?? 'vue' }}
      </VTypography>
      <!--
        The toggle sits after the language tag and before the copy button, which is the slot
        `DocsCode` gives its own header control: the two cards then read the same way round,
        whichever one a page happens to show.

        `mandatory` is what makes this a two-state switch rather than a pair of buttons: without
        it, clicking the selected side deselects it and the card would show neither.
      -->
      <VToggle
        v-model="mode"
        mandatory
        size="xs"
        variant="outline"
        selected-variant="soft"
        tone="accent"
        :label="t('common.example.label')"
      >
        <VToggleItem value="preview">{{ t('common.example.preview') }}</VToggleItem>
        <VToggleItem value="code">{{ t('common.example.code') }}</VToggleItem>
      </VToggle>
      <VIconButton
        :label="t('common.code.copy')"
        icon="content_copy"
        variant="ghost"
        tone="neutral"
        size="sm"
        class="vd-code-copy"
        @click="copy(source)"
      />
    </div>
    <div
      v-show="mode === 'preview'"
      class="vd-example-preview"
      :data-stack="stack ? '' : undefined"
    >
      <slot />
    </div>
    <pre v-show="mode === 'code'">{{ text }}</pre>
  </div>
</template>
