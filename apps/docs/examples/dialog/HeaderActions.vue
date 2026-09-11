<script setup lang="ts">
import { ref } from 'vue'
import {
  VButton,
  VDialog,
  VIconButton,
  VMenu,
  VMenuItem,
  VMenuSeparator,
  VTypography,
} from 'vectis-ui'
import { info, more_horiz as moreHoriz } from 'vectis-ui/icons'

const open = ref(false)
const details = ref(false)
</script>

<template>
  <VDialog v-model:open="open" width="480px" title="Quarterly report" subtitle="report-q3.pdf">
    <template #trigger="{ triggerProps }">
      <VButton v-bind="triggerProps">Open the preview</VButton>
    </template>

    <!-- Rendered before the close cross, which keeps the cross at the edge where the
         reader looks for it. -->
    <template #header-actions>
      <VIconButton
        :icon="info"
        label="File details"
        variant="ghost"
        tone="neutral"
        size="sm"
        @click="details = !details"
      />
      <VMenu>
        <template #trigger="{ triggerProps }">
          <VIconButton
            v-bind="triggerProps"
            :icon="moreHoriz"
            label="More actions"
            variant="ghost"
            tone="neutral"
            size="sm"
          />
        </template>
        <VMenuItem label="Rename" />
        <VMenuItem label="Duplicate" />
        <VMenuSeparator />
        <VMenuItem label="Delete" tone="danger" />
      </VMenu>
    </template>

    <VTypography v-if="details" tone="muted" variant="body-sm">
      PDF, 2.4 MB, updated on 12 September.
    </VTypography>
    <VTypography>
      The report covers the third quarter and supersedes the figures circulated in August.
    </VTypography>

    <template #footer>
      <VButton @click="open = false">Close</VButton>
    </template>
  </VDialog>
</template>
