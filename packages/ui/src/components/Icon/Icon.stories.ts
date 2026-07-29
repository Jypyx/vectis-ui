import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import { defineComponent, h } from 'vue'

import Button from '../Button/Button.vue'

import Icon from './Icon.vue'
import { builtinIcons } from './icons'
import { setIconResolver } from './resolver'

const meta = {
  title: 'Composants/Icon',
  component: Icon,
  argTypes: {
    size: { control: { type: 'number', min: 12, max: 96, step: 4 } },
    name: { control: 'text' },
    src: { control: 'text' },
    label: { control: 'text' },
    filled: { control: 'boolean' },
  },
  args: {
    name: 'favorite',
  },
} satisfies Meta<typeof Icon>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const AdapteeAuTexte: Story = {
  render: () => ({
    components: { Icon },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px">
        <span style="font-size: var(--ds-font-size-sm); display: inline-flex; gap: 8px; align-items: center">
          <Icon name="favorite" /> Suit un texte sm (1em)
        </span>
        <span style="font-size: var(--ds-font-size-xl); display: inline-flex; gap: 8px; align-items: center">
          <Icon name="favorite" /> Suit un texte xl (1em)
        </span>
        <span style="display: inline-flex; gap: 8px; align-items: center">
          <Icon name="favorite" :size="16" />
          <Icon name="favorite" :size="24" />
          <Icon name="favorite" :size="48" />
          <span>(surcharges numériques 16 / 24 / 48)</span>
        </span>
      </div>
    `,
  }),
}

export const QuatreSources: Story = {
  render: () => ({
    components: { Icon },
    template: `
      <div style="display: flex; gap: 12px; align-items: center">
        <Icon name="close" :size="24" />
        <Icon name="rocket_launch" :size="24" />
        <Icon
          :size="24"
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%236366f1'/%3E%3C/svg%3E"
        />
        <Icon :size="24">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 12h16M12 4v16" stroke="currentcolor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </Icon>
        <span>(SVG intégré / ligature / image / SVG inline)</span>
      </div>
    `,
  }),
}

/** Les icônes que la librairie rend elle-même — embarquées, aucune police requise. */
export const Bibliotheque: Story = {
  render: () => ({
    components: { Icon },
    setup: () => ({ noms: Object.keys(builtinIcons) }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px">
        <div v-for="nom in noms" :key="nom" style="display: flex; gap: 8px; align-items: center">
          <Icon :name="nom" :size="24" />
          <code style="font-size: var(--ds-font-size-xs)">{{ nom }}</code>
        </div>
      </div>
    `,
  }),
}

/**
 * Critère d'acceptation de l'autonomie : la police d'icônes est neutralisée
 * (`--ds-font-family-icon: sans-serif`). Tout ce qui reste une ligature apparaît
 * alors EN TOUTES LETTRES — les icônes du DS, elles, ne bougent pas.
 */
export const SansPolice: Story = {
  render: () => ({
    components: { Icon },
    setup: () => ({ noms: Object.keys(builtinIcons) }),
    template: `
      <div style="--ds-font-family-icon: sans-serif; display: flex; flex-direction: column; gap: 16px">
        <div style="display: flex; gap: 12px; flex-wrap: wrap">
          <Icon v-for="nom in noms" :key="nom" :name="nom" :size="24" />
        </div>
        <div style="display: flex; gap: 12px; align-items: center">
          <Icon name="favorite" :size="24" />
          <span style="font-size: var(--ds-font-size-sm)">
            ↖ hors registre : la ligature retombe sur la police du consommateur, absente ici
          </span>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    // Aucune des icônes intégrées ne dépend d'une police : toutes sont des SVG.
    const svgs = canvasElement.querySelectorAll('.ds-icon-svg')
    await expect(svgs).toHaveLength(Object.keys(builtinIcons).length)
    await expect(canvasElement.querySelectorAll('.ds-icon-symbol')).toHaveLength(1)
  },
}

export const Filled: Story = {
  render: () => ({
    components: { Icon },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px">
        <div style="display: flex; gap: 16px; align-items: center">
          <span v-for="name in ['check_circle', 'warning', 'info', 'notifications']" :key="name" style="display: inline-flex; gap: 8px; align-items: center">
            <Icon :name="name" :size="24" />
            <Icon :name="name" :size="24" filled />
          </span>
          <span>(registre intégré : second path embarqué)</span>
        </div>
        <div style="display: flex; gap: 16px; align-items: center">
          <span v-for="name in ['favorite', 'home', 'settings', 'star']" :key="name" style="display: inline-flex; gap: 8px; align-items: center">
            <Icon :name="name" :size="24" />
            <Icon :name="name" :size="24" filled />
          </span>
          <span>(ligature : axe FILL de la police)</span>
        </div>
      </div>
    `,
  }),
}

