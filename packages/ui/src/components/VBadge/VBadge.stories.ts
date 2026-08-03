import type { Meta, StoryObj } from '@storybook/vue3-vite'

import VAvatar from '../VAvatar/VAvatar.vue'
import VButton from '../VButton/VButton.vue'
import VIcon from '../VIcon/VIcon.vue'
import VIconButton from '../VIconButton/VIconButton.vue'
import VBadge from './VBadge.vue'

const meta = {
  title: 'Composants/Badge',
  component: VBadge,
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
    components: { VBadge },
    setup: () => ({ args }),
    template: '<VBadge v-bind="args" />',
  }),
} satisfies Meta<typeof VBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Les 5 tones en rendu plein-couleur — vérifier `neutral` dans les deux thèmes. */
export const Tones: Story = {
  render: () => ({
    components: { VBadge },
    setup: () => ({ tones: ['neutral', 'accent', 'success', 'warning', 'danger'] }),
    template: `
      <div style="display: flex; gap: 16px; flex-wrap: wrap">
        <div v-for="tone in tones" :key="tone" style="display: flex; flex-direction: column; align-items: center; gap: 4px">
          <VBadge :tone="tone" :count="8" />
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
    components: { VBadge },
    setup: () => ({ colors: ['#7c3aed', 'oklch(70% 0.15 180)', 'hotpink', 'gold'] }),
    template: `
      <div style="display: flex; gap: 16px; flex-wrap: wrap">
        <div v-for="color in colors" :key="color" style="display: flex; flex-direction: column; align-items: center; gap: 4px">
          <VBadge :color="color" :count="8" />
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
    components: { VBadge },
    setup: () => ({ counts: [3, 12, 99, 100, 1000] }),
    template: `
      <div style="display: flex; gap: 8px; align-items: center">
        <VBadge v-for="count in counts" :key="count" tone="danger" :count="count" />
      </div>
    `,
  }),
}

/** Icône seule (nom, ou `{ src }`) : badge circulaire de 20px, icône 16px. */
export const Icone: Story = {
  render: () => ({
    components: { VBadge },
    setup: () => ({
      etoile: {
        src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8Z' fill='white'/%3E%3C/svg%3E",
      },
    }),
    template: `
      <div style="display: flex; gap: 8px; align-items: center">
        <VBadge icon="notifications" />
        <VBadge tone="success" icon="check" />
        <VBadge tone="warning" icon="priority_high" />
        <VBadge :icon="etoile" />
      </div>
    `,
  }),
}

/** `dot` réduit le badge à un rond de 10px sans contenu — présence, statut. */
export const Dot: Story = {
  render: () => ({
    components: { VBadge },
    template: `
      <div style="display: flex; gap: 8px; align-items: center">
        <VBadge dot />
        <VBadge dot tone="success" />
        <VBadge dot tone="danger" />
      </div>
    `,
  }),
}

/** Avec une cible en slot par défaut, le badge se place à sa droite. */
export const Inline: Story = {
  render: () => ({
    components: { VBadge },
    template: `
      <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 12px">
        <VBadge tone="danger" :count="3"><span>Messages</span></VBadge>
        <VBadge dot tone="success"><span>Xavier Darmet</span></VBadge>
      </div>
    `,
  }),
}

/** `overlay` pose le badge sur le coin haut-droit, décalé vers l'intérieur. */
export const Overlay: Story = {
  render: () => ({
    components: { VAvatar, VBadge, VButton },
    template: `
      <div style="display: flex; gap: 24px; align-items: center">
        <VBadge overlay tone="danger" :count="8">
          <VAvatar name="Xavier Darmet" />
        </VBadge>
        <VBadge overlay dot tone="success" bordered>
          <VAvatar name="Xavier Darmet" />
        </VBadge>
        <VBadge overlay icon="priority_high" tone="warning" bordered>
          <VAvatar name="Xavier Darmet" />
        </VBadge>
        <VBadge overlay tone="danger" :count="120">
          <VButton variant="outline" tone="neutral">Notifications</VButton>
        </VBadge>
      </div>
    `,
  }),
}

/**
 * `bordered` trace un liseré de 2px couleur du fond derrière
 * (`--vectis-color-surface`, surchargeable localement quand le fond diffère).
 * Sur un VIconButton, le comparatif sans/avec montre le détachement du badge.
 */
export const Bordered: Story = {
  render: () => ({
    components: { VBadge, VIcon, VIconButton },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start">
        <div style="display: flex; gap: 24px; align-items: center; padding: 16px; background: var(--vectis-color-accent); border-radius: var(--vectis-radius-surface); --vectis-color-surface: var(--vectis-color-accent)">
          <VBadge overlay tone="danger" :count="3" bordered>
            <VIconButton label="Notifications" variant="elevated" tone="accent">
              <VIcon name="notifications" />
            </VIconButton>
          </VBadge>
          <VBadge tone="danger" :count="3" bordered />
          <VBadge dot tone="success" bordered />
          <VBadge tone="neutral" :count="5" bordered />
        </div>
      </div>
    `,
  }),
}
