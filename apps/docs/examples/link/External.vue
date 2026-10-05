<script setup lang="ts">
import { VLink } from 'vectis-ui'
import { description } from 'vectis-ui/icons'
</script>

<template>
  <ul class="links">
    <li><VLink href="https://vuejs.org" external>Vue documentation</VLink></li>
    <li>
      <VLink href="https://vuejs.org" external :external-icon="description">Another icon</VLink>
    </li>
    <li><VLink href="https://vuejs.org" external hide-external-icon>Without the icon</VLink></li>
  </ul>
</template>

<style scoped>
.links {
  display: grid;
  gap: var(--vectis-space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
