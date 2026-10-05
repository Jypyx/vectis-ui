<script setup lang="ts">
import { VLink } from 'vectis-ui'
</script>

<template>
  <ul class="links">
    <li><VLink href="#underline">Always underlined</VLink></li>
    <li><VLink href="#underline" underline="hover">Underlined on hover</VLink></li>
    <li><VLink href="#underline" underline="none">Never underlined</VLink></li>
  </ul>
</template>

<style scoped>
.links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-6);
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
