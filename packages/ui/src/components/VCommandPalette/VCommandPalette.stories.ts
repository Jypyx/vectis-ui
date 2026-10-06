import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { computed, ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VButton from '../VButton/VButton.vue'
import VChip from '../VChip/VChip.vue'
import VHotkeys from '../VHotkeys/VHotkeys.vue'
import VTypography from '../VTypography/VTypography.vue'
import VCommandPalette from './VCommandPalette.vue'
import type { CommandPaletteCommand, CommandPaletteItem } from './VCommandPalette.vue'

const t = storyText({
  en: {
    open: 'Search commands',
    ran: (label: string) => `Ran: ${label}`,
    actions: 'Actions',
    newDocument: 'New document',
    newDocumentHint: 'A blank document in this workspace',
    openReports: 'Open reports',
    notifications: 'Notification settings',
    navigation: 'Navigation',
    dashboard: 'Go to dashboard',
    projects: 'Go to projects',
    billing: 'Go to billing',
    help: 'Help and shortcuts',
    syncWords: ['refresh', 'reload'],
    sync: 'Sync now',
    documents: 'Search documents',
    searching: 'Searching documents…',
    recent: 'Recent',
    beta: 'Beta',
  },
  fr: {
    open: 'Rechercher une commande',
    ran: (label: string) => `Exécuté : ${label}`,
    actions: 'Actions',
    newDocument: 'Nouveau document',
    newDocumentHint: 'Un document vierge dans cet espace',
    openReports: 'Ouvrir les rapports',
    notifications: 'Réglages des notifications',
    navigation: 'Navigation',
    dashboard: 'Aller au tableau de bord',
    projects: 'Aller aux projets',
    billing: 'Aller à la facturation',
    help: 'Aide et raccourcis',
    syncWords: ['actualiser', 'recharger'],
    sync: 'Synchroniser',
    documents: 'Rechercher des documents',
    searching: 'Recherche des documents…',
    recent: 'Récents',
    beta: 'Bêta',
  },
})

/** The commands most stories share, rebuilt when the locale changes. */
const commands = computed<CommandPaletteItem[]>(() => [
  {
    label: t.value.actions,
    commands: [
      {
        label: t.value.newDocument,
        description: t.value.newDocumentHint,
        icon: 'add',
        shortcut: 'mod+alt+n',
      },
      { label: t.value.openReports, icon: 'table_chart' },
      { label: t.value.sync, icon: 'schedule', keywords: t.value.syncWords },
      { label: t.value.notifications, icon: 'notifications', keepOpen: true },
    ],
  },
  { separator: true },
  {
    label: t.value.navigation,
    commands: [
      { label: t.value.dashboard, href: '#dashboard' },
      { label: t.value.projects, href: '#projects' },
      { label: t.value.billing, href: '#billing', disabled: true },
    ],
  },
  { separator: true },
  { label: t.value.help, icon: 'info', shortcut: 'shift+/' },
])

const meta = {
  title: 'Components/CommandPalette',
  component: VCommandPalette,
  argTypes: {
    shortcut: { control: 'text' },
    filter: { control: 'boolean' },
    searchDebounce: { control: 'number' },
    loading: { control: 'boolean' },
    loadingText: { control: 'text' },
    emptyText: { control: 'text' },
    placeholder: { control: 'text' },
    label: { control: 'text' },
    searchLabel: { control: 'text' },
    hideFooter: { control: 'boolean' },
    width: { control: 'text' },
  },
  args: {
    items: [],
    shortcut: 'mod+k',
    filter: true,
    searchDebounce: 250,
    loading: false,
    hideFooter: false,
  },
  render: (args) => ({
    components: { VCommandPalette, VButton, VHotkeys, VTypography },
    setup() {
      const open = ref(false)
      const last = ref('')
      return { args, t, open, last, commands }
    },
    template: `
      <VCommandPalette v-bind="args" v-model:open="open" :items="commands" @select="(c) => (last = c.label)">
        <template #trigger="{ triggerProps }">
          <VButton v-bind="triggerProps" variant="outline" tone="neutral">
            {{ t.open }}
            <VHotkeys v-if="args.shortcut" :keys="args.shortcut" />
          </VButton>
        </template>
      </VCommandPalette>
      <VTypography v-if="last" style="margin-block-start: 12px">{{ t.ran(last) }}</VTypography>
    `,
  }),
} satisfies Meta<typeof VCommandPalette>

export default meta
type Story = StoryObj<typeof meta>

const findPalette = (root: HTMLElement) =>
  root.querySelector('.v-command-palette') as HTMLDialogElement | null

/** Waits for the palette to be open and settled, with the focus in its field. */
async function opened(root: HTMLElement) {
  return waitFor(() => {
    const palette = findPalette(root)
    expect(palette?.open).toBe(true)
    expect(palette!.getAnimations()).toHaveLength(0)
    const input = within(palette!).getByRole('combobox', {
      name: 'Search commands',
    }) as HTMLInputElement
    expect(document.activeElement).toBe(input)
    return { palette: palette!, input }
  })
}

const labelsOf = (palette: HTMLElement) =>
  within(palette)
    .queryAllByRole('option')
    .map((option) => option.querySelector('.v-command-palette-item-label')?.textContent)

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: /Search commands/ })
    expect(trigger.getAttribute('aria-keyshortcuts')).toMatch(/^(Control|Meta)\+K$/)

    await userEvent.click(trigger)
    const { palette, input } = await opened(canvasElement)
    // Pinned near the top of the viewport rather than centred.
    expect(Math.round(palette.getBoundingClientRect().top)).toBe(96)

    // The keywords match too: "reload" finds "Sync now".
    await userEvent.type(input, 'reload')
    await waitFor(() => expect(labelsOf(palette)).toEqual(['Sync now']))
    await userEvent.clear(input)
    await userEvent.type(input, 'rep')
    await waitFor(() => expect(labelsOf(palette)).toEqual(['Open reports']))
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(findPalette(canvasElement)).toBeNull())
    await waitFor(() => expect(document.activeElement).toBe(trigger))
    expect(canvas.getByText('Ran: Open reports')).toBeTruthy()

    // The shortcut opens it from the page, emptied; the arrows skip the disabled link.
    const mod = trigger.getAttribute('aria-keyshortcuts')!.split('+')[0]
    await userEvent.keyboard(`{${mod}>}k{/${mod}}`)
    const again = await opened(canvasElement)
    expect(again.input.value).toBe('')
    await userEvent.keyboard('{ArrowUp}{ArrowUp}')
    const active = () => document.getElementById(again.input.getAttribute('aria-activedescendant')!)
    await waitFor(() => expect(active()?.textContent).toContain('Go to projects'))
    expect(active()?.getAttribute('aria-selected')).toBe('true')
  },
}

