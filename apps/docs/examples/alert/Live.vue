<script setup lang="ts">
import { ref } from 'vue'
import { VAlert, VButton } from 'vectis-ui'

const sent = ref(false)
</script>

<template>
  <div class="demo">
    <VButton @click="sent = true">Send the form</VButton>
    <VAlert v-if="sent" live class="alert" tone="success">The form was sent.</VAlert>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--vectis-space-3);
}

.alert {
  align-self: stretch;
}
</style>
