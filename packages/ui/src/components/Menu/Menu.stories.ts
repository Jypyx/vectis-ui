import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import Button from '../Button/Button.vue'
import Menu from './Menu.vue'
import MenuGroup from './MenuGroup.vue'
import MenuItem from './MenuItem.vue'
import MenuSeparator from './MenuSeparator.vue'

const meta = {
  title: 'Composants/Menu',
  component: Menu,
  argTypes: {
    placement: {
      control: 'select',
      options: ['bottom-start', 'bottom-end', 'bottom', 'top-start', 'top-end', 'top'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    compact: { control: 'boolean' },
  },
  args: { placement: 'bottom-start', size: 'sm', compact: false },
} satisfies Meta<typeof Menu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { Menu, MenuItem, MenuSeparator, Button },
    setup: () => ({ args, onSelect: fn() }),
    template: `
      <Menu v-bind="args">
        <template #trigger="{ triggerProps }">
          <Button variant="outline" tone="neutral" v-bind="triggerProps">Actions</Button>
        </template>
        <MenuItem label="Renommer" icon-start="edit" @select="onSelect" />
        <MenuItem label="Dupliquer" icon-start="content_copy" @select="onSelect" />
        <MenuItem label="Archiver (indisponible)" icon-start="archive" disabled />
        <MenuSeparator />
        <MenuItem label="Supprimer" icon-start="delete" danger @select="onSelect" />
      </Menu>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const menu = canvasElement.querySelector('[role="menu"]') as HTMLElement
    const trigger = canvas.getByRole('button', { name: 'Actions' })

    // fermé, le panneau est hors layout (display none) : il ne doit jamais
    // intercepter les clics du contenu qu'il recouvrirait (garde-fou floating.css)
    await expect(getComputedStyle(menu).display).toBe('none')

    // ouverture déclarative (popovertarget) + focus automatique du 1er item
    await userEvent.click(trigger)
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(true))
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: 'Renommer' })).toHaveFocus())

    // roving focus : flèches avec bouclage, les items désactivés sont sautés
    await userEvent.keyboard('{ArrowDown}')
    await expect(canvas.getByRole('menuitem', { name: 'Dupliquer' })).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(canvas.getByRole('menuitem', { name: 'Supprimer' })).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(canvas.getByRole('menuitem', { name: 'Renommer' })).toHaveFocus()

    // la sélection ferme le menu et rend le focus au déclencheur
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(false))
    await waitFor(() => expect(trigger).toHaveFocus())
  },
}

export const SousLabels: Story = {
  render: () => ({
    components: { Menu, MenuItem, Button },
    template: `
      <Menu>
        <template #trigger="{ triggerProps }">
          <Button variant="outline" tone="neutral" v-bind="triggerProps">Exporter</Button>
        </template>
        <MenuItem label="PDF" sublabel="Mise en page fidèle, non éditable" icon-start="picture_as_pdf" />
        <MenuItem label="CSV" sublabel="Données brutes, séparateur virgule" icon-start="csv" />
        <MenuItem label="PNG" sublabel="Image de la vue courante" icon-start="image" />
      </Menu>
    `,
  }),
}

export const Selection: Story = {
  render: () => ({
    components: { Menu, MenuItem, Button },
    template: `
      <Menu>
        <template #trigger="{ triggerProps }">
          <Button variant="outline" tone="neutral" v-bind="triggerProps">Trier par</Button>
        </template>
        <MenuItem label="Nom" selected icon-end="check" />
        <MenuItem label="Date de modification" />
        <MenuItem label="Taille" />
      </Menu>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const menu = canvasElement.querySelector('[role="menu"]') as HTMLElement

    await userEvent.click(canvas.getByRole('button', { name: 'Trier par' }))
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(true))

    // l'item sélectionné est signalé aux technologies d'assistance
    const selected = canvas.getByRole('menuitem', { name: 'Nom' })
    await expect(selected).toHaveAttribute('aria-current', 'true')
  },
}

