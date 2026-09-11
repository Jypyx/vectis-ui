<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { VButton, VPopover, VTypography } from 'vectis-ui'

const manualOpen = ref(false)
const syncPanel = useTemplateRef<InstanceType<typeof VPopover>>('syncPanel')
</script>

<template>
  <div class="column">
    <!-- auto: the browser dismisses it on a click outside or on Escape, and stacks it
         with the other panels on the page. The model is written back from the DOM, so
         nothing has to be reset by hand. -->
    <VPopover>
      <template #trigger="{ triggerProps }">
        <VButton v-bind="triggerProps" variant="outline" tone="neutral">auto</VButton>
      </template>
      <VTypography variant="body-sm">
        Click outside or press Escape: the browser closes this one.
      </VTypography>
    </VPopover>

    <!-- manual: nothing dismisses it but you. This is what a panel with rules of its
         own needs, and it means the panel must offer a way out. -->
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

    <!-- The model costs a tick. When the opening has to be synchronous, because a focus
         move or a timer is armed on the assumption the panel is already there, the
         exposed methods are the route. -->
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
