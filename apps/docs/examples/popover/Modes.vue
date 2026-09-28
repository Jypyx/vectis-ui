<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { VButton, VPopover, VTypography } from 'vectis-ui'

const manualOpen = ref(false)
const syncPanel = useTemplateRef<InstanceType<typeof VPopover>>('syncPanel')
</script>

<template>
  <div class="column">
    <VPopover>
      <template #trigger="{ triggerProps }">
        <VButton v-bind="triggerProps" variant="outline" tone="neutral">auto</VButton>
      </template>
      <VTypography variant="body-sm">
        Click outside or press Escape: the browser closes this one.
      </VTypography>
    </VPopover>

    <VPopover v-model:open="manualOpen" mode="manual">
      <template #trigger="{ triggerProps }">
        <VButton v-bind="triggerProps" variant="outline" tone="neutral">manual</VButton>
      </template>
      <div class="panel">
        <VTypography variant="body-sm">
          Clicking outside leaves this open. Escape does nothing either.
        </VTypography>
        <VButton size="sm" @click="manualOpen = false">Close</VButton>
      </div>
    </VPopover>

    <!-- Use exposed methods when opening must happen synchronously. -->
    <div class="row">
      <VPopover ref="syncPanel" mode="manual">
        <template #trigger="{ triggerProps }">
          <VButton v-bind="triggerProps" variant="outline" tone="neutral">
            Opened through the ref
          </VButton>
        </template>
        <div class="panel">
          <VTypography variant="body-sm"
            >Opened synchronously, with no tick in between.</VTypography
          >
          <VButton size="sm" @click="syncPanel?.close()">Close</VButton>
        </div>
      </VPopover>
      <VButton variant="ghost" tone="neutral" @click="syncPanel?.show()">show()</VButton>
    </div>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-4);
}
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--vectis-space-3);
}
.panel {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-3);
  max-inline-size: 16rem;
}
</style>
