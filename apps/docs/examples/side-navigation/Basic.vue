<script setup lang="ts">
import { VSideNavigation, VSideNavigationItem } from 'vectis-ui'
</script>

<template>
  <aside class="sidebar">
    <VSideNavigation label="Project">
      <VSideNavigationItem href="#usage" active>Overview</VSideNavigationItem>
      <VSideNavigationItem href="#usage">Activity</VSideNavigationItem>
      <VSideNavigationItem href="#usage">Settings</VSideNavigationItem>
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
