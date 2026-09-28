<script setup lang="ts">
import { VIconButton, VTooltip } from 'vectis-ui'
import { close, description, search } from 'vectis-ui/icons'
</script>

<template>
  <div class="demo">
    <VTooltip text="Search everything">
      <template #default="{ triggerProps }">
        <VIconButton
          v-bind="triggerProps"
          :icon="search"
          label="Search"
          variant="outline"
          tone="neutral"
        />
      </template>
    </VTooltip>

    <VTooltip text="Export the current view as a CSV file">
      <template #default="{ triggerProps }">
        <VIconButton
          v-bind="triggerProps"
          :icon="description"
          label="Export"
          variant="outline"
          tone="neutral"
        />
      </template>
    </VTooltip>

    <!-- Keep essential information available outside tooltips for touch users. -->
    <VTooltip text="Discard the draft">
      <template #default="{ triggerProps }">
        <VIconButton
          v-bind="triggerProps"
          :icon="close"
          label="Discard"
          variant="outline"
          tone="danger"
        />
      </template>
    </VTooltip>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-4);
}
</style>
