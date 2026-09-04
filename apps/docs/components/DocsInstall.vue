<script setup lang="ts">
/**
 * The command that adds the package, in whichever package manager the reader uses.
 *
 * It is a DocsCode carrying the manager toggle in its header slot, which is the one control
 * that header was designed for. The choice itself lives in `usePackageManager`, module-wide, so
 * every install block on the site shows the same manager: which one a reader uses is a fact
 * about their machine, not about the paragraph they happen to be reading.
 */
import { VToggle, VToggleItem } from 'vectis-ui'

const props = defineProps<{
  /**
   * The packages to add, space-separated. `vectis-ui vue` for a Vite application, where Vue is
   * a peer dependency the project installs itself; `vectis-ui` alone under Nuxt, which brings
   * Vue with it.
   */
  packages: string
}>()

const { t } = useI18n()
const { managers, packageManager, commandFor } = usePackageManager()

const code = computed(() => commandFor(props.packages))
</script>

<template>
  <DocsCode lang="bash" :code="code">
    <!--
      `size="xs"` against the header's `sm` copy button is deliberate: four text segments in a
      title bar are chrome, and at `sm` the row stops fitting a phone.
    -->
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
