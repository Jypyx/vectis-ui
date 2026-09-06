<script setup lang="ts">
import { ref } from 'vue'
import { VDatePicker, VTypography } from 'vectis-ui'

const appointment = ref('2026-06-16')
const holiday = ref('2026-06-16')

/* A predicate answers for one date at a time, which is what makes a rule such as "no
   weekends" one line rather than an enumeration. */
function isWeekend(iso: string) {
  const day = new Date(`${iso}T00:00:00`).getDay()
  return day === 0 || day === 6
}

/* The other form: a plain list, for days that follow no rule. */
const closedDays = ['2026-06-11', '2026-06-12', '2026-06-25']
</script>

<template>
  <div class="row">
    <div class="group">
      <VTypography variant="overline" tone="muted">a predicate</VTypography>
      <VDatePicker v-model="appointment" :disabled-dates="isWeekend" />
    </div>

    <div class="group">
      <VTypography variant="overline" tone="muted">a list</VTypography>
      <VDatePicker v-model="holiday" :disabled-dates="closedDays" />
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
}
</style>
