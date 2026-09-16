<script setup lang="ts">
import type { TokenRow } from '~/content/designTokens'

/**
 * One row of a Design tokens table: the property name, its description, and either its default
 * value or, in a `themed` table, its value in each theme.
 *
 * The description is looked up by the token's name in the catalogue. A backtick in it marks a
 * prop or an attribute name, rendered as code by splitting the text rather than by injecting
 * markup, so the sentence needs no HTML of its own.
 */
const props = defineProps<{
  row: TokenRow
  /** Shows a Light and a Dark column instead of a single default value. */
  themed?: boolean
}>()

const { t, tm, rt } = useI18n()

/*
 * `tm` hands back the catalogue's record, whose entries are either plain strings or the message
 * functions the production build compiles them into; `rt` resolves the latter only.
 */
const segments = computed(() => {
  const entry = (tm('designTokens.descriptions') as Record<string, unknown>)[props.row.name]
  const text = typeof entry === 'string' ? entry : rt(entry as never)
  return text.split('`').map((part, index) => ({ part, code: index % 2 === 1 }))
})
</script>

<template>
  <tr>
    <td class="vd-token-name">
      <code>{{ row.name }}</code>
    </td>
    <td>
      <template v-for="(segment, index) in segments" :key="index">
        <code v-if="segment.code">{{ segment.part }}</code>
        <template v-else>{{ segment.part }}</template>
      </template>
    </td>
    <td>
      <DocsTokenValue :value="row.light" :swatch="row.isColor" />
    </td>
    <td v-if="themed">
      <DocsTokenValue v-if="row.dark" :value="row.dark" :swatch="row.isColor" />
      <template v-else>{{ t('designTokens.sameAsLight') }}</template>
    </td>
  </tr>
</template>

<style scoped>
/* A property name is copied whole, so it never breaks; a narrow screen scrolls the table. */
.vd-token-name > code {
  white-space: nowrap;
}
</style>
