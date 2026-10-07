<script setup lang="ts">
/** The preview's remaining components: scheduling, files, onboarding, media and content. */
import {
  VAccordion,
  VAccordionItem,
  VAvatar,
  VBadge,
  VButton,
  VButtonGroup,
  VCalendar,
  VCard,
  VCarousel,
  VCarouselItem,
  VChip,
  VColorPicker,
  VContextMenu,
  VDatePicker,
  VFilePicker,
  VHoverCard,
  VIcon,
  VIconButton,
  VLink,
  VMenuItem,
  VMenuSeparator,
  VResizable,
  VResizablePanel,
  VSeparator,
  VSkeletonLoader,
  VStepper,
  VTimePicker,
  VTreeView,
  VTypography,
  VVirtualList,
} from 'vectis-ui'
import type { CalendarEvent, StepperStep, TreeItem } from 'vectis-ui'
import {
  check_circle as checkCircle,
  code,
  description,
  image,
  picture_as_pdf as pdf,
  star,
} from 'vectis-ui/icons'

/* The calendar renders in the browser only, so it can open on the current week. */
const anchor = ref(mondayOf(new Date()))
const events = ref<CalendarEvent[]>(scheduleFor(anchor.value))

function isoOf(date: Date): string {
  const two = (part: number) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}`
}
function mondayOf(date: Date): string {
  const monday = new Date(date)
  monday.setDate(date.getDate() - ((date.getDay() + 6) % 7))
  return isoOf(monday)
}
function scheduleFor(monday: string): CalendarEvent[] {
  const day = (offset: number) => {
    const date = new Date(`${monday}T00:00:00`)
    date.setDate(date.getDate() + offset)
    return isoOf(date)
  }
  return [
    {
      id: 'standup',
      title: 'Standup',
      start: day(0),
      end: day(0),
      startTime: '09:30',
      endTime: '09:45',
    },
    {
      id: 'review',
      title: 'Design review',
      start: day(1),
      end: day(1),
      startTime: '14:00',
      endTime: '15:30',
    },
    {
      id: 'launch',
      title: 'Atlas launch',
      start: day(3),
      end: day(3),
      startTime: '11:00',
      endTime: '12:00',
    },
  ]
}

const date = ref('2026-11-02')
const time = ref<string | null>('09:30')
const color = ref<string | null>('#4f46e5')

const tree: TreeItem[] = [
  {
    value: 'design',
    label: 'Design',
    children: [
      { value: 'brief', label: 'Brief.pdf', icon: pdf },
      { value: 'cover', label: 'Cover.png', icon: image },
    ],
  },
  {
    value: 'src',
    label: 'Source',
    children: [{ value: 'app', label: 'App.vue', icon: code }],
  },
  { value: 'notes', label: 'Notes.md', icon: description },
]
const expanded = ref(['design'])
const uploads = ref<File[]>([])

const steps: StepperStep[] = [
  { value: 'account', title: 'Account' },
  { value: 'workspace', title: 'Workspace' },
  { value: 'invite', title: 'Invite' },
  { value: 'done', title: 'Done' },
]
const step = ref('workspace')

const slide = ref(0)

const invoices = Array.from({ length: 2000 }, (_, i) => ({
  id: i + 1,
  amount: ((i * 7919) % 100000) / 100,
}))

const files = ['Brief.pdf', 'Budget.xlsx', 'Roadmap.md']
</script>

<template>
  <section class="tp-widgets">
    <VCard title="Schedule" class="tp-span-2">
      <!--
        Client-only: the calendar marks today, which the prerendered page cannot know, and the
        difference would be reported as a hydration mismatch.
      -->
      <ClientOnly>
        <VCalendar
          v-model:date="anchor"
          v-model:events="events"
          label="Team schedule"
          class="tp-calendar"
        />
        <template #fallback><div class="tp-calendar" /></template>
      </ClientOnly>
    </VCard>

    <VCard title="Pick a slot">
      <div class="tp-pickers">
        <VDatePicker v-model="date" />
        <VTimePicker v-model="time" />
      </div>
    </VCard>

    <VCard title="Brand colour">
      <VColorPicker v-model="color" />
    </VCard>

    <VCard title="Files">
      <div class="tp-stack">
        <VTreeView v-model:expanded="expanded" :items="tree" label="Project files" />
        <VFilePicker v-model="uploads" title="Drop files here" subtitle="PNG or PDF, up to 5 MB" />
      </div>
    </VCard>

    <VCard title="Getting started">
      <div class="tp-stack">
        <VStepper v-model="step" :steps="steps" />
        <VAccordion>
          <VAccordionItem title="Connect a repository" default-open>
            Orbit builds every push to your default branch.
          </VAccordionItem>
          <VAccordionItem title="Add a custom domain">
            Point a CNAME record at your project's address.
          </VAccordionItem>
        </VAccordion>
      </div>
    </VCard>

    <VCard title="Gallery">
      <VCarousel v-model="slide" label="Screenshots">
        <VCarouselItem><p class="tp-slide">Dashboard</p></VCarouselItem>
        <VCarouselItem><p class="tp-slide">Deployments</p></VCarouselItem>
        <VCarouselItem><p class="tp-slide">Billing</p></VCarouselItem>
      </VCarousel>
    </VCard>

    <VCard title="Invoices">
      <VVirtualList :items="invoices" item-key="id" :height="240" label="Invoices">
        <template #default="{ item }">
          <div class="tp-invoice">
            <span>Invoice {{ item.id }}</span>
            <span>€{{ item.amount.toFixed(2) }}</span>
          </div>
        </template>
      </VVirtualList>
    </VCard>

    <VCard title="Layout" class="tp-span-2">
      <VResizable class="tp-resizable">
        <VResizablePanel :default-size="35" label="Outline" class="tp-pane"
          >Outline</VResizablePanel
        >
        <VResizablePanel class="tp-pane">
          <VSkeletonLoader :lines="4" />
        </VResizablePanel>
      </VResizable>
    </VCard>

    <VCard title="Team">
      <div class="tp-stack">
        <VTypography>
          Ask
          <VHoverCard>
            <template #default="{ triggerProps }">
              <VLink href="#" v-bind="triggerProps">@grace</VLink>
            </template>
            <template #content>
              <div class="tp-person">
                <VAvatar name="Grace Hopper" size="lg" />
                <div>
                  <VTypography variant="subtitle">Grace Hopper</VTypography>
                  <VTypography variant="body-sm" tone="muted">Platform lead</VTypography>
                </div>
              </div>
            </template>
          </VHoverCard>
          before changing the build pipeline.
        </VTypography>
        <VSeparator />
        <VContextMenu as="ul" class="tp-files" aria-label="Shared files">
          <li v-for="file in files" :key="file">
            <button type="button" class="tp-file">{{ file }}</button>
          </li>
          <template #menu>
            <VMenuItem label="Open" />
            <VMenuItem label="Rename" icon-start="edit" />
            <VMenuSeparator />
            <VMenuItem label="Delete" tone="danger" icon-start="delete" />
          </template>
        </VContextMenu>
        <VTypography variant="caption" tone="muted"
          >Right-click a file for its actions.</VTypography
        >
      </div>
    </VCard>

    <VCard title="Labels and actions">
      <div class="tp-stack">
        <div class="tp-row">
          <VChip tone="accent">Accent</VChip>
          <VChip tone="success" variant="solid">Live</VChip>
          <VChip tone="warning" variant="outline">Beta</VChip>
          <VChip tone="danger" shape="pill">Blocked</VChip>
          <VBadge :count="12" tone="accent" />
          <VBadge dot tone="success" />
        </div>
        <div class="tp-row">
          <VButtonGroup variant="outline" tone="neutral" label="Range">
            <VButton>Day</VButton>
            <VButton>Week</VButton>
            <VButton>Month</VButton>
          </VButtonGroup>
          <VIconButton label="Favourite" :icon="star" variant="soft" tone="accent" />
          <VIconButton label="Download" icon="download" variant="outline" tone="neutral" />
        </div>
        <div class="tp-row">
          <VButton tone="accent">Solid</VButton>
          <VButton variant="soft">Soft</VButton>
          <VButton variant="outline" tone="neutral">Outline</VButton>
          <VButton variant="ghost" tone="danger">Ghost</VButton>
        </div>
        <VTypography variant="body-sm" tone="muted" class="tp-row">
          <VIcon :name="checkCircle" class="tp-ok" />
          All systems operational
        </VTypography>
        <code class="tp-code">pnpm add vectis-ui</code>
      </div>
    </VCard>
  </section>
</template>

<style scoped>
.tp-widgets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  gap: var(--vectis-space-5);
  align-items: start;
}
.tp-span-2 {
  grid-column: 1 / -1;
}
.tp-calendar {
  block-size: 30rem;
}
.tp-pickers {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-4);
}
.tp-stack {
  display: grid;
  gap: var(--vectis-space-4);
}
.tp-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--vectis-space-2);
}
.tp-slide {
  display: grid;
  place-items: center;
  block-size: 10rem;
  margin: 0;
  border-radius: var(--vectis-radius-surface);
  background: var(--vectis-color-accent-surface);
  color: var(--vectis-color-accent-text);
  font-family: var(--vectis-text-family-heading);
  font-size: var(--vectis-text-heading-3-size);
}
.tp-invoice {
  display: flex;
  justify-content: space-between;
  padding: var(--vectis-space-2) var(--vectis-space-3);
  border-block-end: 1px solid var(--vectis-color-border);
}
.tp-resizable {
  block-size: 12rem;
  border: 1px solid var(--vectis-color-border);
  border-radius: var(--vectis-radius-surface);
}
.tp-pane {
  padding: var(--vectis-space-4);
}
.tp-person {
  display: flex;
  align-items: center;
  gap: var(--vectis-space-3);
}
.tp-files {
  display: grid;
  gap: var(--vectis-space-1);
  margin: 0;
  padding: 0;
  list-style: none;
}
.tp-file {
  inline-size: 100%;
  padding: var(--vectis-space-2) var(--vectis-space-3);
  border: none;
  border-radius: var(--vectis-radius-interactive);
  background: var(--vectis-color-surface-muted);
  color: var(--vectis-color-text);
  font: inherit;
  text-align: start;
}
.tp-ok {
  color: var(--vectis-color-success-text);
}
.tp-code {
  justify-self: start;
  padding: var(--vectis-space-1) var(--vectis-space-2);
  border-radius: var(--vectis-radius-interactive);
  background: var(--vectis-color-surface-sunken);
  font-family: var(--vectis-text-family-code);
  font-size: var(--vectis-text-code-size);
}
</style>
