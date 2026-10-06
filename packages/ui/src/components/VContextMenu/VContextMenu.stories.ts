import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VMenuItem from '../VMenu/VMenuItem.vue'
import VMenuSeparator from '../VMenu/VMenuSeparator.vue'
import VContextMenu from './VContextMenu.vue'

const t = storyText({
  en: {
    hint: 'Right-click a file, or focus it and press Shift+F10.',
    files: 'Files',
    rename: 'Rename',
    duplicate: 'Duplicate',
    share: 'Share',
    copyLink: 'Copy link',
    invite: 'Invite people',
    delete: 'Delete',
    lastCommand: 'Last command',
    none: 'none',
    corner: 'Right-click near the edges: the menu flips to stay on screen.',
  },
  fr: {
    hint: 'Clic droit sur un fichier, ou focus puis Maj+F10.',
    files: 'Fichiers',
    rename: 'Renommer',
    duplicate: 'Dupliquer',
    share: 'Partager',
    copyLink: 'Copier le lien',
    invite: 'Inviter des personnes',
    delete: 'Supprimer',
    lastCommand: 'Dernière commande',
    none: 'aucune',
    corner: 'Clic droit près des bords : le menu se retourne pour rester à l’écran.',
  },
})

const FILES = ['report.pdf', 'budget.xlsx', 'notes.txt']

/** The file the menu was opened on, read from the row around the target. */
function fileOf(target: Element | null): string {
  return target?.closest<HTMLElement>('[data-file]')?.dataset.file ?? '?'
}

/** A list of files sharing one context menu, with the given items. */
const fileList = (menu: string) => `
  <p style="margin: 0 0 8px">{{ t.hint }}</p>
  <VContextMenu v-bind="args" as="ul" :aria-label="t.files" style="display: grid; gap: 4px; max-inline-size: 20rem; margin: 0; padding: 8px; border: 1px dashed var(--vectis-color-border); border-radius: 8px; list-style: none">
    <li v-for="file in files" :key="file" :data-file="file">
      <button type="button" style="inline-size: 100%; padding: 6px 8px; border: none; border-radius: 4px; background: var(--vectis-color-surface-muted); color: var(--vectis-color-text); font: inherit; text-align: start">{{ file }}</button>
    </li>
    <template #menu="{ target }">
      ${menu}
    </template>
  </VContextMenu>
  <p style="margin: 8px 0 0">{{ t.lastCommand }}: <output data-testid="last">{{ last || t.none }}</output></p>
`

const FLAT_MENU = `
  <VMenuItem :label="t.rename" icon-start="edit" @select="last = t.rename + ' ' + fileOf(target)" />
  <VMenuItem :label="t.duplicate" icon-start="content_copy" @select="last = t.duplicate + ' ' + fileOf(target)" />
  <VMenuSeparator />
  <VMenuItem :label="t.delete" icon-start="delete" tone="danger" @select="last = t.delete + ' ' + fileOf(target)" />
`

const meta = {
  title: 'Components/ContextMenu',
  component: VContextMenu,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    compact: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: { size: 'sm', compact: false, disabled: false },
} satisfies Meta<typeof VContextMenu>

export default meta
type Story = StoryObj<typeof meta>

/** Finds the panel, rendered next to the zone rather than inside it. */
function panelOf(canvasElement: HTMLElement): HTMLElement {
  return canvasElement.querySelector('.v-context-menu-panel') as HTMLElement
}

