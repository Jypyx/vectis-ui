import type { Meta, StoryObj } from '@storybook/vue3-vite'

import { storyText } from '../../stories/storyText'
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

/* Pangrams: the point is to exercise the typeface, so each language keeps its own. */
const t = storyText({
  en: {
    pangram: 'The quick brown fox jumps over the lazy dog',
    pangramShort: 'The quick brown fox jumps over',
    onInverse: 'on-inverse — on an inverted surface',
    defaultTag: 'heading-4 rendered as <h4> (default)',
    asTag: 'heading-4 rendered as <h2> (as)',
    asLabel: 'label rendered as <label> (as)',
    tooLong:
      'A deliberately over-long text for the width of its container, cut off with an ellipsis.',
    articleTitle: 'A single typographic policy',
    articleLead:
      "The typographic recipes live in the design system's semantic tokens: each variant composes family, size, weight, leading and letter spacing from the same source, in light as in dark.",
    articleBodyStart:
      "The components consume the same tokens internally — a dialog's text, a field's label or a table caption share exactly these recipes, with no local duplication. The",
    articleBodyEnd: 'role uses the system monospace stack.',
  },
  fr: {
    pangram: 'Portez ce vieux whisky au juge blond qui fume',
    pangramShort: 'Portez ce vieux whisky au juge blond',
    onInverse: 'on-inverse — sur surface inversée',
    defaultTag: 'heading-4 rendu en <h4> (défaut)',
    asTag: 'heading-4 rendu en <h2> (as)',
    asLabel: 'label rendu en <label> (as)',
    tooLong:
      'Un texte volontairement trop long pour la largeur de son conteneur, coupé net avec une ellipse.',
    articleTitle: 'Une politique typographique unique',
    articleLead:
      'Les recettes typographiques vivent dans les tokens sémantiques du design system : chaque variante compose famille, taille, graisse, interlignage et espacement de lettres depuis la même source, en light comme en dark.',
    articleBodyStart:
      "Les composants consomment les mêmes tokens en interne — le texte d'une boîte de dialogue, le libellé d'un champ ou une légende de tableau partagent exactement ces recettes, sans duplication locale. Le rôle",
    articleBodyEnd: 'utilise la pile monospace du système.',
  },
})

const meta = {
  title: 'Components/Typography',
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
    setup: () => ({ args, t }),
    template: '<VTypography v-bind="args">{{ t.pangram }}</VTypography>',
  }),
} satisfies Meta<typeof VTypography>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * The complete scale. The headings are rendered with `as="p"` here so as not to
 * distort the docs page's heading hierarchy — in a real page, leave the default
 * tag (h1…h4).
 */
export const Variants: Story = {
  render: () => ({
    components: { VTypography },
    setup: () => ({ variants: VARIANTS, t }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px">
        <div v-for="variant in variants" :key="variant" style="display: flex; align-items: baseline; gap: 16px">
          <VTypography variant="code" as="span" tone="muted" style="width: 96px; flex-shrink: 0">{{ variant }}</VTypography>
          <VTypography :variant="variant" as="p">{{ t.pangramShort }}</VTypography>
        </div>
      </div>
    `,
  }),
}

/** The semantic tones; `default` inherits the colour of the context. */
export const Tones: Story = {
  render: () => ({
    components: { VTypography },
    setup: () => ({ tones: TONES, t }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 8px">
        <template v-for="tone in tones" :key="tone">
          <div v-if="tone === 'on-inverse'" style="background: var(--vectis-color-surface-inverse); border-radius: var(--vectis-radius-surface); padding: 8px 12px; align-self: flex-start">
            <VTypography :tone="tone">{{ t.onInverse }}</VTypography>
          </div>
          <VTypography v-else :tone="tone">{{ tone }} — {{ t.pangramShort }}</VTypography>
        </template>
      </div>
    `,
  }),
}

/**
 * The rendered tag is derived from the variant (h1…h4, p, span, code) and
 * overridable through `as` — the same visual recipe can dress any element (e.g. a
 * document h2 styled as heading-4).
 */
export const Tags: Story = {
  render: () => ({
    components: { VTypography },
    setup: () => ({ t }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 8px">
        <VTypography variant="heading-4">{{ t.defaultTag }}</VTypography>
        <VTypography variant="heading-4" as="h2">{{ t.asTag }}</VTypography>
        <VTypography variant="label" as="label">{{ t.asLabel }}</VTypography>
      </div>
    `,
  }),
}

/** `truncate` cuts on a single line with an ellipsis — the width comes from the parent. */
export const Truncate: Story = {
  render: () => ({
    components: { VTypography },
    setup: () => ({ t }),
    template: `
      <div style="width: 240px; border: 1px dashed var(--vectis-color-border); border-radius: var(--vectis-radius-surface); padding: 12px">
        <VTypography truncate>{{ t.tooLong }}</VTypography>
      </div>
    `,
  }),
}

/** A long paragraph: leading and overflow-wrap in real conditions. */
export const Paragraph: Story = {
  render: () => ({
    components: { VTypography },
    setup: () => ({ t }),
    template: `
      <div style="max-width: 560px; display: flex; flex-direction: column; gap: 12px">
        <VTypography variant="heading-3" as="p">{{ t.articleTitle }}</VTypography>
        <VTypography variant="body-lg">{{ t.articleLead }}</VTypography>
        <VTypography variant="body-md" tone="muted">
          {{ t.articleBodyStart }}
          <VTypography variant="code" as="span">code</VTypography>
          {{ t.articleBodyEnd }}
        </VTypography>
      </div>
    `,
  }),
}
