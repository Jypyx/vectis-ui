<script setup lang="ts">
import { VToggle, VToggleItem } from 'vectis-ui'

const props = defineProps<{
  /** Space-separated package names to install. */
  packages: string
}>()

const { t } = useI18n()
const { managers, packageManager, commandFor } = usePackageManager()

const code = computed(() => commandFor(props.packages))
</script>

<template>
  <DocsCode lang="bash" :code="code">
    <!-- Use smaller segments so the package manager toggle fits on mobile. -->
    <template #head>
      <VToggle
        v-model="packageManager"
        mandatory
        variant="outline"
        selected-variant="soft"
        tone="accent"
        size="xs"
        :label="t('common.code.packageManager')"
      >
        <VToggleItem v-for="manager in managers" :key="manager.value" :value="manager.value">
          {{ manager.value }}
        </VToggleItem>
      </VToggle>
    </template>
  </DocsCode>
</template>