export const Groupes: Story = {
  render: () => ({
    components: { Menu, MenuItem, MenuGroup, MenuSeparator, Button },
    template: `
      <Menu>
        <template #trigger="{ triggerProps }">
          <Button variant="outline" tone="neutral" v-bind="triggerProps">Document</Button>
        </template>
        <MenuGroup label="Fichier">
          <MenuItem label="Renommer" icon-start="edit" />
          <MenuItem label="Dupliquer" icon-start="content_copy" />
        </MenuGroup>
        <MenuSeparator />
        <MenuGroup label="Partage">
          <MenuItem label="Inviter" icon-start="person_add" />
          <MenuItem label="Copier le lien" icon-start="link" />
        </MenuGroup>
        <MenuSeparator />
        <MenuItem label="Supprimer" icon-start="delete" danger />
      </Menu>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const menu = canvasElement.querySelector('[role="menu"]') as HTMLElement

    await userEvent.click(canvas.getByRole('button', { name: 'Document' }))
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(true))

    // groupes nommés + roving focus qui les traverse (les libellés sont sautés).
    // waitFor : le panneau vient de s'ouvrir, la transition d'entrée part
    // d'opacity 0 (@starting-style) et toBeVisible l'évalue.
    await waitFor(() => expect(canvas.getByRole('group', { name: 'Fichier' })).toBeVisible())

    // l'en-tête de section tient la hauteur d'une rangée : le rythme vertical
    // de la liste ne casse pas (hauteurs non mesurables en jsdom). Tolérance :
    // le panneau porte une transition `transform`, les rects mesurés en fin
    // d'animation diffèrent au 100 000e de pixel.
    const libelle = menu.querySelector('.ds-menu-group-label') as HTMLElement
    await expect(libelle.getBoundingClientRect().height).toBeCloseTo(
      canvas.getByRole('menuitem', { name: 'Renommer' }).getBoundingClientRect().height,
      1,
    )

    await waitFor(() => expect(canvas.getByRole('menuitem', { name: 'Renommer' })).toHaveFocus())
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    await expect(canvas.getByRole('menuitem', { name: 'Inviter' })).toHaveFocus()
  },
}

/**
 * sm 32px (défaut) / md 40px / lg 48px — hauteur minimale des items et padding
 * inline ; `compact` retire 4px, combinable avec les trois.
 */
export const Tailles: Story = {
  render: () => ({
    components: { Menu, MenuItem, MenuSeparator, Button },
    template: `
      <div style="display: flex; gap: 8px">
        <Menu v-for="variant in [
          { label: 'sm', props: {} },
          { label: 'md', props: { size: 'md' } },
          { label: 'lg', props: { size: 'lg' } },
          { label: 'sm compact', props: { compact: true } },
          { label: 'md compact', props: { size: 'md', compact: true } },
          { label: 'lg compact', props: { size: 'lg', compact: true } },
        ]" :key="variant.label" v-bind="variant.props">
          <template #trigger="{ triggerProps }">
            <Button size="sm" variant="outline" tone="neutral" v-bind="triggerProps">{{ variant.label }}</Button>
          </template>
          <MenuItem label="Renommer" icon-start="edit" />
          <MenuItem label="Dupliquer" icon-start="content_copy" />
          <MenuSeparator />
          <MenuItem label="Supprimer" icon-start="delete" danger />
        </Menu>
      </div>
    `,
  }),
}

/** Largeur explicite du panneau racine : `max-content` (épouse l'item le plus
    large) ou toute longueur CSS. `match-trigger` pose comme plancher la largeur
    du déclencheur. Les sous-menus ne sont pas affectés. */
export const Largeur: Story = {
  render: (args) => ({
    components: { Menu, MenuItem, Button },
    setup: () => ({ args, onSelect: fn() }),
    template: `
      <div style="display: flex; gap: var(--ds-space-8)">
        <Menu v-bind="args" width="max-content">
          <template #trigger="{ triggerProps }">
            <Button variant="outline" tone="neutral" v-bind="triggerProps">10</Button>
          </template>
          <MenuItem label="10" selected @select="onSelect" />
          <MenuItem label="25" @select="onSelect" />
          <MenuItem label="50" @select="onSelect" />
        </Menu>
        <Menu v-bind="args" width="16rem">
          <template #trigger="{ triggerProps }">
            <Button variant="outline" tone="neutral" v-bind="triggerProps">Actions (16rem)</Button>
          </template>
          <MenuItem label="Renommer" icon-start="edit" @select="onSelect" />
          <MenuItem label="Dupliquer" icon-start="content_copy" @select="onSelect" />
        </Menu>
        <Menu v-bind="args" match-trigger>
          <template #trigger="{ triggerProps }">
            <Button variant="outline" tone="neutral" v-bind="triggerProps">
              Trier par ordre alphabétique
            </Button>
          </template>
          <MenuItem label="A → Z" selected @select="onSelect" />
          <MenuItem label="Z → A" @select="onSelect" />
        </Menu>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: 'Trier par ordre alphabétique' })
    // le panneau est celui que le déclencheur invoque (popovertarget)
    const panel = document.getElementById(
      trigger.getAttribute('popovertarget') ?? '',
    ) as HTMLElement

    await userEvent.click(trigger)
    await waitFor(() => expect(panel.matches(':popover-open')).toBe(true))

    // Les items (« A → Z ») sont bien plus étroits que le déclencheur : sans le
    // plancher `anchor-size(width)`, le panneau se réduirait à leur largeur.
    // C'est aussi la seule preuve que anchor-size() résout sur l'ancre
    // IMPLICITE du popover (invocateur popovertarget), jamais nommée ici.
    const triggerWidth = trigger.getBoundingClientRect().width
    await waitFor(() =>
      expect(panel.getBoundingClientRect().width).toBeGreaterThanOrEqual(triggerWidth - 1),
    )

    await userEvent.keyboard('{Escape}')
  },
}

