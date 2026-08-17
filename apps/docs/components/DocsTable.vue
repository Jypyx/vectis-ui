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
}>()
</script>

<template>
  <div class="vd-scroll">
    <table class="vd-table">
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
