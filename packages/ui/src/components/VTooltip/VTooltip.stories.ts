import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import Button from '../VButton/VButton.vue'
import IconButton from '../VIconButton/VIconButton.vue'
import Typography from '../VTypography/VTypography.vue'
import Tooltip from './VTooltip.vue'

const meta = {
  title: 'Composants/Tooltip',
  component: Tooltip,
  argTypes: {
    placement: {
      control: 'select',
      options: [
        'top',
        'top-start',
        'top-end',
        'bottom',
        'bottom-start',
        'bottom-end',
        'left',
        'right',
      ],
    },
  },
  args: {
    text: 'Copier dans le presse-papiers',
    placement: 'top',
    delay: 300,
  },
  render: (args) => ({
    components: { Tooltip, Button },
    setup: () => ({ args }),
    template: `
      <div style="padding: 60px">
        <Tooltip v-bind="args">
          <template #default="{ triggerProps }">
            <Button variant="outline" tone="neutral" v-bind="triggerProps">Copier</Button>
          </template>
        </Tooltip>
      </div>
    `,
  }),
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Le focus clavier ouvre immédiatement (sans délai) — WCAG. */
export const OuvertureAuFocus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const tooltip = canvasElement.querySelector('[role="tooltip"]') as HTMLElement
    const trigger = canvas.getByRole('button', { name: 'Copier' })

    await userEvent.tab()
    await expect(trigger).toHaveFocus()
    await waitFor(() => expect(tooltip.matches(':popover-open')).toBe(true))
    // le trigger est décrit par le tooltip
    await expect(trigger).toHaveAttribute('aria-describedby', tooltip.id)

    // Échap ferme (WCAG 1.4.13)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(tooltip.matches(':popover-open')).toBe(false))
  },
}

export const SurIconButton: Story = {
  render: (args) => ({
    components: { Tooltip, IconButton },
    setup: () => ({ args }),
    template: `
      <div style="padding: 60px">
        <Tooltip v-bind="args" text="Supprimer l'élément" placement="bottom">
          <template #default="{ triggerProps }">
            <IconButton label="Supprimer l'élément" tone="danger" v-bind="triggerProps">
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </IconButton>
          </template>
        </Tooltip>
      </div>
    `,
  }),
}

export const TexteLong: Story = {
  args: {
    text: 'Une description anormalement longue qui doit passer à la ligne proprement sans dépasser la largeur maximale du panneau.',
  },
}

/** Les huit placements disponibles, disposés autour d'un centre vide. */
export const Placements: Story = {
  render: (args) => ({
    components: { Tooltip, Button },
    setup: () => ({
      args,
      placements: [
        'top-start',
        'top',
        'top-end',
        'left',
        null,
        'right',
        'bottom-start',
        'bottom',
        'bottom-end',
      ],
    }),
    template: `
      <div
        style="
          display: grid;
          grid-template-columns: repeat(3, max-content);
          gap: 48px;
          justify-content: center;
          padding: 100px 60px;
        "
      >
        <template v-for="placement in placements">
          <Tooltip
            v-if="placement"
            :key="placement"
            :text="args.text"
            :delay="args.delay"
            :placement="placement"
          >
            <template #default="{ triggerProps }">
              <Button variant="outline" tone="neutral" v-bind="triggerProps">
                {{ placement }}
              </Button>
            </template>
          </Tooltip>
          <span v-else aria-hidden="true"></span>
        </template>
      </div>
    `,
  }),
}

/**
 * Contenu riche via le slot `#content` (prime sur la prop `text`). Réservé au
 * contenu NON interactif : le tooltip se ferme dès que le pointeur quitte le
 * déclencheur et `aria-describedby` aplatit le contenu en texte — un lien ou
 * un bouton y serait inatteignable (utiliser Popover dans ce cas).
 */
export const ContenuRiche: Story = {
  render: (args) => ({
    components: { Tooltip, Button },
    setup: () => ({ args }),
    template: `
      <div style="padding: 100px 60px">
        <Tooltip :delay="args.delay" placement="bottom-start">
          <template #default="{ triggerProps }">
            <Button variant="outline" tone="neutral" v-bind="triggerProps">Rechercher</Button>
          </template>
          <template #content>
            <div style="display: grid; gap: 4px; padding: 4px 0;">
              <strong>Recherche globale</strong>
              <span>Cherche dans les fichiers, les symboles et les commandes du projet.</span>
              <span style="opacity: 0.75;">
                Raccourci&nbsp;:
                <kbd style="border: 1px solid currentcolor; border-radius: 4px; padding: 0 4px;">Ctrl</kbd>
                +
                <kbd style="border: 1px solid currentcolor; border-radius: 4px; padding: 0 4px;">K</kbd>
              </span>
            </div>
          </template>
        </Tooltip>
      </div>
    `,
  }),
}

/**
 * Repli automatique au bord de l'écran (`position-try-fallbacks: flip-block,
 * flip-inline` — voir floating.css) : chaque déclencheur est collé à un bord
 * du viewport avec un placement qui pointe vers ce bord. Faute de place, le
 * navigateur retourne le panneau du côté opposé, sans aucun JS.
 */
export const EdgeFlipping: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => ({
    components: { Tooltip, Button, Typography },
    setup: () => ({ args }),
    template: `
      <div style="position: relative; height: 100dvh;">
        <Typography
          tone="muted"
          style="position: absolute; inset: 50% auto auto 50%; translate: -50% -50%; max-width: 28rem; text-align: center;"
        >
          Chaque bouton demande un placement orienté vers le bord dont il est
          proche : le tooltip bascule automatiquement du côté opposé
          (<code>position-try-fallbacks</code>).
        </Typography>
        <div style="position: absolute; top: 8px; left: 50%; translate: -50%;">
          <Tooltip :text="args.text" :delay="args.delay" placement="top">
            <template #default="{ triggerProps }">
              <Button variant="outline" tone="neutral" v-bind="triggerProps">top → bottom</Button>
            </template>
          </Tooltip>
        </div>
        <div style="position: absolute; bottom: 8px; left: 50%; translate: -50%;">
          <Tooltip :text="args.text" :delay="args.delay" placement="bottom">
            <template #default="{ triggerProps }">
              <Button variant="outline" tone="neutral" v-bind="triggerProps">bottom → top</Button>
            </template>
          </Tooltip>
        </div>
        <div style="position: absolute; left: 8px; top: 50%; translate: 0 -50%;">
          <Tooltip :text="args.text" :delay="args.delay" placement="left">
            <template #default="{ triggerProps }">
              <Button variant="outline" tone="neutral" v-bind="triggerProps">left → right</Button>
            </template>
          </Tooltip>
        </div>
        <div style="position: absolute; right: 8px; top: 50%; translate: 0 -50%;">
          <Tooltip :text="args.text" :delay="args.delay" placement="right">
            <template #default="{ triggerProps }">
              <Button variant="outline" tone="neutral" v-bind="triggerProps">right → left</Button>
            </template>
          </Tooltip>
        </div>
      </div>
    `,
  }),
}
