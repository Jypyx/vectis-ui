import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import Accordion from './Accordion.vue'
import AccordionItem from './AccordionItem.vue'

const meta = {
  title: 'Composants/Accordion',
  component: Accordion,
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { Accordion, AccordionItem },
    template: `
      <Accordion style="width: 420px">
        <AccordionItem title="Qu'est-ce que Socle ?" default-open>
          Un design system Vue 3 fondé sur les primitives natives de la plateforme.
        </AccordionItem>
        <AccordionItem title="Comment personnaliser le thème ?">
          Redéfinissez n'importe quelle custom property --ds-* sur :root ou un sous-arbre.
        </AccordionItem>
        <AccordionItem title="Quels navigateurs sont supportés ?">
          Les navigateurs modernes : Chrome/Edge 125+, Safari 26+.
        </AccordionItem>
      </Accordion>
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
