import type { Meta, StoryObj } from '@storybook/vue3-vite'

import Avatar from '../Avatar/Avatar.vue'
import Button from '../Button/Button.vue'
import Icon from '../Icon/Icon.vue'
import IconButton from '../IconButton/IconButton.vue'
import Badge from './Badge.vue'

const meta = {
  title: 'Composants/Badge',
  component: Badge,
  argTypes: {
    tone: { control: 'select', options: ['neutral', 'accent', 'danger', 'success', 'warning'] },
    color: { control: 'color' },
    count: { control: 'number' },
    icon: { control: 'text' },
    dot: { control: 'boolean' },
    overlay: { control: 'boolean' },
    bordered: { control: 'boolean' },
  },
  args: {
    tone: 'accent',
    count: 8,
    dot: false,
    overlay: false,
    bordered: false,
  },
  render: (args) => ({
    components: { Badge },
    setup: () => ({ args }),
    template: '<Badge v-bind="args" />',
  }),
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Les 5 tones en rendu plein-couleur — vérifier `neutral` dans les deux thèmes. */
export const Tones: Story = {
  render: () => ({
    components: { Badge },
    setup: () => ({ tones: ['neutral', 'accent', 'success', 'warning', 'danger'] }),
    template: `
      <div style="display: flex; gap: 16px; flex-wrap: wrap">
        <div v-for="tone in tones" :key="tone" style="display: flex; flex-direction: column; align-items: center; gap: 4px">
          <Badge :tone="tone" :count="8" />
          <small>{{ tone }}</small>
        </div>
      </div>
    `,
  }),
}

/**
 * Couleur libre (hex, nom CSS, oklch()) : le texte s'adapte noir/blanc via
 * contrast-color() (Safari 26+) ; ailleurs, fallback blanc — le contraste
 * d'une couleur claire est à la charge du consommateur.
 */
export const CouleurCustom: Story = {
  render: () => ({
    components: { Badge },
    setup: () => ({ colors: ['#7c3aed', 'oklch(70% 0.15 180)', 'hotpink', 'gold'] }),
    template: `
      <div style="display: flex; gap: 16px; flex-wrap: wrap">
        <div v-for="color in colors" :key="color" style="display: flex; flex-direction: column; align-items: center; gap: 4px">
          <Badge :color="color" :count="8" />
          <small>{{ color }}</small>
        </div>
      </div>
    `,
  }),
}

/**
 * `count` est un nombre ; au-delà de 99 l'affichage est plafonné à « 99+ ».
 * Le padding réduit garde le badge rond à un ou deux chiffres.
 */
export const Compteurs: Story = {
  render: () => ({
    components: { Badge },
    setup: () => ({ counts: [3, 12, 99, 100, 1000] }),
    template: `
      <div style="display: flex; gap: 8px; align-items: center">
        <Badge v-for="count in counts" :key="count" tone="danger" :count="count" />
      </div>
    `,
  }),
}

/** Icône seule (nom Material Symbols ou URL) : badge circulaire de 20px, icône 16px. */
export const Icone: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <div style="display: flex; gap: 8px; align-items: center">
        <Badge icon="notifications" />
        <Badge tone="success" icon="check" />
        <Badge tone="warning" icon="priority_high" />
        <Badge icon="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8Z' fill='white'/%3E%3C/svg%3E" />
      </div>
    `,
  }),
}

/** `dot` réduit le badge à un rond de 10px sans contenu — présence, statut. */
export const Dot: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <div style="display: flex; gap: 8px; align-items: center">
        <Badge dot />
        <Badge dot tone="success" />
        <Badge dot tone="danger" />
      </div>
    `,
  }),
}

/** Avec une cible en slot par défaut, le badge se place à sa droite. */
export const Inline: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 12px">
        <Badge tone="danger" :count="3"><span>Messages</span></Badge>
        <Badge dot tone="success"><span>Xavier Darmet</span></Badge>
      </div>
    `,
  }),
}

/** `overlay` pose le badge sur le coin haut-droit, décalé vers l'intérieur. */
export const Overlay: Story = {
  render: () => ({
    components: { Avatar, Badge, Button },
    template: `
      <div style="display: flex; gap: 24px; align-items: center">
        <Badge overlay tone="danger" :count="8">
          <Avatar name="Xavier Darmet" />
        </Badge>
        <Badge overlay dot tone="success" bordered>
          <Avatar name="Xavier Darmet" />
        </Badge>
        <Badge overlay icon="priority_high" tone="warning" bordered>
          <Avatar name="Xavier Darmet" />
        </Badge>
        <Badge overlay tone="danger" :count="120">
          <Button variant="outline" tone="neutral">Notifications</Button>
        </Badge>
      </div>
    `,
  }),
}

/**
 * `bordered` trace un liseré de 2px couleur du fond derrière
 * (`--ds-color-surface`, surchargeable localement quand le fond diffère).
 * Sur un IconButton, le comparatif sans/avec montre le détachement du badge.
 */
export const Bordered: Story = {
  render: () => ({
    components: { Badge, Icon, IconButton },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start">
        <div style="display: flex; gap: 24px; align-items: center; padding: 16px; background: var(--ds-color-accent); border-radius: var(--ds-radius-surface); --ds-color-surface: var(--ds-color-accent)">
          <Badge overlay tone="danger" :count="3" bordered>
            <IconButton label="Notifications" variant="elevated" tone="accent">
              <Icon name="notifications" />
            </IconButton>
          </Badge>
          <Badge tone="danger" :count="3" bordered />
          <Badge dot tone="success" bordered />
          <Badge tone="neutral" :count="5" bordered />
        </div>
      </div>
    `,
  }),
}
