<script setup lang="ts">
import { VAvatar, VTooltip } from 'vectis-ui'
</script>

<template>
  <VTooltip text="Ada Lovelace, on call until Friday">
    <template #default="{ triggerProps }">
      <VAvatar name="Ada Lovelace" clickable v-bind="triggerProps" />
    </template>
  </VTooltip>
</template>
