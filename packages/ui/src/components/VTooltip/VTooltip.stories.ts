import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import VButton from '../VButton/VButton.vue'
import VIconButton from '../VIconButton/VIconButton.vue'
import VTypography from '../VTypography/VTypography.vue'
import { storyText } from '../../stories/storyText'
import VTooltip from './VTooltip.vue'

const t = storyText({
  en: {
    deleteItem: 'Delete the item',
    search: 'Search',
    globalSearch: 'Global search',
    searchesIn: 'Searches the files, symbols and commands of the project.',
    shortcut: 'Shortcut:',
    edgeIntro:
      'Each button asks for a placement pointing at the edge it sits near: the tooltip flips automatically to the opposite side',
  },
  fr: {
    deleteItem: "Supprimer l'élément",
    search: 'Rechercher',
    globalSearch: 'Recherche globale',
    searchesIn: 'Cherche dans les fichiers, les symboles et les commandes du projet.',
    shortcut: 'Raccourci :',
    edgeIntro:
      'Chaque bouton demande un placement orienté vers le bord dont il est proche : le tooltip bascule automatiquement du côté opposé',
  },
})

const meta = {
  title: 'Components/Tooltip',
  component: VTooltip,
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
    text: 'Copy to the clipboard',
    placement: 'top',
    delay: 300,
  },
  render: (args) => ({
    components: { VTooltip, VButton },
    setup: () => ({ args }),
    template: `
      <div style="padding: 60px">
        <VTooltip v-bind="args">
          <template #default="{ triggerProps }">
            <VButton variant="outline" tone="neutral" v-bind="triggerProps">Copy</VButton>
          </template>
        </VTooltip>
      </div>
    `,
  }),
} satisfies Meta<typeof VTooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Keyboard focus opens immediately (with no delay) — WCAG. */
export const OpenOnFocus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const tooltip = canvasElement.querySelector('[role="tooltip"]') as HTMLElement
    const trigger = canvas.getByRole('button', { name: 'Copy' })

    await userEvent.tab()
    await expect(trigger).toHaveFocus()
    await waitFor(() => expect(tooltip.matches(':popover-open')).toBe(true))
    // the trigger is described by the tooltip
    await expect(trigger).toHaveAttribute('aria-describedby', tooltip.id)

    /*
     * `.v-popover-panel.v-tooltip-panel`: the compound is what makes the panel's own
     * chrome immune to `.v-panel`'s, at equal specificity, the day `surface` flips
     * (VTooltip passes false today). If the compound stopped matching, every
     * declaration below it would go with it — the padding first.
     */
    await expect(getComputedStyle(tooltip).padding).toBe('4px 8px')

    // Escape closes (WCAG 1.4.13)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(tooltip.matches(':popover-open')).toBe(false))
  },
}

export const OnIconButton: Story = {
  render: (args) => ({
    components: { VTooltip, VIconButton },
    setup: () => ({ args, t }),
    template: `
      <div style="padding: 60px">
        <VTooltip v-bind="args" :text="t.deleteItem" placement="bottom">
          <template #default="{ triggerProps }">
            <VIconButton :label="t.deleteItem" tone="danger" v-bind="triggerProps">
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </VIconButton>
          </template>
        </VTooltip>
      </div>
    `,
  }),
}

export const LongText: Story = {
  args: {
    text: 'An abnormally long description that must wrap cleanly without exceeding the panel maximum width.',
  },
}

/** The eight available placements, laid out around an empty centre. */
export const Placements: Story = {
  render: (args) => ({
    components: { VTooltip, VButton },
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
          <VTooltip
            v-if="placement"
            :key="placement"
            :text="args.text"
            :delay="args.delay"
            :placement="placement"
          >
            <template #default="{ triggerProps }">
              <VButton variant="outline" tone="neutral" v-bind="triggerProps">
                {{ placement }}
              </VButton>
            </template>
          </VTooltip>
          <span v-else aria-hidden="true"></span>
        </template>
      </div>
    `,
  }),
}

/**
 * Rich content through the `#content` slot (which wins over the `text` prop).
 * Reserved for NON-interactive content: the tooltip closes as soon as the pointer
 * leaves the trigger, and `aria-describedby` flattens the content to text — a link
 * or a button would be unreachable there (use VPopover in that case).
 */
export const RichContent: Story = {
  render: (args) => ({
    components: { VTooltip, VButton },
    setup: () => ({ args, t }),
    template: `
      <div style="padding: 100px 60px">
        <VTooltip :delay="args.delay" placement="bottom-start">
          <template #default="{ triggerProps }">
            <VButton variant="outline" tone="neutral" v-bind="triggerProps">{{ t.search }}</VButton>
          </template>
          <template #content>
            <div style="display: grid; gap: 4px; padding: 4px 0;">
              <strong>{{ t.globalSearch }}</strong>
              <span>{{ t.searchesIn }}</span>
              <span style="opacity: 0.75;">
                {{ t.shortcut }}
                <kbd style="border: 1px solid currentcolor; border-radius: 4px; padding: 0 4px;">Ctrl</kbd>
                +
                <kbd style="border: 1px solid currentcolor; border-radius: 4px; padding: 0 4px;">K</kbd>
              </span>
            </div>
          </template>
        </VTooltip>
      </div>
    `,
  }),
}

/**
 * Automatic flipping at the screen edge (`position-try-fallbacks: flip-block,
 * flip-inline` — see floating.css): each trigger is stuck to a viewport edge with a
 * placement pointing at that edge. With no room, the browser flips the panel to the
 * opposite side, with no JS at all.
 */
export const EdgeFlipping: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => ({
    components: { VTooltip, VButton, VTypography },
    setup: () => ({ args, t }),
    template: `
      <div style="position: relative; height: 100dvh;">
        <VTypography
          tone="muted"
          style="position: absolute; inset: 50% auto auto 50%; translate: -50% -50%; max-width: 28rem; text-align: center;"
        >
          {{ t.edgeIntro }}
          (<code>position-try-fallbacks</code>).
        </VTypography>
        <div style="position: absolute; top: 8px; left: 50%; translate: -50%;">
          <VTooltip :text="args.text" :delay="args.delay" placement="top">
            <template #default="{ triggerProps }">
              <VButton variant="outline" tone="neutral" v-bind="triggerProps">top → bottom</VButton>
            </template>
          </VTooltip>
        </div>
        <div style="position: absolute; bottom: 8px; left: 50%; translate: -50%;">
          <VTooltip :text="args.text" :delay="args.delay" placement="bottom">
            <template #default="{ triggerProps }">
              <VButton variant="outline" tone="neutral" v-bind="triggerProps">bottom → top</VButton>
            </template>
          </VTooltip>
        </div>
        <div style="position: absolute; left: 8px; top: 50%; translate: 0 -50%;">
          <VTooltip :text="args.text" :delay="args.delay" placement="left">
            <template #default="{ triggerProps }">
              <VButton variant="outline" tone="neutral" v-bind="triggerProps">left → right</VButton>
            </template>
          </VTooltip>
        </div>
        <div style="position: absolute; right: 8px; top: 50%; translate: 0 -50%;">
          <VTooltip :text="args.text" :delay="args.delay" placement="right">
            <template #default="{ triggerProps }">
              <VButton variant="outline" tone="neutral" v-bind="triggerProps">right → left</VButton>
            </template>
          </VTooltip>
        </div>
      </div>
    `,
  }),
}
