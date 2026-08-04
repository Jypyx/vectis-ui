import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { storyText } from '../../stories/storyText'
import VBadge from '../VBadge/VBadge.vue'
import VIconButton from '../VIconButton/VIconButton.vue'
import VSideNavigation from './VSideNavigation.vue'
import VSideNavigationGroup from './VSideNavigationGroup.vue'
import VSideNavigationItem from './VSideNavigationItem.vue'
import VSideNavigationSeparator from './VSideNavigationSeparator.vue'

const components = {
  VSideNavigation,
  VSideNavigationItem,
  VSideNavigationGroup,
  VSideNavigationSeparator,
  VBadge,
  VIconButton,
}

const t = storyText({
  en: {
    home: 'Home',
    projects: 'Projects',
    settings: 'Settings',
    team: 'Team',
    billing: 'Billing',
    workspace: 'Workspace',
    level: 'Level',
    branch: 'branch',
    messages: 'Messages',
    newMessage: 'New message',
    invite: 'Invite',
    members: 'Members',
    storage: 'Storage',
    archives: 'Archives',
    openTasks: '12 open tasks',
    syncedAgo: 'Synced 2 min ago',
    dashboard: 'Dashboard',
    documentation: 'Documentation',
    preferences: 'Preferences',
    open: 'Open',
    closed: 'Closed',
    available: 'Available',
    unavailableLink: 'Unavailable link',
    unavailableBranch: 'Unavailable branch',
    neverReachable: 'Never reachable',
    longLabel: 'A label far too long for a sidebar',
    longSublabel: 'A sublabel also far too long for the bar',
    longFolder: 'A folder with an endless name that does not fit',
    longSubitem: 'And a subitem just as talkative as its parent',
  },
  fr: {
    home: 'Accueil',
    projects: 'Projets',
    settings: 'Réglages',
    team: 'Équipe',
    billing: 'Facturation',
    workspace: 'Espace de travail',
    level: 'Niveau',
    branch: 'branche',
    messages: 'Messages',
    newMessage: 'Nouveau message',
    invite: 'Inviter',
    members: 'Membres',
    storage: 'Stockage',
    archives: 'Archives',
    openTasks: '12 tâches ouvertes',
    syncedAgo: 'Synchronisé il y a 2 min',
    dashboard: 'Tableau de bord',
    documentation: 'Documentation',
    preferences: 'Préférences',
    open: 'Ouvert',
    closed: 'Fermé',
    available: 'Disponible',
    unavailableLink: 'Lien indisponible',
    unavailableBranch: 'Branche indisponible',
    neverReachable: 'Jamais atteignable',
    longLabel: 'Un libellé beaucoup trop long pour une barre latérale',
    longSublabel: 'Un sous-libellé lui aussi beaucoup trop long pour la barre',
    longFolder: 'Dossier au nom interminable qui ne tient pas',
    longSubitem: 'Et un sous-item tout aussi bavard que son parent',
  },
})

/** Frames the nav in a realistic sidebar width. */
const aside = (inner: string, attrs = 'v-bind="args"') => `
  <div style="inline-size: 17rem; padding: var(--vectis-space-2); border-inline-end: 1px solid var(--vectis-color-border);">
    <VSideNavigation ${attrs}>${inner}</VSideNavigation>
  </div>
`

