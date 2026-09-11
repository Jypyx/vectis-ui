<script setup lang="ts">
import { VSideNavigation, VSideNavigationItem } from 'vectis-ui'
import { code, description, folder_zip as folderZip } from 'vectis-ui/icons'
</script>

<template>
  <aside class="sidebar">
    <VSideNavigation label="Repository">
      <!-- Nesting is not limited. Each level is indented by the room a start icon
           takes, so a subitem's label lands on the same vertical as the label of the
           branch holding it. -->
      <VSideNavigationItem :icon="folderZip" default-open>
        src
        <template #items>
          <VSideNavigationItem :icon="folderZip" default-open>
            components
            <template #items>
              <VSideNavigationItem href="#usage" :icon="code">VButton.vue</VSideNavigationItem>
              <VSideNavigationItem :icon="folderZip" default-open>
                icons
                <template #items>
                  <VSideNavigationItem href="#usage" :icon="code">index.ts</VSideNavigationItem>
                </template>
              </VSideNavigationItem>
            </template>
          </VSideNavigationItem>
          <VSideNavigationItem href="#usage" :icon="code">index.ts</VSideNavigationItem>
        </template>
      </VSideNavigationItem>

      <VSideNavigationItem href="#usage" :icon="description">README.md</VSideNavigationItem>
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
