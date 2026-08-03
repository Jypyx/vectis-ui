import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import { ref } from 'vue'

import Chip from './VChip.vue'

const meta = {
  title: 'Composants/Chip',
  component: Chip,
  argTypes: {
    variant: { control: 'select', options: ['tonal', 'solid', 'outline'] },
    tone: { control: 'select', options: ['neutral', 'accent', 'danger', 'success', 'warning'] },
    color: { control: 'color' },
    shape: { control: 'select', options: ['chip', 'pill'] },
    size: { control: 'select', options: ['xs', 'sm'] },
    compact: { control: 'boolean' },
    clickable: { control: 'boolean' },
    check: { control: 'boolean' },
    dismissIcon: { control: 'text' },
  },
  args: {
    variant: 'tonal',
    tone: 'neutral',
    shape: 'chip',
    size: 'xs',
    compact: false,
    clickable: false,
    check: false,
  },
  render: (args) => ({
    components: { Chip },
    setup: () => ({ args }),
    template: '<Chip v-bind="args">Design system</Chip>',
  }),
} satisfies Meta<typeof Chip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** `solid` neutral passe en contraste inversé (style Toast), lisible dans les deux thèmes. */
export const Variants: Story = {
  render: () => ({
    components: { Chip },
    setup: () => ({
      variants: ['tonal', 'solid', 'outline'],
      tones: ['neutral', 'accent', 'success', 'warning', 'danger'],
    }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 8px">
        <div v-for="variant in variants" :key="variant" style="display: flex; gap: 8px; flex-wrap: wrap">
          <Chip v-for="tone in tones" :key="tone" :variant="variant" :tone="tone">
            {{ variant }} {{ tone }}
          </Chip>
        </div>
      </div>
    `,
  }),
}

/** `chip` (défaut) : coins arrondis rectangulaires ; `pill` : pilule. */
export const Formes: Story = {
  render: () => ({
    components: { Chip },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <Chip shape="chip" tone="accent">Chip (défaut)</Chip>
        <Chip shape="pill" tone="accent">Pill</Chip>
      </div>
    `,
  }),
}

/**
 * `color` (hex, nom CSS ou oklch()) remplace le tone : toutes les nuances sont
 * dérivées par color-mix avec les tokens de thème et s'adaptent light/dark.
 * En `solid`, le texte est blanc : le contraste avec une couleur claire est à
 * la charge du consommateur.
 */
export const CouleurCustom: Story = {
  render: () => ({
    components: { Chip },
    setup: () => ({ selected: ref(true) }),
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <Chip color="hotpink" variant="tonal" clickable>tonal</Chip>
        <Chip color="hotpink" variant="solid" clickable>solid</Chip>
        <Chip color="hotpink" variant="outline" clickable>outline</Chip>
        <Chip color="oklch(55% 0.15 150)" variant="tonal" clickable>oklch()</Chip>
        <Chip color="rebeccapurple" selectable check v-model:selected="selected">sélectionné</Chip>
      </div>
    `,
  }),
}

/** Cliquable = vrai bouton (hover, active, focus clavier) ; statique = aucun hover. */
export const Cliquable: Story = {
  render: () => ({
    components: { Chip },
    setup: () => ({ count: ref(0) }),
    template: `
      <div style="display: flex; gap: 8px; align-items: center">
        <Chip clickable tone="accent" @click="count++">Cliqué {{ count }} fois</Chip>
        <Chip tone="accent">Statique (sans hover)</Chip>
        <Chip clickable disabled tone="accent">Désactivé</Chip>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /Cliqué/ }))
    await expect(canvas.getByText('Cliqué 1 fois')).toBeVisible()
  },
}

/** `href` rend un lien ; disabled → lien inerte (href retiré + aria-disabled). */
export const Lien: Story = {
  render: () => ({
    components: { Chip },
    template: `
      <div style="display: flex; gap: 8px">
        <Chip href="https://vuejs.org" target="_blank" rel="noopener" tone="accent" iconStart="open_in_new">
          vuejs.org
        </Chip>
        <Chip href="https://vuejs.org" disabled tone="accent">Lien inerte</Chip>
      </div>
    `,
  }),
}

