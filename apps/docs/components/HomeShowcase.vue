<script setup lang="ts">
/**
 * The home page's showcase: a few live components in an application window, and accent swatches
 * that repaint them by setting the accent tokens on the window alone.
 */
import {
  VAvatar,
  VAvatarGroup,
  VButton,
  VCard,
  VCheckbox,
  VChip,
  VInput,
  VProgressLinear,
  VSelect,
  VSlider,
  VSwitch,
  VToggle,
  VToggleItem,
  VTypography,
} from 'vectis-ui'
import { arrow_upward as arrowUpward } from 'vectis-ui/icons'

import { formatOklch } from '~/theme-builder/color'
import { GROUP_ROLES, cssNameOf, presetColors } from '~/theme-builder/model'
import { ramps } from '~/theme-builder/palettes'

const { t } = useI18n()
const { theme } = useDocsTheme()

/** Violet first: it is the site's own accent, which the window keeps until another is picked. */
const SWATCHES = ['violet', 'indigo', 'blue', 'emerald', 'rose', 'orange'] as const
const accent = ref<(typeof SWATCHES)[number]>('violet')

const accentStyle = computed(() => {
  if (accent.value === 'violet') return undefined
  const colors = presetColors(accent.value, 'gray', theme.value)
  return Object.fromEntries(
    GROUP_ROLES.accent.map((role) => [cssNameOf(role), formatOklch(colors[role]!)]),
  )
})

const capitalised = (hue: string) => hue.charAt(0).toUpperCase() + hue.slice(1)

const projects = [
  { name: 'Atlas', owner: 'Grace Hopper', status: 'Active' },
  { name: 'Meridian', owner: 'Alan Turing', status: 'Review' },
  { name: 'Ember', owner: 'Ada Lovelace', status: 'Paused' },
]
const statusTone = (status: string) =>
  status === 'Active' ? 'success' : status === 'Review' ? 'warning' : 'neutral'

const email = ref('grace@orbit.dev')
const role = ref('editor')
const roles = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Admin' },
]
const welcome = ref(true)
const channel = ref('mentions')
const digest = ref(true)
const volume = ref(60)
</script>

<template>
  <div class="vd-showcase">
    <div class="vd-showcase-window" :style="accentStyle">
      <div class="vd-showcase-bar" aria-hidden="true">
        <span class="vd-showcase-dots"><i /><i /><i /></span>
        <span class="vd-showcase-address">orbit.app/projects</span>
      </div>

      <div class="vd-showcase-grid">
        <VCard title="Revenue" subtitle="This month">
          <div class="vd-showcase-figure">
            <VTypography variant="heading-1" as="p">€48.2k</VTypography>
            <VChip tone="success" :icon-start="arrowUpward" size="xs">12%</VChip>
          </div>
          <VProgressLinear :value="72" label="Quarterly goal" />
        </VCard>

        <VCard title="Projects" subtitle="Three active this week">
          <ul class="vd-showcase-list">
            <li v-for="project in projects" :key="project.name">
              <VAvatar :name="project.owner" size="sm" />
              <span class="vd-showcase-name">
                <VTypography variant="label" as="span">{{ project.name }}</VTypography>
                <VTypography variant="caption" tone="muted" as="span">{{
                  project.owner
                }}</VTypography>
              </span>
              <VChip :tone="statusTone(project.status)" size="xs">{{ project.status }}</VChip>
            </li>
          </ul>
        </VCard>

        <VCard title="Invite a teammate">
          <div class="vd-showcase-stack">
            <VInput v-model="email" label="Email" type="email" icon-start="mail" />
            <VSelect v-model="role" :options="roles" label="Role" />
            <VSwitch v-model="welcome">Send a welcome email</VSwitch>
          </div>
          <template #footer>
            <VButton variant="outline" tone="neutral">Cancel</VButton>
            <VButton>Send invitation</VButton>
          </template>
        </VCard>

        <VCard title="Notifications">
          <div class="vd-showcase-stack">
            <VToggle v-model="channel" label="Notify me about" mandatory full-width size="sm">
              <VToggleItem value="all" label="Everything" />
              <VToggleItem value="mentions" label="Mentions" />
              <VToggleItem value="none" label="Nothing" />
            </VToggle>
            <VCheckbox v-model="digest">Weekly digest</VCheckbox>
            <VSlider v-model="volume" label="Sound" />
            <VAvatarGroup :max="3" ring-color="var(--vectis-color-surface-raised)">
              <VAvatar name="Grace Hopper" size="sm" />
              <VAvatar name="Alan Turing" size="sm" />
              <VAvatar name="Ada Lovelace" size="sm" />
              <VAvatar name="Katherine Johnson" size="sm" />
            </VAvatarGroup>
          </div>
        </VCard>
      </div>
    </div>

    <div class="vd-showcase-controls">
      <VToggle
        v-model="accent"
        :label="t('home.showcaseAccent')"
        mandatory
        detached
        size="sm"
        item-variant="ghost"
        selected-variant="soft"
        tone="neutral"
        class="vd-showcase-swatches"
      >
        <VToggleItem v-for="hue in SWATCHES" :key="hue" :value="hue" :label="capitalised(hue)">
          <template #start>
            <span class="vd-showcase-swatch" :style="{ background: ramps[hue]['600'] }" />
          </template>
        </VToggleItem>
      </VToggle>
    </div>
  </div>
