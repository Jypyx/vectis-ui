<script setup lang="ts">
import { ref } from 'vue'
import { VPagination, VTypography } from 'vectis-ui'

const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const

const page = ref(3)
</script>

<template>
  <div class="column">
    <div v-for="size in sizes" :key="size" class="row">
      <VPagination
        v-model="page"
        :length="6"
        :size="size"
        item-variant="outline"
        :label="`Pages, ${size}`"
      />
      <VTypography variant="caption" tone="muted">{{ size }}</VTypography>
    </div>

    <!-- A pill is square at one digit and widens by itself past that: its minimum
         width derives from the control height, so nothing is set per size. -->
    <div v-for="size in sizes" :key="`${size}-compact`" class="row">
      <VPagination
        v-model="page"
        :length="6"
        :size="size"
        compact
        item-variant="outline"
        :label="`Pages, ${size} compact`"
      />
      <VTypography variant="caption" tone="muted">{{ size }} compact</VTypography>
    </div>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-4);
}
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--vectis-space-5);
}
</style>
