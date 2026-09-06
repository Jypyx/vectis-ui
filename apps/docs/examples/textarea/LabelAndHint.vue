<script setup lang="ts">
import { ref } from 'vue'
import { VTextarea } from 'vectis-ui'

const bio = ref('')
</script>

<template>
  <VTextarea
    v-model="bio"
    label="Short bio"
    hint="Two or three sentences. It appears on your public profile."
    placeholder="What do you work on?"
  />
</template>
