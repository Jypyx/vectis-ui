<script setup lang="ts">
/** The preview's dashboard: page actions, figures, and a tabbed table and activity feed. */
import {
  VAlert,
  VAvatar,
  VAvatarGroup,
  VButton,
  VCard,
  VCheckbox,
  VChip,
  VDataTable,
  VDialog,
  VDrawer,
  VEmptyState,
  VField,
  VInput,
  VMenuItem,
  VMenuSeparator,
  VPagination,
  VProgressCircular,
  VProgressLinear,
  VSelect,
  VSpinner,
  VSplitButton,
  VTab,
  VTabPanel,
  VTabs,
  VTimeline,
  VTimelineItem,
  VTypography,
  toast,
} from 'vectis-ui'
import type { DataTableRowId } from 'vectis-ui'
import { add, arrow_upward as arrowUpward, search_off as searchOff } from 'vectis-ui/icons'

const inviteOpen = ref(false)
const filtersOpen = ref(false)
const inviteEmail = ref('')
const inviteRole = ref('editor')
const roles = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Admin' },
]
const active = ref(true)
const inReview = ref(true)
const paused = ref(false)

const tab = ref('projects')
const page = ref(2)

const columns = [
  { key: 'name', label: 'Project', sortable: true },
  { key: 'owner', label: 'Owner' },
  { key: 'status', label: 'Status' },
  { key: 'commits', label: 'Commits', sortable: true, align: 'end' as const },
]
const rows = [
  { name: 'Atlas', owner: 'Grace Hopper', status: 'Active', commits: 1204 },
  { name: 'Meridian', owner: 'Alan Turing', status: 'Review', commits: 87 },
  { name: 'Halcyon', owner: 'Ada Lovelace', status: 'Active', commits: 320 },
  { name: 'Ember', owner: 'Katherine Johnson', status: 'Paused', commits: 45 },
]
const selected = ref<DataTableRowId[]>(['Atlas'])
const statusTone = (status: string) =>
  status === 'Active' ? 'success' : status === 'Review' ? 'warning' : 'neutral'

function clearFilters() {
  active.value = false
  inReview.value = false
  paused.value = false
}

function invite() {
  inviteOpen.value = false
  toast({ tone: 'success', message: 'Invitation sent.' })
}
</script>

