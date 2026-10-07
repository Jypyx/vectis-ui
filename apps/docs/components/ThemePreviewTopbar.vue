<script setup lang="ts">
/** The preview's top bar: where one is, a command palette, notifications and help. */
import {
  VBadge,
  VBreadcrumb,
  VButton,
  VCommandPalette,
  VHotkeys,
  VIconButton,
  VPopover,
  VSeparator,
  VTooltip,
  VTypography,
} from 'vectis-ui'
import type { CommandPaletteItem } from 'vectis-ui'
import { add, info, notifications, search, table_chart as tableChart } from 'vectis-ui/icons'

const crumbs = [
  { label: 'Orbit', href: '#' },
  { label: 'Projects', href: '#' },
  { label: 'Overview', href: '#overview' },
]

const commands: CommandPaletteItem[] = [
  {
    label: 'Actions',
    commands: [
      { label: 'New project', icon: add, shortcut: 'mod+n' },
      { label: 'Invite a teammate', icon: 'group' },
    ],
  },
  { separator: true },
  {
    label: 'Go to',
    commands: [
      { label: 'Analytics', icon: 'bar_chart' },
      { label: 'Exports', icon: tableChart },
      { label: 'Settings', icon: 'settings' },
    ],
  },
]

const updates = [
  { title: 'Atlas deployed', when: '2 min ago' },
  { title: 'Grace commented on Meridian', when: '1 h ago' },
  { title: 'Invoice #1042 paid', when: 'Yesterday' },
]
</script>

<template>
  <header class="tp-topbar">
    <VBreadcrumb :items="crumbs" current-path="#overview" />

    <div class="tp-topbar-end">
      <VCommandPalette :items="commands" placeholder="Search commands…">
        <template #trigger="{ triggerProps }">
          <VButton v-bind="triggerProps" variant="outline" tone="neutral" :icon-start="search">
            Search
            <VHotkeys keys="mod+k" size="xs" />
          </VButton>
        </template>
      </VCommandPalette>

      <VPopover placement="bottom-end">
        <template #trigger="{ triggerProps }">
          <VBadge :count="3" overlay>
            <VIconButton
              label="Notifications"
              :icon="notifications"
              variant="ghost"
              tone="neutral"
              v-bind="triggerProps"
            />
          </VBadge>
        </template>
        <div class="tp-updates">
          <VTypography variant="label">Notifications</VTypography>
          <VSeparator />
          <div v-for="update in updates" :key="update.title" class="tp-update">
            <VTypography variant="body-sm">{{ update.title }}</VTypography>
            <VTypography variant="caption" tone="muted">{{ update.when }}</VTypography>
          </div>
        </div>
      </VPopover>

      <VTooltip text="Help centre">
        <template #default="{ triggerProps }">
          <VIconButton
            label="Help"
            :icon="info"
            variant="ghost"
            tone="neutral"
            v-bind="triggerProps"
          />
        </template>
      </VTooltip>
    </div>
  </header>
</template>

<style scoped>
.tp-topbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--vectis-space-3);
  padding: var(--vectis-space-3) var(--vectis-space-5);
  border-block-end: 1px solid var(--vectis-color-border);
}
.tp-topbar-end {
  display: flex;
  align-items: center;
  gap: var(--vectis-space-2);
}
.tp-updates {
  display: grid;
  gap: var(--vectis-space-2);
  min-inline-size: 16rem;
}
.tp-update {
  display: grid;
}
</style>
