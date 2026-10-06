<script setup lang="ts">
import { ref } from 'vue'
import { VAvatar, VHoverCard, VLink, VSkeletonLoader, VTypography } from 'vectis-ui'

const open = ref(false)
const profile = ref<{ name: string; bio: string } | null>(null)

async function onOpen(value: boolean) {
  if (!value || profile.value) return
  // Stands in for a request to your API.
  await new Promise((resolve) => setTimeout(resolve, 800))
  profile.value = {
    name: 'Grace Hopper',
    bio: 'Computer scientist. Led the team behind the first compiler for a programming language.',
  }
}
</script>

<template>
  <VHoverCard v-model:open="open" @update:open="onOpen">
    <template #default="{ triggerProps }">
      <VLink href="#grace" v-bind="triggerProps">@grace</VLink>
    </template>
    <template #content>
      <div v-if="!profile" class="loading">
        <VSkeletonLoader shape="circle" size="lg" />
        <VSkeletonLoader :lines="2" />
      </div>
      <template v-else>
        <div class="header">
          <VAvatar :name="profile.name" size="lg" />
          <VTypography variant="subtitle">{{ profile.name }}</VTypography>
        </div>
        <VTypography variant="body-sm">{{ profile.bio }}</VTypography>
      </template>
    </template>
  </VHoverCard>
</template>

<style scoped>
.loading {
  display: grid;
  gap: var(--vectis-space-2);
  inline-size: 16rem;
}
.header {
  display: flex;
  align-items: center;
  gap: var(--vectis-space-3);
}
</style>
