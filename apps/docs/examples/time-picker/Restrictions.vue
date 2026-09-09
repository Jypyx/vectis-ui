<script setup lang="ts">
import { ref } from 'vue'
import { VTimePicker, VTypography } from 'vectis-ui'

const office = ref<string | null>('09:30')
const booking = ref<string | null>('14:15')
</script>

<template>
  <div class="row">
    <div class="group">
      <VTypography variant="overline" tone="muted">Between 09:30 and 17:00</VTypography>
      <VTimePicker v-model="office" format="24h" min="09:30" max="17:00" />
      <VTypography variant="caption" tone="muted">
        Nine o'clock stays open, and it is its first thirty minutes that go
      </VTypography>
    </div>

    <div class="group">
      <VTypography variant="overline" tone="muted">Quarter hours, on three hours</VTypography>
      <VTimePicker
        v-model="booking"
        format="24h"
        :minute-step="5"
        :allowed-hours="[9, 14, 16]"
        :allowed-minutes="(minute) => minute % 15 === 0"
      />
      <VTypography variant="caption" tone="muted">
        The face keeps only the five minute marks a rule leaves standing
      </VTypography>
    </div>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--vectis-space-6);
}
.group {
  display: grid;
  gap: var(--vectis-space-2);
  max-inline-size: 20rem;
}
</style>
