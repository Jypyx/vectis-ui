import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import Breadcrumb from './Breadcrumb.vue'

const meta = {
  title: 'Composants/Breadcrumb',
  component: Breadcrumb,
} satisfies Meta<typeof Breadcrumb>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    currentPath: '/projets/socle/parametres',
    items: [
      { label: 'Accueil', href: '/' },
      { label: 'Projets', href: '/projets' },
      { label: 'Socle', href: '/projets/socle' },
      { label: 'Paramètres', href: '/projets/socle/parametres' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('navigation', { name: "Fil d'Ariane" })).toBeVisible()
    // l'item actif est détecté via currentPath : lien cliquable + aria-current
    await expect(canvas.getByRole('link', { name: 'Paramètres' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(canvas.getByRole('link', { name: 'Socle' })).not.toHaveAttribute('aria-current')
  },
}

export const SeparateurIcone: Story = {
  // Une chaîne est TOUJOURS un nom d'icône ; une image se déclare en `{ src }`
  // (cf. SeparateurImage). Note RTL : une icône directionnelle ne se retourne
  // pas automatiquement — à vérifier avec le toggle de la toolbar.
  args: {
    separator: 'arrow_forward',
    currentPath: '/projets/socle',
    items: [
      { label: 'Accueil', href: '/' },
      { label: 'Projets', href: '/projets' },
      { label: 'Socle', href: '/projets/socle' },
    ],
  },
  play: async ({ canvasElement }) => {
    const separators = canvasElement.querySelectorAll('.v-breadcrumb-separator')
    await expect(separators).toHaveLength(3)
    // le premier item n'est précédé d'aucun séparateur (règle :first-child)
    await expect(separators[0]).not.toBeVisible()
    await expect(separators[1]).toBeVisible()
    await expect(separators[2]).toBeVisible()
  },
}

export const SeparateurImage: Story = {
  // Rendu explicite `{ src }` — aucune devinette sur le contenu de la chaîne.
  args: {
    separator: {
      src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800px' height='800px' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M10 3V6H4L4 10H10L10 13L11 13L16 8L11 3L10 3Z' fill='%23000000'/%3E%3Cpath d='M0 2L1.38281e-06 14H2L2 2L0 2Z' fill='%23000000'/%3E%3C/svg%3E",
    },
    currentPath: '/projets/socle',
    items: [
      { label: 'Accueil', href: '/' },
      { label: 'Projets', href: '/projets' },
      { label: 'Socle', href: '/projets/socle' },
    ],
  },
}

export const AvecIcones: Story = {
  args: {
    currentPath: '/projets/socle',
    items: [
      { label: 'Accueil', href: '/', iconStart: 'home' },
      { label: 'Projets', href: '/projets', iconStart: 'folder' },
      {
        label: 'Socle',
        href: '/projets/socle',
        iconStart: {
          src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect x='2' y='2' width='12' height='12' rx='3' fill='none' stroke='%23999' stroke-width='1.5'/%3E%3C/svg%3E",
        },
      },
    ],
  },
}

export const Tronque: Story = {
  args: {
    maxItems: 4,
    currentPath: '/a/b/c/d/e/f/g',
    items: [
      { label: 'Accueil', href: '/', iconStart: 'home' },
      { label: 'Projets', href: '/a' },
      { label: 'Design system', href: '/a/b' },
      { label: 'Socle', href: '/a/b/c' },
      { label: 'Composants', href: '/a/b/c/d' },
      { label: 'Navigation', href: '/a/b/c/d/e' },
      { label: 'Breadcrumb', href: '/a/b/c/d/e/f' },
      { label: 'Paramètres', href: '/a/b/c/d/e/f/g' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const menu = canvasElement.querySelector('[role="menu"]') as HTMLElement

    // visibles : 1er, avant-dernier, dernier (actif) + le bouton d'ellipsis
    await expect(canvas.getAllByRole('listitem')).toHaveLength(4)
    await expect(canvas.getByRole('link', { name: 'Accueil' })).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Breadcrumb' })).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Paramètres' })).toHaveAttribute(
      'aria-current',
      'page',
    )

    // fermé, le panneau du menu est hors layout : il ne recouvre pas les liens voisins
    await expect(getComputedStyle(menu).display).toBe('none')

    // l'ellipsis ouvre le menu des seuls items masqués, qui sont des liens
    const trigger = canvas.getByRole('button', { name: 'Afficher les pages intermédiaires' })
    await userEvent.click(trigger)
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(true))
    const items = canvas.getAllByRole('menuitem')
    await expect(items.map((item) => item.textContent?.trim())).toEqual([
      'Projets',
      'Design system',
      'Socle',
      'Composants',
      'Navigation',
    ])
    await expect(canvas.getByRole('menuitem', { name: 'Socle' })).toHaveAttribute('href', '/a/b/c')

    // Esc referme et rend le focus au déclencheur
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(false))
    await waitFor(() => expect(trigger).toHaveFocus())
  },
}

export const LibellesLongs: Story = {
  args: {
    currentPath: '/courante',
    items: [
      { label: 'Un premier niveau au libellé long', href: '/premier' },
      { label: 'Un deuxième niveau encore plus long', href: '/deuxieme' },
      { label: 'Page courante interminable', href: '/courante' },
    ],
  },
  render: (args) => ({
    components: { Breadcrumb },
    setup: () => ({ args }),
    template: `
      <div style="max-width: 280px">
        <Breadcrumb v-bind="args" />
      </div>
    `,
  }),
}
