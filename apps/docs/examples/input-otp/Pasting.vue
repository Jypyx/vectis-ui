<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VInputOTP, VTypography } from 'vectis-ui'

const SAMPLE = 'GT-4F2'

const code = ref('')
const copied = ref(false)

async function copy() {
  await navigator.clipboard.writeText(SAMPLE)
  copied.value = true
}
</script>

<template>
  <div class="column">
    <div class="row">
      <VTypography as="span"
        >Copy <code>{{ SAMPLE }}</code
        >, then paste it anywhere in the row.</VTypography
      >
      <VButton variant="outline" tone="neutral" size="sm" @click="copy">
        {{ copied ? 'Copied' : 'Copy' }}
      </VButton>
    </div>

    <VInputOTP
      v-model="code"
      pattern="GT-###"
      format="alphanumeric"
      label="Ticket reference"
      :hint="`Value: ${code || 'empty'}`"
    />
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-4);
}
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--vectis-space-3);
}
</style>
