import type { Meta, StoryObj } from '@storybook/vue3-vite'

import Badge from '../Badge/Badge.vue'
import Button from '../Button/Button.vue'
import Card from './Card.vue'

const meta = {
  title: 'Composants/Card',
  component: Card,
  argTypes: {
    variant: { control: 'select', options: ['outline', 'raised'] },
  },
  args: { variant: 'outline' },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { Card },
    setup: () => ({ args }),
    template: `
      <Card v-bind="args" style="width: 360px">
        Une carte minimale : juste un corps, ni en-tête ni pied.
      </Card>
    `,
  }),
}

export const Complete: Story = {
  render: (args) => ({
    components: { Card, Button, Badge },
    setup: () => ({ args }),
    template: `
      <Card v-bind="args" style="width: 360px">
        <template #header>
          Projet Alpha
          <Badge tone="success" size="sm">Actif</Badge>
        </template>
        Dernier déploiement il y a 2 heures. 14 contributeurs, 320 commits ce mois-ci.
        <template #footer>
          <Button size="sm" variant="outline" tone="neutral">Paramètres</Button>
          <Button size="sm">Ouvrir</Button>
        </template>
      </Card>
    `,
  }),
}

export const Raised: Story = {
  args: { variant: 'raised' },
  render: (args) => ({
    components: { Card },
    setup: () => ({ args }),
    template: `
      <Card v-bind="args" style="width: 360px">
        <template #header>Surélevée</template>
        Variante avec ombre portée (tokens --ds-shadow-*).
      </Card>
    `,
  }),
}