const meta = {
  title: 'Components/SideNavigation',
  component: VSideNavigation,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    compact: { control: 'boolean' },
    exclusive: { control: 'boolean' },
  },
  args: { size: 'md', compact: false, exclusive: false },
} satisfies Meta<typeof VSideNavigation>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args, t }),
    template: aside(`
      <VSideNavigationItem href="#home" icon="home" active>{{ t.home }}</VSideNavigationItem>
      <VSideNavigationItem icon="folder" default-open>
        {{ t.projects }}
        <template #items>
          <VSideNavigationItem href="#alpha">Alpha</VSideNavigationItem>
          <VSideNavigationItem>
            Beta
            <template #items>
              <VSideNavigationItem href="#beta-api">API</VSideNavigationItem>
              <VSideNavigationItem href="#beta-web">Web</VSideNavigationItem>
            </template>
          </VSideNavigationItem>
        </template>
      </VSideNavigationItem>
      <VSideNavigationSeparator />
      <VSideNavigationGroup :label="t.settings">
        <VSideNavigationItem href="#team" icon="group">{{ t.team }}</VSideNavigationItem>
        <VSideNavigationItem href="#billing" icon="payments">{{ t.billing }}</VSideNavigationItem>
      </VSideNavigationGroup>
    `),
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const beta = canvas.getByText('Beta').closest('summary') as HTMLElement
    const branch = beta.closest('details') as HTMLDetailsElement
    const chevron = beta.querySelector('.v-side-nav-chevron') as HTMLElement

    // The indent is the room an icon takes (icon + gutter): a subitem's label lands
    // on the SAME VERTICAL as its parent's.
    const labelEdge = (name: string) => canvas.getByText(name).getBoundingClientRect().left
    await expect(labelEdge('Alpha')).toBe(labelEdge('Projects'))

    // when collapsed, the sublist is "skipped": its content is not focusable
    const hidden = branch.querySelector('a') as HTMLElement
    hidden.focus()
    await expect(hidden).not.toHaveFocus()

    // clicking the row toggles the branch, and the chevron flips
    await userEvent.click(beta)
    await waitFor(() => expect(branch.open).toBe(true))
    await waitFor(() => expect(getComputedStyle(chevron).rotate).toBe('180deg'))
    await expect(canvas.getByRole('link', { name: 'API' })).toBeVisible()

    hidden.focus()
    await expect(hidden).toHaveFocus()

    await userEvent.click(beta)
    await waitFor(() => expect(branch.open).toBe(false))
    await waitFor(() => expect(getComputedStyle(chevron).rotate).toBe('none'))
  },
}

const SIZE_ITEMS = `
  <VSideNavigationGroup :label="t.workspace">
    <VSideNavigationItem icon="folder" default-open>
      {{ t.projects }}
      <template #items>
        <VSideNavigationItem href="#alpha">Alpha</VSideNavigationItem>
      </template>
    </VSideNavigationItem>
  </VSideNavigationGroup>
`

