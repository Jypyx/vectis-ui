<script setup lang="ts">
import { VBadge, VIconButton, VSideNavigation, VSideNavigationItem } from 'vectis-ui'
import { description, more_horiz as moreHoriz, notifications, search } from 'vectis-ui/icons'
</script>

<template>
  <aside class="sidebar">
    <VSideNavigation label="Project">
      <!-- Leaf end content sits beside the link, so it may contain a control. -->
      <VSideNavigationItem href="#usage" :icon="description">
        Drafts
        <template #end>
          <VIconButton
            label="Draft options"
            :icon="moreHoriz"
            size="xs"
            variant="ghost"
            tone="neutral"
          />
        </template>
      </VSideNavigationItem>

      <!-- Branch end content sits inside summary; keep it non-interactive. -->
      <VSideNavigationItem :icon="notifications">
        Notifications
        <template #end><VBadge :count="12" tone="accent" /></template>
        <template #children>
          <VSideNavigationItem href="#usage">Mentions</VSideNavigationItem>
          <VSideNavigationItem href="#usage">Replies</VSideNavigationItem>
        </template>
      </VSideNavigationItem>

      <VSideNavigationItem :icon="search">
        Saved searches
        <template #end><span class="count">8</span></template>
        <template #children>
          <VSideNavigationItem href="#usage">Open bugs</VSideNavigationItem>
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
.count {
  color: var(--vectis-color-text-muted);
  font-size: var(--vectis-text-caption-size);
}
</style>
