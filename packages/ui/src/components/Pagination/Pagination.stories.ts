import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import Pagination from './Pagination.vue'

const meta = {
  title: 'Composants/Pagination',
  component: Pagination,
  argTypes: {
    variant: { control: 'inline-radio', options: ['ghost', 'outline'] },
    tone: {
      control: 'inline-radio',
      options: ['accent', 'neutral', 'danger', 'success', 'warning'],
    },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    controlsDisplay: { control: 'inline-radio', options: ['icon', 'text', 'both'] },
  },
  args: {
    count: 20,
    siblingCount: 1,
    boundaryCount: 1,
    attached: false,
    variant: 'ghost',
    tone: 'accent',
    size: 'md',
    compact: false,
    align: 'start',
    showControls: true,
    controlsDisplay: 'icon',
    disabled: false,
    responsive: true,
  },
  // v-model vivant : sans ref locale, cliquer une page ne changerait rien.
  render: (args) => ({
    components: { Pagination },
    setup: () => ({ args, page: ref(10) }),
    template: `<Pagination v-bind="args" v-model="page" />`,
  }),
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: 'Page 10' })).toHaveAttribute(
      'aria-current',
      'page',
    )

    await userEvent.click(canvas.getByRole('button', { name: 'Page suivante' }))

    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name: 'Page 11' })).toHaveAttribute(
        'aria-current',
        'page',
      )
    })
  },
}

export const Attached: Story = {
  args: { attached: true, variant: 'outline' },
}

export const Variants: Story = {
  render: () => ({
    components: { Pagination },
    setup: () => ({ ghost: ref(6), outline: ref(6) }),
    // La page active est toujours `solid` : seules les pages inactives suivent la variante.
    template: `
      <div style="display: grid; gap: 16px">
        <Pagination :count="12" variant="ghost" v-model="ghost" />
        <Pagination :count="12" variant="outline" v-model="outline" />
      </div>
    `,
  }),
}

