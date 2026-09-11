<script setup lang="ts">
import { ref } from 'vue'
import { VPagination, VTypography } from 'vectis-ui'
import { arrow_left_alt as arrowLeftAlt, arrow_right_alt as arrowRightAlt } from 'vectis-ui/icons'

const DISPLAYS = [
  { value: 'icon', caption: 'icon, the default' },
  { value: 'text', caption: 'text' },
  { value: 'both', caption: 'both' },
  { value: false, caption: 'false, no controls at all' },
] as const

const page = ref(3)
</script>

<template>
  <div class="column">
    <!-- One prop rather than a boolean beside a union: you pick a member, you do not
         turn one off. -->
    <div v-for="display in DISPLAYS" :key="String(display.value)" class="row">
      <VPagination
        v-model="page"
        :length="6"
        :controls="display.value"
        item-variant="outline"
        :label="`Pages, controls ${display.caption}`"
      />
      <VTypography variant="caption" tone="muted">{{ display.caption }}</VTypography>
    </div>

    <!-- The icons and the wording are yours. A label is both the visible text and the
         accessible name, which is what keeps the control named once its text is hidden
         at a narrow width. -->
    <div class="row">
      <VPagination
        v-model="page"
        :length="6"
        controls="both"
        :prev-icon="arrowLeftAlt"
        :next-icon="arrowRightAlt"
        prev-label="Newer"
        next-label="Older"
        item-variant="outline"
        label="Pages with wording of their own"
      />
      <VTypography variant="caption" tone="muted">Icons and words of your own</VTypography>
    </div>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-5);
}
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--vectis-space-5);
}
</style>
