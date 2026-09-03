<script setup lang="ts">
import { VAvatar, VAvatarGroup } from 'vectis-ui'
</script>

<template>
  <VAvatarGroup size="sm" :max="3" ring-color="var(--vectis-color-surface-raised)">
    <VAvatar name="Ada Lovelace" />
    <VAvatar name="Grace Hopper" />
    <VAvatar name="Alan Turing" />
    <VAvatar name="Katherine Johnson" />
  </VAvatarGroup>

  <VAvatarGroup size="lg" :max="3" ring-color="var(--vectis-color-surface-raised)">
    <VAvatar name="Ada Lovelace" />
    <VAvatar name="Grace Hopper" />
    <VAvatar name="Alan Turing" />
    <VAvatar name="Katherine Johnson" />
  </VAvatarGroup>
</template>
