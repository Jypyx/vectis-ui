import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { storyText } from '../../stories/storyText'
import VButton from '../VButton/VButton.vue'
import VMenu from './VMenu.vue'
import VMenuGroup from './VMenuGroup.vue'
import VMenuItem from './VMenuItem.vue'
import VMenuSeparator from './VMenuSeparator.vue'

const t = storyText({
  en: {
    actions: 'Actions',
    rename: 'Rename',
    duplicate: 'Duplicate',
    archiveUnavailable: 'Archive (unavailable)',
    delete: 'Delete',
    export: 'Export',
    pdfSublabel: 'Faithful layout, not editable',
    csvSublabel: 'Raw data, comma separated',
    pngSublabel: 'Image of the current view',
    sortBy: 'Sort by',
    name: 'Name',
    modifiedDate: 'Date modified',
    size: 'Size',
    document: 'Document',
    file: 'File',
    sharing: 'Sharing',
    invite: 'Invite',
    copyLink: 'Copy link',
    sortAlphabetically: 'Sort alphabetically',
    menu: 'Menu',
    first: 'First',
    second: 'Second',
    goTo: 'Go to',
    profile: 'Profile',
    billing: 'Billing',
    archivesUnavailable: 'Archives (unavailable)',
    new: 'New',
    faithfulLayout: 'Faithful layout',
    image: 'Image',
    share: 'Share',
    options: 'Options',
    exportSelectionCsv: 'Export the selection as CSV with the headers',
    longLabel: 'An abnormally long label that must be bounded by the menu maximum width',
    longSublabel: 'An equally verbose sublabel that wraps over several lines without overflowing',
  },
  fr: {
    actions: 'Actions',
    rename: 'Renommer',
    duplicate: 'Dupliquer',
    archiveUnavailable: 'Archiver (indisponible)',
    delete: 'Supprimer',
    export: 'Exporter',
    pdfSublabel: 'Mise en page fidèle, non éditable',
    csvSublabel: 'Données brutes, séparateur virgule',
    pngSublabel: 'Image de la vue courante',
    sortBy: 'Trier par',
    name: 'Nom',
    modifiedDate: 'Date de modification',
    size: 'Taille',
    document: 'Document',
    file: 'Fichier',
    sharing: 'Partage',
    invite: 'Inviter',
    copyLink: 'Copier le lien',
    sortAlphabetically: 'Trier par ordre alphabétique',
    menu: 'Menu',
    first: 'Premier',
    second: 'Second',
    goTo: 'Aller à',
    profile: 'Profil',
    billing: 'Facturation',
    archivesUnavailable: 'Archives (indisponible)',
    new: 'Nouveau',
    faithfulLayout: 'Mise en page fidèle',
    image: 'Image',
    share: 'Partager',
    options: 'Options',
    exportSelectionCsv: 'Exporter la sélection au format CSV avec les en-têtes',
    longLabel: 'Un libellé anormalement long qui doit être borné par la largeur maximale du menu',
    longSublabel: 'Un sous-libellé tout aussi verbeux qui passe sur plusieurs lignes sans déborder',
  },
})

