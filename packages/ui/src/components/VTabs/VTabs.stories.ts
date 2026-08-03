import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import VBadge from '../VBadge/VBadge.vue'
import VTab from './VTab.vue'
import VTabPanel from './VTabPanel.vue'
import VTabs from './VTabs.vue'

/** Jeu d'onglets assez long pour déborder d'un conteneur étroit. */
const VILLES = [
  'Paris',
  'Lyon',
  'Marseille',
  'Toulouse',
  'Bordeaux',
  'Lille',
  'Nantes',
  'Strasbourg',
  'Montpellier',
  'Rennes',
  'Grenoble',
  'Toulon',
]

const meta = {
  title: 'Composants/Tabs',
  component: VTabs,
  argTypes: {
    variant: { control: 'inline-radio', options: ['flat', 'outlined', 'inset'] },
    tone: {
      control: 'inline-radio',
      options: ['accent', 'neutral', 'danger', 'success', 'warning'],
    },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    activation: { control: 'inline-radio', options: ['manual', 'automatic'] },
  },
  args: {
    variant: 'flat',
    tone: 'accent',
    size: 'md',
    compact: false,
    orientation: 'horizontal',
    align: 'start',
    grow: false,
    scrollButtons: false,
    activation: 'manual',
  },
  // v-model vivant : sans ref locale, cliquer un onglet ne changerait rien.
  render: (args) => ({
    components: { VTabs, VTab, VTabPanel },
    setup: () => ({ args, onglet: ref('apercu') }),
    template: `
      <VTabs v-bind="args" v-model="onglet">
        <VTab value="apercu" label="Aperçu" />
        <VTab value="details" label="Détails" />
        <VTab value="historique" label="Historique" />
      </VTabs>
    `,
  }),
} satisfies Meta<typeof VTabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('tab', { name: 'Aperçu' })).toHaveAttribute(
      'aria-selected',
      'true',
    )

    await userEvent.click(canvas.getByRole('tab', { name: 'Détails' }))

    await waitFor(async () => {
      await expect(canvas.getByRole('tab', { name: 'Détails' })).toHaveAttribute(
        'aria-selected',
        'true',
      )
    })
  },
}

/** Les trois habillages : `flat` (défaut), `outlined` (carte) et `inset` (piste creuse). */
export const Variantes: Story = {
  render: () => ({
    components: { VTabs, VTab, VTabPanel },
    setup: () => ({
      variants: ['flat', 'outlined', 'inset'],
      onglets: ref({ flat: 'a', outlined: 'a', inset: 'a', seule: 'a' }),
    }),
    /*
     * Les panneaux sont rendus : c'est le composant ENTIER que `outlined`
     * enferme dans une carte, et la piste de la barre y devient le filet qui les
     * sépare. Aucun padding n'est posé sur les panneaux — c'est la gouttière du
     * cadre qui les écarte en `outlined`, là où `flat` et `inset` les laissent à
     * fleur, à la charge du consommateur. La dernière barre est le cas limite
     * `outlined` sans slot #panels : plus rien à séparer, la piste s'efface.
     */
    template: `
      <div style="display: grid; gap: 32px; width: 480px">
        <VTabs v-for="v in variants" :key="v" :variant="v" v-model="onglets[v]">
          <VTab value="a" label="Aperçu" />
          <VTab value="b" label="Détails" />
          <VTab value="c" label="Historique" />
          <template #panels>
            <VTabPanel value="a">Panneau « Aperçu » — variante {{ v }}.</VTabPanel>
            <VTabPanel value="b">Panneau « Détails ».</VTabPanel>
            <VTabPanel value="c">Panneau « Historique ».</VTabPanel>
          </template>
        </VTabs>

        <VTabs variant="outlined" v-model="onglets.seule">
          <VTab value="a" label="Aperçu" />
          <VTab value="b" label="Détails" />
          <VTab value="c" label="Historique" />
        </VTabs>
      </div>
    `,
  }),
}

