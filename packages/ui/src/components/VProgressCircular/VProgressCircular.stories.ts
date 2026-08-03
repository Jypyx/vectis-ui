import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'

import VTypography from '../VTypography/VTypography.vue'
import VProgressCircular from './VProgressCircular.vue'

const meta = {
  title: 'Composants/ProgressCircular',
  component: VProgressCircular,
  argTypes: {
    tone: { control: 'select', options: ['accent', 'success', 'warning', 'danger', 'neutral'] },
    shape: { control: 'select', options: ['rounded', 'square'] },
  },
  args: { value: 65, max: 100, indeterminate: false, tone: 'accent', shape: 'rounded' },
  render: (args) => ({
    components: { VProgressCircular },
    setup: () => ({ args }),
    template: '<VProgressCircular v-bind="args" aria-label="Progression" />',
  }),
} satisfies Meta<typeof VProgressCircular>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const bar = within(canvasElement).getByRole('progressbar', { name: 'Progression' })
    await expect(bar).toHaveAttribute('aria-valuenow', '65')
    /*
     * Canari de support : toute la géométrie du donut repose sur les propriétés
     * CSS de géométrie SVG2 (cx/cy/r) sur un <svg> sans viewBox. Si elles ne
     * s'appliquaient pas, rien ne serait dessiné — on le vérifie ici plutôt
     * qu'à l'œil (impossible en jsdom, qui n'a pas de layout SVG).
     * Diamètre par défaut 48px, épaisseur 4px → r = 22px.
     */
    const barCircle = bar.querySelector('.v-progress-circular-bar')!
    await waitFor(() => expect(getComputedStyle(barCircle).r).toBe('22px'))
    // Chromium sérialise le calc() résolu en « calc(35px) » dans getComputedStyle
    // (parseFloat → NaN) : on lit la valeur via l'OM typé.
    await waitFor(() => {
      const offset = barCircle.computedStyleMap().get('stroke-dashoffset') as CSSUnitValue
      expect(offset.value).toBeCloseTo(35, 0)
    })
  },
}

export const Tones: Story = {
  render: () => ({
    components: { VProgressCircular },
    template: `
      <div style="display: flex; gap: 16px; align-items: center">
        <VProgressCircular tone="accent" :value="40" show-value aria-label="Accent" />
        <VProgressCircular tone="success" :value="100" show-value aria-label="Succès" />
        <VProgressCircular tone="warning" :value="70" show-value aria-label="Avertissement" />
        <VProgressCircular tone="danger" :value="25" show-value aria-label="Erreur" />
        <VProgressCircular tone="neutral" :value="55" show-value aria-label="Neutre" />
      </div>
    `,
  }),
}

/**
 * `color` remplace le tone : le trait prend la couleur brute, la piste en est
 * dérivée par `color-mix` vers la surface — donc adaptée au thème clair comme
 * au thème sombre.
 */
export const CouleurCustom: Story = {
  render: () => ({
    components: { VProgressCircular },
    template: `
      <div style="display: flex; gap: 16px; align-items: center">
        <VProgressCircular color="#7c3aed" :value="45" show-value aria-label="Violet" />
        <VProgressCircular color="teal" :value="65" show-value aria-label="Teal" />
        <VProgressCircular color="oklch(72% 0.18 45)" :value="85" show-value aria-label="Orange" />
      </div>
    `,
  }),
}

export const Taille: Story = {
  render: () => ({
    components: { VProgressCircular },
    template: `
      <div style="display: flex; gap: 16px; align-items: center">
        <VProgressCircular :size="24" :thickness="3" :value="60" aria-label="24px" />
        <VProgressCircular :size="48" :value="60" aria-label="48px (défaut)" />
        <VProgressCircular :size="80" :value="60" show-value aria-label="80px" />
        <!-- toujours des pixels : une string numérique équivaut au number -->
        <VProgressCircular size="96" :value="60" show-value aria-label="96px (string)" />
      </div>
    `,
  }),
}

