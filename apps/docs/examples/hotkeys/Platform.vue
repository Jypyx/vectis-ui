<script setup lang="ts">
import { VHotkeys, VTypography, type HotkeysPlatform } from 'vectis-ui'

/* The four the component knows. Without the prop it detects the one the reader is on,
   which is what the shortcuts everywhere else on this page are doing. */
const PLATFORMS: { value: HotkeysPlatform; label: string }[] = [
  { value: 'mac', label: 'macOS' },
  { value: 'windows', label: 'Windows' },
  { value: 'linux', label: 'Linux' },
  { value: 'other', label: 'Unknown' },
]
</script>

<template>
  <div class="grid">
    <template v-for="platform in PLATFORMS" :key="platform.value">
      <VTypography variant="caption" tone="muted">{{ platform.label }}</VTypography>
      <div class="keys">
        <VHotkeys keys="mod+k" :platform="platform.value" variant="outlined" />
        <VHotkeys keys="meta+shift+enter" :platform="platform.value" variant="outlined" />
        <VHotkeys keys="alt+backspace" :platform="platform.value" variant="outlined" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: var(--vectis-space-3) var(--vectis-space-5);
}
.keys {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-3);
}
</style>
