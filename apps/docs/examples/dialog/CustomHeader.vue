<script setup lang="ts">
import { ref } from 'vue'
import { VAvatar, VButton, VDialog, VTypography } from 'vectis-ui'

const open = ref(false)
const following = ref(false)
</script>

<template>
  <!-- The slot replaces the title, so the dialog is named with an `aria-label` instead:
       there is no longer a `title` prop for it to point at. -->
  <VDialog v-model:open="open" width="440px" aria-label="Nadia Rousseau">
    <template #trigger="{ triggerProps }">
      <VButton v-bind="triggerProps">Open the profile</VButton>
    </template>

    <template #header>
      <div class="profile">
        <VAvatar name="Nadia Rousseau" size="lg" />
        <div class="identity">
          <VTypography as="h2" variant="heading-4">Nadia Rousseau</VTypography>
          <VTypography variant="body-sm" tone="muted">Design systems, Paris</VTypography>
        </div>
        <VButton
          size="sm"
          :variant="following ? 'outline' : 'solid'"
          :tone="following ? 'neutral' : 'accent'"
          @click="following = !following"
        >
          {{ following ? 'Following' : 'Follow' }}
        </VButton>
      </div>
    </template>

    <VTypography>
      Maintains the component library and reviews every change to the token source. Ask her about
      anything to do with theming.
    </VTypography>

    <template #footer>
      <VButton variant="ghost" tone="neutral" @click="open = false">Close</VButton>
      <VButton @click="open = false">Send a message</VButton>
    </template>
  </VDialog>
</template>

<style scoped>
.profile {
  display: flex;
  flex: 1;
  align-items: center;
  gap: var(--vectis-space-3);
}
.identity {
  flex: 1;
  min-inline-size: 0;
}
</style>
