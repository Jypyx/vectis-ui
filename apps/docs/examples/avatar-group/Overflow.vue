<script setup lang="ts">
import { VAvatar, VAvatarGroup } from 'vectis-ui'
</script>

<template>
  <VAvatarGroup :max="4" ring-color="var(--vectis-color-surface-raised)">
    <VAvatar name="Ada Lovelace" />
    <VAvatar name="Grace Hopper" />
    <VAvatar name="Alan Turing" />
    <VAvatar name="Katherine Johnson" />
    <VAvatar name="Margaret Hamilton" />
    <VAvatar name="Barbara Liskov" />
  </VAvatarGroup>
</template>
