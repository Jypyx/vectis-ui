<script setup lang="ts">
import { VAvatar } from 'vectis-ui'

// NASA portrait of astronaut Anna Fisher, 1978. Public domain.
import portrait from '~/assets/img/anna-fisher.jpg'
</script>

<template>
  <VAvatar :src="portrait" name="Anna Fisher" size="lg" />
</template>