/**
 * With `filter` off, the source filters: `search` reports the term after `searchDebounce`, and
 * `loading` shows a spinner in the field until the commands arrive.
 */
export const AsyncSearch: Story = {
  args: { shortcut: undefined, filter: false },
  render: (args) => ({
    components: { VCommandPalette, VButton },
    setup() {
      const open = ref(false)
      const loading = ref(false)
      const results = ref<CommandPaletteCommand[]>([])
      const documents = ['Roadmap 2026', 'Release plan', 'Planning poker notes', 'Team charter']
      let request = 0
      function search(query: string) {
        const id = ++request
        loading.value = true
        setTimeout(() => {
          if (id !== request) return
          const q = query.toLowerCase()
          results.value = documents
            .filter((name) => name.toLowerCase().includes(q))
            .map((label) => ({ label, icon: 'description' }))
          loading.value = false
        }, 400)
      }
      return { args, t, open, loading, results, search }
    },
    template: `
      <VCommandPalette
        v-bind="args"
        v-model:open="open"
        :items="results"
        :loading="loading"
        :loading-text="t.searching"
        @search="search"
      >
        <template #trigger="{ triggerProps }">
          <VButton v-bind="triggerProps">{{ t.documents }}</VButton>
        </template>
      </VCommandPalette>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Search documents' }))
    const { palette, input } = await opened(canvasElement)
    await waitFor(() => expect(labelsOf(palette)).toHaveLength(4))

    await userEvent.type(input, 'plan')
    await waitFor(() => expect(palette.querySelector('.v-command-palette-spinner')).not.toBeNull())
    await waitFor(() => expect(labelsOf(palette)).toEqual(['Release plan', 'Planning poker notes']))
    expect(palette.querySelector('.v-command-palette-spinner')).toBeNull()

    await userEvent.type(input, 'zzz')
    await waitFor(() => expect(within(palette).getByRole('status').textContent).toBe('No results'))
  },
}

/**
 * Recent commands are kept by the consumer: `select` reports each choice, and the commands
 * offered while the search is empty start with a block of the latest ones.
 */
export const RecentCommands: Story = {
  args: { shortcut: undefined },
  render: (args) => ({
    components: { VCommandPalette, VButton },
    setup() {
      const open = ref(false)
      const query = ref('')
      const recent = ref<CommandPaletteCommand[]>([])
      const items = computed<CommandPaletteItem[]>(() =>
        query.value || recent.value.length === 0
          ? commands.value
          : [
              { label: t.value.recent, commands: recent.value },
              { separator: true },
              ...commands.value,
            ],
      )
      function remember(command: CommandPaletteCommand) {
        recent.value = [command, ...recent.value.filter((c) => c.label !== command.label)].slice(
          0,
          3,
        )
      }
      return { args, t, open, query, items, remember }
    },
    template: `
      <VCommandPalette v-bind="args" v-model:open="open" v-model:query="query" :items="items" @select="remember">
        <template #trigger="{ triggerProps }">
          <VButton v-bind="triggerProps">{{ t.open }}</VButton>
        </template>
      </VCommandPalette>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: 'Search commands' })
    await userEvent.click(trigger)
    let { palette } = await opened(canvasElement)
    await userEvent.click(within(palette).getByRole('option', { name: 'Sync now' }))
    await waitFor(() => expect(findPalette(canvasElement)).toBeNull())

    await userEvent.click(trigger)
    ;({ palette } = await opened(canvasElement))
    const group = within(palette).getByRole('group', { name: 'Recent' })
    expect(within(group).getByRole('option', { name: 'Sync now' })).toBeTruthy()
  },
}

/** The `#item` slot draws the label and description; the icon and the shortcut stay in place. */
export const CustomItem: Story = {
  args: { shortcut: undefined },
  render: (args) => ({
    components: { VCommandPalette, VButton, VChip },
    setup() {
      const open = ref(false)
      return { args, t, open, commands }
    },
    template: `
      <VCommandPalette v-bind="args" v-model:open="open" :items="commands">
        <template #trigger="{ triggerProps }">
          <VButton v-bind="triggerProps">{{ t.open }}</VButton>
        </template>
        <template #item="{ command }">
          <span class="v-command-palette-item-label" style="display: flex; align-items: center; gap: 8px">
            {{ command.label }}
            <VChip v-if="command.keepOpen" tone="accent" size="xs">{{ t.beta }}</VChip>
          </span>
        </template>
      </VCommandPalette>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Search commands' }))
    const { palette } = await opened(canvasElement)
    const option = within(palette).getByRole('option', { name: /Notification settings/ })
    expect(within(option).getByText('Beta')).toBeTruthy()
  },
}
