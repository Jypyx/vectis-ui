import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import VSlider from './VSlider.vue'

const meta = {
  title: 'Composants/Slider',
  component: VSlider,
  args: { min: 0, max: 100, step: 1, label: 'Volume' },
} satisfies Meta<typeof VSlider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { VSlider },
    setup: () => ({ args, value: ref(40) }),
    template: `
      <div style="display: grid; gap: 8px; width: 320px">
        <VSlider v-bind="args" v-model="value" />
        <output>{{ value }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const slider = canvas.getByRole('slider', { name: 'Volume' }) as HTMLInputElement
    // Le clavier est 100 % natif, mais un keydown synthétique (non trusted) ne
    // déclenche PAS le comportement par défaut d'un <input type=range> : on
    // simule l'effet d'une flèche droite (valeur + event input) et on vérifie
    // le pont v-model.
    slider.focus()
    slider.value = '41'
    await fireEvent.input(slider)
    await waitFor(() => expect(canvas.getByText('41')).toBeVisible())
  },
}

export const Range: Story = {
  render: (args) => ({
    components: { VSlider },
    setup: () => ({ args, value: ref<[number, number]>([20, 60]) }),
    template: `
      <div style="display: grid; gap: 8px; width: 320px">
        <VSlider v-bind="args" range v-model="value" label="Budget" />
        <output>{{ value[0] }} – {{ value[1] }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('slider', { name: 'Budget (début)' })).toBeVisible()
    await expect(canvas.getByRole('slider', { name: 'Budget (fin)' })).toBeVisible()
  },
}

// Cliquer la piste déplace la valeur (mode simple uniquement — natif via
// pointer-events, à vérifier manuellement : le hit-testing à coordonnées est
// trop fragile pour une play function).
export const Pas: Story = {
  render: (args) => ({
    components: { VSlider },
    setup: () => ({ args, value: ref(50), valueSansTicks: ref(50) }),
    template: `
      <div style="display: grid; gap: 16px; width: 320px">
        <VSlider v-bind="args" v-model="value" :step="10" ticks label="Par pas de 10" />
        <VSlider v-bind="args" v-model="valueSansTicks" :step="10" label="Par pas de 10, sans ticks" />
      </div>
    `,
  }),
}

export const Disabled: Story = {
  render: (args) => ({
    components: { VSlider },
    setup: () => ({ args, value: ref(30), rangeValue: ref<[number, number]>([20, 60]) }),
    template: `
      <div style="display: grid; gap: 16px; width: 320px">
        <VSlider v-bind="args" v-model="value" disabled />
        <VSlider v-bind="args" range v-model="rangeValue" :step="10" ticks disabled label="Plage" />
      </div>
    `,
  }),
}

export const Vertical: Story = {
  render: (args) => ({
    components: { VSlider },
    setup: () => ({ args, value: ref(40), rangeValue: ref<[number, number]>([20, 60]) }),
    template: `
      <div style="display: flex; gap: 48px; align-items: start">
        <VSlider v-bind="args" orientation="vertical" v-model="value" />
        <VSlider v-bind="args" orientation="vertical" range v-model="rangeValue" label="Budget" />
        <!-- longueur surchargée via le token, sans style inline dans le composant -->
        <VSlider
          v-bind="args"
          orientation="vertical"
          v-model="value"
          style="--vectis-control-size-slider-length: 16rem"
        />
      </div>
    `,
  }),
}

export const AvecInputs: Story = {
  render: (args) => ({
    components: { VSlider },
    setup: () => ({ args, value: ref(40), rangeValue: ref<[number, number]>([20, 60]) }),
    template: `
      <div style="display: grid; gap: 24px; width: 420px">
        <VSlider v-bind="args" inputs v-model="value" />
        <output>{{ value }}</output>
        <VSlider v-bind="args" inputs range v-model="rangeValue" label="Budget" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // saisie hors bornes → commit au change → clamp sur max. Un {Enter}
    // synthétique ne déclenche pas le change natif : on quitte le champ (blur)
    // comme un utilisateur réel.
    const field = canvas.getByRole('spinbutton', { name: 'Volume' })
    await userEvent.clear(field)
    await userEvent.type(field, '150')
    await userEvent.tab()
    await waitFor(() => expect(canvas.getByText('100')).toBeVisible())
    await waitFor(() => expect(field).toHaveValue(100))
  },
}

export const LabelsTexte: Story = {
  render: (args) => ({
    components: { VSlider },
    setup: () => ({ args, value: ref(2) }),
    template: `
      <div style="width: 320px; padding-inline: 16px">
        <VSlider
          v-bind="args"
          v-model="value"
          :min="0"
          :max="4"
          :step="1"
          :labels="['XS', 'S', 'M', 'L', 'XL']"
          label="Taille"
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // les valeurs non numériques sont annoncées via aria-valuetext
    const slider = canvas.getByRole('slider', { name: 'Taille' }) as HTMLInputElement
    await expect(slider).toHaveAttribute('aria-valuetext', 'M')
    // même limite que Default : on simule l'effet d'ArrowRight (valeur + input)
    slider.focus()
    slider.value = '3'
    await fireEvent.input(slider)
    await waitFor(() => expect(slider).toHaveAttribute('aria-valuetext', 'L'))
  },
}

export const LabelsIcones: Story = {
  render: (args) => ({
    components: { VSlider },
    setup: () => ({ args, value: ref(1) }),
    template: `
      <div style="width: 320px; padding-inline: 16px">
        <VSlider
          v-bind="args"
          v-model="value"
          :min="0"
          :max="3"
          :step="1"
          :labels="[
            { icon: 'volume_mute', label: 'Muet' },
            { icon: 'volume_down', label: 'Faible' },
            { icon: 'volume_up', label: 'Fort' },
            { icon: 'campaign', label: 'Maximum' },
          ]"
        />
      </div>
    `,
  }),
}

export const AvecTooltip: Story = {
  render: (args) => ({
    components: { VSlider },
    setup: () => ({ args, value: ref(40), rangeValue: ref<[number, number]>([20, 60]) }),
    template: `
      <div style="display: grid; gap: 32px; width: 320px; padding-top: 32px">
        <VSlider v-bind="args" tooltip v-model="value" />
        <VSlider v-bind="args" tooltip range v-model="rangeValue" label="Budget" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // le focus clavier (focus-visible) affiche la bulle du thumb manipulé
    await userEvent.tab()
    await waitFor(() => expect(canvas.getByText('40')).toBeVisible())
  },
}

export const VerticalComplet: Story = {
  render: (args) => ({
    components: { VSlider },
    setup: () => ({ args, value: ref(2), rangeValue: ref<[number, number]>([20, 60]) }),
    template: `
      <div style="display: flex; gap: 96px; align-items: start; padding-inline-start: 48px">
        <VSlider
          v-bind="args"
          orientation="vertical"
          v-model="value"
          :min="0"
          :max="4"
          :step="1"
          :labels="['XS', 'S', 'M', 'L', 'XL']"
          tooltip
          label="Taille"
        />
        <VSlider v-bind="args" orientation="vertical" inputs range tooltip v-model="rangeValue" label="Budget" />
      </div>
    `,
  }),
}
