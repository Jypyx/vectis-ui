<script setup lang="ts">
import { ref } from 'vue'
import { VTextarea } from 'vectis-ui'

const invalid = ref('Too short')
const disabled = ref('Waiting on the form to be submitted')
const readonly = ref('Signed off on 12 March, and no longer open to changes')
const loading = ref('Writing a summary')
</script>

<template>
  <VTextarea
    v-model="invalid"
    label="Invalid"
    hint="Say a little more than that."
    invalid
    :rows="2"
  />
  <VTextarea v-model="disabled" label="Disabled" disabled :rows="2" />
  <VTextarea v-model="readonly" label="Read only" readonly :rows="2" />
  <VTextarea v-model="loading" label="Loading" loading :rows="2" />
</template>
