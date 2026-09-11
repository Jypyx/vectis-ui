<script setup lang="ts">
import { VSkeletonLoader } from 'vectis-ui'
</script>

<template>
  <!-- The component has no width of its own: it fills what it is given, so a
       container is what decides how wide the silhouette is. -->
  <div class="demo">
    <VSkeletonLoader :lines="3" />
  </div>
</template>

<style scoped>
.demo {
  inline-size: 22rem;
}
</style>
