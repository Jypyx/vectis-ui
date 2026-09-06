<script setup lang="ts">
import { ref } from 'vue'
import { VChip } from 'vectis-ui'
import { arrow_right_alt as arrowRightAlt } from 'vectis-ui/icons'

const count = ref(0)
</script>

<template>
  <VChip>Static, no hover</VChip>
  <VChip clickable tone="accent" @click="count += 1">Clicked {{ count }} times</VChip>
  <VChip :icon-end="arrowRightAlt" href="https://vuejs.org" target="_blank" rel="noreferrer">
    vuejs.org
  </VChip>
</template>