export const Tones: Story = {
  render: () => ({
    components: { VTabs, VTab },
    setup: () => ({
      tones: ['accent', 'neutral', 'success', 'warning', 'danger'],
      // `outlined` rend les tones à l'identique de `flat` (le cadre est agnostique
      // du tone) : l'ajouter ne ferait que doubler la planche.
      variants: ['flat', 'inset'],
      onglet: ref('b'),
    }),
    template: `
      <div style="display: grid; gap: 32px">
        <div v-for="v in variants" :key="v" style="display: grid; gap: 16px">
          <VTabs v-for="t in tones" :key="t" :variant="v" :tone="t" v-model="onglet">
            <VTab value="a" label="Aperçu" />
            <VTab value="b" label="Détails" />
            <VTab value="c" label="Historique" />
          </VTabs>
        </div>
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { VTabs, VTab },
    setup: () => ({ sizes: ['xs', 'sm', 'md', 'lg', 'xl'], onglet: ref('a') }),
    template: `
      <div style="display: grid; gap: 24px">
        <VTabs v-for="s in sizes" :key="s" :size="s" variant="inset" v-model="onglet">
          <VTab value="a" label="Aperçu" />
          <VTab value="b" label="Détails" icon="tune" />
          <VTab value="c" icon="more_horiz" aria-label="Plus" />
        </VTabs>
      </div>
    `,
  }),
}

export const Compact: Story = {
  render: () => ({
    components: { VTabs, VTab },
    setup: () => ({ normal: ref('a'), compact: ref('a') }),
    // compact = -4px de hauteur ; padding, typo et icônes inchangés
    template: `
      <div style="display: grid; gap: 24px">
        <VTabs variant="inset" v-model="normal">
          <VTab value="a" label="Aperçu" />
          <VTab value="b" label="Détails" />
        </VTabs>
        <VTabs variant="inset" compact v-model="compact">
          <VTab value="a" label="Aperçu" />
          <VTab value="b" label="Détails" />
        </VTabs>
      </div>
    `,
  }),
}

export const ContenuOnglet: Story = {
  render: () => ({
    components: { VTabs, VTab, VBadge },
    setup: () => ({ onglet: ref('texte') }),
    template: `
      <VTabs v-model="onglet">
        <VTab value="texte" label="Texte seul" />
        <VTab value="icone" label="Texte et icône" icon="tune" />
        <VTab value="seule" icon="settings" aria-label="Réglages" />
        <VTab value="slot">
          <VBadge :count="3">Messages</VBadge>
        </VTab>
      </VTabs>
    `,
  }),
}

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => ({
    components: { VTabs, VTab, VTabPanel },
    setup: () => ({ args, onglet: ref('apercu'), encadre: ref('apercu') }),
    /*
     * L'indicateur reste au bord de départ dans les deux habillages. La PISTE,
     * elle, migre : à plat elle délimite la colonne d'onglets (bord de départ) ;
     * encadrée, ce bord est déjà tenu par la bordure de la carte et le filet
     * passe au bord opposé, où il sépare enfin les onglets de leur contenu.
     */
    template: `
      <div style="display: grid; grid-auto-flow: column; gap: 32px; justify-content: start">
        <VTabs v-bind="args" orientation="vertical" v-model="onglet" style="min-height: 220px">
          <VTab value="apercu" label="Aperçu" icon="dashboard" />
          <VTab value="details" label="Détails" icon="tune" />
          <VTab value="historique" label="Historique" icon="history" />
          <template #panels>
            <VTabPanel value="apercu" style="padding: 16px">Panneau « Aperçu »</VTabPanel>
            <VTabPanel value="details" style="padding: 16px">Panneau « Détails »</VTabPanel>
            <VTabPanel value="historique" style="padding: 16px">Panneau « Historique »</VTabPanel>
          </template>
        </VTabs>

        <VTabs variant="outlined" orientation="vertical" v-model="encadre" style="min-height: 220px">
          <VTab value="apercu" label="Aperçu" icon="dashboard" />
          <VTab value="details" label="Détails" icon="tune" />
          <VTab value="historique" label="Historique" icon="history" />
          <template #panels>
            <VTabPanel value="apercu">Panneau « Aperçu »</VTabPanel>
            <VTabPanel value="details">Panneau « Détails »</VTabPanel>
            <VTabPanel value="historique">Panneau « Historique »</VTabPanel>
          </template>
        </VTabs>
      </div>
    `,
  }),
}

export const Alignement: Story = {
  render: () => ({
    components: { VTabs, VTab },
    setup: () => ({
      aligns: ['start', 'center', 'end'],
      horizontal: ref('a'),
      vertical: ref('a'),
    }),
    /*
     * En vertical, `align` joue sur l'axe block : il n'a d'effet que si la
     * barre reçoit une hauteur — d'où le `height` posé sur chaque exemple.
     */
    template: `
      <div style="display: grid; gap: 24px">
        <VTabs v-for="a in aligns" :key="a" :align="a" variant="inset" v-model="horizontal">
          <VTab value="a" label="Aperçu" />
          <VTab value="b" label="Détails" />
          <VTab value="c" label="Historique" />
        </VTabs>

        <div style="display: grid; grid-auto-flow: column; gap: 24px; justify-content: start">
          <VTabs
            v-for="a in aligns"
            :key="a"
            :align="a"
            orientation="vertical"
            variant="inset"
            v-model="vertical"
            style="height: 240px"
          >
            <VTab value="a" label="Aperçu" />
            <VTab value="b" label="Détails" />
            <VTab value="c" label="Historique" />
          </VTabs>
        </div>
      </div>
    `,
  }),
}

export const Grow: Story = {
  args: { grow: true },
  render: (args) => ({
    components: { VTabs, VTab },
    setup: () => ({ args, onglet: ref('a') }),
    template: `
      <VTabs v-bind="args" grow v-model="onglet">
        <VTab value="a" label="Aperçu" />
        <VTab value="b" label="Détails" />
        <VTab value="c" label="Historique très long qui doit être tronqué" />
      </VTabs>
    `,
  }),
}

export const Desactive: Story = {
  render: () => ({
    components: { VTabs, VTab },
    setup: () => ({ onglet: ref('a') }),
    // l'onglet inerte est un <button disabled> : gris par tokens, sauté par les flèches
    template: `
      <VTabs v-model="onglet">
        <VTab value="a" label="Aperçu" />
        <VTab value="b" label="Détails" disabled />
        <VTab value="c" label="Historique" />
      </VTabs>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('tab', { name: 'Détails' })).toBeDisabled()

    canvas.getByRole('tab', { name: 'Aperçu' }).focus()
    await userEvent.keyboard('{ArrowRight}')

    await waitFor(async () => {
      await expect(canvas.getByRole('tab', { name: 'Historique' })).toHaveFocus()
    })
  },
}

