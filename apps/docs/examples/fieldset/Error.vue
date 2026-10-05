<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VFieldset, VRadio } from 'vectis-ui'

const plan = ref<string>()
const error = ref<string>()

function submit() {
  error.value = plan.value ? undefined : 'Choose a plan to continue.'
}

function pick(value: string) {
  plan.value = value
  error.value = undefined
}
</script>

<template>
  <div class="demo">
    <VFieldset v-slot="{ invalid, required }" legend="Plan" :error="error" required>
      <VRadio
        v-for="value in ['Free', 'Pro', 'Team']"
        :key="value"
        :model-value="plan"
        name="plan"
        :value="value"
        :label="value"
        :invalid="invalid"
        :required="required"
        @update:model-value="pick(value)"
      />
    </VFieldset>
    <VButton @click="submit">Continue</VButton>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--vectis-space-4);
}
</style>
