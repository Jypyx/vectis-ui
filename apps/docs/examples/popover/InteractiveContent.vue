<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VCheckbox, VPopover, VTypography } from 'vectis-ui'

const open = ref(false)

const filters = ref({ active: true, archived: false, mine: false })
const applied = ref('Active')

function apply() {
  const chosen = Object.entries(filters.value)
    .filter(([, on]) => on)
    .map(([key]) => key)
  applied.value = chosen.length ? chosen.join(', ') : 'none'
  open.value = false
}
</script>

<template>
  <div class="column">
    <!-- A panel holds real controls: light dismiss only fires on a click OUTSIDE, so
         everything inside keeps working, and the focus is not trapped, a popover being
         no dialog. -->
    <VPopover v-model:open="open" placement="bottom-start">
      <template #trigger="{ triggerProps }">
        <VButton v-bind="triggerProps" variant="outline" tone="neutral">Filters</VButton>
      </template>

      <div class="panel">
        <VTypography variant="overline" tone="muted">Show</VTypography>
        <VCheckbox v-model="filters.active" label="Active" />
        <VCheckbox v-model="filters.archived" label="Archived" />
        <VCheckbox v-model="filters.mine" label="Mine only" />
        <div class="actions">
          <VButton variant="ghost" tone="neutral" size="sm" @click="open = false">Cancel</VButton>
          <VButton size="sm" @click="apply">Apply</VButton>
        </div>
      </div>
    </VPopover>

    <VTypography variant="body-sm" tone="muted">Showing: {{ applied }}</VTypography>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-3);
}
.panel {
  display: grid;
  gap: var(--vectis-space-2);
  min-inline-size: 14rem;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--vectis-space-2);
  margin-block-start: var(--vectis-space-2);
}
</style>