export const Panneaux: Story = {
  render: () => ({
    components: { VTabs, VTab, VTabPanel },
    setup: () => ({ onglet: ref('apercu') }),
    template: `
      <VTabs v-model="onglet">
        <VTab value="apercu" label="Aperçu" />
        <VTab value="details" label="Détails" />
        <VTab value="historique" label="Historique" />
        <template #panels>
          <VTabPanel value="apercu" style="padding: 16px 0">
            Le panneau actif est le seul visible ; les autres portent l'attribut natif
            <code>hidden</code> et gardent leur état.
          </VTabPanel>
          <VTabPanel value="details" style="padding: 16px 0">
            <label>Une saisie conservée d'un onglet à l'autre : <input type="text" /></label>
          </VTabPanel>
          <VTabPanel value="historique" style="padding: 16px 0" lazy>
            Ce panneau est <code>lazy</code> : son contenu n'a été monté qu'à son premier affichage.
          </VTabPanel>
        </template>
      </VTabs>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('tab', { name: 'Détails' }))

    await waitFor(async () => {
      await expect(canvas.getByRole('tabpanel')).toHaveAttribute(
        'aria-labelledby',
        canvas.getByRole('tab', { name: 'Détails' }).id,
      )
    })
  },
}

export const Defilement: Story = {
  render: () => ({
    components: { VTabs, VTab },
    setup: () => ({ villes: VILLES, onglet: ref('Paris') }),
    // le conteneur est volontairement étroit : la liste défile au doigt, au
    // trackpad et au clavier, sans barre de défilement visible
    template: `
      <div style="max-width: 420px; border: 1px dashed var(--vectis-color-border); padding: 8px">
        <VTabs v-model="onglet">
          <VTab v-for="v in villes" :key="v" :value="v" :label="v" />
        </VTabs>
      </div>
    `,
  }),
}

export const BoutonsDefilement: Story = {
  render: () => ({
    components: { VTabs, VTab },
    setup: () => ({ villes: VILLES, onglet: ref('Paris') }),
    template: `
      <div style="max-width: 420px; border: 1px dashed var(--vectis-color-border); padding: 8px">
        <VTabs scroll-buttons variant="inset" v-model="onglet">
          <VTab v-for="v in villes" :key="v" :value="v" :label="v" />
        </VTabs>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const suivants = canvas.getByRole('button', { name: 'Onglets suivants' })

    // en butée de départ, seul le contrôle aval est actif
    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name: 'Onglets précédents' })).toBeDisabled()
      await expect(suivants).toBeEnabled()
    })

    await userEvent.click(suivants)

    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name: 'Onglets précédents' })).toBeEnabled()
    })
  },
}

