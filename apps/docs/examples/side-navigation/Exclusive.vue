<script setup lang="ts">
import { VSideNavigation, VSideNavigationItem } from 'vectis-ui'
import { description, image, table_chart as tableChart } from 'vectis-ui/icons'
</script>

<template>
  <aside class="sidebar">
    <!-- Opening one section closes the one beside it. The browser does this on its
         own, through the name the sections of a level share, so there is no state to
         keep. The exclusivity is local to each level: opening a subsection leaves its
         parent's neighbours alone. -->
    <VSideNavigation label="Workspace" exclusive>
      <VSideNavigationItem :icon="description" default-open>
        Documents
        <template #items>
          <VSideNavigationItem href="#usage">Drafts</VSideNavigationItem>
          <VSideNavigationItem href="#usage">Published</VSideNavigationItem>
        </template>
      </VSideNavigationItem>

      <VSideNavigationItem :icon="image">
        Media
        <template #items>
          <VSideNavigationItem href="#usage">Images</VSideNavigationItem>
          <VSideNavigationItem href="#usage">Video</VSideNavigationItem>
        </template>
      </VSideNavigationItem>

      <VSideNavigationItem :icon="tableChart">
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
