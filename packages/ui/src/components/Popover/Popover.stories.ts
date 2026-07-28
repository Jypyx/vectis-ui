import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import Button from '../Button/Button.vue'
import Input from '../Input/Input.vue'
import Typography from '../Typography/Typography.vue'
import Popover from './Popover.vue'

const meta = {
  title: 'Composants/Popover',
  component: Popover,
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
        'left-start',
        'left-end',
        'right',
        'right-start',
        'right-end',
      ],
    },
    mode: { control: 'inline-radio', options: ['auto', 'manual'] },
  },
  args: {
    placement: 'bottom-start',
    mode: 'auto',
    surface: true,
  },
  render: (args) => ({
    components: { Popover, Button, Typography },
    setup: () => ({ args }),
    template: `
      <div style="padding: 60px">
        <Popover v-bind="args">
          <template #trigger="{ triggerProps }">
            <Button variant="outline" tone="neutral" v-bind="triggerProps">Ouvrir</Button>
          </template>
          <div style="display: grid; gap: 8px; padding: 8px; max-inline-size: 18rem;">
            <Typography variant="subtitle" as="p">Contenu libre</Typography>
            <Typography variant="body-sm" tone="muted" as="p">
              Le Popover ne fournit que le panneau, son ancrage et son état
              d'ouverture. Le contenu — et sa sémantique — appartiennent au
              consommateur.
            </Typography>
          </div>
        </Popover>
      </div>
    `,
  }),
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * Le déclencheur ouvre et ferme le panneau par le seul attribut natif
 * `popovertarget`, sans gestionnaire de clic, et `aria-expanded` suit l'état
 * réel du panneau dans les deux sens.
 *
 * Le light dismiss du mode `auto` (clic à l'extérieur, Échap) n'est pas
 * assertable ici : il repose sur des événements **trusted** du navigateur, que
 * les événements synthétiques de `userEvent` ne produisent pas.
 */
export const OuvertureParLeDeclencheur: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const panel = canvasElement.querySelector('.ds-popover-panel') as HTMLElement
    const trigger = canvas.getByRole('button', { name: 'Ouvrir' })

    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    await waitFor(() => expect(panel.matches(':popover-open')).toBe(true))
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')

    // re-clic : `popovertarget` bascule (action `toggle` par défaut) et l'état
    // republié par le panneau redescend jusqu'au déclencheur
    await userEvent.click(trigger)
    await waitFor(() => expect(panel.matches(':popover-open')).toBe(false))
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  },
}

/**
 * Deux Popover côte à côte : chaque panneau s'ancre à SON déclencheur. Le nom
 * d'ancre est statique et partagé par toutes les instances — c'est
 * `anchor-scope`, posé sur le wrapper, qui le confine à chaque sous-arbre.
 * Sans lui, les deux panneaux se rattacheraient au dernier wrapper de la page.
 */
