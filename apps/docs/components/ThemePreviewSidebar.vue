<script setup lang="ts">
/** The preview's application rail: navigation, storage use and the account menu. */
import {
  VAvatar,
  VButton,
  VMenu,
  VMenuGroup,
  VMenuItem,
  VMenuSeparator,
  VMeter,
  VSideNavigation,
  VSideNavigationGroup,
  VSideNavigationItem,
  VSideNavigationSeparator,
  VTypography,
} from 'vectis-ui'
import { inbox, table_chart as tableChart } from 'vectis-ui/icons'
</script>

<template>
  <aside class="tp-rail">
    <div class="tp-brand">
      <span class="tp-mark" aria-hidden="true" />
      <VTypography variant="heading-4" as="span">Orbit</VTypography>
    </div>

    <VSideNavigation label="Workspace">
      <VSideNavigationItem href="#" icon="dashboard" current>Dashboard</VSideNavigationItem>
      <VSideNavigationItem href="#" icon="folder">Projects</VSideNavigationItem>
      <VSideNavigationItem href="#" :icon="inbox">Inbox</VSideNavigationItem>
      <VSideNavigationSeparator />
      <VSideNavigationGroup label="Reports">
        <VSideNavigationItem href="#" icon="bar_chart">Analytics</VSideNavigationItem>
        <VSideNavigationItem href="#" :icon="tableChart">Exports</VSideNavigationItem>
      </VSideNavigationGroup>
      <VSideNavigationItem href="#" icon="settings">Settings</VSideNavigationItem>
    </VSideNavigation>

    <div class="tp-rail-end">
      <VMeter :value="72" label="Storage" value-text="7.2 of 10 GB" size="sm" />

      <VMenu placement="top-start" match-trigger>
        <template #trigger="{ triggerProps }">
          <VButton variant="ghost" tone="neutral" class="tp-account" v-bind="triggerProps">
            <VAvatar name="Ada Lovelace" size="sm" />
            <span class="tp-account-name">Ada Lovelace</span>
          </VButton>
        </template>
        <VMenuGroup label="Account">
          <VMenuItem label="Profile" icon-start="person" />
          <VMenuItem label="Team" icon-start="group" />
        </VMenuGroup>
        <VMenuSeparator />
        <VMenuItem label="Sign out" icon-start="logout" tone="danger" />
      </VMenu>
    </div>
  </aside>
</template>

<style scoped>
.tp-rail {
  display: flex;
  flex-direction: column;
  gap: var(--vectis-space-5);
  padding: var(--vectis-space-5) var(--vectis-space-4);
  border-block-end: 1px solid var(--vectis-color-border);
  background: var(--vectis-color-surface-sunken);
}
.tp-brand {
  display: flex;
  align-items: center;
  gap: var(--vectis-space-2);
  padding-inline: var(--vectis-space-2);
}
.tp-mark {
  inline-size: var(--vectis-space-6);
  block-size: var(--vectis-space-6);
  border-radius: var(--vectis-radius-interactive);
  background: var(--vectis-color-accent);
}
.tp-rail-end {
  display: grid;
  gap: var(--vectis-space-4);
  margin-block-start: auto;
}
.tp-account {
  justify-content: flex-start;
  inline-size: 100%;
}
.tp-account-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (min-width: 900px) {
  .tp-rail {
    position: sticky;
    inset-block-start: 0;
    block-size: 100dvh;
    border-block-end: none;
    border-inline-end: 1px solid var(--vectis-color-border);
  }
}
</style>
