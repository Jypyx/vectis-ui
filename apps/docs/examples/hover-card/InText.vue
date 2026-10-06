<script setup lang="ts">
import { VAvatar, VHoverCard, VLink, VTypography } from 'vectis-ui'
</script>

<template>
  <VTypography class="sentence">
    The notes were translated and expanded by
    <VHoverCard>
      <template #default="{ triggerProps }">
        <VLink href="#ada" v-bind="triggerProps">Ada Lovelace</VLink>
      </template>
      <template #content>
        <div class="header">
          <VAvatar name="Ada Lovelace" />
          <VTypography variant="subtitle">Ada Lovelace</VTypography>
        </div>
        <VTypography variant="body-sm">
          English mathematician, born in 1815. Her Note G is often cited as the first computer
          program.
        </VTypography>
      </template>
    </VHoverCard>
    in 1843.
  </VTypography>
</template>

<style scoped>
.sentence {
  max-inline-size: 32rem;
}
.header {
  display: flex;
  align-items: center;
  gap: var(--vectis-space-3);
}
</style>
