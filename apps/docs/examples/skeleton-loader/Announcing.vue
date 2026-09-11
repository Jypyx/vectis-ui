<script setup lang="ts">
import { VSkeletonLoader } from 'vectis-ui'
</script>

<template>
  <div class="demo">
    <!-- A skeleton is silent by default: a page holds a dozen of them and a dozen
         competing announcements are unreadable. One instance per zone speaks, and
         `label` is what it says, which is also what turns the announcement on. Prefer
         something situated: a generic word is the reason the default is silence. -->
    <VSkeletonLoader shape="control" size="sm" label="Loading the results" />

    <!-- The rest stay decorative, hidden from the accessibility tree. -->
    <VSkeletonLoader v-for="n in 7" :key="n" shape="control" size="sm" />
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-2);
  inline-size: 20rem;
}
</style>
