<script setup lang="ts">
import { VBadge, VIconButton, VSideNavigation, VSideNavigationItem } from 'vectis-ui'
import { description, more_horiz as moreHoriz, notifications, search } from 'vectis-ui/icons'
</script>

<template>
  <aside class="sidebar">
    <VSideNavigation label="Project">
      <!-- On a leaf the action is stretched over the row by an overlay, so whatever
           sits at the end stays a sibling of it rather than inside it. A real control
           belongs here and nowhere else. -->
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

      <!-- A branch is a native disclosure and its row is the summary, which has to
           hold the whole line. So the end of a branch row takes a counter or a badge,
           never a control: a control there would be nested inside the one the row
           already is. -->
      <VSideNavigationItem :icon="notifications">
        Notifications
        <template #end><VBadge :count="12" tone="accent" /></template>
        <template #items>
          <VSideNavigationItem href="#usage">Mentions</VSideNavigationItem>
          <VSideNavigationItem href="#usage">Replies</VSideNavigationItem>
        </template>
      </VSideNavigationItem>

      <VSideNavigationItem :icon="search">
        Saved searches
        <template #end><span class="count">8</span></template>
        <template #items>
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
