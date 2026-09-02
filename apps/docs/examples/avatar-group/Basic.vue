<script setup lang="ts">
import { VAvatar, VAvatarGroup } from 'vectis-ui'
</script>

<template>
  <!-- The separation ring takes the page background by default. This demo sits on a raised card,
       so it passes that card's colour instead. -->
  <VAvatarGroup ring-color="var(--vectis-color-surface-raised)">
    <VAvatar name="Ada Lovelace" />
    <VAvatar name="Grace Hopper" />
    <VAvatar name="Alan Turing" />
  </VAvatarGroup>
</template>