const meta = {
  title: 'Components/Menu',
  component: VMenu,
  argTypes: {
    placement: {
      control: 'select',
      options: ['bottom-start', 'bottom-end', 'bottom', 'top-start', 'top-end', 'top'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    compact: { control: 'boolean' },
  },
  args: { placement: 'bottom-start', size: 'sm', compact: false },
} satisfies Meta<typeof VMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { VMenu, VMenuItem, VMenuSeparator, VButton },
    setup: () => ({ args, t, onSelect: fn() }),
    template: `
      <VMenu v-bind="args">
        <template #trigger="{ triggerProps }">
          <VButton variant="outline" tone="neutral" v-bind="triggerProps">{{ t.actions }}</VButton>
        </template>
        <VMenuItem :label="t.rename" icon-start="edit" @select="onSelect" />
        <VMenuItem :label="t.duplicate" icon-start="content_copy" @select="onSelect" />
        <VMenuItem :label="t.archiveUnavailable" icon-start="archive" disabled />
        <VMenuSeparator />
        <VMenuItem :label="t.delete" icon-start="delete" danger @select="onSelect" />
      </VMenu>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const menu = canvasElement.querySelector('[role="menu"]') as HTMLElement
    const trigger = canvas.getByRole('button', { name: 'Actions' })

    // when closed, the panel is out of the layout (display none): it must never
    // intercept clicks on the content it would cover (the floating.css guard)
    await expect(getComputedStyle(menu).display).toBe('none')

    // declarative opening (popovertarget) + automatic focus on the first item
    await userEvent.click(trigger)
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(true))
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: 'Rename' })).toHaveFocus())

    // roving focus: arrows with wrap-around, disabled items are skipped
    await userEvent.keyboard('{ArrowDown}')
    await expect(canvas.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(canvas.getByRole('menuitem', { name: 'Delete' })).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(canvas.getByRole('menuitem', { name: 'Rename' })).toHaveFocus()

    // selecting closes the menu and hands focus back to the trigger
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(false))
    await waitFor(() => expect(trigger).toHaveFocus())
  },
}

export const Sublabels: Story = {
  render: () => ({
    components: { VMenu, VMenuItem, VButton },
    setup: () => ({ t }),
    template: `
      <VMenu>
        <template #trigger="{ triggerProps }">
          <VButton variant="outline" tone="neutral" v-bind="triggerProps">{{ t.export }}</VButton>
        </template>
        <VMenuItem label="PDF" :sublabel="t.pdfSublabel" icon-start="picture_as_pdf" />
        <VMenuItem label="CSV" :sublabel="t.csvSublabel" icon-start="csv" />
        <VMenuItem label="PNG" :sublabel="t.pngSublabel" icon-start="image" />
      </VMenu>
    `,
  }),
}

export const Selection: Story = {
  render: () => ({
    components: { VMenu, VMenuItem, VButton },
    setup: () => ({ t }),
    template: `
      <VMenu>
        <template #trigger="{ triggerProps }">
          <VButton variant="outline" tone="neutral" v-bind="triggerProps">{{ t.sortBy }}</VButton>
        </template>
        <VMenuItem :label="t.name" selected icon-end="check" />
        <VMenuItem :label="t.modifiedDate" />
        <VMenuItem :label="t.size" />
      </VMenu>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const menu = canvasElement.querySelector('[role="menu"]') as HTMLElement

    await userEvent.click(canvas.getByRole('button', { name: 'Sort by' }))
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(true))

    // the selected item is signalled to assistive technologies
    const selected = canvas.getByRole('menuitem', { name: 'Name' })
    await expect(selected).toHaveAttribute('aria-current', 'true')
  },
}

