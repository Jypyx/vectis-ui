<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VDrawer, VTypography } from 'vectis-ui'
import type { DrawerSize } from 'vectis-ui'

const SIZES: DrawerSize[] = ['sm', 'md', 'lg']

const opened = ref<string | null>(null)
</script>

<template>
  <div class="row">
    <VButton
      v-for="size in SIZES"
      :key="size"
      variant="outline"
      tone="neutral"
      @click="opened = size"
    >
      {{ size }}
    </VButton>
    <VButton variant="outline" tone="neutral" @click="opened = 'extent'">extent="50vw"</VButton>
  </div>

  <VDrawer
    v-for="size in SIZES"
    :key="size"
    :size="size"
    :open="opened === size"
    :title="`Size ${size}`"
    @update:open="(value) => !value && (opened = null)"
  >
    <VTypography>On a narrow screen the drawer leaves a strip of the page uncovered.</VTypography>
  </VDrawer>
  <VDrawer
    extent="50vw"
    :open="opened === 'extent'"
    title="Half the viewport"
    @update:open="(value) => !value && (opened = null)"
  >
    <VTypography>The extent is a CSS length, in any unit.</VTypography>
  </VDrawer>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-2);
}
</style>
