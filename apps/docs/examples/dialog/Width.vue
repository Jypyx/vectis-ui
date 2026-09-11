<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VDialog, VTypography } from 'vectis-ui'

/* One dialog per width, each opened by its own button. Whatever is asked for, the
   dialog is never allowed past the viewport, margins included. */
const WIDTHS = ['320px', '480px', '40rem']

const opened = ref<string | null>(null)
</script>

<template>
  <div class="row">
    <VButton
      v-for="width in WIDTHS"
      :key="width"
      variant="outline"
      tone="neutral"
      @click="opened = width"
    >
      {{ width }}
    </VButton>
  </div>

  <VDialog
    v-for="width in WIDTHS"
    :key="width"
    :width="width"
    :open="opened === width"
    :title="`A ${width} dialog`"
    subtitle="The width is a CSS length, in any unit."
    @update:open="(value) => !value && (opened = null)"
  >
    <VTypography>
      Past the viewport the dialog stops growing and keeps a margin on either side, so a width set
      in pixels never has to be defended against a narrow screen.
    </VTypography>
    <template #footer>
      <VButton @click="opened = null">Close</VButton>
    </template>
  </VDialog>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-2);
}
</style>
