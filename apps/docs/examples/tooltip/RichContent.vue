<script setup lang="ts">
import { VButton, VHotkeys, VTooltip, VTypography } from 'vectis-ui'
</script>

<template>
  <!-- The slot wins over the `text` prop when both are given. It has to stay
       non-interactive: the tooltip closes as soon as the pointer leaves the trigger,
       so a link inside could never be reached, and the description is flattened to
       plain text for a screen reader anyway. Anything one can act on belongs in a
       panel that stays open. -->
  <VTooltip placement="bottom-start">
    <template #default="{ triggerProps }">
      <VButton variant="outline" tone="neutral" v-bind="triggerProps">Search</VButton>
    </template>

    <template #content>
      <div class="content">
        <VTypography variant="label" as="strong">Global search</VTypography>
        <span>Looks through projects, files and people.</span>
        <!-- The panel is an inverse surface, dark in both themes, and VHotkeys paints
             itself from the colour it inherits: the caps follow it with nothing to
             set. -->
        <span class="shortcut">
          Shortcut
          <VHotkeys keys="mod+k" variant="outlined" />
        </span>
      </div>
    </template>
  </VTooltip>
</template>

<style scoped>
.content {
  display: grid;
  gap: var(--vectis-space-1);
  padding-block: var(--vectis-space-1);
}
.shortcut {
  display: flex;
  align-items: center;
  gap: var(--vectis-space-2);
}
</style>
