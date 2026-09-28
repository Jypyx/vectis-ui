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
      <VSideNavigationItem href="#usage" :icon="description" current>Usage</VSideNavigationItem>
      <VSideNavigationItem href="#api" :icon="info">API</VSideNavigationItem>
      <VSideNavigationItem
        href="https://vuejs.org"
        :icon="arrowRightAlt"
        target="_blank"
        rel="noreferrer"
      >
        Vue documentation
      </VSideNavigationItem>

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
