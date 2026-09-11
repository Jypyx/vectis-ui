<script setup lang="ts">
import { ref } from 'vue'
import { VToggle, VToggleItem } from 'vectis-ui'

const period = ref('week')
const kinds = ref(['images'])
</script>

<template>
  <div class="demo">
    <!-- Clicking the chosen item normally gives it up, leaving nothing selected.
         `mandatory` refuses that last step, so a row that has an answer keeps one. It
         is a guard and nothing more: it selects nothing on its own at the start, and a
         group that begins empty stays empty until something is clicked. -->
    <div class="row">
      <p class="caption">one choice</p>
      <VToggle v-model="period" mandatory item-variant="outline" label="Period">
        <VToggleItem value="day" label="Day" />
        <VToggleItem value="week" label="Week" />
        <VToggleItem value="month" label="Month" />
      </VToggle>
    </div>

    <!-- With several, it is the last remaining one that cannot be given up. -->
    <div class="row">
      <p class="caption">several, the last one held</p>
      <VToggle v-model="kinds" multiple mandatory item-variant="outline" label="Media">
        <VToggleItem value="images" label="Images" />
        <VToggleItem value="video" label="Video" />
        <VToggleItem value="audio" label="Audio" />
      </VToggle>
    </div>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-5);
}
.row {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-2);
}
.caption {
  margin: 0;
  color: var(--vectis-color-text-muted);
  font-size: var(--vectis-text-caption-size);
}
</style>
