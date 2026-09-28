<script setup lang="ts">
/**
 * Import each example as an SFC and as raw source. Use v-show to preserve demo state when
 * switching to code.
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
      <VTypography variant="overline" tone="muted" class="vd-code-lang">
        {{ lang ?? 'vue' }}
      </VTypography>
      <!--
        `mandatory` is what makes this a two-state switch rather than a pair of buttons: without
        it, clicking the selected side deselects it and the card would show neither.
      -->
      <VToggle
        v-model="mode"
        mandatory
        size="xs"
        item-variant="outline"
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
