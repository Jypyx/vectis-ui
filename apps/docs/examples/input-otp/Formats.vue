<script setup lang="ts">
import { ref } from 'vue'
import { VInputOTP } from 'vectis-ui'

const pin = ref('')
const word = ref('')
const key = ref('')
</script>

<template>
  <div class="column">
    <VInputOTP
      v-model="pin"
      :length="6"
      format="numeric"
      label="Numeric code"
      hint="Digits only, and a phone offers its number pad"
    />

    <!-- Outside a numeric code the value is forced to capitals, so it has one
         canonical form whatever the reader typed. -->
    <VInputOTP
      v-model="word"
      :length="5"
      format="alpha"
      label="Letter code"
      hint="Letters only, typed in either case and kept in capitals"
    />

    <VInputOTP
      v-model="key"
      :length="6"
      format="alphanumeric"
      label="Licence key"
      hint="Letters and digits, again in capitals"
    />
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-5);
}
</style>
