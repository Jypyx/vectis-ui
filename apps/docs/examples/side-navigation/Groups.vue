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
      <VSideNavigationItem href="#usage" :icon="tableChart" active>Overview</VSideNavigationItem>

      <!-- A rule, for a break between two runs of rows. It says nothing and is
           announced as nothing: real grouping is the group's job. -->
      <VSideNavigationSeparator />

      <!-- A named block. The heading is not a row: nothing happens when it is clicked
           and the arrow keys never stop on it. It takes the height of a row all the
           same, which is what keeps the vertical rhythm of the list. What it names is
           the sublist under it, so a screen reader reads the section and its items as
           one thing. -->
      <VSideNavigationGroup label="Content">
        <VSideNavigationItem href="#usage" :icon="description">Documents</VSideNavigationItem>
        <VSideNavigationItem href="#usage" :icon="image">Media</VSideNavigationItem>
      </VSideNavigationGroup>

      <!-- A group is not a level of the hierarchy: its items are indented as if it
           were not there. -->
      <VSideNavigationGroup>
        <!-- The slot takes markup where the prop takes a string. One of the two is
             needed, since this is what names the sublist. -->
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
