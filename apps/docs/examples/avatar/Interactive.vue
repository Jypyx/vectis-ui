<script setup lang="ts">
import { ref } from 'vue'
import { VAvatar, VTypography } from 'vectis-ui'

const opened = ref(0)
</script>

<template>
  <VAvatar name="Ada Lovelace" clickable @click="opened += 1" />
  <VAvatar name="Grace Hopper" href="#usage" />
  <VAvatar name="Alan Turing" href="#usage" disabled />
  <VTypography variant="body-sm" tone="muted">Profile opened {{ opened }} times</VTypography>
</template>
