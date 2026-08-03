import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import ProgressLinear from './ProgressLinear.vue'

const meta = {
  title: 'Composants/ProgressLinear',
  component: ProgressLinear,
  argTypes: {
    tone: { control: 'select', options: ['accent', 'success', 'warning', 'danger', 'neutral'] },
    shape: { control: 'select', options: ['rounded', 'square'] },
    valuePosition: { control: 'select', options: ['start', 'center', 'end'] },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
  args: {
    value: 40,
    max: 100,
    indeterminate: false,
    tone: 'accent',
    shape: 'rounded',
    valuePosition: 'center',
  },
  render: (args) => ({
    components: { ProgressLinear },
    setup: () => ({ args }),
    template:
      '<div style="width: 320px"><ProgressLinear v-bind="args" aria-label="Progression" /></div>',
  }),
} satisfies Meta<typeof ProgressLinear>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const bar = canvas.getByRole('progressbar', { name: 'Progression' })
    await expect(bar).toHaveAttribute('aria-valuenow', '40')
    // géométrie réelle : le remplissage vaut 40 % de la piste — la racine EST
    // la piste (invérifiable en jsdom)
    const fill = bar.querySelector('.v-progress-linear-fill')!
    await waitFor(() =>
      expect(fill.getBoundingClientRect().width).toBeCloseTo(
        bar.getBoundingClientRect().width * 0.4,
        0,
      ),
    )
  },
}

export const Tones: Story = {
  render: () => ({
    components: { ProgressLinear },
    template: `
      <div style="display: grid; gap: 16px; width: 320px">
        <ProgressLinear tone="accent" :value="40" aria-label="Accent" />
        <ProgressLinear tone="success" :value="100" aria-label="Succès" />
        <ProgressLinear tone="warning" :value="70" aria-label="Avertissement" />
        <ProgressLinear tone="danger" :value="25" aria-label="Erreur" />
        <ProgressLinear tone="neutral" :value="55" aria-label="Neutre" />
      </div>
    `,
  }),
}

/**
 * `color` remplace le tone : le remplissage prend la couleur brute, la piste en
 * est dérivée par `color-mix` vers la surface — donc adaptée automatiquement au
 * thème clair comme au thème sombre.
 */
export const CouleurCustom: Story = {
  render: () => ({
    components: { ProgressLinear },
    template: `
      <div style="display: grid; gap: 16px; width: 320px">
        <ProgressLinear color="#7c3aed" :value="45" aria-label="Violet" />
        <ProgressLinear color="teal" :value="65" show-value aria-label="Teal" />
        <ProgressLinear color="oklch(72% 0.18 45)" :value="85" show-value aria-label="Orange" />
      </div>
    `,
  }),
}

export const Epaisseur: Story = {
  render: () => ({
    components: { ProgressLinear },
    template: `
      <div style="display: grid; gap: 16px; width: 320px">
        <ProgressLinear :value="40" aria-label="4px (défaut)" />
        <ProgressLinear :thickness="8" :value="55" aria-label="8px" />
        <ProgressLinear :thickness="16" :value="70" aria-label="16px" />
        <!-- toujours des pixels : une string numérique équivaut au number -->
        <ProgressLinear thickness="24" :value="85" aria-label="24px" />
      </div>
    `,
  }),
}

/**
 * Le texte est rendu en deux copies superposées : l'une sur la piste, l'autre
 * clippée à la portion remplie et contrastée sur le remplissage. Il reste donc
 * lisible à 5 % comme à 95 %. L'épaisseur par défaut (4px) ne peut pas
 * l'accueillir : afficher un texte suppose une `thickness`.
 */
