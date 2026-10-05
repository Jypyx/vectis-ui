<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VDrawer, VTypography } from 'vectis-ui'
import type { DrawerSide } from 'vectis-ui'

const SIDES: DrawerSide[] = ['start', 'end', 'top', 'bottom']

const opened = ref<DrawerSide | null>(null)
</script>

<template>
  <div class="row">
    <VButton
      v-for="side in SIDES"
      :key="side"
      variant="outline"
      tone="neutral"
      @click="opened = side"
    >
      {{ side }}
    </VButton>
  </div>

  <VDrawer
    v-for="side in SIDES"
    :key="side"
    :side="side"
    :open="opened === side"
    :title="`From ${side}`"
    subtitle="The drawer slides in from this edge."
    @update:open="(value) => !value && (opened = null)"
  >
    <VTypography>
      In a right-to-left page, start is the right edge and end the left one.
    </VTypography>
  </VDrawer>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-2);
}
</style>
