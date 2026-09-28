<script setup lang="ts">
import { VSkeletonLoader } from 'vectis-ui'
</script>

<template>
  <div class="demo">
    <VSkeletonLoader :lines="3" />
  </div>
</template>

<style scoped>
.demo {
  inline-size: 22rem;
}
</style>
