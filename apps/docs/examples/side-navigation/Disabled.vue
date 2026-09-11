<script setup lang="ts">
import { VSideNavigation, VSideNavigationItem } from 'vectis-ui'
import { description, image, table_chart as tableChart } from 'vectis-ui/icons'
</script>

<template>
  <aside class="sidebar">
    <VSideNavigation label="Workspace">
      <VSideNavigationItem href="#usage" :icon="description" active>Documents</VSideNavigationItem>

      <!-- A disabled link stops leading anywhere and the arrow keys step over it. It
           greys out through the colour tokens rather than through an opacity, so it
           keeps its contrast against the sidebar. -->
      <VSideNavigationItem href="#usage" :icon="image" disabled>Media</VSideNavigationItem>

      <!-- On a branch it goes further: the section can no longer be unfolded, so what
           it holds is out of reach for good. -->
      <VSideNavigationItem :icon="tableChart" disabled>
        Reports
        <template #items>
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
