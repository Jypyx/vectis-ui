<script setup lang="ts">
import { ref } from 'vue'
import { VPagination, VTypography } from 'vectis-ui'

const listed = ref(1)
const predicate = ref(1)
</script>

<template>
  <div class="column">
    <!-- A list, for a handful of known pages. The controls STEP OVER them rather than
         stopping at one: from page 1, next lands on 5. -->
    <div class="row">
      <VPagination
        v-model="listed"
        :length="10"
        :disabled-pages="[2, 3, 4]"
        controls="both"
        item-variant="outline"
        label="Pages 2 to 4 unavailable"
      />
      <VTypography variant="caption" tone="muted">A list. Now on page {{ listed }}</VTypography>
    </div>

    <!-- A predicate, when the rule is easier to write than to enumerate. When nothing
         is left to step to, the control disables itself. -->
    <div class="row">
      <VPagination
        v-model="predicate"
        :length="10"
        :disabled-pages="(page) => page % 2 === 0"
        controls="both"
        item-variant="outline"
        label="Even pages unavailable"
      />
      <VTypography variant="caption" tone="muted">
        A predicate. Now on page {{ predicate }}
      </VTypography>
    </div>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-5);
}
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--vectis-space-5);
}
</style>