export const FermetureEscape: Story = {
  render: () => ({
    components: { Menu, MenuItem, Button },
    template: `
      <Menu>
        <template #trigger="{ triggerProps }">
          <Button variant="outline" tone="neutral" v-bind="triggerProps">Menu</Button>
        </template>
        <MenuItem label="Premier" />
        <MenuItem label="Second" />
      </Menu>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const menu = canvasElement.querySelector('[role="menu"]') as HTMLElement

    await userEvent.click(canvas.getByRole('button', { name: 'Menu' }))
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(true))

    // Échap ferme le niveau courant — ici le panneau racine, donc le menu
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(false))
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Menu' })).toHaveFocus())
  },
}

export const ItemsDeNavigation: Story = {
  render: () => ({
    components: { Menu, MenuItem, Button },
    template: `
      <Menu>
        <template #trigger="{ triggerProps }">
          <Button variant="outline" tone="neutral" v-bind="triggerProps">Aller à</Button>
        </template>
        <MenuItem href="#profil" label="Profil" icon-start="person" />
        <MenuItem href="#facturation" label="Facturation" icon-start="credit_card" />
        <MenuItem href="#archives" label="Archives (indisponible)" icon-start="archive" disabled />
      </Menu>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const menu = canvasElement.querySelector('[role="menu"]') as HTMLElement

    await userEvent.click(canvas.getByRole('button', { name: 'Aller à' }))
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(true))

    // les items href sont de vrais liens ; le lien désactivé est inerte
    const profil = canvas.getByRole('menuitem', { name: 'Profil' })
    await expect(profil).toHaveAttribute('href', '#profil')
    await expect(profil.tagName).toBe('A')
    const archives = canvas.getByRole('menuitem', { name: 'Archives (indisponible)' })
    await expect(archives).not.toHaveAttribute('href')
    await expect(archives).toHaveAttribute('aria-disabled', 'true')

    // le roving focus saute le lien inerte
    await waitFor(() => expect(profil).toHaveFocus())
    await userEvent.keyboard('{ArrowDown}')
    await expect(canvas.getByRole('menuitem', { name: 'Facturation' })).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(profil).toHaveFocus()

    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(false))
  },
}

