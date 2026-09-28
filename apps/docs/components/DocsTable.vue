<script setup lang="ts">
/** Confine wide-table overflow to its wrapper so the article does not scroll horizontally. */
defineProps<{
  /** The header row. Two or three columns, depending on what the table is listing. */
  columns: string[]
  /** Optional caption distinguishing tables of the same kind. */
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
