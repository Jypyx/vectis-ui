<script setup lang="ts">
import { ref } from 'vue'
import { VCheckbox } from 'vectis-ui'

const subscribed = ref(true)
</script>

<template>
  <VCheckbox v-model="subscribed">Send me release notes</VCheckbox>
</template>
