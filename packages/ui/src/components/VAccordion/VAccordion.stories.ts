import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { builtinIcons as icons } from '../VIcon/icons'
import { storyText } from '../../stories/storyText'
import VAccordion from './VAccordion.vue'
import VAccordionItem from './VAccordionItem.vue'

const t = storyText({
  en: {
    whatIsVectis: 'What is Vectis?',
    whatIsVectisBody: 'A Vue 3 design system founded on the native primitives of the platform.',
    howToTheme: 'How do I customize the theme?',
    howToThemeBody: 'Redefine any --vectis-* custom property on :root or on a subtree.',
    whichBrowsers: 'Which browsers are supported?',
    whichBrowsersBody: 'Modern browsers: Chrome/Edge 125+, Safari 26+.',
    first: 'First',
    firstBody: 'Content of the first panel.',
    second: 'Second',
    secondBody: 'Content of the second panel.',
    billing: 'Billing',
    comingSoonParen: '(coming soon)',
    billingBody: 'Billing details.',
    notifications: 'Notifications',
    notificationsSub: 'Emails, push and weekly digests',
    notificationsBody: 'Notification preferences.',
    privacy: 'Privacy',
    privacySub: 'Profile visibility and shared data',
    privacyBody: 'Privacy settings.',
    account: 'Account',
    accountBody: 'An item may carry an icon with no subtitle.',
    sessions: 'Sessions',
    sessionsSub: 'Connected devices',
    sessionsBody: 'Or a subtitle with no icon.',
    flatTitle: 'flat — no decoration',
    flatBody: 'No border, no radius, no background: the accordion inherits its container surface.',
    separatorsTitle: 'The separators remain',
    separatorsBody: 'They belong to reading the list, not to framing it.',
    outlinedTitle: 'outlined — border and radius',
    outlinedBody: 'A 1px rule surrounds the group, on a raised background.',
    nestedRadiusTitle: 'Nested inner radius',
    nestedRadiusBody: 'The corners of the end items follow the group clip.',
    available: 'Available',
    availableBody: 'An openable panel.',
    comingSoon: 'Coming soon',
    comingSoonBody: 'An inaccessible panel.',
    alsoAvailable: 'Also available',
    alsoAvailableBody: 'Another openable panel.',
  },
  fr: {
    whatIsVectis: "Qu'est-ce que Vectis ?",
    whatIsVectisBody: 'Un design system Vue 3 fondé sur les primitives natives de la plateforme.',
    howToTheme: 'Comment personnaliser le thème ?',
    howToThemeBody:
      "Redéfinissez n'importe quelle custom property --vectis-* sur :root ou un sous-arbre.",
    whichBrowsers: 'Quels navigateurs sont supportés ?',
    whichBrowsersBody: 'Les navigateurs modernes : Chrome/Edge 125+, Safari 26+.',
    first: 'Premier',
    firstBody: 'Contenu du premier panneau.',
    second: 'Second',
    secondBody: 'Contenu du second panneau.',
    billing: 'Facturation',
    comingSoonParen: '(bientôt disponible)',
    billingBody: 'Détails de facturation.',
    notifications: 'Notifications',
    notificationsSub: 'E-mails, push et récapitulatifs hebdomadaires',
    notificationsBody: 'Préférences de notification.',
    privacy: 'Confidentialité',
    privacySub: 'Visibilité du profil et données partagées',
    privacyBody: 'Réglages de confidentialité.',
    account: 'Compte',
    accountBody: 'Un item peut porter une icône sans sous-titre.',
    sessions: 'Sessions',
    sessionsSub: 'Appareils connectés',
    sessionsBody: 'Ou un sous-titre sans icône.',
    flatTitle: 'flat — aucun habillage',
    flatBody: "Ni bordure, ni rayon, ni fond : l'accordéon hérite de la surface de son conteneur.",
    separatorsTitle: 'Les séparateurs subsistent',
    separatorsBody: 'Ils appartiennent à la lecture de la liste, pas à son cadre.',
    outlinedTitle: 'outlined — bordure et rayon',
    outlinedBody: 'Un trait de 1px cerne le groupe, sur un fond surélevé.',
    nestedRadiusTitle: 'Rayon intérieur emboîté',
    nestedRadiusBody: "Les coins des items d'extrémité suivent la découpe du groupe.",
    available: 'Disponible',
    availableBody: 'Panneau ouvrable.',
    comingSoon: 'Bientôt disponible',
    comingSoonBody: 'Panneau inaccessible.',
    alsoAvailable: 'Disponible aussi',
    alsoAvailableBody: 'Autre panneau ouvrable.',
  },
})

const meta = {
  title: 'Components/Accordion',
  component: VAccordion,
  argTypes: {
    exclusive: { control: 'boolean' },
    variant: { control: 'inline-radio', options: ['flat', 'outlined'] },
    compact: { control: 'boolean' },
    expandIcon: { control: 'text' },
    collapseIcon: { control: 'text' },
  },
} satisfies Meta<typeof VAccordion>

export default meta
type Story = StoryObj<typeof meta>

const ITEMS = `
  <VAccordionItem :title="t.whatIsVectis" default-open>{{ t.whatIsVectisBody }}</VAccordionItem>
  <VAccordionItem :title="t.howToTheme">{{ t.howToThemeBody }}</VAccordionItem>
  <VAccordionItem :title="t.whichBrowsers">{{ t.whichBrowsersBody }}</VAccordionItem>
`

