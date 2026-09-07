<script setup lang="ts">
import { ref } from 'vue'
import { VTimeInput } from 'vectis-ui'

/* The value stays a 24-hour string in all three: 19:00 is what the model holds while the
   field reads 7:00 PM. */
const typed = ref<string | null>('07:00')
const onTheClock = ref<string | null>('19:00')
const fromList = ref<string | null>('19:30')
</script>

<template>
  <div class="column">
    <VTimeInput
      v-model="typed"
      format="12h"
      show-picker
      label="Typed"
      hint="The mask says nothing about the half of the day, so a button in the field does"
    />

    <VTimeInput
      v-model="onTheClock"
      format="12h"
      mode="picker"
      label="Read-only"
      hint="Here the pair belongs to the clock, beside its two large numerals"
    />

    <VTimeInput
      v-model="fromList"
      format="12h"
      mode="list"
      :minute-step="30"
      label="List"
      hint="Every row spells its own half of the day, so neither control is needed"
    />

    <output class="value" aria-label="The three values held">
      {{ typed }}, {{ onTheClock }}, {{ fromList }}
    </output>
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  gap: var(--vectis-space-5);
  max-inline-size: 26rem;
}
.value {
  font-family: var(--vectis-text-family-code);
  font-size: var(--vectis-text-body-sm-size);
  color: var(--vectis-color-text-muted);
}
</style>
