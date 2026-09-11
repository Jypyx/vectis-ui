<script setup lang="ts">
import {
  VButton,
  VHotkeys,
  VMenu,
  VMenuItem,
  VMenuSeparator,
  VTooltip,
  VTypography,
} from 'vectis-ui'

const COMMANDS = [
  { label: 'New file', keys: 'mod+n' },
  { label: 'Save', keys: 'mod+s' },
  { label: 'Save as', keys: 'mod+shift+s' },
]
</script>

<template>
  <div class="stack">
    <!-- The cap takes its size from the text it sits in, so a shortcut written into a
         sentence keeps the line it is on. -->
    <VTypography class="prose">
      Press <VHotkeys keys="mod+k" /> to open the command palette, then type the first letters of
      what you are after. <VHotkeys keys="esc" /> puts it away again.
    </VTypography>

    <!-- At the end of a command row, which is where a shortcut is usually read. -->
    <VMenu>
      <template #trigger="{ triggerProps }">
        <VButton v-bind="triggerProps" variant="outline" tone="neutral">File</VButton>
      </template>
      <VMenuItem v-for="command in COMMANDS" :key="command.keys" :label="command.label">
        <template #end><VHotkeys :keys="command.keys" /></template>
      </VMenuItem>
      <VMenuSeparator />
      <VMenuItem label="Settings">
        <template #end><VHotkeys keys="mod+," /></template>
      </VMenuItem>
    </VMenu>

    <!-- Inside a tooltip, which is what its `#content` slot is for: rich but never
         interactive. -->
    <VTooltip>
      <template #default="{ triggerProps }">
        <VButton v-bind="triggerProps" variant="outline" tone="neutral">Save</VButton>
      </template>
      <template #content>Save this file <VHotkeys keys="mod+s" size="xs" /></template>
    </VTooltip>

    <!-- And inside the control the shortcut is a second route to. -->
    <VButton variant="outline" tone="neutral" class="search">
      Search the docs
      <VHotkeys keys="mod+k" variant="outlined" />
    </VButton>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: var(--vectis-space-5);
}
.prose {
  max-inline-size: 34rem;
  line-height: 1.9;
}
.search {
  inline-size: 18rem;
  justify-content: space-between;
}
</style>