<template>
  <section id="overview" class="tp-section">
    <div class="tp-page-head">
      <div>
        <VTypography variant="heading-1" as="h1">Projects</VTypography>
        <VTypography variant="body-md" tone="muted">
          Everything your team is shipping this quarter.
        </VTypography>
      </div>
      <div class="tp-actions">
        <VDrawer v-model:open="filtersOpen" title="Filters" subtitle="Narrow the list of projects.">
          <template #trigger="{ triggerProps }">
            <VButton variant="ghost" tone="neutral" v-bind="triggerProps">Filters</VButton>
          </template>
          <div class="tp-stack">
            <VCheckbox v-model="active">Active</VCheckbox>
            <VCheckbox v-model="inReview">In review</VCheckbox>
            <VCheckbox v-model="paused">Paused</VCheckbox>
          </div>
          <template #footer>
            <VButton variant="ghost" tone="neutral" @click="clearFilters">Clear</VButton>
            <VButton @click="filtersOpen = false">Apply</VButton>
          </template>
        </VDrawer>

        <VDialog v-model:open="inviteOpen" title="Invite a teammate" subtitle="They join Orbit.">
          <template #trigger="{ triggerProps }">
            <VButton variant="outline" tone="neutral" v-bind="triggerProps">Invite</VButton>
          </template>
          <div class="tp-stack">
            <VField v-slot="{ fieldProps }" label="Email">
              <VInput v-bind="fieldProps" v-model="inviteEmail" type="email" icon-start="mail" />
            </VField>
            <VSelect v-model="inviteRole" :options="roles" label="Role" />
          </div>
          <template #footer>
            <VButton variant="ghost" tone="neutral" @click="inviteOpen = false">Cancel</VButton>
            <VButton @click="invite">Send invitation</VButton>
          </template>
        </VDialog>

        <VSplitButton label="New project" :icon-start="add">
          <VMenuItem label="From a template" />
          <VMenuItem label="Import from GitHub" icon-start="download" />
          <VMenuSeparator />
          <VMenuItem label="Duplicate Atlas" />
        </VSplitButton>
      </div>
    </div>

    <div class="tp-stats">
      <VCard title="Revenue" subtitle="This month">
        <div class="tp-figure">
          <VTypography variant="display" as="p">€48.2k</VTypography>
          <VChip tone="success" :icon-start="arrowUpward" size="xs">12%</VChip>
        </div>
      </VCard>
      <VCard title="Active users" subtitle="Of 3,200 seats">
        <div class="tp-figure">
          <VProgressCircular :value="68" label="Seats in use" show-value />
          <VAvatarGroup :max="3" ring-color="var(--vectis-color-surface-raised)">
            <VAvatar name="Grace Hopper" />
            <VAvatar name="Alan Turing" />
            <VAvatar name="Ada Lovelace" />
            <VAvatar name="Katherine Johnson" />
          </VAvatarGroup>
        </div>
      </VCard>
      <VCard title="Release" subtitle="Atlas 2.4">
        <div class="tp-stack">
          <VProgressLinear :value="80" label="Build" />
          <span class="tp-syncing">
            <VSpinner />
            <VTypography variant="body-sm" tone="muted" as="span">Deploying to Europe…</VTypography>
          </span>
        </div>
      </VCard>
    </div>

    <VCard>
      <VTabs v-model="tab" label="Workspace">
        <VTab value="projects" label="Projects" />
        <VTab value="activity" label="Activity" />
        <VTab value="archive" label="Archive" />
        <template #panels>
          <VTabPanel value="projects">
            <div class="tp-stack">
              <VDataTable
                v-model:selected="selected"
                :columns="columns"
                :rows="rows"
                row-key="name"
                selectable
              >
                <template #cell-owner="{ row }">
                  <span class="tp-owner">
                    <VAvatar :name="row.owner" size="xs" />
                    {{ row.owner }}
                  </span>
                </template>
                <template #cell-status="{ row }">
                  <VChip :tone="statusTone(row.status)" size="xs">{{ row.status }}</VChip>
                </template>
              </VDataTable>
              <VPagination v-model="page" :length="6" class="tp-pagination" />
            </div>
          </VTabPanel>
          <VTabPanel value="activity">
            <VTimeline aria-label="Recent activity">
              <VTimelineItem datetime="2026-10-06T09:15" title="Atlas deployed">
                Version 2.4 is live in every region.
              </VTimelineItem>
              <VTimelineItem datetime="2026-10-05T16:40" title="Review requested">
                Alan asked Grace to review Meridian.
              </VTimelineItem>
              <VTimelineItem datetime="2026-10-05T11:02" title="Project created">
                Ember was created from a template.
              </VTimelineItem>
            </VTimeline>
          </VTabPanel>
          <VTabPanel value="archive">
            <VEmptyState
              :icon="searchOff"
              title="Nothing archived"
              description="Projects you archive are kept here for 90 days."
            >
              <template #actions>
                <VButton variant="outline" tone="neutral">Learn more</VButton>
              </template>
            </VEmptyState>
          </VTabPanel>
        </template>
      </VTabs>
    </VCard>

    <div class="tp-alerts">
      <VAlert tone="accent" title="New region">Projects can now deploy to Singapore.</VAlert>
      <VAlert tone="success" variant="outline" title="Backup complete">
        All 12 projects were saved at 03:00.
      </VAlert>
      <VAlert tone="warning" title="Seats running low"> You have used 68% of your plan. </VAlert>
      <VAlert tone="danger" variant="outline" title="Payment failed" closable>
        Update your card to keep deploying.
      </VAlert>
    </div>
  </section>
</template>

<style scoped>
.tp-section {
  display: grid;
  gap: var(--vectis-space-5);
}
.tp-page-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--vectis-space-4);
}
.tp-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-2);
}
.tp-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: var(--vectis-space-4);
}
.tp-figure {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--vectis-space-3);
}
.tp-figure > p {
  margin: 0;
}
.tp-stack {
  display: grid;
  gap: var(--vectis-space-4);
}
/* A stretched choice spreads its `auto auto` columns apart; keep it at its own width. */
.tp-stack > .v-choice {
  justify-self: start;
}
.tp-syncing,
.tp-owner {
  display: inline-flex;
  align-items: center;
  gap: var(--vectis-space-2);
}
.tp-pagination {
  justify-self: end;
}
.tp-alerts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  gap: var(--vectis-space-4);
}
</style>
