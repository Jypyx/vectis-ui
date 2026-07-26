import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VButton from '../VButton/VButton.vue'
import VInput from '../VInput/VInput.vue'
import VTypography from '../VTypography/VTypography.vue'
import VPopover from './VPopover.vue'

const t = storyText({
  en: {
    open: 'Open',
    freeContent: 'Free content',
    freeContentBody:
      'VPopover provides only the panel, its anchoring and its open state. The content — and its semantics — belong to the consumer.',
    left: 'Left',
    right: 'Right',
    anchoredLeft: 'Anchored left',
    anchoredRight: 'Anchored right',
    invite: 'Invite',
    inviteTitle: 'Invite a collaborator',
    emailLabel: 'Email address',
    emailPlaceholder: 'name@example.com',
    cancel: 'Cancel',
    send: 'Send',
    documentPreview: 'Document preview',
    toggle: 'Toggle',
    manualPanel: 'panel: no automatic dismissal.',
    edgeIntro:
      'Each button asks for a placement pointing at the edge it sits near: the panel flips automatically to the opposite side.',
    flippedDown: 'Flipped downwards',
    flippedUp: 'Flipped upwards',
    flippedRight: 'Flipped to the right',
    flippedLeft: 'Flipped to the left',
  },
  fr: {
    open: 'Ouvrir',
    freeContent: 'Contenu libre',
    freeContentBody:
      "Le VPopover ne fournit que le panneau, son ancrage et son état d'ouverture. Le contenu — et sa sémantique — appartiennent au consommateur.",
    left: 'Gauche',
    right: 'Droite',
    anchoredLeft: 'Ancré à gauche',
    anchoredRight: 'Ancré à droite',
    invite: 'Inviter',
    inviteTitle: 'Inviter un collaborateur',
    emailLabel: 'Adresse e-mail',
    emailPlaceholder: 'nom@exemple.fr',
    cancel: 'Annuler',
    send: 'Envoyer',
    documentPreview: 'Aperçu du document',
    toggle: 'Basculer',
    manualPanel: ': aucune fermeture automatique.',
    edgeIntro:
      'Chaque bouton demande un placement orienté vers le bord dont il est proche : le panneau bascule automatiquement du côté opposé.',
    flippedDown: 'Replié vers le bas',
    flippedUp: 'Replié vers le haut',
    flippedRight: 'Replié à droite',
    flippedLeft: 'Replié à gauche',
  },
})

const meta = {
  title: 'Components/Popover',
  component: VPopover,
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
    components: { VPopover, VButton, VTypography },
    setup: () => ({ args, t }),
    template: `
      <div style="padding: 60px">
        <VPopover v-bind="args">
          <template #trigger="{ triggerProps }">
            <VButton variant="outline" tone="neutral" v-bind="triggerProps">{{ t.open }}</VButton>
          </template>
          <div style="display: grid; gap: 8px; padding: 8px; max-inline-size: 18rem;">
            <VTypography variant="subtitle" as="p">{{ t.freeContent }}</VTypography>
            <VTypography variant="body-sm" tone="muted" as="p">{{ t.freeContentBody }}</VTypography>
          </div>
        </VPopover>
      </div>
    `,
  }),
} satisfies Meta<typeof VPopover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * The trigger opens and closes the panel through the native `popovertarget`
 * attribute alone, with no click handler, and `aria-expanded` follows the panel's
 * real state in both directions.
 *
 * The light dismiss of `auto` mode (click outside, Escape) is not assertable
 * here: it relies on **trusted** browser events, which `userEvent`'s synthetic
 * events do not produce.
 */
export const OpenedByTheTrigger: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const panel = canvasElement.querySelector('.v-popover-panel') as HTMLElement
    const trigger = canvas.getByRole('button', { name: 'Open' })

    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    await waitFor(() => expect(panel.matches(':popover-open')).toBe(true))
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')

    // clicking again: `popovertarget` toggles (the default action) and the state
    // republished by the panel flows back down to the trigger
    await userEvent.click(trigger)
    await waitFor(() => expect(panel.matches(':popover-open')).toBe(false))
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  },
}

/**
 * Two VPopover side by side: each panel anchors to ITS trigger. The anchor name is
 * static and shared by every instance — it is `anchor-scope`, set on the wrapper,
 * that confines it to each subtree. Without it, both panels would attach to the
 * last wrapper on the page.
 */
