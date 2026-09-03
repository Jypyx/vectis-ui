<script setup lang="ts">
import { VAvatar, VAvatarGroup, VTooltip } from 'vectis-ui'

const members = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing']
const hidden = ['Katherine Johnson', 'Margaret Hamilton']
</script>

<template>
  <VAvatarGroup :max="3" ring-color="var(--vectis-color-surface-raised)">
    <VTooltip v-for="member in [...members, ...hidden]" :key="member" :text="member">
      <template #default="{ triggerProps }">
        <VAvatar :name="member" clickable v-bind="triggerProps" />
      </template>
    </VTooltip>

    <template #overflow="{ count }">
      <VTooltip :text="hidden.join(', ')">
        <template #default="{ triggerProps }">
          <VAvatar clickable :alt="`${count} more members`" v-bind="triggerProps">
            +{{ count }}
          </VAvatar>
        </template>
      </VTooltip>
    </template>
  </VAvatarGroup>
</template>
