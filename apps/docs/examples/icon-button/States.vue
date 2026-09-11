<script setup lang="ts">
import { VIconButton } from 'vectis-ui'
import { notifications } from 'vectis-ui/icons'

const variants = ['solid', 'soft', 'outline', 'ghost'] as const
</script>

<template>
  <div class="row">
    <VIconButton
      v-for="variant in variants"
      :key="variant"
      :icon="notifications"
      :variant="variant"
      disabled
      :label="`Notifications, ${variant} disabled`"
    />
  </div>

  <!-- Loading puts a spinner where the icon was and disables the button while it turns,
       so the same action cannot be asked for twice. The spinner takes the icon's box,
       which is what keeps the square from changing size. -->
  <div class="row">
    <VIconButton :icon="notifications" loading label="Refreshing" />
    <VIconButton :icon="notifications" variant="outline" loading label="Checking" />
    <VIconButton :icon="notifications" variant="ghost" loading label="Loading" />
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-3);
}
</style>
