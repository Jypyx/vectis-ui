import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import VChip from '../VChip/VChip.vue'
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
  VChip,
  VIconButton,
}

/** Encadre la nav dans une largeur de barre latérale réaliste. */
const aside = (inner: string, attrs = 'v-bind="args"') => `
  <div style="inline-size: 17rem; padding: var(--vectis-space-2); border-inline-end: 1px solid var(--vectis-color-border);">
    <VSideNavigation ${attrs}>${inner}</VSideNavigation>
  </div>
`

const meta = {
  title: 'Composants/SideNavigation',
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
    setup: () => ({ args }),
    template: aside(`
      <VSideNavigationItem href="#accueil" icon="home" active>Accueil</VSideNavigationItem>
      <VSideNavigationItem icon="folder" default-open>
        Projets
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
      <VSideNavigationGroup label="Réglages">
        <VSideNavigationItem href="#equipe" icon="group">Équipe</VSideNavigationItem>
        <VSideNavigationItem href="#facturation" icon="payments">Facturation</VSideNavigationItem>
      </VSideNavigationGroup>
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
  <VSideNavigationGroup label="Espace de travail">
    <VSideNavigationItem icon="folder" default-open>
      Projets
      <template #items>
        <VSideNavigationItem href="#alpha">Alpha</VSideNavigationItem>
      </template>
    </VSideNavigationItem>
  </VSideNavigationGroup>
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
      <VSideNavigationItem href="#n0" icon="folder">Niveau 0</VSideNavigationItem>
      <VSideNavigationItem icon="folder" default-open>
        Niveau 0 (branche)
        <template #items>
          <VSideNavigationItem href="#n1">Niveau 1</VSideNavigationItem>
          <VSideNavigationItem icon="folder" default-open>
            Niveau 1 (branche)
            <template #items>
              <VSideNavigationItem href="#n2">Niveau 2</VSideNavigationItem>
              <VSideNavigationItem icon="folder" default-open>
                Niveau 2 (branche)
                <template #items>
                  <VSideNavigationItem href="#n3">Niveau 3</VSideNavigationItem>
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
      <VSideNavigationItem @select="onSelect">
        Messages
        <template #end>
          <VIconButton label="Nouveau message" icon="add" size="xs" data-testid="action" />
        </template>
      </VSideNavigationItem>
      <VSideNavigationItem icon="folder">
        Projets
        <template #end><VChip size="xs" tone="accent">12</VChip></template>
        <template #items>
          <VSideNavigationItem href="#alpha">Alpha</VSideNavigationItem>
        </template>
      </VSideNavigationItem>
      <VSideNavigationItem icon="group">
        Équipe
        <template #end>
          <VIconButton label="Inviter" icon="person_add" size="xs" data-testid="inviter" />
        </template>
        <template #items>
          <VSideNavigationItem href="#membres">Membres</VSideNavigationItem>
        </template>
      </VSideNavigationItem>
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
      <VSideNavigationItem icon="folder" default-open>
        Projets
        <template #items><VSideNavigationItem href="#alpha">Alpha</VSideNavigationItem></template>
      </VSideNavigationItem>
      <VSideNavigationItem icon="group">
        Équipe
        <template #items><VSideNavigationItem href="#membres">Membres</VSideNavigationItem></template>
      </VSideNavigationItem>
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
      <VSideNavigationItem href="#alpha" icon="folder" sublabel="12 tâches ouvertes">Alpha</VSideNavigationItem>
      <VSideNavigationItem icon="cloud" sublabel="Synchronisé il y a 2 min" default-open>
        Stockage
        <template #items>
          <VSideNavigationItem href="#archives" sublabel="4,2 Go">Archives</VSideNavigationItem>
        </template>
      </VSideNavigationItem>
    `),
  }),
}

export const Liens: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args, onSelect: fn() }),
    template: aside(`
      <VSideNavigationItem href="#tableau" icon="dashboard" active>Tableau de bord</VSideNavigationItem>
      <VSideNavigationItem href="https://example.com" icon="open_in_new" target="_blank" rel="noreferrer">
        Documentation
      </VSideNavigationItem>
      <VSideNavigationItem icon="tune" @select="onSelect">Préférences</VSideNavigationItem>
    `),
  }),
}

export const IconesPersonnalisees: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args }),
    template: aside(
      `
      <VSideNavigationItem default-open>
        Ouvert
        <template #items><VSideNavigationItem href="#a">Alpha</VSideNavigationItem></template>
      </VSideNavigationItem>
      <VSideNavigationItem>
        Fermé
        <template #items><VSideNavigationItem href="#b">Beta</VSideNavigationItem></template>
      </VSideNavigationItem>
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
      <VSideNavigationItem href="#actif" icon="home">Disponible</VSideNavigationItem>
      <VSideNavigationItem href="#inactif" icon="lock" disabled>Lien indisponible</VSideNavigationItem>
      <VSideNavigationItem icon="folder" disabled>
        Branche indisponible
        <template #items><VSideNavigationItem href="#x">Jamais atteignable</VSideNavigationItem></template>
      </VSideNavigationItem>
    `),
  }),
}

export const TextesLongs: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args }),
    template: aside(`
      <VSideNavigationItem href="#long" icon="description" sublabel="Un sous-libellé lui aussi beaucoup trop long pour la barre">
        Un libellé beaucoup trop long pour une barre latérale
      </VSideNavigationItem>
      <VSideNavigationItem icon="folder" default-open>
        Dossier au nom interminable qui ne tient pas
        <template #end><VChip size="xs">99+</VChip></template>
        <template #items>
          <VSideNavigationItem href="#imbrique">Et un sous-item tout aussi bavard que son parent</VSideNavigationItem>
        </template>
      </VSideNavigationItem>
    `),
  }),
}
