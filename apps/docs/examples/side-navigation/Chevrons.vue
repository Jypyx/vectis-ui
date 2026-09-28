<script setup lang="ts">
import { VSideNavigation, VSideNavigationItem } from 'vectis-ui'
import {
  arrow_drop_down as arrowDropDown,
  chevron_right as chevronRight,
  expand_more as expandMore,
} from 'vectis-ui/icons'
</script>

<template>
  <div class="row">
    <aside class="sidebar">
      <p class="caption">One icon, rotated</p>
      <VSideNavigation label="Rotated chevron" :expand-icon="arrowDropDown">
        <VSideNavigationItem default-open>
          Documents
          <template #children>
            <VSideNavigationItem href="#usage">Drafts</VSideNavigationItem>
          </template>
        </VSideNavigationItem>
        <VSideNavigationItem>
          Media
          <template #children>
            <VSideNavigationItem href="#usage">Images</VSideNavigationItem>
          </template>
        </VSideNavigationItem>
      </VSideNavigation>
    </aside>

    <aside class="sidebar">
      <p class="caption">Two icons, swapped</p>
      <VSideNavigation
        label="Swapped chevrons"
        :expand-icon="chevronRight"
        :collapse-icon="expandMore"
      >
        <VSideNavigationItem default-open>
          Documents
          <template #children>
            <VSideNavigationItem href="#usage">Drafts</VSideNavigationItem>
          </template>
        </VSideNavigationItem>
        <VSideNavigationItem>
          Media
          <template #children>
            <VSideNavigationItem href="#usage">Images</VSideNavigationItem>
          </template>
        </VSideNavigationItem>
      </VSideNavigation>
    </aside>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  gap: var(--vectis-space-5);
}
.sidebar {
  inline-size: 15rem;
  padding: var(--vectis-space-2);
  border-inline-end: 1px solid var(--vectis-color-border);
}
.caption {
  margin: 0 var(--vectis-space-2) var(--vectis-space-2);
  color: var(--vectis-color-text-muted);
  font-size: var(--vectis-text-caption-size);
}
</style>