export const Default: Story = {
  args: { exclusive: true, variant: 'flat', compact: false },
  render: (args) => ({
    components: { VAccordion, VAccordionItem },
    setup: () => ({ args, t }),
    template: `
      <VAccordion v-bind="args" style="width: 420px">${ITEMS}</VAccordion>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const details = [...canvasElement.querySelectorAll('details')]
    await expect(details[0]?.open).toBe(true)

    // NATIVE exclusive mode (the name attribute): opening the 2nd closes the 1st, with no JS
    await userEvent.click(canvas.getByText('How do I customize the theme?'))
    await waitFor(() => expect(details[1]?.open).toBe(true))
    await waitFor(() => expect(details[0]?.open).toBe(false))
  },
}

export const MultipleOpen: Story = {
  render: () => ({
    components: { VAccordion, VAccordionItem },
    setup: () => ({ t }),
    template: `
      <VAccordion :exclusive="false" style="width: 420px">
        <VAccordionItem :title="t.first">{{ t.firstBody }}</VAccordionItem>
        <VAccordionItem :title="t.second">{{ t.secondBody }}</VAccordionItem>
      </VAccordion>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const details = [...canvasElement.querySelectorAll('details')]
    await userEvent.click(canvas.getByText('First'))
    await userEvent.click(canvas.getByText('Second'))
    // with no shared name, both stay open
    await waitFor(() => expect(details[0]?.open).toBe(true))
    await waitFor(() => expect(details[1]?.open).toBe(true))
  },
}

export const RichTitle: Story = {
  render: () => ({
    components: { VAccordion, VAccordionItem },
    setup: () => ({ t }),
    template: `
      <VAccordion style="width: 420px">
        <VAccordionItem>
          <template #title>{{ t.billing }} <em>{{ t.comingSoonParen }}</em></template>
          {{ t.billingBody }}
        </VAccordionItem>
      </VAccordion>
    `,
  }),
}

/** `subtitle` + `iconStart`: a subtitle stacked under the title, an icon before the block. */
export const SubtitleAndIcon: Story = {
  render: () => ({
    components: { VAccordion, VAccordionItem },
    setup: () => ({ icons, t }),
    template: `
      <VAccordion style="width: 420px">
        <VAccordionItem
          :title="t.notifications"
          :subtitle="t.notificationsSub"
          :icon-start="icons.notifications"
        >
          {{ t.notificationsBody }}
        </VAccordionItem>
        <VAccordionItem :title="t.privacy" :subtitle="t.privacySub" icon-start="lock">
          {{ t.privacyBody }}
        </VAccordionItem>
        <VAccordionItem :title="t.account" icon-start="person">
          {{ t.accountBody }}
        </VAccordionItem>
        <VAccordionItem :title="t.sessions" :subtitle="t.sessionsSub">
          {{ t.sessionsBody }}
        </VAccordionItem>
      </VAccordion>
    `,
  }),
}

/** `expandIcon`/`collapseIcon`: two icons swapped in CSS (here add ↔ remove). */
export const CustomIcons: Story = {
  render: () => ({
    components: { VAccordion, VAccordionItem },
    setup: () => ({ t }),
    template: `
      <VAccordion expand-icon="add" collapse-icon="remove" style="width: 420px">
        <VAccordionItem :title="t.first">{{ t.firstBody }}</VAccordionItem>
        <VAccordionItem :title="t.second">{{ t.secondBody }}</VAccordionItem>
      </VAccordion>
    `,
  }),
  play: async ({ canvasElement }) => {
    const [first] = [...canvasElement.querySelectorAll('details')]
    const item = within(first as HTMLElement)
    await expect(item.getByText('add')).toBeVisible()
    await expect(item.getByText('remove')).not.toBeVisible()

    await userEvent.click(item.getByText('First'))
    await waitFor(() => expect(item.getByText('remove')).toBeVisible())
    await waitFor(() => expect(item.getByText('add')).not.toBeVisible())
  },
}

/** The two decorations: `flat` (the default, none) and `outlined` (raised background, border, radius). */
export const Variants: Story = {
  render: () => ({
    components: { VAccordion, VAccordionItem },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 32px; width: 420px">
        <VAccordion variant="flat">
          <VAccordionItem :title="t.flatTitle">{{ t.flatBody }}</VAccordionItem>
          <VAccordionItem :title="t.separatorsTitle">{{ t.separatorsBody }}</VAccordionItem>
        </VAccordion>

        <VAccordion variant="outlined">
          <VAccordionItem :title="t.outlinedTitle">{{ t.outlinedBody }}</VAccordionItem>
          <VAccordionItem :title="t.nestedRadiusTitle">{{ t.nestedRadiusBody }}</VAccordionItem>
        </VAccordion>
      </div>
    `,
  }),
}

/** `compact`: -4px on every padding, type and icons unchanged. */
export const Compact: Story = {
  render: () => ({
    components: { VAccordion, VAccordionItem },
    setup: () => ({ t }),
    template: `
      <VAccordion compact style="width: 420px">${ITEMS}</VAccordion>
    `,
  }),
}

/** Disabled item: greyed through tokens, inert on click and out of the keyboard path. */
export const DisabledItem: Story = {
  render: () => ({
    components: { VAccordion, VAccordionItem },
    setup: () => ({ t }),
    template: `
      <VAccordion style="width: 420px">
        <VAccordionItem :title="t.available">{{ t.availableBody }}</VAccordionItem>
        <VAccordionItem :title="t.comingSoon" disabled>{{ t.comingSoonBody }}</VAccordionItem>
        <VAccordionItem :title="t.alsoAvailable">{{ t.alsoAvailableBody }}</VAccordionItem>
      </VAccordion>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const details = [...canvasElement.querySelectorAll('details')]
    await userEvent.click(canvas.getByText('Coming soon'))
    await waitFor(() => expect(details[1]?.open).toBe(false))
  },
}
