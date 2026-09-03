<script setup lang="ts">
import { VAvatar, VBadge } from 'vectis-ui'
</script>

<template>
  <VBadge :count="7" overlay>
    <VAvatar name="Ada Lovelace" size="lg" />
  </VBadge>

  <VBadge dot tone="success" overlay overlay-position="bottom">
    <VAvatar name="Grace Hopper" size="lg" />
  </VBadge>
</template>
