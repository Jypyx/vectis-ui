<script setup lang="ts">
/** Render closed unions below their type name; link structured types to their declarations. */
import type { ApiEntry, TypeEntry } from '~/content/api/types'

import { anchorOf } from '~/content/api/types'

const props = defineProps<{
  /** The row being rendered. Only its type and its values are read. */
  entry: ApiEntry
  /** The page's named types: what decides whether a name in this cell is a link. */
  types?: TypeEntry[]
}>()

/** Match longer type names first so a prefix cannot consume part of another name. */
const pattern = computed(() => {
  const names = (props.types ?? []).map((one) => one.name).sort((a, b) => b.length - a.length)
  return names.length > 0 ? new RegExp(`\\b(${names.join('|')})\\b`, 'g') : undefined
})

interface Segment {
  text: string
  /** The anchor of the definition below, on a segment that is one of the page's named types. */
  href?: string
}

/** The cell cut into the names this page defines and whatever is written between them. */
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
  <!--
    The segments are written one per line deliberately: the compiler's `condense` whitespace mode
    drops a whitespace-only node that contains a newline, so nothing is inserted between two
    segments. Put them on one line with spaces around them and `ComboboxOption[]` would be
    rendered as `ComboboxOption []`.
  -->
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
/* A link on the TEXT's own colour, the DocsOutline rail's arrangement: a Type column of thirteen
   rows turned accent would read as thirteen things to do, where all this one says is that the
   name has a shape and the shape is printed further down. The dotted underline is what still
   marks it as a link at a glance. */
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