export const TwoInstances: Story = {
  render: (args) => ({
    components: { VPopover, VButton, VTypography },
    setup: () => ({ args, t }),
    template: `
      <div style="display: flex; gap: 200px; padding: 60px">
        <VPopover v-bind="args">
          <template #trigger="{ triggerProps }">
            <VButton variant="outline" tone="neutral" v-bind="triggerProps">{{ t.left }}</VButton>
          </template>
          <VTypography variant="body-sm" as="p" style="padding: 8px">{{ t.anchoredLeft }}</VTypography>
        </VPopover>
        <VPopover v-bind="args">
          <template #trigger="{ triggerProps }">
            <VButton variant="outline" tone="neutral" v-bind="triggerProps">{{ t.right }}</VButton>
          </template>
          <VTypography variant="body-sm" as="p" style="padding: 8px">{{ t.anchoredRight }}</VTypography>
        </VPopover>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const [first, second] = [
      ...canvasElement.querySelectorAll<HTMLElement>('.v-popover-panel'),
    ] as [HTMLElement, HTMLElement]

    await userEvent.click(canvas.getByRole('button', { name: 'Left' }))
    await waitFor(() => expect(first.matches(':popover-open')).toBe(true))
    const left = first.getBoundingClientRect().left

    // in `auto` mode, opening the second closes the first (the native stack)
    await userEvent.click(canvas.getByRole('button', { name: 'Right' }))
    await waitFor(() => expect(second.matches(':popover-open')).toBe(true))
    // each panel resolved ITS anchor, not the last one on the page
    await expect(second.getBoundingClientRect().left).toBeGreaterThan(left)
  },
}

/** The twelve placements of `floating.css`, laid out around an empty centre. */
export const Placements: Story = {
  render: (args) => ({
    components: { VPopover, VButton, VTypography },
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
          <VPopover v-if="placement" :placement="placement" :surface="args.surface">
            <template #trigger="{ triggerProps }">
              <VButton variant="outline" tone="neutral" v-bind="triggerProps">{{ placement }}</VButton>
            </template>
            <VTypography variant="body-sm" as="p" style="padding: 8px">{{ placement }}</VTypography>
          </VPopover>
          <span v-else aria-hidden="true"></span>
        </template>
      </div>
    `,
  }),
}

/**
 * Unlike VTooltip, the content can be interactive: the panel is persistent and
 * focus can enter it. For dialog-like content, set `role="dialog"` and an
 * accessible name on the VPopover (and `aria-haspopup="dialog"` on the trigger) —
 * the component imposes no role.
 */
export const InteractiveContent: Story = {
  render: (args) => ({
    components: { VPopover, VButton, VInput, VTypography },
    setup: () => {
      const open = ref(false)
      const email = ref('')
      return { args, open, email, t }
    },
    template: `
      <div style="padding: 60px">
        <VPopover
          v-model:open="open"
          :placement="args.placement"
          role="dialog"
          :aria-label="t.inviteTitle"
        >
          <template #trigger="{ triggerProps }">
            <VButton v-bind="triggerProps" aria-haspopup="dialog">{{ t.invite }}</VButton>
          </template>
          <form
            style="display: grid; gap: 12px; padding: 12px; inline-size: 18rem;"
            @submit.prevent="open = false"
          >
            <VTypography variant="subtitle" as="p">{{ t.inviteTitle }}</VTypography>
            <VInput v-model="email" type="email" :label="t.emailLabel" :placeholder="t.emailPlaceholder" />
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
              <VButton type="button" variant="ghost" tone="neutral" @click="open = false">
                {{ t.cancel }}
              </VButton>
              <VButton type="submit">{{ t.send }}</VButton>
            </div>
          </form>
        </VPopover>
      </div>
    `,
  }),
}

/**
 * `surface: false` removes the decoration (`.v-panel`): the consumer provides its
 * own. This is the mode taken by the DS panels that have their own chrome —
 * VTooltip (inverted contrast), VDateInput and VTimeInput.
 */