export const DeuxInstances: Story = {
  render: (args) => ({
    components: { Popover, Button, Typography },
    setup: () => ({ args }),
    template: `
      <div style="display: flex; gap: 200px; padding: 60px">
        <Popover v-bind="args">
          <template #trigger="{ triggerProps }">
            <Button variant="outline" tone="neutral" v-bind="triggerProps">Gauche</Button>
          </template>
          <Typography variant="body-sm" as="p" style="padding: 8px">Ancré à gauche</Typography>
        </Popover>
        <Popover v-bind="args">
          <template #trigger="{ triggerProps }">
            <Button variant="outline" tone="neutral" v-bind="triggerProps">Droite</Button>
          </template>
          <Typography variant="body-sm" as="p" style="padding: 8px">Ancré à droite</Typography>
        </Popover>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const [first, second] = [
      ...canvasElement.querySelectorAll<HTMLElement>('.ds-popover-panel'),
    ] as [HTMLElement, HTMLElement]

    await userEvent.click(canvas.getByRole('button', { name: 'Gauche' }))
    await waitFor(() => expect(first.matches(':popover-open')).toBe(true))
    const left = first.getBoundingClientRect().left

    // en mode `auto`, ouvrir le second ferme le premier (pile native)
    await userEvent.click(canvas.getByRole('button', { name: 'Droite' }))
    await waitFor(() => expect(second.matches(':popover-open')).toBe(true))
    // chaque panneau a résolu SON ancre, pas la dernière de la page
    await expect(second.getBoundingClientRect().left).toBeGreaterThan(left)
  },
}

/** Les douze placements de `floating.css`, disposés autour d'un centre vide. */
export const Placements: Story = {
  render: (args) => ({
    components: { Popover, Button, Typography },
    setup: () => ({
      args,
      placements: [
        'top-start',
        'top',
        'top-end',
        'left-start',
        null,
        'right-start',
        'left',
        null,
        'right',
        'left-end',
        null,
        'right-end',
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
          gap: 40px 64px;
          justify-content: center;
          padding: 80px 60px;
        "
      >
        <template v-for="(placement, index) in placements" :key="index">
          <Popover v-if="placement" :placement="placement" :surface="args.surface">
            <template #trigger="{ triggerProps }">
              <Button variant="outline" tone="neutral" v-bind="triggerProps">{{ placement }}</Button>
            </template>
            <Typography variant="body-sm" as="p" style="padding: 8px">{{ placement }}</Typography>
          </Popover>
          <span v-else aria-hidden="true"></span>
        </template>
      </div>
    `,
  }),
}

/**
 * Contrairement au Tooltip, le contenu peut être interactif : le panneau est
 * persistant et le focus peut y entrer. Pour un contenu de type dialogue,
 * poser `role="dialog"` et un nom accessible sur le Popover (et
 * `aria-haspopup="dialog"` sur le déclencheur) — le composant n'impose aucun
 * rôle.
 */
export const ContenuInteractif: Story = {
  render: (args) => ({
    components: { Popover, Button, Input, Typography },
    setup: () => {
      const open = ref(false)
      const email = ref('')
      return { args, open, email }
    },
    template: `
      <div style="padding: 60px">
        <Popover
          v-model:open="open"
          :placement="args.placement"
          role="dialog"
          aria-label="Inviter un collaborateur"
        >
          <template #trigger="{ triggerProps }">
            <Button v-bind="triggerProps" aria-haspopup="dialog">Inviter</Button>
          </template>
          <form
            style="display: grid; gap: 12px; padding: 12px; inline-size: 18rem;"
            @submit.prevent="open = false"
          >
            <Typography variant="subtitle" as="p">Inviter un collaborateur</Typography>
            <Input v-model="email" type="email" label="Adresse e-mail" placeholder="nom@exemple.fr" />
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
              <Button type="button" variant="ghost" tone="neutral" @click="open = false">
                Annuler
              </Button>
              <Button type="submit">Envoyer</Button>
            </div>
          </form>
        </Popover>
      </div>
    `,
  }),
}

/**
 * `surface: false` retire l'habillage (`.ds-panel`) : le consommateur fournit
 * le sien. C'est le mode par lequel passent les panneaux du DS qui ont leur
 * propre chrome — Tooltip (contraste inversé), DatePicker et TimePicker.
 */
export const SansHabillage: Story = {
  args: { surface: false },
  render: (args) => ({
    components: { Popover, Button },
    setup: () => ({ args }),
    template: `
      <div style="padding: 60px">
        <Popover v-bind="args">
          <template #trigger="{ triggerProps }">
            <Button variant="outline" tone="neutral" v-bind="triggerProps">Ouvrir</Button>
          </template>
          <img
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 160'%3E%3Crect width='240' height='160' fill='%231f2937'/%3E%3Ccircle cx='72' cy='60' r='22' fill='%23fbbf24'/%3E%3Cpath d='M0 160 78 84l52 44 40-30 70 62Z' fill='%2334d399'/%3E%3C/svg%3E"
            alt="Aperçu du document"
            width="240"
            height="160"
            style="display: block; border-radius: 12px; box-shadow: var(--ds-shadow-4);"
          />
        </Popover>
      </div>
    `,
  }),
}

