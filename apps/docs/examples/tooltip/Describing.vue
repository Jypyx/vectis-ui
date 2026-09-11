<script setup lang="ts">
import { VIconButton, VTooltip } from 'vectis-ui'
import { close, description, search } from 'vectis-ui/icons'
</script>

<template>
  <div class="demo">
    <!-- The tooltip DESCRIBES and never names: it sets `aria-describedby` on the
         trigger, and the trigger keeps its own accessible name. An icon button
         therefore still carries its `label`, and the tooltip is the visual
         confirmation of it rather than a replacement. -->
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

    <!-- A tap opens nothing, there being no hover on a touch screen and no room for a
         panel standing over what the tap just opened. So whatever the tooltip says has
         to exist somewhere else too: a visible label, a field hint, a panel. -->
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