export const Sizes: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args, t }),
    template: `
      <div style="display: flex; gap: var(--vectis-space-6);">
        ${['sm', 'md'].map((size) => aside(SIZE_ITEMS, `size="${size}"`)).join('')}
        ${aside(SIZE_ITEMS, 'size="md" compact')}
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    // LEVEL 2 rows: they prove the `--control-*` inherit all the way down without
    // ever setting `v-control` again on a sublist.
    const rows = [...canvasElement.querySelectorAll('.v-side-nav-children a')].map(
      (el) => (el.closest('.v-side-nav-row') as HTMLElement).getBoundingClientRect().height,
    )
    const [sm, md, compact] = rows
    await expect(md! - sm!).toBe(8) // 40px − 32px
    await expect(md! - compact!).toBe(4) // the DS compact delta

    // The section header holds the height of a row, at all three densities.
    const labels = [...canvasElement.querySelectorAll('.v-side-nav-group-label')].map(
      (el) => (el as HTMLElement).getBoundingClientRect().height,
    )
    await expect(labels).toEqual(rows)
  },
}

export const Depth: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args, t }),
    template: aside(`
      <VSideNavigationItem href="#n0" icon="folder">{{ t.level }} 0</VSideNavigationItem>
      <VSideNavigationItem icon="folder" default-open>
        {{ t.level }} 0 ({{ t.branch }})
        <template #items>
          <VSideNavigationItem href="#n1">{{ t.level }} 1</VSideNavigationItem>
          <VSideNavigationItem icon="folder" default-open>
            {{ t.level }} 1 ({{ t.branch }})
            <template #items>
              <VSideNavigationItem href="#n2">{{ t.level }} 2</VSideNavigationItem>
              <VSideNavigationItem icon="folder" default-open>
                {{ t.level }} 2 ({{ t.branch }})
                <template #items>
                  <VSideNavigationItem href="#n3">{{ t.level }} 3</VSideNavigationItem>
                </template>
              </VSideNavigationItem>
            </template>
          </VSideNavigationItem>
        </template>
      </VSideNavigationItem>
    `),
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const indentOf = (name: string) => {
      const row = canvas.getByRole('link', { name }).closest('.v-side-nav-row')!
      return Number.parseFloat(getComputedStyle(row).paddingInlineStart)
    }

    // The CSS counter with TWO alternating names: the self-referential form
    // (`--side-nav-level: calc(var(--side-nav-level, 0) + 1)`) is a cycle and would
    // make these four values equal, with no console error at all.
    const indents = ['Level 0', 'Level 1', 'Level 2', 'Level 3'].map(indentOf)
    for (let i = 1; i < indents.length; i++) {
      await expect(indents[i]).toBeGreaterThan(indents[i - 1]!)
    }
    await expect(indents[1]! - indents[0]!).toBe(indents[3]! - indents[2]!)

    // …and that step is the room an icon takes: at every level, a subitem's label
    // falls back on the vertical of its parent branch's label.
    const edge = (name: string) => canvas.getByText(name).getBoundingClientRect().left
    for (const level of [0, 1, 2]) {
      await expect(edge(`Level ${level + 1}`)).toBe(edge(`Level ${level} (branch)`))
    }
  },
}

export const EndContent: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args, t, onSelect: fn() }),
    template: aside(`
      <VSideNavigationItem @select="onSelect">
        {{ t.messages }}
        <template #end>
          <VIconButton :label="t.newMessage" icon="add" size="xs" data-testid="action" />
        </template>
      </VSideNavigationItem>
      <VSideNavigationItem icon="folder">
        {{ t.projects }}
        <template #end><VBadge size="xs" tone="accent" count="12" /></template>
        <template #items>
          <VSideNavigationItem href="#alpha">Alpha</VSideNavigationItem>
        </template>
      </VSideNavigationItem>
      <VSideNavigationItem icon="group">
        {{ t.team }}
        <template #end>
          <VIconButton :label="t.invite" icon="person_add" size="xs" data-testid="invite" />
        </template>
        <template #items>
          <VSideNavigationItem href="#members">{{ t.members }}</VSideNavigationItem>
        </template>
      </VSideNavigationItem>
    `),
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const row = canvas.getByText('Messages').closest('.v-side-nav-row') as HTMLElement
    const action = row.querySelector('.v-side-nav-action') as HTMLElement
    const button = canvas.getByTestId('action')

    // Leaf: the action's clickable area covers the WHOLE row — including the empty
    // gutter in front of the end slot…
    const box = row.getBoundingClientRect()
    const buttonBox = button.getBoundingClientRect()
    await expect(document.elementFromPoint(buttonBox.left - 4, box.top + box.height / 2)).toBe(
      action,
    )

    // …but the end slot is painted ABOVE it, so it stays clickable (`contains`: the
    // point lands on the icon's glyph, inside the button).
    const target = document.elementFromPoint(
      buttonBox.left + buttonBox.width / 2,
      buttonBox.top + buttonBox.height / 2,
    )
    await expect(button.contains(target)).toBe(true)

    // Branch: a click in the end slot does not toggle the <details> — neither on an
    // inert badge…
    const projects = canvas.getByText('Projects').closest('summary') as HTMLElement
    const branch = projects.closest('details') as HTMLDetailsElement
    await userEvent.click(projects.querySelector('.v-side-nav-end') as HTMLElement)
    await expect(branch.open).toBe(false)
    await userEvent.click(projects)
    await waitFor(() => expect(branch.open).toBe(true))

    // …nor on a control, which is its own activation target
    const team = canvas.getByText('Team').closest('details') as HTMLDetailsElement
    await userEvent.click(canvas.getByTestId('invite'))
    await expect(team.open).toBe(false)
  },
}

export const Exclusive: Story = {
  args: { exclusive: true },
  render: (args) => ({
    components,
    setup: () => ({ args, t }),
    template: aside(`
      <VSideNavigationItem icon="folder" default-open>
        {{ t.projects }}
        <template #items><VSideNavigationItem href="#alpha">Alpha</VSideNavigationItem></template>
      </VSideNavigationItem>
      <VSideNavigationItem icon="group">
        {{ t.team }}
        <template #items><VSideNavigationItem href="#members">{{ t.members }}</VSideNavigationItem></template>
      </VSideNavigationItem>
    `),
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const [projects, team] = [...canvasElement.querySelectorAll('details')]
    await expect(projects!.open).toBe(true)

    // NATIVE exclusivity (<details name>): opening a sibling closes the other
    await userEvent.click(canvas.getByText('Team').closest('summary') as HTMLElement)
    await waitFor(() => expect(team!.open).toBe(true))
    await expect(projects!.open).toBe(false)
  },
}

export const Sublabels: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args, t }),
    template: aside(`
      <VSideNavigationItem href="#alpha" icon="folder" :sublabel="t.openTasks">Alpha</VSideNavigationItem>
      <VSideNavigationItem icon="cloud" :sublabel="t.syncedAgo" default-open>
        {{ t.storage }}
        <template #items>
          <VSideNavigationItem href="#archives" sublabel="4.2 GB">{{ t.archives }}</VSideNavigationItem>
        </template>
      </VSideNavigationItem>
    `),
  }),
}

export const Links: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args, t, onSelect: fn() }),
    template: aside(`
      <VSideNavigationItem href="#dashboard" icon="dashboard" active>{{ t.dashboard }}</VSideNavigationItem>
      <VSideNavigationItem href="https://example.com" icon="open_in_new" target="_blank" rel="noreferrer">
        {{ t.documentation }}
      </VSideNavigationItem>
      <VSideNavigationItem icon="tune" @select="onSelect">{{ t.preferences }}</VSideNavigationItem>
    `),
  }),
}

export const CustomIcons: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args, t }),
    template: aside(
      `
      <VSideNavigationItem default-open>
        {{ t.open }}
        <template #items><VSideNavigationItem href="#a">Alpha</VSideNavigationItem></template>
      </VSideNavigationItem>
      <VSideNavigationItem>
        {{ t.closed }}
        <template #items><VSideNavigationItem href="#b">Beta</VSideNavigationItem></template>
      </VSideNavigationItem>
    `,
      'v-bind="args" expand-icon="add" collapse-icon="remove"',
    ),
  }),
}

export const DisabledItem: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args, t }),
    template: aside(`
      <VSideNavigationItem href="#active" icon="home">{{ t.available }}</VSideNavigationItem>
      <VSideNavigationItem href="#inactive" icon="lock" disabled>{{ t.unavailableLink }}</VSideNavigationItem>
      <VSideNavigationItem icon="folder" disabled>
        {{ t.unavailableBranch }}
        <template #items><VSideNavigationItem href="#x">{{ t.neverReachable }}</VSideNavigationItem></template>
      </VSideNavigationItem>
    `),
  }),
}

export const LongTexts: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args, t }),
    template: aside(`
      <VSideNavigationItem href="#long" icon="description" :sublabel="t.longSublabel">
        {{ t.longLabel }}
      </VSideNavigationItem>
      <VSideNavigationItem icon="folder" default-open>
        {{ t.longFolder }}
        <template #end><VBadge count="300" /></template>
        <template #items>
          <VSideNavigationItem href="#nested">{{ t.longSubitem }}</VSideNavigationItem>
        </template>
      </VSideNavigationItem>
    `),
  }),
}