export const WithoutSurface: Story = {
  args: { surface: false },
  render: (args) => ({
    components: { VPopover, VButton },
    setup: () => ({ args, t }),
    template: `
      <div style="padding: 60px">
        <VPopover v-bind="args">
          <template #trigger="{ triggerProps }">
            <VButton variant="outline" tone="neutral" v-bind="triggerProps">{{ t.open }}</VButton>
          </template>
          <img
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 160'%3E%3Crect width='240' height='160' fill='%231f2937'/%3E%3Ccircle cx='72' cy='60' r='22' fill='%23fbbf24'/%3E%3Cpath d='M0 160 78 84l52 44 40-30 70 62Z' fill='%2334d399'/%3E%3C/svg%3E"
            :alt="t.documentPreview"
            width="240"
            height="160"
            style="display: block; border-radius: 12px; box-shadow: var(--vectis-shadow-lg);"
          />
        </VPopover>
      </div>
    `,
  }),
}

/**
 * Programmatic opening through `v-model:open`, with no trigger: the consumer then
 * sets the anchor itself (`anchor-scope` on a common ancestor, `anchor-name` on
 * the element to follow) and passes it through the `anchor` prop. This is the mode
 * VCombobox, VTooltip, VDateInput and VTimeInput use.
 */
export const SuppliedAnchor: Story = {
  render: (args) => ({
    components: { VPopover, VButton, VTypography },
    setup: () => {
      const open = ref(false)
      return { args, open, t }
    },
    template: `
      <div style="padding: 60px">
        <div style="anchor-scope: --demo-anchor; display: inline-block;">
          <VButton
            variant="outline"
            tone="neutral"
            style="anchor-name: --demo-anchor;"
            :aria-expanded="open"
            @click="open = !open"
          >
            {{ t.toggle }}
          </VButton>
          <VPopover
            v-model:open="open"
            mode="manual"
            anchor="--demo-anchor"
            :placement="args.placement"
          >
            <VTypography variant="body-sm" as="p" style="padding: 8px">
              <code>manual</code> {{ t.manualPanel }}
            </VTypography>
          </VPopover>
        </div>
      </div>
    `,
  }),
}

/**
 * Automatic flipping at the screen edge (`position-try-fallbacks: flip-block,
 * flip-inline` — see floating.css): each trigger is stuck to a viewport edge with
 * a placement pointing at that edge. With no room, the browser flips the panel to
 * the opposite side, with no JS at all.
 */
export const EdgeFlipping: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => ({
    components: { VPopover, VButton, VTypography },
    setup: () => ({ args, t }),
    template: `
      <div style="position: relative; height: 100dvh;">
        <VTypography
          tone="muted"
          style="position: absolute; inset: 50% auto auto 50%; translate: -50% -50%; max-width: 28rem; text-align: center;"
        >
          {{ t.edgeIntro }}
        </VTypography>
        <div style="position: absolute; top: 8px; left: 50%; translate: -50%;">
          <VPopover placement="top">
            <template #trigger="{ triggerProps }">
              <VButton variant="outline" tone="neutral" v-bind="triggerProps">top → bottom</VButton>
            </template>
            <VTypography variant="body-sm" as="p" style="padding: 8px">{{ t.flippedDown }}</VTypography>
          </VPopover>
        </div>
        <div style="position: absolute; bottom: 8px; left: 50%; translate: -50%;">
          <VPopover placement="bottom">
            <template #trigger="{ triggerProps }">
              <VButton variant="outline" tone="neutral" v-bind="triggerProps">bottom → top</VButton>
            </template>
            <VTypography variant="body-sm" as="p" style="padding: 8px">{{ t.flippedUp }}</VTypography>
          </VPopover>
        </div>
        <div style="position: absolute; left: 8px; top: 50%; translate: 0 -50%;">
          <VPopover placement="left">
            <template #trigger="{ triggerProps }">
              <VButton variant="outline" tone="neutral" v-bind="triggerProps">left → right</VButton>
            </template>
            <VTypography variant="body-sm" as="p" style="padding: 8px">{{ t.flippedRight }}</VTypography>
          </VPopover>
        </div>
        <div style="position: absolute; right: 8px; top: 50%; translate: 0 -50%;">
          <VPopover placement="right">
            <template #trigger="{ triggerProps }">
              <VButton variant="outline" tone="neutral" v-bind="triggerProps">right → left</VButton>
            </template>
            <VTypography variant="body-sm" as="p" style="padding: 8px">{{ t.flippedLeft }}</VTypography>
          </VPopover>
        </div>
      </div>
    `,
  }),
}
