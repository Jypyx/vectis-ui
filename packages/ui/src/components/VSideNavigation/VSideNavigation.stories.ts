import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import Chip from '../Chip/Chip.vue'
import IconButton from '../IconButton/IconButton.vue'
import SideNavigation from './SideNavigation.vue'
import SideNavigationGroup from './SideNavigationGroup.vue'
import SideNavigationItem from './SideNavigationItem.vue'
import SideNavigationSeparator from './SideNavigationSeparator.vue'

const components = {
  SideNavigation,
  SideNavigationItem,
  SideNavigationGroup,
  SideNavigationSeparator,
  Chip,
  IconButton,
}

/** Encadre la nav dans une largeur de barre latérale réaliste. */
const aside = (inner: string, attrs = 'v-bind="args"') => `
  <div style="inline-size: 17rem; padding: var(--vectis-space-2); border-inline-end: 1px solid var(--vectis-color-border);">
    <SideNavigation ${attrs}>${inner}</SideNavigation>
  </div>
`

const meta = {
  title: 'Composants/SideNavigation',
  component: SideNavigation,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    compact: { control: 'boolean' },
    exclusive: { control: 'boolean' },
  },
  args: { size: 'md', compact: false, exclusive: false },
} satisfies Meta<typeof SideNavigation>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args }),
    template: aside(`
      <SideNavigationItem href="#accueil" icon="home" active>Accueil</SideNavigationItem>
      <SideNavigationItem icon="folder" default-open>
        Projets
        <template #items>
          <SideNavigationItem href="#alpha">Alpha</SideNavigationItem>
          <SideNavigationItem>
            Beta
            <template #items>
              <SideNavigationItem href="#beta-api">API</SideNavigationItem>
              <SideNavigationItem href="#beta-web">Web</SideNavigationItem>
            </template>
          </SideNavigationItem>
        </template>
      </SideNavigationItem>
      <SideNavigationSeparator />
      <SideNavigationGroup label="Réglages">
        <SideNavigationItem href="#equipe" icon="group">Équipe</SideNavigationItem>
        <SideNavigationItem href="#facturation" icon="payments">Facturation</SideNavigationItem>
      </SideNavigationGroup>
    `),
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const beta = canvas.getByText('Beta').closest('summary') as HTMLElement
    const branche = beta.closest('details') as HTMLDetailsElement
    const chevron = beta.querySelector('.v-side-nav-chevron') as HTMLElement

    // Le retrait vaut la place d'une icône (icône + gouttière) : le libellé
    // d'un sous-item tombe sur la MÊME VERTICALE que celui de son parent.
    const bordDuLibelle = (nom: string) => canvas.getByText(nom).getBoundingClientRect().left
    await expect(bordDuLibelle('Alpha')).toBe(bordDuLibelle('Projets'))

    // repliée, la sous-liste est « sautée » : son contenu n'est pas focusable
    const cache = branche.querySelector('a') as HTMLElement
    cache.focus()
    await expect(cache).not.toHaveFocus()

    // le clic sur la rangée bascule la branche, le chevron se retourne
    await userEvent.click(beta)
    await waitFor(() => expect(branche.open).toBe(true))
    await waitFor(() => expect(getComputedStyle(chevron).rotate).toBe('180deg'))
    await expect(canvas.getByRole('link', { name: 'API' })).toBeVisible()

    cache.focus()
    await expect(cache).toHaveFocus()

    await userEvent.click(beta)
    await waitFor(() => expect(branche.open).toBe(false))
    await waitFor(() => expect(getComputedStyle(chevron).rotate).toBe('none'))
  },
}

const TAILLES_ITEMS = `
  <SideNavigationGroup label="Espace de travail">
    <SideNavigationItem icon="folder" default-open>
      Projets
      <template #items>
        <SideNavigationItem href="#alpha">Alpha</SideNavigationItem>
      </template>
    </SideNavigationItem>
  </SideNavigationGroup>
`