export const Valeur: Story = {
  render: () => ({
    components: { ProgressLinear },
    template: `
      <div style="display: grid; gap: 16px; width: 320px">
        <ProgressLinear :thickness="20" show-value value-position="start" :value="35" aria-label="Début" />
        <ProgressLinear :thickness="20" show-value value-position="center" :value="35" aria-label="Centre" />
        <ProgressLinear :thickness="20" show-value value-position="end" :value="35" aria-label="Fin" />
        <ProgressLinear :thickness="20" show-value value-position="center" :value="92" aria-label="Presque fini" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const bar = canvas.getByRole('progressbar', { name: 'Centre' })
    const [base, onFill] = [...bar.querySelectorAll('.v-progress-linear-text')]
    // la copie clippée est colorée par contraste : couleur distincte de la copie de base
    await expect(getComputedStyle(base!).color).not.toBe(getComputedStyle(onFill!).color)
    await expect(getComputedStyle(onFill!).clipPath).not.toBe('none')
  },
}

/** Le slot par défaut reçoit `{ value, max, percent }` et remplace le pourcentage. */
export const ContenuPersonnalise: Story = {
  render: () => ({
    components: { ProgressLinear },
    template: `
      <div style="display: grid; gap: 16px; width: 320px">
        <ProgressLinear :value="3" :max="8" :thickness="24" aria-label="Fichiers envoyés">
          <template #default="{ value, max }">{{ value }}/{{ max }} fichiers</template>
        </ProgressLinear>
        <ProgressLinear :value="72" :thickness="24" value-position="end" aria-label="Espace utilisé">
          <template #default="{ percent }">{{ Math.round(percent) }} % de 500 Go</template>
        </ProgressLinear>
      </div>
    `,
  }),
}

export const Carre: Story = {
  render: () => ({
    components: { ProgressLinear },
    template: `
      <div style="display: grid; gap: 16px; width: 320px">
        <ProgressLinear shape="rounded" :value="60" aria-label="Arrondi (défaut)" />
        <ProgressLinear shape="square" :value="60" aria-label="Carré" />
        <ProgressLinear shape="square" :value="60" :thickness="20" show-value aria-label="Carré épais" />
      </div>
    `,
  }),
}

export const Indetermine: Story = {
  args: { indeterminate: true },
  render: () => ({
    components: { ProgressLinear },
    template: `
      <div style="display: grid; gap: 16px; width: 320px">
        <ProgressLinear indeterminate aria-label="Chargement" />
        <ProgressLinear indeterminate tone="success" :thickness="8" aria-label="Synchronisation" />
        <ProgressLinear indeterminate color="teal" :thickness="12" shape="square" aria-label="Analyse" />
      </div>
    `,
  }),
}

/**
 * `orientation="vertical"` : 0 en bas, max en haut, par un simple
 * `writing-mode` sur la racine — remplissage, texte et animation indéterminée
 * basculent d'axe sans règle dupliquée. La longueur se pose en CSS (`height`),
 * comme la largeur en horizontal.
 */
export const Vertical: Story = {
  render: () => ({
    components: { ProgressLinear },
    template: `
      <div style="display: flex; gap: 32px; align-items: flex-end">
        <ProgressLinear orientation="vertical" :value="40" aria-label="Défaut" />
        <ProgressLinear orientation="vertical" :value="75" style="height: 240px" tone="success" aria-label="240px" />
        <ProgressLinear orientation="vertical" :value="30" :thickness="20" shape="square" tone="warning" aria-label="Épaisse carrée" />
        <ProgressLinear orientation="vertical" :value="60" :thickness="32" style="height: 200px" show-value aria-label="Avec texte" />
        <ProgressLinear orientation="vertical" indeterminate :thickness="12" aria-label="Indéterminé" />
      </div>
    `,
  }),
}

/** L'animation de progression joue à chaque changement de valeur. */
export const Progression: Story = {
  render: () => ({
    components: { ProgressLinear },
    setup: () => {
      const value = ref(20)
      const bump = (d: number) => {
        value.value = Math.min(100, Math.max(0, value.value + d))
      }
      return { value, bump }
    },
    template: `
      <div style="display: grid; gap: 16px; width: 320px">
        <ProgressLinear :value="value" :thickness="20" show-value aria-label="Envoi" />
        <div style="display: flex; gap: 8px">
          <button type="button" @click="bump(-10)">−10</button>
          <button type="button" @click="bump(10)">+10</button>
          <button type="button" @click="value = 80">80 %</button>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const bar = canvas.getByRole('progressbar', { name: 'Envoi' })
    await userEvent.click(canvas.getByRole('button', { name: '80 %' }))
    await waitFor(() => expect(bar).toHaveAttribute('aria-valuenow', '80'))
    // la transition converge sur la largeur cible
    const fill = bar.querySelector('.v-progress-linear-fill')!
    await waitFor(() =>
      expect(fill.getBoundingClientRect().width).toBeCloseTo(
        bar.getBoundingClientRect().width * 0.8,
        0,
      ),
    )
  },
}

/** `max` libre : les bornes ARIA restent fidèles (« 3 sur 8 »). */
export const MaxPersonnalise: Story = {
  args: { value: 3, max: 8, showValue: true, thickness: 20 },
}

export const CasLimites: Story = {
  render: () => ({
    components: { ProgressLinear },
    template: `
      <div style="display: grid; gap: 16px; width: 320px">
        <ProgressLinear :value="0" :thickness="20" show-value aria-label="Zéro" />
        <ProgressLinear :value="100" :thickness="20" show-value aria-label="Complet" />
        <!-- au-delà du max : clampé -->
        <ProgressLinear :value="250" :max="100" :thickness="20" show-value aria-label="Hors bornes" />
        <!-- texte plus haut que la barre : débordement visible, non rogné -->
        <ProgressLinear :value="45" show-value aria-label="Barre à l'épaisseur par défaut" />
        <ProgressLinear :value="45" :thickness="24" aria-label="Texte très long">
          <template #default>Compression des ressources du projet en cours…</template>
        </ProgressLinear>
      </div>
    `,
  }),
}