export const Tones: Story = {
  render: () => ({
    components: { Pagination },
    setup: () => ({ tones: ['accent', 'neutral', 'success', 'warning', 'danger'], page: ref(3) }),
    template: `
      <div style="display: grid; gap: 16px">
        <Pagination v-for="t in tones" :key="t" :count="8" :tone="t" v-model="page" />
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { Pagination },
    setup: () => ({ sizes: ['xs', 'sm', 'md', 'lg', 'xl'], page: ref(3) }),
    template: `
      <div style="display: grid; gap: 16px">
        <Pagination v-for="s in sizes" :key="s" :count="8" :size="s" v-model="page" />
      </div>
    `,
  }),
}

export const Compact: Story = {
  render: () => ({
    components: { Pagination },
    setup: () => ({ normal: ref(3), compact: ref(3) }),
    template: `
      <div style="display: grid; gap: 16px">
        <Pagination :count="8" v-model="normal" />
        <Pagination :count="8" compact v-model="compact" />
      </div>
    `,
  }),
}

export const Controles: Story = {
  render: () => ({
    components: { Pagination },
    setup: () => ({ a: ref(4), b: ref(4), c: ref(4), d: ref(4), e: ref(4) }),
    // Icônes personnalisées : nom Material Symbols OU URL d'image.
    template: `
      <div style="display: grid; gap: 16px">
        <Pagination :count="10" controls-display="icon" v-model="a" />
        <Pagination :count="10" controls-display="text" v-model="b" />
        <Pagination :count="10" controls-display="both" v-model="c" />
        <Pagination
          :count="10"
          controls-display="both"
          prev-icon="first_page"
          next-icon="last_page"
          prev-label="Reculer"
          next-label="Avancer"
          v-model="d"
        />
        <Pagination :count="10" :show-controls="false" v-model="e" />
      </div>
    `,
  }),
}

export const PagesDesactivees: Story = {
  render: () => ({
    components: { Pagination },
    setup: () => ({ liste: ref(5), predicat: ref(5) }),
    // Les contrôles enjambent les pages désactivées jusqu'à la plus proche activable.
    template: `
      <div style="display: grid; gap: 16px">
        <Pagination :count="12" :boundary-count="2" :sibling-count="2" :disabled-pages="[4, 6]" v-model="liste" />
        <Pagination :count="12" :boundary-count="2" :sibling-count="2" :disabled-pages="(p) => p % 2 === 0" v-model="predicat" />
      </div>
    `,
  }),
}

export const Responsive: Story = {
  render: () => ({
    components: { Pagination },
    setup: () => ({ large: ref(10), moyen: ref(10), etroit: ref(10) }),
    // La nav est son propre conteneur de requête : la troncature suit la largeur
    // du décor, pas celle du viewport. Redimensionner le panneau les fait tomber
    // par paliers — la première, la dernière et la page courante restent toujours.
    template: `
      <div style="display: grid; gap: 16px">
        <!-- ~39rem : la fenêtre complète tient (1 … 8 9 10 11 12 … 40) -->
        <div style="width: 640px; border: 1px dashed var(--ds-color-border); padding: 8px">
          <Pagination :count="40" :sibling-count="2" v-model="large" />
        </div>
        <!-- ~29rem : les voisines à distance 2 tombent (1 … 9 10 11 … 40) -->
        <div style="width: 480px; border: 1px dashed var(--ds-color-border); padding: 8px">
          <Pagination :count="40" :sibling-count="2" v-model="moyen" />
        </div>
        <!-- ~19rem : il ne reste que la première, la courante et la dernière -->
        <div style="width: 320px; border: 1px dashed var(--ds-color-border); padding: 8px">
          <Pagination :count="40" :sibling-count="2" v-model="etroit" />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const visiblePages = (nav: Element) =>
      [...nav.querySelectorAll<HTMLElement>('.ds-pagination-page')]
        .filter((el) => getComputedStyle(el).display !== 'none')
        .map((el) => el.textContent?.trim())
    const [wide, medium, narrow] = canvasElement.querySelectorAll('.ds-pagination')

    await expect(visiblePages(wide!)).toEqual(['1', '8', '9', '10', '11', '12', '40'])
    await expect(visiblePages(medium!)).toEqual(['1', '9', '10', '11', '40'])
    // ne restent que la première, la courante et la dernière
    await expect(visiblePages(narrow!)).toEqual(['1', '10', '40'])
  },
}

export const Alignement: Story = {
  render: () => ({
    components: { Pagination },
    setup: () => ({ aligns: ['start', 'center', 'end'], page: ref(3) }),
    // La nav occupe toute la largeur disponible (contrainte de container-type) :
    // l'alignement passe donc par la prop `align`.
    template: `
      <div style="display: grid; gap: 16px; border: 1px dashed var(--ds-color-border); padding: 8px">
        <Pagination v-for="a in aligns" :key="a" :count="8" :align="a" v-model="page" />
      </div>
    `,
  }),
}

export const BeaucoupDePages: Story = {
  args: { count: 120, siblingCount: 2, boundaryCount: 2 },
  render: (args) => ({
    components: { Pagination },
    setup: () => ({ args, page: ref(60) }),
    template: `<Pagination v-bind="args" v-model="page" />`,
  }),
}

export const CasLimites: Story = {
  render: () => ({
    components: { Pagination },
    setup: () => ({ une: ref(1), deux: ref(1), longs: ref(9999) }),
    template: `
      <div style="display: grid; gap: 16px">
        <!-- Page unique : les deux contrôles sont en butée. -->
        <Pagination :count="1" v-model="une" />
        <Pagination :count="2" v-model="deux" />
        <!-- Numéros à 4 chiffres : les pastilles s'élargissent au-delà du carré. -->
        <Pagination :count="12000" v-model="longs" />
        <!-- Troncature responsive désactivée : la rangée déborde plutôt que de se réduire. -->
        <Pagination :count="12000" :responsive="false" v-model="longs" />
      </div>
    `,
  }),
}
