import type { Meta, StoryObj } from '@storybook/vue3-vite'

import VTypography from './VTypography.vue'

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
  component: VTypography,
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
    components: { VTypography },
    setup: () => ({ args }),
    template:
      '<VTypography v-bind="args">Portez ce vieux whisky au juge blond qui fume</VTypography>',
  }),
} satisfies Meta<typeof VTypography>

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
    components: { VTypography },
    setup: () => ({ variants: VARIANTS }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px">
        <div v-for="variant in variants" :key="variant" style="display: flex; align-items: baseline; gap: 16px">
          <VTypography variant="code" as="span" tone="muted" style="width: 96px; flex-shrink: 0">{{ variant }}</VTypography>
          <VTypography :variant="variant" as="p">Portez ce vieux whisky au juge blond</VTypography>
        </div>
      </div>
    `,
  }),
}

/** Les tones sémantiques ; `default` hérite de la couleur du contexte. */
export const Tones: Story = {
  render: () => ({
    components: { VTypography },
    setup: () => ({ tones: TONES }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 8px">
        <template v-for="tone in tones" :key="tone">
          <div v-if="tone === 'on-inverse'" style="background: var(--vectis-color-surface-inverse); border-radius: var(--vectis-radius-surface); padding: 8px 12px; align-self: flex-start">
            <VTypography :tone="tone">on-inverse — sur surface inversée</VTypography>
          </div>
          <VTypography v-else :tone="tone">{{ tone }} — Portez ce vieux whisky au juge blond</VTypography>
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
    components: { VTypography },
    template: `
      <div style="display: flex; flex-direction: column; gap: 8px">
        <VTypography variant="heading-4">heading-4 rendu en &lt;h4&gt; (défaut)</VTypography>
        <VTypography variant="heading-4" as="h2">heading-4 rendu en &lt;h2&gt; (as)</VTypography>
        <VTypography variant="label" as="label">label rendu en &lt;label&gt; (as)</VTypography>
      </div>
    `,
  }),
}

/** `truncate` coupe sur une ligne avec ellipse — la largeur vient du parent. */
export const Truncate: Story = {
  render: () => ({
    components: { VTypography },
    template: `
      <div style="width: 240px; border: 1px dashed var(--vectis-color-border); border-radius: var(--vectis-radius-surface); padding: 12px">
        <VTypography truncate>
          Un texte volontairement trop long pour la largeur de son conteneur,
          coupé net avec une ellipse.
        </VTypography>
      </div>
    `,
  }),
}

/** Un paragraphe long : interlignage et overflow-wrap en conditions réelles. */
export const Paragraphe: Story = {
  render: () => ({
    components: { VTypography },
    template: `
      <div style="max-width: 560px; display: flex; flex-direction: column; gap: 12px">
        <VTypography variant="heading-3" as="p">Une politique typographique unique</VTypography>
        <VTypography variant="body-lg">
          Les recettes typographiques vivent dans les tokens sémantiques du design
          system : chaque variante compose famille, taille, graisse, interlignage et
          espacement de lettres depuis la même source, en light comme en dark.
        </VTypography>
        <VTypography variant="body-md" tone="muted">
          Les composants consomment les mêmes tokens en interne — le texte d'une boîte
          de dialogue, le libellé d'un champ ou une légende de tableau partagent
          exactement ces recettes, sans duplication locale. Le rôle
          <VTypography variant="code" as="span">code</VTypography> utilise la pile
          monospace du système.
        </VTypography>
      </div>
    `,
  }),
}
