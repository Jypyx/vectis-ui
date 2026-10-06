import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import photoCoast from '../../stories/photos/coast.svg'
import photoForest from '../../stories/photos/forest.svg'
import photoSunset from '../../stories/photos/sunset.svg'
import VButton from '../VButton/VButton.vue'
import VChip from '../VChip/VChip.vue'
import VCard from './VCard.vue'

const t = storyText({
  en: {
    title: 'Coastal trail',
    subtitle: '12 km · 4 hours',
    body: 'A cliff path above the sea, with two beaches to stop at and a lighthouse at the end.',
    forest: 'Forest loop',
    forestBody: 'A shaded walk under old oaks, suitable for children.',
    sunset: 'Sunset ridge',
    sunsetBody: 'A short climb to a viewpoint facing west.',
    book: 'Book a guide',
    save: 'Save',
    coastAlt: 'Waves breaking below a cliff',
    forestAlt: 'Tall trees in a forest',
    sunsetAlt: 'A sun setting behind hills',
    loading: 'Loading the trail',
    toggle: 'Toggle loading',
    easy: 'Easy',
  },
  fr: {
    title: 'Sentier côtier',
    subtitle: '12 km · 4 heures',
    body: 'Un chemin en falaise au-dessus de la mer, avec deux plages où s’arrêter et un phare au bout.',
    forest: 'Boucle forestière',
    forestBody: 'Une promenade ombragée sous de vieux chênes, adaptée aux enfants.',
    sunset: 'Crête du couchant',
    sunsetBody: 'Une courte montée vers un point de vue tourné vers l’ouest.',
    book: 'Réserver un guide',
    save: 'Enregistrer',
    coastAlt: 'Des vagues qui se brisent au pied d’une falaise',
    forestAlt: 'De grands arbres dans une forêt',
    sunsetAlt: 'Un soleil qui se couche derrière des collines',
    loading: 'Chargement du sentier',
    toggle: 'Basculer le chargement',
    easy: 'Facile',
  },
})

const meta = {
  title: 'Components/Card',
  component: VCard,
  argTypes: {
    variant: { control: 'inline-radio', options: ['flat', 'outline', 'elevated', 'filled'] },
    orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    title: { control: 'text' },
    subtitle: { control: 'text' },
    headingLevel: { control: 'select', options: [undefined, 1, 2, 3, 4, 5, 6] },
    href: { control: 'text' },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    loadingText: { control: 'text' },
    as: { control: 'text' },
  },
  args: {
    variant: 'outline',
    orientation: 'vertical',
    size: 'md',
    title: 'Coastal trail',
    subtitle: '12 km · 4 hours',
    disabled: false,
    loading: false,
    as: 'div',
  },
  render: (args) => ({
    components: { VButton, VCard },
    setup: () => ({ args, t, photoCoast }),
    template: `
      <VCard v-bind="args" style="max-width: 360px">
        <template #media><img :src="photoCoast" :alt="t.coastAlt" style="aspect-ratio: 16 / 9" /></template>
        {{ t.body }}
        <template #footer><VButton size="sm">{{ t.book }}</VButton></template>
      </VCard>
    `,
  }),
} satisfies Meta<typeof VCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** The four variants, as they sit on the page surface. */
export const Variants: Story = {
  render: () => ({
    components: { VCard },
    setup: () => ({ t, variants: ['flat', 'outline', 'elevated', 'filled'] }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 240px)); gap: 16px">
        <VCard v-for="variant in variants" :key="variant" :variant="variant" :title="variant">
          {{ t.forestBody }}
        </VCard>
      </div>
    `,
  }),
}

/** `size` sets the padding and the gaps between the parts. */
export const Sizes: Story = {
  render: () => ({
    components: { VCard },
    setup: () => ({ t, sizes: ['sm', 'md', 'lg'] }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 240px)); gap: 16px; align-items: start">
        <VCard v-for="size in sizes" :key="size" :size="size" :title="size" :subtitle="t.subtitle">
          {{ t.forestBody }}
        </VCard>
      </div>
    `,
  }),
}

/**
 * `horizontal` places the media at the start. Below the width of both parts side by side, the
 * media moves back above the content: compare the two widths.
 */