export const SousMenus: Story = {
  render: () => ({
    components: { Menu, MenuItem, MenuSeparator, Button },
    setup: () => ({ onSelect: fn() }),
    template: `
      <Menu>
        <template #trigger="{ triggerProps }">
          <Button variant="outline" tone="neutral" v-bind="triggerProps">Fichier</Button>
        </template>
        <MenuItem label="Nouveau" icon-start="note_add" />
        <MenuItem label="Exporter" icon-start="download">
          <template #submenu>
            <MenuItem label="PDF" sublabel="Mise en page fidèle" />
            <MenuItem label="Image">
              <template #submenu>
                <MenuItem label="PNG" @select="onSelect" />
                <MenuItem label="JPEG" />
              </template>
            </MenuItem>
          </template>
        </MenuItem>
        <MenuItem label="Partager" icon-start="share">
          <template #submenu>
            <MenuItem label="Inviter" icon-start="person_add" />
            <MenuItem label="Copier le lien" icon-start="link" />
          </template>
        </MenuItem>
        <MenuSeparator />
        <MenuItem label="Supprimer" icon-start="delete" danger />
      </Menu>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: 'Fichier' })
    const root = canvasElement.querySelector('[role="menu"]') as HTMLElement

    await userEvent.click(trigger)
    await waitFor(() => expect(root.matches(':popover-open')).toBe(true))
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: 'Nouveau' })).toHaveFocus())

    // Flèche droite : ouvre le sous-menu et focus son premier item ; l'item
    // parent garde sa surbrillance (aria-expanded pilote le fond)
    await userEvent.keyboard('{ArrowDown}')
    const exporter = canvas.getByRole('menuitem', { name: 'Exporter' })
    await expect(exporter).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: /PDF/ })).toHaveFocus())
    await expect(exporter).toHaveAttribute('aria-expanded', 'true')

    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: 'PNG' })).toHaveFocus())

    // Flèche gauche : remonte d'un niveau seulement
    await userEvent.keyboard('{ArrowLeft}')
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: 'Image' })).toHaveFocus())
    await expect(exporter).toHaveAttribute('aria-expanded', 'true')

    // Échap : ferme le niveau courant seulement, focus sur l'item parent
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(exporter).toHaveAttribute('aria-expanded', 'false'))
    await expect(root.matches(':popover-open')).toBe(true)
    await waitFor(() => expect(exporter).toHaveFocus())

    // Échap sur le panneau racine : ferme le menu, focus au déclencheur
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(root.matches(':popover-open')).toBe(false))
    await waitFor(() => expect(trigger).toHaveFocus())
  },
}

export const SousMenusSurvol: Story = {
  render: () => ({
    components: { Menu, MenuItem, Button },
    template: `
      <Menu>
        <template #trigger="{ triggerProps }">
          <Button variant="outline" tone="neutral" v-bind="triggerProps">Fichier</Button>
        </template>
        <MenuItem label="Nouveau" icon-start="note_add" />
        <MenuItem label="Exporter" icon-start="download">
          <template #submenu>
            <MenuItem label="PDF" />
            <MenuItem label="CSV" />
          </template>
        </MenuItem>
        <MenuItem label="Partager" icon-start="share">
          <template #submenu>
            <MenuItem label="Inviter" />
          </template>
        </MenuItem>
      </Menu>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Fichier' }))
    const root = canvasElement.querySelector('[role="menu"]') as HTMLElement
    await waitFor(() => expect(root.matches(':popover-open')).toBe(true))

    // survol : l'item survolé prend le focus (une seule surbrillance),
    // puis le sous-menu s'ouvre après le délai d'intention
    const exporter = canvas.getByRole('menuitem', { name: 'Exporter' })
    await userEvent.hover(exporter)
    await expect(exporter).toHaveFocus()
    await waitFor(() => expect(exporter).toHaveAttribute('aria-expanded', 'true'))
    // waitFor : transition d'entrée du sous-panneau (opacity 0 au premier instant)
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: 'PDF' })).toBeVisible())

    // bascule de branche : survoler un autre item à sous-menu ferme la première.
    // unhover explicite : l'API directe de userEvent ne trace pas le pointeur
    // entre deux hover(), le pointerleave du précédent ne serait jamais émis
    // (un vrai pointeur le fait en quittant l'item).
    const partager = canvas.getByRole('menuitem', { name: 'Partager' })
    await userEvent.unhover(exporter)
    await userEvent.hover(partager)
    await waitFor(() => expect(partager).toHaveAttribute('aria-expanded', 'true'))
    await waitFor(() => expect(exporter).toHaveAttribute('aria-expanded', 'false'))

    // survoler un item simple referme la branche voisine (fermeture au
    // pointerleave après le délai d'intention)
    await userEvent.unhover(partager)
    await userEvent.hover(canvas.getByRole('menuitem', { name: 'Nouveau' }))
    await waitFor(() => expect(partager).toHaveAttribute('aria-expanded', 'false'))
  },
}

export const LibellesLongs: Story = {
  render: () => ({
    components: { Menu, MenuItem, Button },
    template: `
      <Menu placement="bottom-end">
        <template #trigger="{ triggerProps }">
          <Button variant="outline" tone="neutral" v-bind="triggerProps">Options</Button>
        </template>
        <MenuItem label="Exporter la sélection au format CSV avec les en-têtes" />
        <MenuItem
          label="Un libellé anormalement long qui doit être borné par la largeur maximale du menu"
          sublabel="Un sous-libellé tout aussi verbeux qui passe sur plusieurs lignes sans déborder"
        />
      </Menu>
    `,
  }),
}
