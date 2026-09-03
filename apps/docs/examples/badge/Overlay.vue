<script setup lang="ts">
import { VAvatar, VBadge, VIconButton } from 'vectis-ui'
import { notifications } from 'vectis-ui/icons'
</script>

<template>
  <VBadge :count="12" overlay>
    <VIconButton label="Notifications" :icon="notifications" variant="ghost" tone="neutral" />
  </VBadge>

  <VBadge dot tone="success" overlay>
    <VAvatar name="Ada Lovelace" />
  </VBadge>
</template>
