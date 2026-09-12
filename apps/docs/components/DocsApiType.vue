<script setup lang="ts">
/**
 * The Type cell of an API table: the type as the library writes it, and what it admits.
 *
 * One question, two answers, and which one a reader gets follows from what the type IS. A closed
 * set of values is printed under the name rather than instead of it, the name being what a
 * consumer imports and the values what they choose between. A shape cannot be read in a cell, so
 * the name becomes a link to the definition the page prints under its Types heading.
 *
 * The generator is what guarantees a reader always gets one of the two: a name standing as the
 * whole of a cell whose values it expanded carries no definition, and every other mention does.
 */
import type { ApiEntry, TypeEntry } from '~/content/api/types'

import { anchorOf } from '~/content/api/types'

const props = defineProps<{
  /** The row being rendered. Only its type and its values are read. */
  entry: ApiEntry
  /** The page's named types: what decides whether a name in this cell is a link. */
  types?: TypeEntry[]
}>()

/**
 * LONGEST NAME FIRST. An alternation matches whichever branch is written earliest, so a name that
 * is the prefix of another would claim the first half of it and leave the rest as plain text.
 */
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
/* The values go UNDER the name, muted: the table is read down its Type column, and a second line
   in the text colour would read as a second entry rather than as a gloss on the one above it.
   `max-inline-size` is what keeps a twelve-member placement union lengthening the cell instead of
   widening the table, the wrapping being free — a `<code>` does not preserve whitespace. */
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
