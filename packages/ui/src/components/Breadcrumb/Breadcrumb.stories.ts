import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'

import Breadcrumb from './Breadcrumb.vue'
import BreadcrumbItem from './BreadcrumbItem.vue'

const meta = {
  title: 'Composants/Breadcrumb',
  component: Breadcrumb,
} satisfies Meta<typeof Breadcrumb>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { Breadcrumb, BreadcrumbItem },
    template: `
      <Breadcrumb>
        <BreadcrumbItem href="#">Accueil</BreadcrumbItem>
        <BreadcrumbItem href="#">Projets</BreadcrumbItem>
        <BreadcrumbItem href="#">Socle</BreadcrumbItem>
        <BreadcrumbItem current>Paramètres</BreadcrumbItem>
      </Breadcrumb>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('navigation', { name: "Fil d'Ariane" })).toBeVisible()
    await expect(canvas.getByText('Paramètres')).toHaveAttribute('aria-current', 'page')
  },
}

export const LibellesLongs: Story = {
  render: () => ({
    components: { Breadcrumb, BreadcrumbItem },
    template: `
      <div style="max-width: 280px">
        <Breadcrumb>
          <BreadcrumbItem href="#">Un premier niveau au libellé long</BreadcrumbItem>
          <BreadcrumbItem href="#">Un deuxième niveau encore plus long</BreadcrumbItem>
          <BreadcrumbItem current>Page courante interminable</BreadcrumbItem>
        </Breadcrumb>
      </div>
    `,
  }),
}
