import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import Accordion from './Accordion.vue'
import AccordionItem from './AccordionItem.vue'

const meta = {
  title: 'Composants/Accordion',
  component: Accordion,
  argTypes: {
    exclusive: { control: 'boolean' },
    variant: { control: 'inline-radio', options: ['flat', 'outlined'] },
    compact: { control: 'boolean' },
    expandIcon: { control: 'text' },
    collapseIcon: { control: 'text' },
  },
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

const ITEMS = `
  <AccordionItem title="Qu'est-ce que Socle ?" default-open>
    Un design system Vue 3 fondé sur les primitives natives de la plateforme.
  </AccordionItem>
  <AccordionItem title="Comment personnaliser le thème ?">
    Redéfinissez n'importe quelle custom property --vectis-* sur :root ou un sous-arbre.
  </AccordionItem>
  <AccordionItem title="Quels navigateurs sont supportés ?">
    Les navigateurs modernes : Chrome/Edge 125+, Safari 26+.
  </AccordionItem>
`

export const Default: Story = {
  args: { exclusive: true, variant: 'flat', compact: false },
  render: (args) => ({
    components: { Accordion, AccordionItem },
    setup: () => ({ args }),
    template: `
      <Accordion v-bind="args" style="width: 420px">${ITEMS}</Accordion>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const details = [...canvasElement.querySelectorAll('details')]
    await expect(details[0]?.open).toBe(true)

    // mode exclusif NATIF (attribut name) : ouvrir le 2e ferme le 1er, sans JS
    await userEvent.click(canvas.getByText('Comment personnaliser le thème ?'))
    await waitFor(() => expect(details[1]?.open).toBe(true))
    await waitFor(() => expect(details[0]?.open).toBe(false))
  },
}

export const OuverturesMultiples: Story = {
  render: () => ({
    components: { Accordion, AccordionItem },
    template: `
      <Accordion :exclusive="false" style="width: 420px">
        <AccordionItem title="Premier">Contenu du premier panneau.</AccordionItem>
        <AccordionItem title="Second">Contenu du second panneau.</AccordionItem>
      </Accordion>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const details = [...canvasElement.querySelectorAll('details')]
    await userEvent.click(canvas.getByText('Premier'))
    await userEvent.click(canvas.getByText('Second'))
    // sans name partagé, les deux restent ouverts
    await waitFor(() => expect(details[0]?.open).toBe(true))
    await waitFor(() => expect(details[1]?.open).toBe(true))
  },
}

export const TitreRiche: Story = {
  render: () => ({
    components: { Accordion, AccordionItem },
    template: `
      <Accordion style="width: 420px">
        <AccordionItem>
          <template #title>Facturation <em>(bientôt disponible)</em></template>
          Détails de facturation.
        </AccordionItem>
      </Accordion>
    `,
  }),
}

/** `subtitle` + `iconStart` : sous-titre empilé sous le titre, icône devant le bloc. */
export const SousTitreEtIcone: Story = {
  render: () => ({
    components: { Accordion, AccordionItem },
    template: `
      <Accordion style="width: 420px">
        <AccordionItem
          title="Notifications"
          subtitle="E-mails, push et récapitulatifs hebdomadaires"
          icon-start="notifications"
        >
          Préférences de notification.
        </AccordionItem>
        <AccordionItem
          title="Confidentialité"
          subtitle="Visibilité du profil et données partagées"
          icon-start="lock"
        >
          Réglages de confidentialité.
        </AccordionItem>
        <AccordionItem title="Compte" icon-start="person">
          Un item peut porter une icône sans sous-titre.
        </AccordionItem>
        <AccordionItem title="Sessions" subtitle="Appareils connectés">
          Ou un sous-titre sans icône.
        </AccordionItem>
      </Accordion>
    `,
  }),
}

/** `expandIcon`/`collapseIcon` : deux icônes permutées en CSS (ici add ↔ remove). */
export const IconesPersonnalisees: Story = {
  render: () => ({
    components: { Accordion, AccordionItem },
    template: `
      <Accordion expand-icon="add" collapse-icon="remove" style="width: 420px">
        <AccordionItem title="Premier">Contenu du premier panneau.</AccordionItem>
        <AccordionItem title="Second">Contenu du second panneau.</AccordionItem>
      </Accordion>
    `,
  }),
  play: async ({ canvasElement }) => {
    const [first] = [...canvasElement.querySelectorAll('details')]
    const item = within(first as HTMLElement)
    await expect(item.getByText('add')).toBeVisible()
    await expect(item.getByText('remove')).not.toBeVisible()

    await userEvent.click(item.getByText('Premier'))
    await waitFor(() => expect(item.getByText('remove')).toBeVisible())
    await waitFor(() => expect(item.getByText('add')).not.toBeVisible())
  },
}

/** Les deux habillages : `flat` (défaut, aucun) et `outlined` (fond surélevé, bordure, rayon). */
export const Variantes: Story = {
  render: () => ({
    components: { Accordion, AccordionItem },
    template: `
      <div style="display: grid; gap: 32px; width: 420px">
        <Accordion variant="flat">
          <AccordionItem title="flat — aucun habillage">
            Ni bordure, ni rayon, ni fond : l'accordéon hérite de la surface de son conteneur.
          </AccordionItem>
          <AccordionItem title="Les séparateurs subsistent">
            Ils appartiennent à la lecture de la liste, pas à son cadre.
          </AccordionItem>
        </Accordion>

        <Accordion variant="outlined">
          <AccordionItem title="outlined — bordure et rayon">
            Un trait de 1px cerne le groupe, sur un fond surélevé.
          </AccordionItem>
          <AccordionItem title="Rayon intérieur emboîté">
            Les coins des items d'extrémité suivent la découpe du groupe.
          </AccordionItem>
        </Accordion>
      </div>
    `,
  }),
}

/** `compact` : -4px sur tous les paddings, typo et icônes inchangées. */
export const Compact: Story = {
  render: () => ({
    components: { Accordion, AccordionItem },
    template: `
      <Accordion compact style="width: 420px">${ITEMS}</Accordion>
    `,
  }),
}

/** Item désactivé : gris par tokens, inerte au clic et hors parcours clavier. */
export const ItemDesactive: Story = {
  render: () => ({
    components: { Accordion, AccordionItem },
    template: `
      <Accordion style="width: 420px">
        <AccordionItem title="Disponible">Panneau ouvrable.</AccordionItem>
        <AccordionItem title="Bientôt disponible" disabled>
          Panneau inaccessible.
        </AccordionItem>
        <AccordionItem title="Disponible aussi">Autre panneau ouvrable.</AccordionItem>
      </Accordion>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const details = [...canvasElement.querySelectorAll('details')]
    await userEvent.click(canvas.getByText('Bientôt disponible'))
    await waitFor(() => expect(details[1]?.open).toBe(false))
  },
}
