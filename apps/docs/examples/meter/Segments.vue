<script setup lang="ts">
import { computed, ref } from 'vue'
import { VButton, VMeter } from 'vectis-ui'

const strengths = ['Weak', 'Fair', 'Good', 'Strong']
const strength = ref(2)
const text = computed(() => strengths[strength.value - 1])
</script>

<template>
  <div class="meters">
    <VMeter
      label="Password strength"
      :value="strength"
      :max="4"
      :low="1.5"
      :high="2.5"
      :optimum="4"
      :segments="4"
      :value-text="text"
    />
    <div class="actions">
      <VButton variant="outline" size="sm" :disabled="strength <= 1" @click="strength--">
        Weaker
      </VButton>
      <VButton variant="outline" size="sm" :disabled="strength >= 4" @click="strength++">
        Stronger
      </VButton>
    </div>
    <VMeter label="Battery" :value="70" :low="20" :high="50" :optimum="100" :segments="5" />
  </div>
</template>

<style scoped>
.meters {
  display: grid;
  gap: var(--vectis-space-5);
  max-inline-size: 20rem;
}

.actions {
  display: flex;
  gap: var(--vectis-space-2);
}
</style>