export const Tailles: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args }),
    template: `
      <div style="display: flex; gap: var(--vectis-space-6);">
        ${['sm', 'md'].map((size) => aside(TAILLES_ITEMS, `size="${size}"`)).join('')}
        ${aside(TAILLES_ITEMS, 'size="md" compact')}
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    // Rangées de NIVEAU 2 : elles prouvent que les `--control-*` héritent
    // jusqu'au bout sans jamais reposer `v-control` sur une sous-liste.
    const rangees = [...canvasElement.querySelectorAll('.v-side-nav-children a')].map(
      (el) => (el.closest('.v-side-nav-row') as HTMLElement).getBoundingClientRect().height,
    )
    const [sm, md, compact] = rangees
    await expect(md! - sm!).toBe(8) // 40px − 32px
    await expect(md! - compact!).toBe(4) // le compact du DS

    // L'en-tête de section tient la hauteur d'une rangée, aux trois densités.
    const libelles = [...canvasElement.querySelectorAll('.v-side-nav-group-label')].map(
      (el) => (el as HTMLElement).getBoundingClientRect().height,
    )
    await expect(libelles).toEqual(rangees)
  },
}

export const SousItemsProfonds: Story = {
  name: 'Profondeur',
  render: (args) => ({
    components,
    setup: () => ({ args }),
    template: aside(`
      <SideNavigationItem href="#n0" icon="folder">Niveau 0</SideNavigationItem>
      <SideNavigationItem icon="folder" default-open>
        Niveau 0 (branche)
        <template #items>
          <SideNavigationItem href="#n1">Niveau 1</SideNavigationItem>
          <SideNavigationItem icon="folder" default-open>
            Niveau 1 (branche)
            <template #items>
              <SideNavigationItem href="#n2">Niveau 2</SideNavigationItem>
              <SideNavigationItem icon="folder" default-open>
                Niveau 2 (branche)
                <template #items>
                  <SideNavigationItem href="#n3">Niveau 3</SideNavigationItem>
                </template>
              </SideNavigationItem>
            </template>
          </SideNavigationItem>
        </template>
      </SideNavigationItem>
    `),
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const retrait = (nom: string) => {
      const rangee = canvas.getByRole('link', { name: nom }).closest('.v-side-nav-row')!
      return Number.parseFloat(getComputedStyle(rangee).paddingInlineStart)
    }

    // Le compteur CSS à DEUX noms alternés : la forme auto-référentielle
    // (`--side-nav-level: calc(var(--side-nav-level, 0) + 1)`) est un cycle et rendrait ces
    // quatre valeurs égales, sans la moindre erreur console.
    const retraits = ['Niveau 0', 'Niveau 1', 'Niveau 2', 'Niveau 3'].map(retrait)
    for (let i = 1; i < retraits.length; i++) {
      await expect(retraits[i]).toBeGreaterThan(retraits[i - 1]!)
    }
    await expect(retraits[1]! - retraits[0]!).toBe(retraits[3]! - retraits[2]!)

    // …et ce pas vaut la place d'une icône : à chaque niveau, le libellé d'un
    // sous-item retombe sur la verticale du libellé de sa branche parente.
    const bord = (nom: string) => canvas.getByText(nom).getBoundingClientRect().left
    for (const niveau of [0, 1, 2]) {
      await expect(bord(`Niveau ${niveau + 1}`)).toBe(bord(`Niveau ${niveau} (branche)`))
    }
  },
}

export const ContenuDeFin: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args, onSelect: fn() }),
    template: aside(`
      <SideNavigationItem @select="onSelect">
        Messages
        <template #end>
          <IconButton label="Nouveau message" icon="add" size="xs" data-testid="action" />
        </template>
      </SideNavigationItem>
      <SideNavigationItem icon="folder">
        Projets
        <template #end><Chip size="xs" tone="accent">12</Chip></template>
        <template #items>
          <SideNavigationItem href="#alpha">Alpha</SideNavigationItem>
        </template>
      </SideNavigationItem>
      <SideNavigationItem icon="group">
        Équipe
        <template #end>
          <IconButton label="Inviter" icon="person_add" size="xs" data-testid="inviter" />
        </template>
        <template #items>
          <SideNavigationItem href="#membres">Membres</SideNavigationItem>
        </template>
      </SideNavigationItem>
    `),
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const rangee = canvas.getByText('Messages').closest('.v-side-nav-row') as HTMLElement
    const action = rangee.querySelector('.v-side-nav-action') as HTMLElement
    const bouton = canvas.getByTestId('action')

    // Feuille : la zone cliquable de l'action couvre TOUTE la rangée — y compris
    // la gouttière vide devant le slot de fin…
    const boite = rangee.getBoundingClientRect()
    const boiteBouton = bouton.getBoundingClientRect()
    await expect(
      document.elementFromPoint(boiteBouton.left - 4, boite.top + boite.height / 2),
    ).toBe(action)

    // …mais le slot de fin est peint AU-DESSUS d'elle, donc reste cliquable
    // (`contains` : le point tombe sur le glyphe de l'icône, dans le bouton).
    const cible = document.elementFromPoint(
      boiteBouton.left + boiteBouton.width / 2,
      boiteBouton.top + boiteBouton.height / 2,
    )
    await expect(bouton.contains(cible)).toBe(true)

    // Branche : le clic dans le slot de fin ne bascule pas le <details> —
    // ni sur une pastille inerte…
    const projets = canvas.getByText('Projets').closest('summary') as HTMLElement
    const branche = projets.closest('details') as HTMLDetailsElement
    await userEvent.click(projets.querySelector('.v-side-nav-end') as HTMLElement)
    await expect(branche.open).toBe(false)
    await userEvent.click(projets)
    await waitFor(() => expect(branche.open).toBe(true))

    // …ni sur un contrôle, qui est sa propre cible d'activation
    const equipe = canvas.getByText('Équipe').closest('details') as HTMLDetailsElement
    await userEvent.click(canvas.getByTestId('inviter'))
    await expect(equipe.open).toBe(false)
  },
}

export const Exclusif: Story = {
  args: { exclusive: true },
  render: (args) => ({
    components,
    setup: () => ({ args }),
    template: aside(`
      <SideNavigationItem icon="folder" default-open>
        Projets
        <template #items><SideNavigationItem href="#alpha">Alpha</SideNavigationItem></template>
      </SideNavigationItem>
      <SideNavigationItem icon="group">
        Équipe
        <template #items><SideNavigationItem href="#membres">Membres</SideNavigationItem></template>
      </SideNavigationItem>
    `),
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const [projets, equipe] = [...canvasElement.querySelectorAll('details')]
    await expect(projets!.open).toBe(true)

    // exclusivité NATIVE (<details name>) : ouvrir un frère referme l'autre
    await userEvent.click(canvas.getByText('Équipe').closest('summary') as HTMLElement)
    await waitFor(() => expect(equipe!.open).toBe(true))
    await expect(projets!.open).toBe(false)
  },
}

export const SousLabels: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args }),
    template: aside(`
      <SideNavigationItem href="#alpha" icon="folder" sublabel="12 tâches ouvertes">Alpha</SideNavigationItem>
      <SideNavigationItem icon="cloud" sublabel="Synchronisé il y a 2 min" default-open>
        Stockage
        <template #items>
          <SideNavigationItem href="#archives" sublabel="4,2 Go">Archives</SideNavigationItem>
        </template>
      </SideNavigationItem>
    `),
  }),
}

export const Liens: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args, onSelect: fn() }),
    template: aside(`
      <SideNavigationItem href="#tableau" icon="dashboard" active>Tableau de bord</SideNavigationItem>
      <SideNavigationItem href="https://example.com" icon="open_in_new" target="_blank" rel="noreferrer">
        Documentation
      </SideNavigationItem>
      <SideNavigationItem icon="tune" @select="onSelect">Préférences</SideNavigationItem>
    `),
  }),
}

export const IconesPersonnalisees: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args }),
    template: aside(
      `
      <SideNavigationItem default-open>
        Ouvert
        <template #items><SideNavigationItem href="#a">Alpha</SideNavigationItem></template>
      </SideNavigationItem>
      <SideNavigationItem>
        Fermé
        <template #items><SideNavigationItem href="#b">Beta</SideNavigationItem></template>
      </SideNavigationItem>
    `,
      'v-bind="args" expand-icon="add" collapse-icon="remove"',
    ),
  }),
}

export const ItemDesactive: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args }),
    template: aside(`
      <SideNavigationItem href="#actif" icon="home">Disponible</SideNavigationItem>
      <SideNavigationItem href="#inactif" icon="lock" disabled>Lien indisponible</SideNavigationItem>
      <SideNavigationItem icon="folder" disabled>
        Branche indisponible
        <template #items><SideNavigationItem href="#x">Jamais atteignable</SideNavigationItem></template>
      </SideNavigationItem>
    `),
  }),
}

export const TextesLongs: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args }),
    template: aside(`
      <SideNavigationItem href="#long" icon="description" sublabel="Un sous-libellé lui aussi beaucoup trop long pour la barre">
        Un libellé beaucoup trop long pour une barre latérale
      </SideNavigationItem>
      <SideNavigationItem icon="folder" default-open>
        Dossier au nom interminable qui ne tient pas
        <template #end><Chip size="xs">99+</Chip></template>
        <template #items>
          <SideNavigationItem href="#imbrique">Et un sous-item tout aussi bavard que son parent</SideNavigationItem>
        </template>
      </SideNavigationItem>
    `),
  }),
}