export const Groups: Story = {
  render: () => ({
    components: { VMenu, VMenuItem, VMenuGroup, VMenuSeparator, VButton },
    setup: () => ({ t }),
    template: `
      <VMenu>
        <template #trigger="{ triggerProps }">
          <VButton variant="outline" tone="neutral" v-bind="triggerProps">{{ t.document }}</VButton>
        </template>
        <VMenuGroup :label="t.file">
          <VMenuItem :label="t.rename" icon-start="edit" />
          <VMenuItem :label="t.duplicate" icon-start="content_copy" />
        </VMenuGroup>
        <VMenuSeparator />
        <VMenuGroup :label="t.sharing">
          <VMenuItem :label="t.invite" icon-start="person_add" />
          <VMenuItem :label="t.copyLink" icon-start="link" />
        </VMenuGroup>
        <VMenuSeparator />
        <VMenuItem :label="t.delete" icon-start="delete" danger />
      </VMenu>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const menu = canvasElement.querySelector('[role="menu"]') as HTMLElement

    await userEvent.click(canvas.getByRole('button', { name: 'Document' }))
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(true))

    // named groups + a roving focus that crosses them (the labels are skipped).
    // waitFor: the panel has just opened, its entry transition starts from
    // opacity 0 (@starting-style) and toBeVisible evaluates it.
    await waitFor(() => expect(canvas.getByRole('group', { name: 'File' })).toBeVisible())

    // the section header holds the height of a row: the list's vertical rhythm
    // does not break (heights are not measurable in jsdom). Tolerance: the panel
    // carries a `transform` transition, and the rects measured at the end of the
    // animation differ by a hundred-thousandth of a pixel.
    const groupLabel = menu.querySelector('.v-menu-group-label') as HTMLElement
    await expect(groupLabel.getBoundingClientRect().height).toBeCloseTo(
      canvas.getByRole('menuitem', { name: 'Rename' }).getBoundingClientRect().height,
      1,
    )

    await waitFor(() => expect(canvas.getByRole('menuitem', { name: 'Rename' })).toHaveFocus())
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    await expect(canvas.getByRole('menuitem', { name: 'Invite' })).toHaveFocus()
  },
}

/**
 * sm 32px (the default) / md 40px / lg 48px — minimum item height and inline
 * padding; `compact` removes 4px, combinable with all three.
 */
export const Sizes: Story = {
  render: () => ({
    components: { VMenu, VMenuItem, VMenuSeparator, VButton },
    setup: () => ({ t }),
    template: `
      <div style="display: flex; gap: 8px">
        <VMenu v-for="variant in [
          { label: 'sm', props: {} },
          { label: 'md', props: { size: 'md' } },
          { label: 'lg', props: { size: 'lg' } },
          { label: 'sm compact', props: { compact: true } },
          { label: 'md compact', props: { size: 'md', compact: true } },
          { label: 'lg compact', props: { size: 'lg', compact: true } },
        ]" :key="variant.label" v-bind="variant.props">
          <template #trigger="{ triggerProps }">
            <VButton size="sm" variant="outline" tone="neutral" v-bind="triggerProps">{{ variant.label }}</VButton>
          </template>
          <VMenuItem :label="t.rename" icon-start="edit" />
          <VMenuItem :label="t.duplicate" icon-start="content_copy" />
          <VMenuSeparator />
          <VMenuItem :label="t.delete" icon-start="delete" danger />
        </VMenu>
      </div>
    `,
  }),
}

/** Explicit width of the root panel: `max-content` (matching the widest item) or
    any CSS length. `match-trigger` sets the trigger's width as a floor. Submenus
    are unaffected. */
export const Width: Story = {
  render: (args) => ({
    components: { VMenu, VMenuItem, VButton },
    setup: () => ({ args, t, onSelect: fn() }),
    template: `
      <div style="display: flex; gap: var(--vectis-space-8)">
        <VMenu v-bind="args" width="max-content">
          <template #trigger="{ triggerProps }">
            <VButton variant="outline" tone="neutral" v-bind="triggerProps">10</VButton>
          </template>
          <VMenuItem label="10" selected @select="onSelect" />
          <VMenuItem label="25" @select="onSelect" />
          <VMenuItem label="50" @select="onSelect" />
        </VMenu>
        <VMenu v-bind="args" width="16rem">
          <template #trigger="{ triggerProps }">
            <VButton variant="outline" tone="neutral" v-bind="triggerProps">{{ t.actions }} (16rem)</VButton>
          </template>
          <VMenuItem :label="t.rename" icon-start="edit" @select="onSelect" />
          <VMenuItem :label="t.duplicate" icon-start="content_copy" @select="onSelect" />
        </VMenu>
        <VMenu v-bind="args" match-trigger>
          <template #trigger="{ triggerProps }">
            <VButton variant="outline" tone="neutral" v-bind="triggerProps">
              {{ t.sortAlphabetically }}
            </VButton>
          </template>
          <VMenuItem label="A → Z" selected @select="onSelect" />
          <VMenuItem label="Z → A" @select="onSelect" />
        </VMenu>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: 'Sort alphabetically' })
    // the panel is the one the trigger invokes (popovertarget)
    const panel = document.getElementById(
      trigger.getAttribute('popovertarget') ?? '',
    ) as HTMLElement

    await userEvent.click(trigger)
    await waitFor(() => expect(panel.matches(':popover-open')).toBe(true))

    // The items ("A → Z") are far narrower than the trigger: without the
    // `anchor-size(width)` floor, the panel would shrink to their width. It is also
    // the only proof that anchor-size() resolves against the popover's IMPLICIT
    // anchor (the popovertarget invoker), never named here.
    const triggerWidth = trigger.getBoundingClientRect().width
    await waitFor(() =>
      expect(panel.getBoundingClientRect().width).toBeGreaterThanOrEqual(triggerWidth - 1),
    )

    await userEvent.keyboard('{Escape}')
  },
}

