<script setup lang="ts">
import { VSideNavigation, VSideNavigationItem } from 'vectis-ui'
import { description, image, table_chart as tableChart } from 'vectis-ui/icons'
</script>

<template>
  <div class="row">
    <!-- The size is set once on the navigation and every level follows, however deep:
         a sublist never restates it. `compact` takes 4px off each row on top of that.
         It is a density setting, not a rail folded down to its icons. -->
    <aside class="sidebar">
      <p class="caption">sm</p>
      <VSideNavigation label="Rows of 32px" size="sm">
        <VSideNavigationItem href="#usage" :icon="description" active
          >Documents</VSideNavigationItem
        >
        <VSideNavigationItem :icon="image" default-open>
          Media
          <template #items>
            <VSideNavigationItem href="#usage">Images</VSideNavigationItem>
          </template>
        </VSideNavigationItem>
        <VSideNavigationItem href="#usage" :icon="tableChart">Reports</VSideNavigationItem>
      </VSideNavigation>
    </aside>

    <aside class="sidebar">
      <p class="caption">md</p>
      <VSideNavigation label="Rows of 40px" size="md">
        <VSideNavigationItem href="#usage" :icon="description" active
          >Documents</VSideNavigationItem
        >
        <VSideNavigationItem :icon="image" default-open>
          Media
          <template #items>
            <VSideNavigationItem href="#usage">Images</VSideNavigationItem>
          </template>
        </VSideNavigationItem>
        <VSideNavigationItem href="#usage" :icon="tableChart">Reports</VSideNavigationItem>
      </VSideNavigation>
    </aside>

    <aside class="sidebar">
      <p class="caption">md compact</p>
      <VSideNavigation label="Rows of 36px" size="md" compact>
        <VSideNavigationItem href="#usage" :icon="description" active
          >Documents</VSideNavigationItem
        >
        <VSideNavigationItem :icon="image" default-open>
          Media
          <template #items>
            <VSideNavigationItem href="#usage">Images</VSideNavigationItem>
          </template>
        </VSideNavigationItem>
        <VSideNavigationItem href="#usage" :icon="tableChart">Reports</VSideNavigationItem>
      </VSideNavigation>
    </aside>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-4);
}
.sidebar {
  inline-size: 12rem;
  padding: var(--vectis-space-2);
  border-inline-end: 1px solid var(--vectis-color-border);
}
.caption {
  margin: 0 var(--vectis-space-2) var(--vectis-space-2);
  color: var(--vectis-color-text-muted);
  font-size: var(--vectis-text-caption-size);
}
</style>
