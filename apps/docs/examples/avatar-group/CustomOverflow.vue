<script setup lang="ts">
import { VAvatar, VAvatarGroup } from 'vectis-ui'
</script>

<template>
  <VAvatarGroup :max="3" ring-color="var(--vectis-color-surface-raised)">
    <VAvatar name="Ada Lovelace" />
    <VAvatar name="Grace Hopper" />
    <VAvatar name="Alan Turing" />
    <VAvatar name="Katherine Johnson" />
    <VAvatar name="Margaret Hamilton" />

    <template #overflow="{ count }">
      <VAvatar color="#6d28d9" clickable :alt="`Show ${count} more members`">
        +{{ count }}
      </VAvatar>
    </template>
  </VAvatarGroup>
</template>
