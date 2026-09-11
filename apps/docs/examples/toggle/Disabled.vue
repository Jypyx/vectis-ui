<script setup lang="ts">
import { ref } from 'vue'
import { VToggle, VToggleItem } from 'vectis-ui'

const group = ref('week')
const item = ref('day')
</script>

<template>
  <div class="demo">
    <!-- The whole group at once: nothing responds and no item takes focus. -->
    <div class="row">
      <p class="caption">the group</p>
      <VToggle v-model="group" disabled item-variant="outline" label="Period, disabled">
        <VToggleItem value="day" label="Day" />
        <VToggleItem value="week" label="Week" />
        <VToggleItem value="month" label="Month" />
      </VToggle>
    </div>

    <!-- Or a single item, which stops responding and which the arrow keys step over as
         though it were not in the row. Both grey out through the colour tokens rather
         than through an opacity, so they keep their contrast. -->
    <div class="row">
      <p class="caption">one item</p>
      <VToggle v-model="item" item-variant="outline" label="Period">
        <VToggleItem value="day" label="Day" />
        <VToggleItem value="week" label="Week" disabled />
        <VToggleItem value="month" label="Month" />
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