export const FlechesPersonnalisees: Story = {
  render: () => ({
    components: { VTabs, VTab },
    setup: () => ({ villes: VILLES, horizontal: ref('Paris'), vertical: ref('Paris') }),
    /*
     * `prevIcon`/`nextIcon` acceptent un nom Material Symbols ou une URL
     * d'image, et `prevLabel`/`nextLabel` fournissent le nom accessible. Les
     * défauts suivent l'orientation (chevrons en horizontal, expand_less /
     * expand_more en vertical) ; ici on les remplace dans les deux axes.
     */
    template: `
      <div style="display: grid; gap: 24px; max-width: 420px">
        <!-- min-width: 0 : un item de grid ne descend pas sous son min-content
             (min-width: auto), la liste d'onglets ne déborderait jamais -->
        <div style="min-width: 0; border: 1px dashed var(--vectis-color-border); padding: 8px">
          <VTabs
            scroll-buttons
            prev-icon="keyboard_double_arrow_left"
            next-icon="keyboard_double_arrow_right"
            prev-label="Voir les onglets précédents"
            next-label="Voir les onglets suivants"
            v-model="horizontal"
          >
            <VTab v-for="v in villes" :key="v" :value="v" :label="v" />
          </VTabs>
        </div>

        <div style="min-width: 0; border: 1px dashed var(--vectis-color-border); padding: 8px">
          <VTabs
            orientation="vertical"
            variant="inset"
            scroll-buttons
            prev-icon="arrow_drop_up"
            next-icon="arrow_drop_down"
            prev-label="Onglets au-dessus"
            next-label="Onglets en dessous"
            v-model="vertical"
            style="height: 180px"
          >
            <VTab v-for="v in villes" :key="v" :value="v" :label="v" />
          </VTabs>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const suivants = canvas.getByRole('button', { name: 'Voir les onglets suivants' })

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', { name: 'Voir les onglets précédents' }),
      ).toBeDisabled()
      await expect(suivants).toBeEnabled()
    })

    await userEvent.click(suivants)

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', { name: 'Voir les onglets précédents' }),
      ).toBeEnabled()
    })
  },
}

export const CasLimites: Story = {
  render: () => ({
    components: { VTabs, VTab },
    setup: () => ({ unique: ref('a'), longs: ref('a'), inconnu: ref('zzz') }),
    template: `
      <div style="display: grid; gap: 24px">
        <VTabs v-model="unique"><VTab value="a" label="Onglet unique" /></VTabs>

        <VTabs variant="inset" v-model="longs">
          <VTab value="a" label="Un libellé d'onglet particulièrement long" />
          <VTab value="b" label="Un autre libellé tout aussi interminable" />
        </VTabs>

        <!-- valeur hors liste : aucun onglet actif, la barre sort de la tabulation -->
        <VTabs v-model="inconnu">
          <VTab value="a" label="Aperçu" />
          <VTab value="b" label="Détails" />
        </VTabs>
      </div>
    `,
  }),
}
