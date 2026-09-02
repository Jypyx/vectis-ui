<script setup lang="ts">
import { ref } from 'vue'
import { VTextarea } from 'vectis-ui'

const message = ref('')
</script>

<template>
  <VTextarea v-model="message" label="Message" placeholder="What would you like to tell us?" />
</template>
