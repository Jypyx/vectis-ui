<script setup lang="ts">
import {
  VSideNavigation,
  VSideNavigationGroup,
  VSideNavigationItem,
  VSideNavigationSeparator,
} from 'vectis-ui'
import { description, image, schedule, table_chart as tableChart } from 'vectis-ui/icons'
</script>

<template>
  <aside class="sidebar">
    <VSideNavigation label="Workspace">
      <VSideNavigationItem href="#usage" :icon="tableChart" current>Overview</VSideNavigationItem>

      <VSideNavigationSeparator />

      <VSideNavigationGroup label="Content">
        <VSideNavigationItem href="#usage" :icon="description">Documents</VSideNavigationItem>
        <VSideNavigationItem href="#usage" :icon="image">Media</VSideNavigationItem>
      </VSideNavigationGroup>

      <VSideNavigationGroup>
        <template #label>Recent <span class="hint">(7 days)</span></template>
        <VSideNavigationItem href="#usage" :icon="schedule">Release notes</VSideNavigationItem>
        <VSideNavigationItem href="#usage" :icon="schedule">Meeting minutes</VSideNavigationItem>
      </VSideNavigationGroup>
    </VSideNavigation>
  </aside>
</template>

<style scoped>
.sidebar {
  inline-size: 16rem;
  padding: var(--vectis-space-2);
  border-inline-end: 1px solid var(--vectis-color-border);
}
.hint {
  color: var(--vectis-color-text-muted);
}
</style>