export const Default: Story = {
  render: (args) => ({
    components: { VContextMenu, VMenuItem, VMenuSeparator },
    setup: () => ({ args, t, files: FILES, last: ref(''), fileOf }),
    template: fileList(FLAT_MENU),
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const panel = panelOf(canvasElement)
    const file = canvas.getByRole('button', { name: 'budget.xlsx' })

    await expect(getComputedStyle(panel).display).toBe('none')

    // user-event fires `contextmenu` on the press, as macOS and Linux do: the opening waits for
    // the release.
    await userEvent.pointer({
      keys: '[MouseRight]',
      target: file,
      coords: { clientX: 60, clientY: 90 },
    })
    await waitFor(() => expect(panel.matches(':popover-open')).toBe(true))

    // The panel's corner sits on the pointer.
    await waitFor(() => {
      const rect = panel.getBoundingClientRect()
      expect(rect.left).toBeCloseTo(60, 0)
      expect(rect.top).toBeCloseTo(90, 0)
    })

    // A pointer opening singles out no command; the arrows then enter the list.
    await expect(panel).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(canvas.getByRole('menuitem', { name: 'Rename' })).toHaveFocus()
    await userEvent.keyboard('{Enter}')

    await waitFor(() => expect(panel.matches(':popover-open')).toBe(false))
    await expect(canvas.getByTestId('last')).toHaveTextContent('Rename budget.xlsx')
  },
}

export const Keyboard: Story = {
  render: (args) => ({
    components: { VContextMenu, VMenuItem, VMenuSeparator },
    setup: () => ({ args, t, files: FILES, last: ref(''), fileOf }),
    template: fileList(FLAT_MENU),
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const panel = panelOf(canvasElement)
    const file = canvas.getByRole('button', { name: 'notes.txt' })

    file.focus()
    await userEvent.keyboard('{Shift>}{F10}{/Shift}')
    await waitFor(() => expect(panel.matches(':popover-open')).toBe(true))
    await expect(canvas.getByRole('menuitem', { name: 'Rename' })).toHaveFocus()

    // Opened from the keyboard, the menu sits under the focused element's start edge.
    await waitFor(() => {
      const rect = panel.getBoundingClientRect()
      const fileRect = file.getBoundingClientRect()
      expect(rect.left).toBeCloseTo(fileRect.left, 0)
      expect(rect.top).toBeCloseTo(fileRect.bottom, 0)
    })

    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(panel.matches(':popover-open')).toBe(false))
    await expect(file).toHaveFocus()

    await userEvent.keyboard('{Shift>}{F10}{/Shift}')
    await waitFor(() => expect(panel.matches(':popover-open')).toBe(true))
    await userEvent.keyboard('{ArrowUp}{Enter}')
    await expect(canvas.getByTestId('last')).toHaveTextContent('Delete notes.txt')
    await expect(file).toHaveFocus()
  },
}

export const Submenus: Story = {
  render: (args) => ({
    components: { VContextMenu, VMenuItem, VMenuSeparator },
    setup: () => ({ args, t, files: FILES, last: ref(''), fileOf }),
    template: fileList(
      `
        <VMenuItem :label="t.rename" icon-start="edit" @select="last = t.rename + ' ' + fileOf(target)" />
        <VMenuItem :label="t.share" icon-start="share">
          <template #submenu>
            <VMenuItem :label="t.copyLink" icon-start="link" @select="last = t.copyLink + ' ' + fileOf(target)" />
            <VMenuItem :label="t.invite" icon-start="person_add" @select="last = t.invite + ' ' + fileOf(target)" />
          </template>
        </VMenuItem>
        <VMenuSeparator />
        <VMenuItem :label="t.delete" icon-start="delete" tone="danger" @select="last = t.delete + ' ' + fileOf(target)" />
      `,
    ),
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const panel = panelOf(canvasElement)

    canvas.getByRole('button', { name: 'report.pdf' }).focus()
    await userEvent.keyboard('{Shift>}{F10}{/Shift}')
    await waitFor(() => expect(panel.matches(':popover-open')).toBe(true))
    await userEvent.keyboard('{ArrowDown}{ArrowRight}')
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: 'Copy link' })).toHaveFocus())

    // Left open for the accessibility check, the submenu included.
  },
}

/** A zone filling the viewport: near its edges the panel flips to stay on screen. */
export const NearTheEdges: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => ({
    components: { VContextMenu, VMenuItem, VMenuSeparator },
    setup: () => ({ args, t, last: ref(''), fileOf }),
    template: `
      <VContextMenu v-bind="args" data-file="canvas" style="box-sizing: border-box; block-size: 100dvb; padding: 16px">
        <p style="margin: 0">{{ t.corner }}</p>
        <template #menu="{ target }">
          ${FLAT_MENU}
        </template>
      </VContextMenu>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const panel = panelOf(canvasElement)
    const x = window.innerWidth - 10
    const y = window.innerHeight - 10

    await userEvent.pointer({
      keys: '[MouseRight]',
      target: canvas.getByText(/Right-click near the edges/),
      coords: { clientX: x, clientY: y },
    })
    await waitFor(() => expect(panel.matches(':popover-open')).toBe(true))

    // Flipped both ways, the panel now ends at the pointer.
    await waitFor(() => {
      const rect = panel.getBoundingClientRect()
      expect(rect.right).toBeCloseTo(x, 0)
      expect(rect.bottom).toBeCloseTo(y, 0)
    })
  },
}
