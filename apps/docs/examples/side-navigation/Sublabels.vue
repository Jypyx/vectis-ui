<script setup lang="ts">
import { VSideNavigation, VSideNavigationItem } from 'vectis-ui'
import { cloud_upload as cloudUpload, description, folder_zip as folderZip } from 'vectis-ui/icons'
</script>

<template>
  <aside class="sidebar">
    <VSideNavigation label="Project">
      <!-- A second line under the label, for what the row does not already say: a
           count, a status, a size. The row grows to hold both and the icon stays
           centred on the pair rather than on the first line. -->
      <VSideNavigationItem href="#usage" :icon="description" sublabel="12 open tasks">
        Alpha
      </VSideNavigationItem>

      <VSideNavigationItem :icon="cloudUpload" default-open>
        Storage
        <!-- The slot takes markup where the prop takes a string. -->
        <template #sublabel>Synced <strong>2 min</strong> ago</template>
        <template #items>
          <VSideNavigationItem href="#usage" :icon="folderZip" sublabel="4.2 GB">
            Archives
          </VSideNavigationItem>
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
