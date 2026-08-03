import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import { ref } from 'vue'

import VChip from './VChip.vue'

const meta = {
  title: 'Composants/Chip',
  component: VChip,
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
    components: { VChip },
    setup: () => ({ args }),
    template: '<VChip v-bind="args">Design system</VChip>',
  }),
} satisfies Meta<typeof VChip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** `solid` neutral passe en contraste inversé (style VToast), lisible dans les deux thèmes. */
export const Variants: Story = {
  render: () => ({
    components: { VChip },
    setup: () => ({
      variants: ['tonal', 'solid', 'outline'],
      tones: ['neutral', 'accent', 'success', 'warning', 'danger'],
    }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 8px">
        <div v-for="variant in variants" :key="variant" style="display: flex; gap: 8px; flex-wrap: wrap">
          <VChip v-for="tone in tones" :key="tone" :variant="variant" :tone="tone">
            {{ variant }} {{ tone }}
          </VChip>
        </div>
      </div>
    `,
  }),
}

/** `chip` (défaut) : coins arrondis rectangulaires ; `pill` : pilule. */
export const Formes: Story = {
  render: () => ({
    components: { VChip },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <VChip shape="chip" tone="accent">VChip (défaut)</VChip>
        <VChip shape="pill" tone="accent">Pill</VChip>
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
    components: { VChip },
    setup: () => ({ selected: ref(true) }),
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <VChip color="hotpink" variant="tonal" clickable>tonal</VChip>
        <VChip color="hotpink" variant="solid" clickable>solid</VChip>
        <VChip color="hotpink" variant="outline" clickable>outline</VChip>
        <VChip color="oklch(55% 0.15 150)" variant="tonal" clickable>oklch()</VChip>
        <VChip color="rebeccapurple" selectable check v-model:selected="selected">sélectionné</VChip>
      </div>
    `,
  }),
}

/** Cliquable = vrai bouton (hover, active, focus clavier) ; statique = aucun hover. */
export const Cliquable: Story = {
  render: () => ({
    components: { VChip },
    setup: () => ({ count: ref(0) }),
    template: `
      <div style="display: flex; gap: 8px; align-items: center">
        <VChip clickable tone="accent" @click="count++">Cliqué {{ count }} fois</VChip>
        <VChip tone="accent">Statique (sans hover)</VChip>
        <VChip clickable disabled tone="accent">Désactivé</VChip>
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
    components: { VChip },
    template: `
      <div style="display: flex; gap: 8px">
        <VChip href="https://vuejs.org" target="_blank" rel="noopener" tone="accent" iconStart="open_in_new">
          vuejs.org
        </VChip>
        <VChip href="https://vuejs.org" disabled tone="accent">Lien inerte</VChip>
      </div>
    `,
  }),
}

export const Selectionnable: Story = {
  render: () => ({
    components: { VChip },
    setup: () => ({ vue: ref(true), react: ref(false), svelte: ref(false) }),
    template: `
      <div style="display: flex; gap: 8px" role="group" aria-label="Frameworks">
        <VChip selectable v-model:selected="vue" tone="accent">Vue</VChip>
        <VChip selectable v-model:selected="react" tone="accent">React</VChip>
        <VChip selectable v-model:selected="svelte" tone="accent">Svelte</VChip>
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
    components: { VChip },
    setup: () => ({ selected: ref(true) }),
    template: `
      <VChip selectable check iconStart="palette" v-model:selected="selected" tone="accent">
        Design
      </VChip>
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
    components: { VChip },
    setup: () => ({
      tones: ['neutral', 'accent', 'success', 'warning', 'danger'],
      selected: ref(true),
    }),
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <VChip v-for="tone in tones" :key="tone" :tone="tone" selectable :selected="true">
          {{ tone }}
        </VChip>
        <VChip color="hotpink" selectable :selected="true">custom</VChip>
      </div>
    `,
  }),
}

export const Supprimable: Story = {
  render: () => ({
    components: { VChip },
    setup: () => ({ tags: ref(['Vue', 'TypeScript', 'CSS']) }),
    template: `
      <div style="display: flex; gap: 8px">
        <VChip v-for="tag in tags" :key="tag" dismissible @dismiss="tags = tags.filter(t => t !== tag)">
          {{ tag }}
        </VChip>
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
    components: { VChip },
    template: `
      <div style="display: flex; gap: 8px">
        <VChip dismissible tone="accent">close (défaut)</VChip>
        <VChip dismissible dismissIcon="cancel" tone="accent">cancel</VChip>
        <VChip dismissible dismissIcon="backspace" tone="accent">backspace</VChip>
      </div>
    `,
  }),
}

/** Icônes par props (nom Material ou URL) ou slots #start/#end ; icône seule = pas de libellé. */
export const Icones: Story = {
  render: () => ({
    components: { VChip },
    template: `
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
        <VChip iconStart="palette" tone="accent">Icône début</VChip>
        <VChip iconEnd="arrow_forward" tone="accent">Icône fin</VChip>
        <VChip iconStart="favorite" iconEnd="arrow_forward" tone="accent">Les deux</VChip>
        <VChip iconStart="favorite" tone="danger" clickable aria-label="Favori" />
        <VChip tone="success">
          <template #start><span aria-hidden="true">✓</span></template>
          Slot #start
        </VChip>
      </div>
    `,
  }),
}

export const SelectionnableEtSupprimable: Story = {
  render: () => ({
    components: { VChip },
    setup: () => ({ selected: ref(true) }),
    template: `
      <VChip selectable check dismissible v-model:selected="selected" tone="accent">Filtre actif</VChip>
    `,
  }),
}

/** xs 24px (défaut) / sm 32px ; `compact` retire 4px de hauteur. */
export const Tailles: Story = {
  render: () => ({
    components: { VChip },
    template: `
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
        <VChip size="xs" dismissible>XSmall 24px</VChip>
        <VChip size="sm" dismissible>Small 32px</VChip>
        <VChip size="xs" compact dismissible>XSmall compact 20px</VChip>
        <VChip size="sm" compact dismissible>Small compact 28px</VChip>
      </div>
    `,
  }),
}

/** Désactivé : gris par tokens (plus d'opacité), lien inerte compris. */
export const Disabled: Story = {
  render: () => ({
    components: { VChip },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <VChip variant="tonal" tone="accent" disabled clickable>tonal</VChip>
        <VChip variant="solid" tone="accent" disabled clickable>solid</VChip>
        <VChip variant="outline" tone="accent" disabled clickable>outline</VChip>
        <VChip selectable :selected="true" dismissible disabled>Sélectionné</VChip>
        <VChip href="https://vuejs.org" disabled>Lien inerte</VChip>
      </div>
    `,
  }),
}
