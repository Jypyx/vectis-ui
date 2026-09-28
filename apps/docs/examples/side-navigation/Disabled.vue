<script setup lang="ts">
import { VSideNavigation, VSideNavigationItem } from 'vectis-ui'
import { description, image, table_chart as tableChart } from 'vectis-ui/icons'
</script>

<template>
  <aside class="sidebar">
    <VSideNavigation label="Workspace">
      <VSideNavigationItem href="#usage" :icon="description" current>Documents</VSideNavigationItem>

      <VSideNavigationItem href="#usage" :icon="image" disabled>Media</VSideNavigationItem>

      <VSideNavigationItem :icon="tableChart" disabled>
        Reports
        <template #children>
          <VSideNavigationItem href="#usage">Weekly</VSideNavigationItem>
        </template>
      </VSideNavigationItem>
    </VSideNavigation>
  </aside>
</template>

<style scoped>
.sidebar {
  inline-size: 16rem;
  padding: var(--vectis-space-2);
  border-inline-end: 1px solid var(--vectis-color-border);
}
</style>
