import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { storyText } from '../../stories/storyText'
import VTypography from '../VTypography/VTypography.vue'
import VLink from './VLink.vue'

const t = storyText({
  en: {
    before: 'Read the',
    link: 'installation guide',
    after: 'before adding the package to your project.',
    accent: 'Accent',
    neutral: 'Neutral',
    danger: 'Delete account',
    success: 'View receipt',
    warning: 'Review settings',
    always: 'Always underlined',
    hover: 'Underlined on hover',
    none: 'Never underlined',
    vue: 'Vue documentation',
    noIcon: 'Without the icon',
    customIcon: 'With another icon',
    archived: 'Archived release notes',
    heading: 'Heading with a',
    caption: 'Caption with a',
    inlineLink: 'link',
    builtWith: 'Built with',
    and: 'and',
  },
  fr: {
    before: 'Lisez le',
    link: 'guide d’installation',
    after: 'avant d’ajouter le paquet à votre projet.',
    accent: 'Accent',
    neutral: 'Neutre',
    danger: 'Supprimer le compte',
    success: 'Voir le reçu',
    warning: 'Vérifier les réglages',
    always: 'Toujours souligné',
    hover: 'Souligné au survol',
    none: 'Jamais souligné',
    vue: 'Documentation de Vue',
    noIcon: 'Sans l’icône',
    customIcon: 'Avec une autre icône',
    archived: 'Notes de version archivées',
    heading: 'Titre avec un',
    caption: 'Légende avec un',
    inlineLink: 'lien',
    builtWith: 'Construit avec',
    and: 'et',
  },
})

const meta = {
  title: 'Components/Link',
  component: VLink,
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['accent', 'neutral', 'danger', 'success', 'warning', 'inherit'],
    },
    underline: { control: 'inline-radio', options: ['always', 'hover', 'none'] },
    external: { control: 'boolean' },
    hideExternalIcon: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    href: '#install',
    tone: 'accent',
    underline: 'always',
    external: false,
    hideExternalIcon: false,
    disabled: false,
  },
  render: (args) => ({
    components: { VLink, VTypography },
    setup: () => ({ args, t }),
    template: `
      <VTypography style="max-width: 560px">
        {{ t.before }} <VLink v-bind="args">{{ t.link }}</VLink> {{ t.after }}
      </VTypography>
    `,
  }),
} satisfies Meta<typeof VLink>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'installation guide' })
    expect(link).toHaveAttribute('href', '#install')
    expect(getComputedStyle(link).textDecorationLine).toBe('underline')
    // The link takes the size of the text around it.
    expect(getComputedStyle(link).fontSize).toBe(getComputedStyle(link.parentElement!).fontSize)
  },
}

/** `tone` paints the link; `neutral` takes the colour of the text. */
export const Tones: Story = {
  render: () => ({
    components: { VLink },
    setup: () => ({ t, tones: ['accent', 'neutral', 'danger', 'success', 'warning'] as const }),
    template: `
      <ul style="display: flex; flex-wrap: wrap; gap: 24px; margin: 0; padding: 0; list-style: none">
        <li v-for="tone in tones" :key="tone">
          <VLink href="#tones" :tone="tone">{{ t[tone] }}</VLink>
        </li>
      </ul>
    `,
  }),
}

/**
 * `tone="inherit"` takes the colour of the text around the link, muted here, and turns to the
 * accent on hover. The underline still tells the link apart.
 */
export const InheritedColour: Story = {
  render: () => ({
    components: { VLink, VTypography },
    setup: () => ({ t }),
    template: `
      <VTypography variant="body-sm" tone="muted">
        {{ t.builtWith }} <VLink href="#vectis" tone="inherit">Vectis UI</VLink> {{ t.and }}
        <VLink href="#nuxt" tone="inherit">Nuxt</VLink>.
      </VTypography>
    `,
  }),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Nuxt' })
    expect(getComputedStyle(link).color).toBe(getComputedStyle(link.parentElement!).color)
    expect(getComputedStyle(link).textDecorationLine).toBe('underline')
  },
}

/**
 * `underline` decides when the line shows. Keep `always` inside running text; `hover` and `none`
 * suit menus and lists of links.
 */
export const Underline: Story = {
  render: () => ({
    components: { VLink },
    setup: () => ({ t, variants: ['always', 'hover', 'none'] as const }),
    template: `
      <ul style="display: flex; flex-wrap: wrap; gap: 24px; margin: 0; padding: 0; list-style: none">
        <li v-for="variant in variants" :key="variant">
          <VLink href="#underline" :underline="variant">{{ t[variant] }}</VLink>
        </li>
      </ul>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const line = (name: string) =>
      getComputedStyle(canvas.getByRole('link', { name })).textDecorationLine
    expect(line('Always underlined')).toBe('underline')
    expect(line('Underlined on hover')).toBe('none')
    expect(line('Never underlined')).toBe('none')
    // Keyboard focus shows the line as hovering does.
    await userEvent.tab()
    await userEvent.tab()
    await waitFor(() => expect(line('Underlined on hover')).toBe('underline'))
  },
}

/**
 * `external` opens a new tab with `rel="noopener noreferrer"`, adds an icon and tells screen
 * readers. `externalIcon` replaces the icon and `hideExternalIcon` removes it.
 */
export const External: Story = {
  render: () => ({
    components: { VLink },
    setup: () => ({ t }),
    template: `
      <ul style="display: flex; flex-direction: column; gap: 12px; margin: 0; padding: 0; list-style: none">
        <li><VLink href="https://vuejs.org" external>{{ t.vue }}</VLink></li>
        <li><VLink href="https://vuejs.org" external hide-external-icon>{{ t.noIcon }}</VLink></li>
        <li><VLink href="https://vuejs.org" external external-icon="launch">{{ t.customIcon }}</VLink></li>
      </ul>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const link = canvas.getByRole('link', { name: /^Vue documentation ?, opens in a new tab$/ })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    // The icon follows the size of the text.
    const icon = link.querySelector('.v-link-external')!
    expect(icon.getBoundingClientRect().height).toBe(parseFloat(getComputedStyle(link).fontSize))
    expect(
      canvas.getByRole('link', { name: /^Without the icon ?, opens in a new tab$/ }),
    ).toBeInTheDocument()
  },
}

/** A disabled link loses its address and is marked `aria-disabled`. */
export const Disabled: Story = {
  render: () => ({
    components: { VLink },
    setup: () => ({ t }),
    template: `<VLink href="#archive" disabled>{{ t.archived }}</VLink>`,
  }),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Archived release notes' })
    expect(link).not.toHaveAttribute('href')
    expect(link).toHaveAttribute('aria-disabled', 'true')
  },
}

/** The link takes the size and weight of the text it sits in, and so does its icon. */
export const InheritedText: Story = {
  render: () => ({
    components: { VLink, VTypography },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 16px">
        <VTypography variant="heading-3">
          {{ t.heading }} <VLink href="https://vuejs.org" external>{{ t.inlineLink }}</VLink>
        </VTypography>
        <VTypography variant="caption">
          {{ t.caption }} <VLink href="https://vuejs.org" external>{{ t.inlineLink }}</VLink>
        </VTypography>
      </div>
    `,
  }),
}
