<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VSideNavigation, VSideNavigationItem } from 'vectis-ui'
import { description, image } from 'vectis-ui/icons'

// A null model leaves the branch state uncontrolled.
const documentsOpen = ref<boolean | null>(true)
</script>

<template>
  <aside class="sidebar">
    <VSideNavigation label="Workspace">
      <VSideNavigationItem v-model:open="documentsOpen" :icon="description">
        Documents
        <template #children>
          <VSideNavigationItem href="#usage">Drafts</VSideNavigationItem>
          <VSideNavigationItem href="#usage">Published</VSideNavigationItem>
        </template>
      </VSideNavigationItem>

      <VSideNavigationItem :icon="image" default-open>
        Media
        <template #children>
          <VSideNavigationItem href="#usage">Images</VSideNavigationItem>
        </template>
      </VSideNavigationItem>
    </VSideNavigation>

    <div class="controls">
      <p class="state">Documents is {{ documentsOpen ? 'open' : 'closed' }}</p>
      <VButton size="sm" variant="outline" tone="neutral" @click="documentsOpen = !documentsOpen">
        Toggle from code
      </VButton>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  inline-size: 16rem;
  padding: var(--vectis-space-2);
  border-inline-end: 1px solid var(--vectis-color-border);
}
.controls {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: var(--vectis-space-2);
  margin: var(--vectis-space-4) var(--vectis-space-2) 0;
}
.state {
  margin: 0;
  color: var(--vectis-color-text-muted);
  font-size: var(--vectis-text-caption-size);
}
</style>