/** L'épaisseur est indépendante du diamètre — le donut peut devenir un disque. */
export const Epaisseur: Story = {
  render: () => ({
    components: { VProgressCircular },
    template: `
      <div style="display: flex; gap: 16px; align-items: center">
        <VProgressCircular :size="72" :thickness="2" :value="60" aria-label="2px" />
        <VProgressCircular :size="72" :thickness="4" :value="60" aria-label="4px (défaut)" />
        <VProgressCircular :size="72" :thickness="8" :value="60" aria-label="8px" />
        <VProgressCircular :size="72" :thickness="16" :value="60" aria-label="16px" />
      </div>
    `,
  }),
}

/** La taille du texte suit le diamètre, avec un plancher au plus petit token. */
export const Valeur: Story = {
  render: () => ({
    components: { VProgressCircular },
    template: `
      <div style="display: flex; gap: 16px; align-items: center">
        <VProgressCircular :size="48" :value="35" show-value aria-label="48px" />
        <VProgressCircular :size="72" :value="35" show-value aria-label="72px" />
        <VProgressCircular :size="112" :value="35" show-value aria-label="112px" />
      </div>
    `,
  }),
}

/** Le slot par défaut reçoit `{ value, max, percent }` : au centre, tout est permis. */
export const LabelCentre: Story = {
  render: () => ({
    components: { VProgressCircular, VTypography },
    template: `
      <div style="display: flex; gap: 24px; align-items: center">
        <VProgressCircular :size="112" :thickness="10" :value="7" :max="10" aria-label="Étapes">
          <template #default="{ value, max }">
            <span style="display: grid; gap: 2px; justify-items: center">
              <VTypography variant="heading-2" as="strong">{{ value }}</VTypography>
              <small style="opacity: 0.7">sur {{ max }}</small>
            </span>
          </template>
        </VProgressCircular>
        <VProgressCircular :size="96" :value="100" tone="success" aria-label="Terminé">
          <template #default>
            <span class="material-symbols-rounded" aria-hidden="true" style="font-size: 2rem">check</span>
          </template>
        </VProgressCircular>
        <VProgressCircular :size="96" :thickness="8" :value="42" show-value aria-label="Compression" />
      </div>
    `,
  }),
}

export const Carre: Story = {
  render: () => ({
    components: { VProgressCircular },
    template: `
      <div style="display: flex; gap: 16px; align-items: center">
        <VProgressCircular :size="72" :thickness="10" :value="35" shape="rounded" aria-label="Bouts arrondis (défaut)" />
        <VProgressCircular :size="72" :thickness="10" :value="35" shape="square" aria-label="Bouts francs" />
      </div>
    `,
  }),
}

export const Indetermine: Story = {
  args: { indeterminate: true },
  render: () => ({
    components: { VProgressCircular },
    template: `
      <div style="display: flex; gap: 16px; align-items: center">
        <VProgressCircular indeterminate aria-label="Chargement" />
        <VProgressCircular indeterminate :size="72" :thickness="8" tone="success" aria-label="Synchronisation" />
        <VProgressCircular indeterminate :size="96" :thickness="4" shape="square" color="teal" aria-label="Analyse" />
      </div>
    `,
  }),
}

export const CasLimites: Story = {
  render: () => ({
    components: { VProgressCircular },
    template: `
      <div style="display: flex; gap: 16px; align-items: center">
        <VProgressCircular :value="0" show-value aria-label="Zéro" />
        <VProgressCircular :value="100" show-value aria-label="Complet" />
        <!-- épaisseur ≥ diamètre : rayon nul, dégradation propre (pas d'erreur SVG) -->
        <VProgressCircular :size="48" :thickness="64" :value="50" aria-label="Épaisseur excessive" />
        <!-- label trop long pour le trou du donut -->
        <VProgressCircular :size="72" :thickness="6" :value="50" aria-label="Label trop long">
          <template #default>Compression en cours</template>
        </VProgressCircular>
      </div>
    `,
  }),
}
