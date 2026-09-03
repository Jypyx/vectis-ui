<script setup lang="ts">
import { VAvatar, VAvatarGroup } from 'vectis-ui'
</script>

<template>
  <VAvatarGroup size="lg" ring-color="var(--vectis-color-surface-raised)">
    <VAvatar name="Ada Lovelace" />
    <VAvatar name="Grace Hopper" />
    <VAvatar name="Alan Turing" />
  </VAvatarGroup>

  <VAvatarGroup size="lg" compact ring-color="var(--vectis-color-surface-raised)">
    <VAvatar name="Ada Lovelace" />
    <VAvatar name="Grace Hopper" />
    <VAvatar name="Alan Turing" />
  </VAvatarGroup>
</template>