</template>

<style scoped>
.vd-showcase {
  display: grid;
  gap: var(--vectis-space-5);
}
/*
 * A window, set apart from the page by its shadow rather than by a second frame. The accent
 * tokens it carries inline reach every component inside, and nothing outside.
 */
.vd-showcase-window {
  overflow: clip;
  border: 1px solid var(--vectis-color-border);
  border-radius: var(--vectis-radius-overlay);
  background: var(--vectis-color-surface-sunken);
  box-shadow: var(--vectis-shadow-xl);
  text-align: start;
}
.vd-showcase-bar {
  display: flex;
  align-items: center;
  gap: var(--vectis-space-4);
  padding: var(--vectis-space-3) var(--vectis-space-4);
  border-block-end: 1px solid var(--vectis-color-border);
  background: var(--vectis-color-surface-raised);
}
.vd-showcase-dots {
  display: flex;
  gap: var(--vectis-space-2);
}
.vd-showcase-dots > i {
  inline-size: 0.625rem;
  block-size: 0.625rem;
  border-radius: var(--vectis-radius-full);
  background: var(--vectis-color-border-strong);
}
.vd-showcase-address {
  flex: 0 1 18rem;
  margin-inline: auto;
  padding: var(--vectis-space-1) var(--vectis-space-3);
  border-radius: var(--vectis-radius-interactive);
  background: var(--vectis-color-surface-muted);
  color: var(--vectis-color-text-muted);
  font-size: var(--vectis-text-caption-size);
  text-align: center;
}
.vd-showcase-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--vectis-space-4);
  padding: var(--vectis-space-4);
}
.vd-showcase-figure {
  display: flex;
  align-items: center;
  gap: var(--vectis-space-3);
  margin-block-end: var(--vectis-space-4);
}
.vd-showcase-figure > p {
  margin: 0;
}
.vd-showcase-list {
  display: grid;
  gap: var(--vectis-space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}
.vd-showcase-list > li {
  display: flex;
  align-items: center;
  gap: var(--vectis-space-3);
}
.vd-showcase-name {
  display: grid;
  flex: 1;
  min-inline-size: 0;
}
.vd-showcase-stack {
  display: grid;
  gap: var(--vectis-space-4);
}
/* A stretched choice spreads its `auto auto` columns apart; keep it at its own width. */
.vd-showcase-stack > .v-choice {
  justify-self: start;
}
.vd-showcase-controls {
  display: flex;
  justify-content: center;
}
.vd-showcase-swatches {
  flex-wrap: wrap;
  justify-content: center;
}
.vd-showcase-swatch {
  inline-size: 0.75rem;
  block-size: 0.75rem;
  border-radius: var(--vectis-radius-full);
  box-shadow: inset 0 0 0 1px var(--vectis-color-border-on-fill);
}

@media (min-width: 768px) {
  .vd-showcase-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding: var(--vectis-space-6);
  }
}
</style>
