<script setup lang="ts">
import { VAvatar, VAvatarGroup } from 'vectis-ui'
</script>

<template>
  <!-- Match the separation ring to the demo card background. -->
  <VAvatarGroup ring-color="var(--vectis-color-surface-raised)">
    <VAvatar name="Ada Lovelace" />
    <VAvatar name="Grace Hopper" />
    <VAvatar name="Alan Turing" />
  </VAvatarGroup>
</template>