export const Horizontal: Story = {
  render: () => ({
    components: { VButton, VCard },
    setup: () => ({ t, photoCoast }),
    template: `
      <div style="display: grid; gap: 16px">
        <VCard v-for="width in [640, 360]" :key="width" orientation="horizontal" :title="t.title" :subtitle="t.subtitle" :style="{ maxWidth: width + 'px' }">
          <template #media><img :src="photoCoast" :alt="t.coastAlt" /></template>
          {{ t.body }}
          <template #footer><VButton size="sm">{{ t.book }}</VButton></template>
        </VCard>
      </div>
    `,
  }),
}

/**
 * Cards stretched to the height of their row push their footers to the bottom, so that the
 * actions line up. Each one is a link with a heading; the buttons stay separate targets.
 */
export const LinkedGrid: Story = {
  render: () => ({
    components: { VButton, VCard },
    setup: () => ({
      t,
      saved: ref<string[]>([]),
      cards: [
        { id: 'coast', photo: photoCoast },
        { id: 'forest', photo: photoForest },
        { id: 'sunset', photo: photoSunset },
      ],
    }),
    template: `
      <ul style="display: grid; grid-template-columns: repeat(3, minmax(0, 240px)); gap: 16px; padding: 0; list-style: none">
        <VCard
          v-for="card in cards"
          :key="card.id"
          as="li"
          variant="elevated"
          :heading-level="3"
          :href="'#' + card.id"
          :title="{ coast: t.title, forest: t.forest, sunset: t.sunset }[card.id]"
        >
          <template #media>
            <img :src="card.photo" :alt="t[card.id + 'Alt']" style="aspect-ratio: 4 / 3" />
          </template>
          {{ { coast: t.body, forest: t.forestBody, sunset: t.sunsetBody }[card.id] }}
          <template #footer>
            <VButton
              size="sm"
              variant="outline"
              tone="neutral"
              :aria-pressed="saved.includes(card.id)"
              @click="saved = saved.includes(card.id) ? saved.filter((id) => id !== card.id) : [...saved, card.id]"
            >{{ t.save }}</VButton>
          </template>
        </VCard>
      </ul>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const link = canvas.getByRole('link', { name: 'Coastal trail' })
    await expect(link).toHaveAttribute('href', '#coast')
    await expect(canvas.getByRole('heading', { level: 3, name: 'Coastal trail' })).toBeVisible()

    // The button sits above the stretched link: clicking it toggles it instead of following
    // the link.
    const [save] = canvas.getAllByRole('button', { name: 'Save' })
    await userEvent.click(save!)
    await waitFor(() => expect(save).toHaveAttribute('aria-pressed', 'true'))

    // A click anywhere else on the card lands on the link's stretched area.
    const card = link.closest('.v-card') as HTMLElement
    const box = card.getBoundingClientRect()
    const target = document.elementFromPoint(box.left + 10, box.top + 10)
    await expect(target).toBe(link)
  },
}

/** A disabled linked card loses its address; its title and media are dimmed. */
export const Disabled: Story = {
  render: () => ({
    components: { VCard },
    setup: () => ({ t }),
    template: `
      <VCard href="#coast" disabled :title="t.title" :subtitle="t.subtitle" style="max-width: 320px">
        {{ t.body }}
      </VCard>
    `,
  }),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Coastal trail' })
    await expect(link).not.toHaveAttribute('href')
    await expect(link).toHaveAttribute('aria-disabled', 'true')
  },
}

/** `loading` swaps the content, and the media, for placeholders. */
export const Loading: Story = {
  render: () => ({
    components: { VButton, VCard, VChip },
    setup: () => ({ t, photoForest, loading: ref(true) }),
    template: `
      <div style="display: grid; gap: 16px; justify-items: start">
        <VButton variant="outline" tone="neutral" @click="loading = !loading">{{ t.toggle }}</VButton>
        <VCard :loading="loading" :loading-text="t.loading" :title="t.forest" :subtitle="t.subtitle" style="width: 320px">
          <template #media><img :src="photoForest" :alt="t.forestAlt" style="aspect-ratio: 16 / 9" /></template>
          {{ t.forestBody }}
          <template #footer><VChip>{{ t.easy }}</VChip></template>
        </VCard>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('status')).toHaveTextContent('Loading the trail')
    await expect(canvas.queryByText('Forest loop')).toBeNull()

    await userEvent.click(canvas.getByRole('button', { name: 'Toggle loading' }))
    await waitFor(() => expect(canvas.getByText('Forest loop')).toBeVisible())
  },
}