export const Selectionnable: Story = {
  render: () => ({
    components: { Chip },
    setup: () => ({ vue: ref(true), react: ref(false), svelte: ref(false) }),
    template: `
      <div style="display: flex; gap: 8px" role="group" aria-label="Frameworks">
        <Chip selectable v-model:selected="vue" tone="accent">Vue</Chip>
        <Chip selectable v-model:selected="react" tone="accent">React</Chip>
        <Chip selectable v-model:selected="svelte" tone="accent">Svelte</Chip>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const react = canvas.getByRole('button', { name: 'React' })
    await expect(react).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(react)
    await expect(react).toHaveAttribute('aria-pressed', 'true')
  },
}

/** `check` affiche une coche quand sélectionné, à la place d'`iconStart`. */
export const SelectionnableAvecCheck: Story = {
  render: () => ({
    components: { Chip },
    setup: () => ({ selected: ref(true) }),
    template: `
      <Chip selectable check iconStart="palette" v-model:selected="selected" tone="accent">
        Design
      </Chip>
    `,
  }),
  play: async ({ canvasElement }) => {
    // `data-icon` nomme l'icône quelle que soit sa source — la coche vient du
    // registre intégré (SVG), `palette` de la police du consommateur (ligature).
    const icone = (nom: string) => canvasElement.querySelector(`.v-icon[data-icon='${nom}']`)
    await expect(icone('check')).toBeVisible()
    await expect(icone('palette')).toBeNull()
    await userEvent.click(within(canvasElement).getByRole('button'))
    await expect(icone('check')).toBeNull()
    await expect(icone('palette')).toBeVisible()
  },
}

/** Sélectionné = rendu solid du tone (ou de la couleur custom) courant. */
export const SelectionParTone: Story = {
  render: () => ({
    components: { Chip },
    setup: () => ({
      tones: ['neutral', 'accent', 'success', 'warning', 'danger'],
      selected: ref(true),
    }),
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <Chip v-for="tone in tones" :key="tone" :tone="tone" selectable :selected="true">
          {{ tone }}
        </Chip>
        <Chip color="hotpink" selectable :selected="true">custom</Chip>
      </div>
    `,
  }),
}

export const Supprimable: Story = {
  render: () => ({
    components: { Chip },
    setup: () => ({ tags: ref(['Vue', 'TypeScript', 'CSS']) }),
    template: `
      <div style="display: flex; gap: 8px">
        <Chip v-for="tag in tags" :key="tag" dismissible @dismiss="tags = tags.filter(t => t !== tag)">
          {{ tag }}
        </Chip>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getAllByRole('button', { name: 'Retirer' })[1]!)
    await expect(canvas.queryByText('TypeScript')).toBeNull()
  },
}

/** `dismissIcon` : nom Material Symbols ou URL d'image. */
export const IconeDeRetraitCustom: Story = {
  render: () => ({
    components: { Chip },
    template: `
      <div style="display: flex; gap: 8px">
        <Chip dismissible tone="accent">close (défaut)</Chip>
        <Chip dismissible dismissIcon="cancel" tone="accent">cancel</Chip>
        <Chip dismissible dismissIcon="backspace" tone="accent">backspace</Chip>
      </div>
    `,
  }),
}

/** Icônes par props (nom Material ou URL) ou slots #start/#end ; icône seule = pas de libellé. */
export const Icones: Story = {
  render: () => ({
    components: { Chip },
    template: `
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
        <Chip iconStart="palette" tone="accent">Icône début</Chip>
        <Chip iconEnd="arrow_forward" tone="accent">Icône fin</Chip>
        <Chip iconStart="favorite" iconEnd="arrow_forward" tone="accent">Les deux</Chip>
        <Chip iconStart="favorite" tone="danger" clickable aria-label="Favori" />
        <Chip tone="success">
          <template #start><span aria-hidden="true">✓</span></template>
          Slot #start
        </Chip>
      </div>
    `,
  }),
}

export const SelectionnableEtSupprimable: Story = {
  render: () => ({
    components: { Chip },
    setup: () => ({ selected: ref(true) }),
    template: `
      <Chip selectable check dismissible v-model:selected="selected" tone="accent">Filtre actif</Chip>
    `,
  }),
}

/** xs 24px (défaut) / sm 32px ; `compact` retire 4px de hauteur. */
export const Tailles: Story = {
  render: () => ({
    components: { Chip },
    template: `
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
        <Chip size="xs" dismissible>XSmall 24px</Chip>
        <Chip size="sm" dismissible>Small 32px</Chip>
        <Chip size="xs" compact dismissible>XSmall compact 20px</Chip>
        <Chip size="sm" compact dismissible>Small compact 28px</Chip>
      </div>
    `,
  }),
}

/** Désactivé : gris par tokens (plus d'opacité), lien inerte compris. */
export const Disabled: Story = {
  render: () => ({
    components: { Chip },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <Chip variant="tonal" tone="accent" disabled clickable>tonal</Chip>
        <Chip variant="solid" tone="accent" disabled clickable>solid</Chip>
        <Chip variant="outline" tone="accent" disabled clickable>outline</Chip>
        <Chip selectable :selected="true" dismissible disabled>Sélectionné</Chip>
        <Chip href="https://vuejs.org" disabled>Lien inerte</Chip>
      </div>
    `,
  }),
}
