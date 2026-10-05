import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { computed, ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VTypography from '../VTypography/VTypography.vue'
import VTreeView from './VTreeView.vue'
import type { TreeItem, TreeViewModelValue } from './VTreeView.vue'
import type { ItemValue } from '../../types'

const t = storyText({
  en: {
    files: 'Files',
    documents: 'Documents',
    resume: 'Resume.pdf',
    taxes: 'Taxes',
    pictures: 'Pictures',
    holidays: 'Holidays',
    beach: 'Beach.jpg',
    mountain: 'Mountain.jpg',
    music: 'Music',
    playlist: 'Playlist.m3u',
    archive: 'Archive',
    notes: 'Notes.txt',
    selected: 'Selected',
    nothing: 'nothing',
    site: 'Site',
    gettingStarted: 'Getting started',
    installation: 'Installation',
    theming: 'Theming',
    components: 'Components',
    button: 'Button',
    treeView: 'Tree view',
    changelog: 'Changelog',
    servers: 'Servers',
    production: 'Production',
    staging: 'Staging',
    offline: 'Offline region',
    node: (name: string, index: number) => `${name} node ${index}`,
  },
  fr: {
    files: 'Fichiers',
    documents: 'Documents',
    resume: 'CV.pdf',
    taxes: 'Impôts',
    pictures: 'Images',
    holidays: 'Vacances',
    beach: 'Plage.jpg',
    mountain: 'Montagne.jpg',
    music: 'Musique',
    playlist: 'Liste.m3u',
    archive: 'Archives',
    notes: 'Notes.txt',
    selected: 'Sélection',
    nothing: 'rien',
    site: 'Site',
    gettingStarted: 'Premiers pas',
    installation: 'Installation',
    theming: 'Thèmes',
    components: 'Composants',
    button: 'Bouton',
    treeView: 'Arborescence',
    changelog: 'Journal des modifications',
    servers: 'Serveurs',
    production: 'Production',
    staging: 'Préproduction',
    offline: 'Région hors ligne',
    node: (name: string, index: number) => `${name}, nœud ${index}`,
  },
})

const files = computed<TreeItem[]>(() => [
  {
    value: 'documents',
    label: t.value.documents,
    icon: 'folder',
    children: [
      { value: 'resume', label: t.value.resume, icon: 'description' },
      {
        value: 'taxes',
        label: t.value.taxes,
        icon: 'folder',
        children: [
          { value: 'taxes-2025', label: '2025.pdf', icon: 'description' },
          { value: 'taxes-2026', label: '2026.pdf', icon: 'description' },
        ],
      },
    ],
  },
  {
    value: 'pictures',
    label: t.value.pictures,
    icon: 'folder',
    children: [
      {
        value: 'holidays',
        label: t.value.holidays,
        icon: 'folder',
        children: [
          { value: 'beach', label: t.value.beach, icon: 'image' },
          { value: 'mountain', label: t.value.mountain, icon: 'image' },
        ],
      },
    ],
  },
  {
    value: 'music',
    label: t.value.music,
    icon: 'folder',
    children: [{ value: 'playlist', label: t.value.playlist, icon: 'music_note' }],
  },
  {
    value: 'archive',
    label: t.value.archive,
    icon: 'folder',
    disabled: true,
    children: [{ value: 'old', label: 'Old.zip', icon: 'folder_zip' }],
  },
  { value: 'notes', label: t.value.notes, icon: 'description' },
])

const meta = {
  title: 'Components/TreeView',
  component: VTreeView,
  argTypes: {
    selectionMode: { control: 'inline-radio', options: ['none', 'single', 'multiple'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    label: { control: 'text' },
  },
  args: { items: [], selectionMode: 'none', size: 'md' },
  render: (args) => ({
    components: { VTreeView, VTypography },
    setup() {
      const expanded = ref<ItemValue[]>(['documents'])
      const selected = ref<TreeViewModelValue>(null)
      const summary = computed(() => {
        const values = [selected.value ?? []].flat()
        return values.length ? values.join(', ') : t.value.nothing
      })
      return { args, t, files, expanded, selected, summary }
    },
    template: `
      <div style="display: grid; gap: 16px; max-width: 360px">
        <VTreeView
          v-bind="args"
          v-model="selected"
          v-model:expanded="expanded"
          :items="files"
          :label="args.label ?? t.files"
        />
        <VTypography v-if="args.selectionMode !== 'none'" variant="body-sm" data-testid="summary">
          {{ t.selected }}: {{ summary }}
        </VTypography>
      </div>
    `,
  }),
} satisfies Meta<typeof VTreeView>

export default meta
type Story = StoryObj<typeof meta>

const focused = () => document.activeElement?.querySelector('.v-tree-label')?.textContent

/** The arrows walk the visible rows; right and left open, enter, leave and close branches. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const tree = canvas.getByRole('tree', { name: 'Files' })
    expect(within(tree).getAllByRole('treeitem')).toHaveLength(7)

    await userEvent.tab()
    expect(focused()).toBe('Documents')
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowRight}')
    expect(canvas.getByRole('treeitem', { name: 'Taxes' })).toHaveAttribute('aria-expanded', 'true')
    await userEvent.keyboard('{ArrowRight}')
    expect(focused()).toBe('2025.pdf')
    expect(document.activeElement).toHaveAttribute('aria-level', '3')
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(focused()).toBe('Taxes')
    expect(document.activeElement).toHaveAttribute('aria-expanded', 'false')

    // Typeahead, then the asterisk opens every branch beside the focused one.
    await userEvent.keyboard('n')
    expect(focused()).toBe('Notes.txt')
    await userEvent.keyboard('*')
    await waitFor(() =>
      expect(canvas.getByRole('treeitem', { name: 'Pictures' })).toHaveAttribute(
        'aria-expanded',
        'true',
      ),
    )
    // The disabled branch stays closed, but the keyboard still finds it.
    expect(canvas.getByRole('treeitem', { name: 'Archive' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    await userEvent.keyboard('{ArrowUp}')
    expect(focused()).toBe('Archive')
  },
}

/** `single`: a click, Enter or Space selects a node; the chevron only folds it. */
export const SingleSelection: Story = {
  args: { selectionMode: 'single' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('treeitem', { name: 'Resume.pdf' }))
    await waitFor(() =>
      expect(canvas.getByRole('treeitem', { name: 'Resume.pdf' })).toHaveAttribute(
        'aria-selected',
        'true',
      ),
    )
    const music = canvas.getByRole('treeitem', { name: 'Music' })
    await userEvent.click(music.querySelector('.v-tree-toggle')!)
    await waitFor(() => expect(music).toHaveAttribute('aria-expanded', 'true'))
    expect(music).toHaveAttribute('aria-selected', 'false')
    await userEvent.keyboard('{ArrowDown} ')
    await waitFor(() =>
      expect(canvas.getByTestId('summary')).toHaveTextContent('Selected: playlist'),
    )
  },
}

/**
 * `multiple`: each row has a checkbox. Checking a branch checks its subtree, and a branch
 * partly checked shows a dash.
 */
export const MultipleSelection: Story = {
  args: { selectionMode: 'multiple' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getByRole('tree')).toHaveAttribute('aria-multiselectable', 'true')
    await userEvent.click(canvas.getByRole('treeitem', { name: 'Documents' }))
    await waitFor(() =>
      expect(canvas.getByTestId('summary')).toHaveTextContent(
        'Selected: documents, resume, taxes, taxes-2025, taxes-2026',
      ),
    )
    await userEvent.click(canvas.getByRole('treeitem', { name: 'Resume.pdf' }))
    await waitFor(() =>
      expect(canvas.getByRole('treeitem', { name: 'Documents' })).toHaveAttribute(
        'aria-checked',
        'mixed',
      ),
    )
    expect(canvas.getByRole('treeitem', { name: 'Taxes' })).toHaveAttribute('aria-checked', 'true')
  },
}

/** A node with `href` is a link; `current` marks the page being viewed. */
export const Navigation: Story = {
  render: () => ({
    components: { VTreeView },
    setup() {
      const pages = computed<TreeItem[]>(() => [
        {
          value: 'getting-started',
          label: t.value.gettingStarted,
          children: [
            { value: 'installation', label: t.value.installation, href: '#installation' },
            { value: 'theming', label: t.value.theming, href: '#theming' },
          ],
        },
        {
          value: 'components',
          label: t.value.components,
          children: [
            { value: 'button', label: t.value.button, href: '#button' },
            { value: 'tree-view', label: t.value.treeView, href: '#tree-view', current: true },
          ],
        },
        { value: 'changelog', label: t.value.changelog, href: '#changelog' },
      ])
      return { pages, t, expanded: ref(['components']) }
    },
    template: `
      <div style="max-width: 280px">
        <VTreeView v-model:expanded="expanded" :items="pages" :label="t.site" size="sm" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const current = canvas.getByRole('treeitem', { name: 'Tree view' })
    expect(current.tagName).toBe('A')
    expect(current).toHaveAttribute('aria-current', 'page')
    expect(current).toHaveAttribute('tabindex', '0')
    await userEvent.click(canvas.getByRole('treeitem', { name: 'Getting started' }))
    await waitFor(() => expect(canvas.getAllByRole('treeitem')).toHaveLength(7))
  },
}

/**
 * `loadChildren` fetches the children of a `lazy` node on its first expansion. Here the offline
 * region fails once: the node closes again, and the next expansion retries.
 */
export const LazyLoading: Story = {
  render: () => ({
    components: { VTreeView },
    setup() {
      let failures = 0
      const servers = computed<TreeItem[]>(() => [
        { value: 'production', label: t.value.production, icon: 'dns', lazy: true },
        { value: 'staging', label: t.value.staging, icon: 'dns', lazy: true },
        { value: 'offline', label: t.value.offline, icon: 'dns', lazy: true },
      ])
      const loadChildren = (item: TreeItem) =>
        new Promise<TreeItem[]>((resolve, reject) =>
          setTimeout(() => {
            if (item.value === 'offline' && failures++ === 0) reject(new Error('offline'))
            else
              resolve(
                [1, 2, 3].map((index) => ({
                  value: `${item.value}-${index}`,
                  label: t.value.node(item.label, index),
                  icon: 'memory',
                  lazy: index === 1,
                })),
              )
          }, 600),
        )
      return { servers, loadChildren, t }
    },
    template: `
      <div style="max-width: 360px">
        <VTreeView :items="servers" :load-children="loadChildren" :label="t.servers" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const production = canvas.getByRole('treeitem', { name: 'Production' })
    await userEvent.click(production)
    await waitFor(() => expect(production).toHaveAttribute('aria-busy', 'true'))
    await waitFor(() => expect(canvas.getAllByRole('treeitem')).toHaveLength(6), {
      timeout: 3000,
    })

    const offline = canvas.getByRole('treeitem', { name: 'Offline region' })
    await userEvent.click(offline)
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent(/Could not load/), {
      timeout: 3000,
    })
    expect(offline).toHaveAttribute('aria-expanded', 'false')
  },
}

/** The `#icon` slot shows an open folder when a branch is expanded; `#end` adds a count. */
export const CustomContent: Story = {
  render: () => ({
    components: { VTreeView },
    setup() {
      const count = (item: TreeItem): number =>
        (item.children ?? []).reduce((sum, child) => sum + (child.children ? count(child) : 1), 0)
      return { files, count, t, expanded: ref(['documents', 'taxes']) }
    },
    template: `
      <div style="max-width: 360px">
        <VTreeView v-model:expanded="expanded" :items="files" :label="t.files">
          <template #icon="{ item, expanded: open }">
            <span class="material-symbols-rounded" aria-hidden="true" style="font-size: 20px; color: var(--vectis-color-text-muted)">
              {{ item.children ? (open ? 'folder_open' : 'folder') : item.icon }}
            </span>
          </template>
          <template #end="{ item }">
            <span v-if="item.children?.length">{{ count(item) }}</span>
          </template>
        </VTreeView>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const documents = within(canvasElement).getByRole('treeitem', { name: /^Documents/ })
    expect(documents.querySelector('.v-tree-end')).toHaveTextContent('3')
  },
}

/** `size` sets the height of the rows: 32 or 40 pixels. */
export const Sizes: Story = {
  render: () => ({
    components: { VTreeView },
    setup: () => ({ files, t, expanded: ref(['documents']) }),
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 32px">
        <div style="flex: 1 1 240px; max-width: 320px">
          <VTreeView v-model:expanded="expanded" :items="files" :label="t.files + ' sm'" size="sm" />
        </div>
        <div style="flex: 1 1 240px; max-width: 320px">
          <VTreeView v-model:expanded="expanded" :items="files" :label="t.files + ' md'" />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const [sm, md] = within(canvasElement).getAllByRole('tree')
    const height = (tree: HTMLElement) =>
      tree.querySelector('[role="treeitem"]')!.getBoundingClientRect().height
    expect(height(sm!)).toBe(32)
    expect(height(md!)).toBe(40)
  },
}
