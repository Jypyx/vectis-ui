import type { Meta, StoryObj } from '@storybook/vue3-vite'

import Typography from './Typography.vue'

const VARIANTS = [
  'display',
  'heading-1',
  'heading-2',
  'heading-3',
  'heading-4',
  'subtitle',
  'body-lg',
  'body-md',
  'body-sm',
  'label',
  'caption',
  'overline',
  'code',
] as const

const TONES = [
  'default',
  'muted',
  'subtle',
  'accent',
  'danger',
  'success',
  'warning',
  'on-inverse',
] as const

const meta = {
  title: 'Composants/Typography',
  component: Typography,
  argTypes: {
    variant: { control: 'select', options: [...VARIANTS] },
    tone: { control: 'select', options: [...TONES] },
    as: { control: 'text' },
    truncate: { control: 'boolean' },
  },
  args: {
    variant: 'body-md',
    tone: 'default',
    truncate: false,
  },
  render: (args) => ({
    components: { Typography },
    setup: () => ({ args }),
    template:
      '<Typography v-bind="args">Portez ce vieux whisky au juge blond qui fume</Typography>',
  }),
} satisfies Meta<typeof Typography>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * L'échelle complète. Les headings sont rendus en `as="p"` ici pour ne pas
 * fausser la hiérarchie de titres de la page de doc — dans une vraie page,
 * laisser la balise par défaut (h1…h4).
 */
export const Variantes: Story = {
  render: () => ({
    components: { Typography },
    setup: () => ({ variants: VARIANTS }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px">
        <div v-for="variant in variants" :key="variant" style="display: flex; align-items: baseline; gap: 16px">
          <Typography variant="code" as="span" tone="muted" style="width: 96px; flex-shrink: 0">{{ variant }}</Typography>
          <Typography :variant="variant" as="p">Portez ce vieux whisky au juge blond</Typography>
        </div>
      </div>
    `,
  }),
}

/** Les tones sémantiques ; `default` hérite de la couleur du contexte. */
export const Tones: Story = {
  render: () => ({
    components: { Typography },
    setup: () => ({ tones: TONES }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 8px">
        <template v-for="tone in tones" :key="tone">
          <div v-if="tone === 'on-inverse'" style="background: var(--vectis-color-surface-inverse); border-radius: var(--vectis-radius-surface); padding: 8px 12px; align-self: flex-start">
            <Typography :tone="tone">on-inverse — sur surface inversée</Typography>
          </div>
          <Typography v-else :tone="tone">{{ tone }} — Portez ce vieux whisky au juge blond</Typography>
        </template>
      </div>
    `,
  }),
}

/**
 * La balise rendue est dérivée de la variante (h1…h4, p, span, code) et
 * surchargeable par `as` — la même recette visuelle peut habiller n'importe
 * quel élément (ex. un h2 de document stylé en heading-4).
 */
export const Balises: Story = {
  render: () => ({
    components: { Typography },
    template: `
      <div style="display: flex; flex-direction: column; gap: 8px">
        <Typography variant="heading-4">heading-4 rendu en &lt;h4&gt; (défaut)</Typography>
        <Typography variant="heading-4" as="h2">heading-4 rendu en &lt;h2&gt; (as)</Typography>
        <Typography variant="label" as="label">label rendu en &lt;label&gt; (as)</Typography>
      </div>
    `,
  }),
}

/** `truncate` coupe sur une ligne avec ellipse — la largeur vient du parent. */
export const Truncate: Story = {
  render: () => ({
    components: { Typography },
    template: `
      <div style="width: 240px; border: 1px dashed var(--vectis-color-border); border-radius: var(--vectis-radius-surface); padding: 12px">
        <Typography truncate>
          Un texte volontairement trop long pour la largeur de son conteneur,
          coupé net avec une ellipse.
        </Typography>
      </div>
    `,
  }),
}

/** Un paragraphe long : interlignage et overflow-wrap en conditions réelles. */
export const Paragraphe: Story = {
  render: () => ({
    components: { Typography },
    template: `
      <div style="max-width: 560px; display: flex; flex-direction: column; gap: 12px">
        <Typography variant="heading-3" as="p">Une politique typographique unique</Typography>
        <Typography variant="body-lg">
          Les recettes typographiques vivent dans les tokens sémantiques du design
          system : chaque variante compose famille, taille, graisse, interlignage et
          espacement de lettres depuis la même source, en light comme en dark.
        </Typography>
        <Typography variant="body-md" tone="muted">
          Les composants consomment les mêmes tokens en interne — le texte d'une boîte
          de dialogue, le libellé d'un champ ou une légende de tableau partagent
          exactement ces recettes, sans duplication locale. Le rôle
          <Typography variant="code" as="span">code</Typography> utilise la pile
          monospace du système.
        </Typography>
      </div>
    `,
  }),
}
