<script setup lang="ts">
import { ref } from 'vue'
import { VSideNavigation, VSideNavigationItem } from 'vectis-ui'
import {
  arrow_right_alt as arrowRightAlt,
  description,
  info,
  schedule,
  table_chart as tableChart,
} from 'vectis-ui/icons'

const selected = ref<string | null>(null)
</script>

<template>
  <aside class="sidebar">
    <VSideNavigation label="Workspace">
      <!-- With `href` the row is a real link: it can be middle-clicked, its address
           copied, and a crawler follows it. `active` says which one is the page being
           read, and that is what a screen reader announces as the current page. -->
      <VSideNavigationItem href="#usage" :icon="description" active>Usage</VSideNavigationItem>
      <VSideNavigationItem href="#api" :icon="info">API</VSideNavigationItem>
      <VSideNavigationItem
        href="https://vuejs.org"
        :icon="arrowRightAlt"
        target="_blank"
        rel="noreferrer"
      >
        Vue documentation
      </VSideNavigationItem>

      <!-- Without `href` the row is a button instead, and reports its activation
           through `select`. That is the shape for what switches a view rather than
           for what leads to an address. -->
      <VSideNavigationItem :icon="tableChart" @select="selected = 'Board'">
        Board
      </VSideNavigationItem>
      <VSideNavigationItem :icon="schedule" @select="selected = 'Timeline'">
        Timeline
      </VSideNavigationItem>
    </VSideNavigation>

    <p class="log">{{ selected ? `Selected: ${selected}` : 'Nothing selected yet' }}</p>
  </aside>
</template>

<style scoped>
.sidebar {
  inline-size: 16rem;
  padding: var(--vectis-space-2);
  border-inline-end: 1px solid var(--vectis-color-border);
}
.log {
  margin: var(--vectis-space-3) var(--vectis-space-2) 0;
  color: var(--vectis-color-text-muted);
  font-size: var(--vectis-text-caption-size);
}
</style>
