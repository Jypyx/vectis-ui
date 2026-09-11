<script setup lang="ts">
import { VSkeletonLoader } from 'vectis-ui'
</script>

<template>
  <div class="demo">
    <!-- In the text shape the height is one em and the gutter is the leading, so N
         silhouettes occupy exactly N lines of the typography around them: swapping
         them for the real text shifts nothing. The last line is drawn shorter, and
         that single detail is what reads as a paragraph rather than as a table. -->
    <div class="body">
      <p class="caption">body-sm, 5 lines</p>
      <VSkeletonLoader :lines="5" />
    </div>

    <div class="heading">
      <p class="caption">heading-2, 2 lines</p>
      <VSkeletonLoader :lines="2" />
    </div>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-6);
  inline-size: 24rem;
}
.body {
  font-size: var(--vectis-text-body-sm-size);
  line-height: var(--vectis-text-body-sm-leading);
}
.heading {
  font-size: var(--vectis-text-heading-2-size);
  line-height: var(--vectis-text-heading-2-leading);
}
.caption {
  margin: 0 0 var(--vectis-space-2);
  color: var(--vectis-color-text-muted);
  font-size: var(--vectis-text-caption-size);
  line-height: var(--vectis-text-caption-leading);
}
</style>
