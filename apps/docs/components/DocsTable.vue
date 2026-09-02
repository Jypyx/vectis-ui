<script setup lang="ts">
/**
 * A reference table — a component's props, the package's exports, the classes in the DOM.
 *
 * The scroll wrapper is part of the component rather than something each page remembers: a
 * prop table has a `white-space: nowrap` header and long union types in it, so on a narrow
 * screen it is the TABLE that has to scroll. Without the wrapper the whole page does, which
 * on a phone means the prose scrolls sideways too.
 */
defineProps<{
  /** The header row. Two or three columns, depending on what the table is listing. */
  columns: string[]
  /**
   * Names the table, for a page that shows several of the same kind — the props of VTabs, then
   * of VTab, then of VTabPanel, all under one Props heading.
   *
   * A `<caption>` and not a heading: the outline harvests every `h2`/`h3` on the page, and
   * three sub-headings per component would bury the four the reader actually navigates by. It
   * is also the element assistive technology reads as the table's own name.
   */
  caption?: string
}>()
</script>

<template>
  <div class="vd-scroll">
    <table class="vd-table">
      <caption v-if="caption">
        {{
          caption
        }}
      </caption>
      <thead>
        <tr>
          <th v-for="column in columns" :key="column">{{ column }}</th>
        </tr>
      </thead>
      <tbody>
        <slot />
      </tbody>
    </table>
  </div>
</template>