export const EscapeDismiss: Story = {
  render: () => ({
    components: { VMenu, VMenuItem, VButton },
    setup: () => ({ t }),
    template: `
      <VMenu>
        <template #trigger="{ triggerProps }">
          <VButton variant="outline" tone="neutral" v-bind="triggerProps">{{ t.menu }}</VButton>
        </template>
        <VMenuItem :label="t.first" />
        <VMenuItem :label="t.second" />
      </VMenu>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const menu = canvasElement.querySelector('[role="menu"]') as HTMLElement

    await userEvent.click(canvas.getByRole('button', { name: 'Menu' }))
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(true))

    // Escape closes the current level — here the root panel, hence the menu
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(false))
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Menu' })).toHaveFocus())
  },
}

export const NavigationItems: Story = {
  render: () => ({
    components: { VMenu, VMenuItem, VButton },
    setup: () => ({ t }),
    template: `
      <VMenu>
        <template #trigger="{ triggerProps }">
          <VButton variant="outline" tone="neutral" v-bind="triggerProps">{{ t.goTo }}</VButton>
        </template>
        <VMenuItem href="#profile" :label="t.profile" icon-start="person" />
        <VMenuItem href="#billing" :label="t.billing" icon-start="credit_card" />
        <VMenuItem href="#archives" :label="t.archivesUnavailable" icon-start="archive" disabled />
      </VMenu>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const menu = canvasElement.querySelector('[role="menu"]') as HTMLElement

    await userEvent.click(canvas.getByRole('button', { name: 'Go to' }))
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(true))

    // href items are real links; the disabled link is inert
    const profile = canvas.getByRole('menuitem', { name: 'Profile' })
    await expect(profile).toHaveAttribute('href', '#profile')
    await expect(profile.tagName).toBe('A')
    const archives = canvas.getByRole('menuitem', { name: 'Archives (unavailable)' })
    await expect(archives).not.toHaveAttribute('href')
    await expect(archives).toHaveAttribute('aria-disabled', 'true')

    // the roving focus skips the inert link
    await waitFor(() => expect(profile).toHaveFocus())
    await userEvent.keyboard('{ArrowDown}')
    await expect(canvas.getByRole('menuitem', { name: 'Billing' })).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(profile).toHaveFocus()

    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(false))
  },
}