/**
 * L'invariant du DS : quelle que soit la SOURCE de l'icône, sa taille reste celle
 * du contexte (ici celle du Button — lg → 24px, xs → 16px). Mesuré pour de vrai :
 * jsdom ne fait pas de layout, ce contrôle n'existe qu'ici.
 */
export const InvariantDeTaille: Story = {
  beforeEach: () => {
    // Faux jeu « composant » (à la Lucide) : dimensions EN DUR, que le CSS du DS
    // doit battre — ce sont des attributs de présentation, donc perdants.
    const Lucide = defineComponent({
      setup: () => () =>
        h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', 'data-testid': 'composant' }, [
          h('path', { d: 'M6 6l12 12M18 6L6 18', stroke: 'currentcolor', 'stroke-width': 2 }),
        ]),
    })
    // Fausse police à classes (à la Font Awesome / Phosphor) : glyphe en ::before.
    const style = document.createElement('style')
    style.textContent = `.faux-glyphe::before { content: '\\2716' }`
    document.head.append(style)

    setIconResolver((name) => {
      if (name === 'composant') return { component: Lucide }
      if (name === 'classe') return { class: 'faux-glyphe' }
      return undefined
    })

    return () => {
      setIconResolver(undefined)
      style.remove()
    }
  },
  render: () => ({
    components: { Button, Icon },
    setup: () => ({ sources: ['close', 'favorite', 'composant', 'classe'] }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; align-items: start">
        <div v-for="size in ['lg', 'xs']" :key="size" :data-taille="size" style="display: flex; gap: 8px">
          <Button v-for="nom in sources" :key="nom" :size="size" variant="outline" tone="neutral">
            <template #start><Icon :name="nom" /></template>
            {{ nom }}
          </Button>
          <Button :size="size" variant="outline" tone="neutral">
            <template #start>
              <Icon src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%236366f1'/%3E%3C/svg%3E" />
            </template>
            image
          </Button>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    for (const [taille, attendu] of [
      ['lg', 24],
      ['xs', 16],
    ] as const) {
      const rangee = canvasElement.querySelector(`[data-taille='${taille}']`) as HTMLElement
      const icones = [...rangee.querySelectorAll('.ds-icon')]
      await expect(icones).toHaveLength(5)

      for (const icone of icones) {
        const boite = icone.getBoundingClientRect()
        await expect(Math.round(boite.width)).toBe(attendu)
        await expect(Math.round(boite.height)).toBe(attendu)

        // Un SVG enfant remplit le carré, y compris avec width/height en dur.
        const svg = icone.querySelector('svg')
        if (svg) {
          const interne = svg.getBoundingClientRect()
          await expect(Math.round(interne.width)).toBe(attendu)
          await expect(Math.round(interne.height)).toBe(attendu)
        }
      }
    }
  },
}

export const AvecLabel: Story = {
  args: { name: 'warning', label: 'Attention' },
  play: async ({ canvasElement }) => {
    const icon = within(canvasElement).getByRole('img', { name: 'Attention' })
    await expect(icon).not.toHaveAttribute('aria-hidden')
  },
}

export const PiloteParLeParent: Story = {
  render: () => ({
    components: { Icon },
    template: `
      <!-- Le conteneur pose l'API de contexte ; la prop size numérique prime -->
      <div style="--ds-icon-size: var(--ds-icon-size-lg); --ds-icon-opsz: 24; display: flex; gap: 12px; align-items: center">
        <Icon name="palette" />
        <Icon name="palette" :size="16" />
        <span>(contexte lg / prop 16px qui prime)</span>
      </div>
    `,
  }),
}
