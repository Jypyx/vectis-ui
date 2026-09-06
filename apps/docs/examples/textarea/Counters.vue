<script setup lang="ts">
import { ref } from 'vue'
import { VTextarea } from 'vectis-ui'

const summary = ref('Vue developer in Lyon.')
const review = ref('')
const note = ref('')
</script>

<template>
  <VTextarea
    v-model="summary"
    label="Summary"
    hint="The browser refuses the eighty-first character."
    :maxlength="80"
    counter
    :rows="2"
  />

  <VTextarea
    v-model="review"
    label="Review"
    hint="Type past eighty and the field goes into error instead."
    :maxlength="80"
    soft-limit
    counter
    :rows="3"
  />

  <VTextarea
    v-model="note"
    label="Note"
    hint="No limit, so the counter only counts."
    counter
    :rows="2"
  />
</template>