/**
 * Ouverture programmatique par `v-model:open`, sans déclencheur : le
 * consommateur pose alors lui-même l'ancre (`anchor-scope` sur un ancêtre
 * commun, `anchor-name` sur l'élément à suivre) et la passe en prop `anchor`.
 * C'est le mode qu'utilisent Listbox, Tooltip, DatePicker et TimePicker.
 */
export const AncrageFourni: Story = {
  render: (args) => ({
    components: { Popover, Button, Typography },
    setup: () => {
      const open = ref(false)
      return { args, open }
    },
    template: `
      <div style="padding: 60px">
        <div style="anchor-scope: --demo-anchor; display: inline-block;">
          <Button
            variant="outline"
            tone="neutral"
            style="anchor-name: --demo-anchor;"
            :aria-expanded="open"
            @click="open = !open"
          >
            Basculer
          </Button>
          <Popover
            v-model:open="open"
            mode="manual"
            anchor="--demo-anchor"
            :placement="args.placement"
          >
            <Typography variant="body-sm" as="p" style="padding: 8px">
              Panneau <code>manual</code> : aucune fermeture automatique.
            </Typography>
          </Popover>
        </div>
      </div>
    `,
  }),
}

/**
 * Repli automatique au bord de l'écran (`position-try-fallbacks: flip-block,
 * flip-inline` — voir floating.css) : chaque déclencheur est collé à un bord du
 * viewport avec un placement qui pointe vers ce bord. Faute de place, le
 * navigateur retourne le panneau du côté opposé, sans aucun JS.
 */
export const EdgeFlipping: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => ({
    components: { Popover, Button, Typography },
    setup: () => ({ args }),
    template: `
      <div style="position: relative; height: 100dvh;">
        <Typography
          tone="muted"
          style="position: absolute; inset: 50% auto auto 50%; translate: -50% -50%; max-width: 28rem; text-align: center;"
        >
          Chaque bouton demande un placement orienté vers le bord dont il est
          proche : le panneau bascule automatiquement du côté opposé.
        </Typography>
        <div style="position: absolute; top: 8px; left: 50%; translate: -50%;">
          <Popover placement="top">
            <template #trigger="{ triggerProps }">
              <Button variant="outline" tone="neutral" v-bind="triggerProps">top → bottom</Button>
            </template>
            <Typography variant="body-sm" as="p" style="padding: 8px">Replié vers le bas</Typography>
          </Popover>
        </div>
        <div style="position: absolute; bottom: 8px; left: 50%; translate: -50%;">
          <Popover placement="bottom">
            <template #trigger="{ triggerProps }">
              <Button variant="outline" tone="neutral" v-bind="triggerProps">bottom → top</Button>
            </template>
            <Typography variant="body-sm" as="p" style="padding: 8px">Replié vers le haut</Typography>
          </Popover>
        </div>
        <div style="position: absolute; left: 8px; top: 50%; translate: 0 -50%;">
          <Popover placement="left">
            <template #trigger="{ triggerProps }">
              <Button variant="outline" tone="neutral" v-bind="triggerProps">left → right</Button>
            </template>
            <Typography variant="body-sm" as="p" style="padding: 8px">Replié à droite</Typography>
          </Popover>
        </div>
        <div style="position: absolute; right: 8px; top: 50%; translate: 0 -50%;">
          <Popover placement="right">
            <template #trigger="{ triggerProps }">
              <Button variant="outline" tone="neutral" v-bind="triggerProps">right → left</Button>
            </template>
            <Typography variant="body-sm" as="p" style="padding: 8px">Replié à gauche</Typography>
          </Popover>
        </div>
      </div>
    `,
  }),
}
