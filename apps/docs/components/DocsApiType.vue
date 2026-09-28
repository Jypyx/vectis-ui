<script setup lang="ts">
/** Render closed unions below their type name; link structured types to their declarations. */
import type { ApiEntry, TypeEntry } from '~/content/api/types'

import { anchorOf } from '~/content/api/types'

const props = defineProps<{
  /** API row supplying the type and union values. */
  entry: ApiEntry
  /** Named types available as definition links. */
  types?: TypeEntry[]
}>()

/** Match longer type names first so a prefix cannot consume part of another name. */
const pattern = computed(() => {
  const names = (props.types ?? []).map((one) => one.name).sort((a, b) => b.length - a.length)
  return names.length > 0 ? new RegExp(`\\b(${names.join('|')})\\b`, 'g') : undefined
})

interface Segment {
  text: string
  /** Definition anchor for a named type. */
  href?: string
}

const segments = computed<Segment[]>(() => {
  const type = props.entry.type
  const regex = pattern.value
  if (!regex) return [{ text: type }]

  const cut: Segment[] = []
  let end = 0
  for (const match of type.matchAll(regex)) {
    if (match.index > end) cut.push({ text: type.slice(end, match.index) })
    cut.push({ text: match[0], href: `#${anchorOf(match[0])}` })
    end = match.index + match[0].length
  }
  if (end < type.length) cut.push({ text: type.slice(end) })
  return cut
})
</script>

<template>
  <!-- Newlines let Vue condense whitespace without inserting spaces inside type names. -->
  <td>
    <code>
      <template v-for="(segment, index) in segments" :key="index">
        <a v-if="segment.href" :href="segment.href" class="vd-api-type-link">{{ segment.text }}</a>
        <template v-else>{{ segment.text }}</template>
      </template>
    </code>
    <code v-if="entry.values" class="vd-api-values">{{ entry.values }}</code>
  </td>
</template>

<style scoped>
.vd-api-values {
  display: block;
  max-inline-size: 22rem;
  color: var(--vectis-color-text-muted);
}
/* Keep type links on the text colour; the dotted underline marks them as links. */
.vd-api-type-link {
  color: inherit;
  text-decoration: underline dotted;
}
.vd-api-type-link:hover {
  color: var(--vectis-color-accent-text);
}
.vd-api-type-link:focus-visible {
  outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
  outline-offset: var(--vectis-focus-ring-offset);
  border-radius: var(--vectis-radius-xs);
}
</style>