export const Submenus: Story = {
  render: () => ({
    components: { VMenu, VMenuItem, VMenuSeparator, VButton },
    setup: () => ({ t, onSelect: fn() }),
    template: `
      <VMenu>
        <template #trigger="{ triggerProps }">
          <VButton variant="outline" tone="neutral" v-bind="triggerProps">{{ t.file }}</VButton>
        </template>
        <VMenuItem :label="t.new" icon-start="note_add" />
        <VMenuItem :label="t.export" icon-start="download">
          <template #submenu>
            <VMenuItem label="PDF" :sublabel="t.faithfulLayout" />
            <VMenuItem :label="t.image">
              <template #submenu>
                <VMenuItem label="PNG" @select="onSelect" />
                <VMenuItem label="JPEG" />
              </template>
            </VMenuItem>
          </template>
        </VMenuItem>
        <VMenuItem :label="t.share" icon-start="share">
          <template #submenu>
            <VMenuItem :label="t.invite" icon-start="person_add" />
            <VMenuItem :label="t.copyLink" icon-start="link" />
          </template>
        </VMenuItem>
        <VMenuSeparator />
        <VMenuItem :label="t.delete" icon-start="delete" danger />
      </VMenu>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: 'File' })
    const root = canvasElement.querySelector('[role="menu"]') as HTMLElement

    await userEvent.click(trigger)
    await waitFor(() => expect(root.matches(':popover-open')).toBe(true))
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: 'New' })).toHaveFocus())

    // ArrowRight: opens the submenu and focuses its first item; the parent item
    // keeps its highlight (aria-expanded drives the background)
    await userEvent.keyboard('{ArrowDown}')
    const exportItem = canvas.getByRole('menuitem', { name: 'Export' })
    await expect(exportItem).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: /PDF/ })).toHaveFocus())
    await expect(exportItem).toHaveAttribute('aria-expanded', 'true')

    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: 'PNG' })).toHaveFocus())

    // ArrowLeft: goes up one level only
    await userEvent.keyboard('{ArrowLeft}')
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: 'Image' })).toHaveFocus())
    await expect(exportItem).toHaveAttribute('aria-expanded', 'true')

    // Escape: closes the current level only, focus on the parent item
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(exportItem).toHaveAttribute('aria-expanded', 'false'))
    await expect(root.matches(':popover-open')).toBe(true)
    await waitFor(() => expect(exportItem).toHaveFocus())

    // Escape on the root panel: closes the menu, focus back on the trigger
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(root.matches(':popover-open')).toBe(false))
    await waitFor(() => expect(trigger).toHaveFocus())
  },
}

export const SubmenusOnHover: Story = {
  render: () => ({
    components: { VMenu, VMenuItem, VButton },
    setup: () => ({ t }),
    template: `
      <VMenu>
        <template #trigger="{ triggerProps }">
          <VButton variant="outline" tone="neutral" v-bind="triggerProps">{{ t.file }}</VButton>
        </template>
        <VMenuItem :label="t.new" icon-start="note_add" />
        <VMenuItem :label="t.export" icon-start="download">
          <template #submenu>
            <VMenuItem label="PDF" />
            <VMenuItem label="CSV" />
          </template>
        </VMenuItem>
        <VMenuItem :label="t.share" icon-start="share">
          <template #submenu>
            <VMenuItem :label="t.invite" />
          </template>
        </VMenuItem>
      </VMenu>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'File' }))
    const root = canvasElement.querySelector('[role="menu"]') as HTMLElement
    await waitFor(() => expect(root.matches(':popover-open')).toBe(true))

    // hover: the hovered item takes the focus (a single highlight), then the
    // submenu opens after the intent delay
    const exportItem = canvas.getByRole('menuitem', { name: 'Export' })
    await userEvent.hover(exportItem)
    await expect(exportItem).toHaveFocus()
    await waitFor(() => expect(exportItem).toHaveAttribute('aria-expanded', 'true'))
    // waitFor: the subpanel's entry transition (opacity 0 at the first instant)
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: 'PDF' })).toBeVisible())

    // switching branch: hovering another item with a submenu closes the first.
    // explicit unhover: userEvent's direct API does not track the pointer between
    // two hover() calls, so the previous item's pointerleave would never be
    // emitted (a real pointer emits it when leaving the item).
    const shareItem = canvas.getByRole('menuitem', { name: 'Share' })
    await userEvent.unhover(exportItem)
    await userEvent.hover(shareItem)
    await waitFor(() => expect(shareItem).toHaveAttribute('aria-expanded', 'true'))
    await waitFor(() => expect(exportItem).toHaveAttribute('aria-expanded', 'false'))

    // hovering a plain item closes the neighbouring branch (closing on
    // pointerleave after the intent delay)
    await userEvent.unhover(shareItem)
    await userEvent.hover(canvas.getByRole('menuitem', { name: 'New' }))
    await waitFor(() => expect(shareItem).toHaveAttribute('aria-expanded', 'false'))
  },
}

export const LongLabels: Story = {
  render: () => ({
    components: { VMenu, VMenuItem, VButton },
    setup: () => ({ t }),
    template: `
      <VMenu placement="bottom-end">
        <template #trigger="{ triggerProps }">
          <VButton variant="outline" tone="neutral" v-bind="triggerProps">{{ t.options }}</VButton>
        </template>
        <VMenuItem :label="t.exportSelectionCsv" />
        <VMenuItem :label="t.longLabel" :sublabel="t.longSublabel" />
      </VMenu>
    `,
  }),
}
