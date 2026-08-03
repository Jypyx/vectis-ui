import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { computed } from 'vue'

import { storyText } from '../../stories/storyText'
import VBreadcrumb from './VBreadcrumb.vue'

const t = storyText({
  en: {
    home: 'Home',
    projects: 'Projects',
    settings: 'Settings',
    designSystem: 'Design system',
    components: 'Components',
    navigation: 'Navigation',
    firstLevelLong: 'A first level with a long label',
    secondLevelLonger: 'A second level, longer still',
    endlessCurrentPage: 'An endless current page',
  },
  fr: {
    home: 'Accueil',
    projects: 'Projets',
    settings: 'Paramètres',
    designSystem: 'Design system',
    components: 'Composants',
    navigation: 'Navigation',
    firstLevelLong: 'Un premier niveau au libellé long',
    secondLevelLonger: 'Un deuxième niveau encore plus long',
    endlessCurrentPage: 'Page courante interminable',
  },
})

const meta = {
  title: 'Components/Breadcrumb',
  component: VBreadcrumb,
  // `items` is required, and every story builds its own list in `render` so the
  // labels follow the locale: the meta only has to satisfy the type.
  args: { items: [] },
} satisfies Meta<typeof VBreadcrumb>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { VBreadcrumb },
    setup: () => ({
      items: computed(() => [
        { label: t.value.home, href: '/' },
        { label: t.value.projects, href: '/projects' },
        { label: 'Vectis', href: '/projects/vectis' },
        { label: t.value.settings, href: '/projects/vectis/settings' },
      ]),
    }),
    template: `<VBreadcrumb :items="items" current-path="/projects/vectis/settings" />`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible()
    // the active item is detected through currentPath: a clickable link + aria-current
    await expect(canvas.getByRole('link', { name: 'Settings' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(canvas.getByRole('link', { name: 'Vectis' })).not.toHaveAttribute('aria-current')
  },
}

export const IconSeparator: Story = {
  // A string is ALWAYS an icon name; an image is declared as `{ src }` (see
  // ImageSeparator). RTL note: a directional icon does not flip automatically — check
  // it with the toolbar toggle.
  render: () => ({
    components: { VBreadcrumb },
    setup: () => ({
      items: computed(() => [
        { label: t.value.home, href: '/' },
        { label: t.value.projects, href: '/projects' },
        { label: 'Vectis', href: '/projects/vectis' },
      ]),
    }),
    template: `
      <VBreadcrumb :items="items" separator="arrow_forward" current-path="/projects/vectis" />
    `,
  }),
  play: async ({ canvasElement }) => {
    const separators = canvasElement.querySelectorAll('.v-breadcrumb-separator')
    await expect(separators).toHaveLength(3)
    // the first item is preceded by no separator (the :first-child rule)
    await expect(separators[0]).not.toBeVisible()
    await expect(separators[1]).toBeVisible()
    await expect(separators[2]).toBeVisible()
  },
}

export const ImageSeparator: Story = {
  // An explicit `{ src }` render — no guessing about the string's content.
  render: () => ({
    components: { VBreadcrumb },
    setup: () => ({
      separator: {
        src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800px' height='800px' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M10 3V6H4L4 10H10L10 13L11 13L16 8L11 3L10 3Z' fill='%23000000'/%3E%3Cpath d='M0 2L1.38281e-06 14H2L2 2L0 2Z' fill='%23000000'/%3E%3C/svg%3E",
      },
      items: computed(() => [
        { label: t.value.home, href: '/' },
        { label: t.value.projects, href: '/projects' },
        { label: 'Vectis', href: '/projects/vectis' },
      ]),
    }),
    template: `
      <VBreadcrumb :items="items" :separator="separator" current-path="/projects/vectis" />
    `,
  }),
}

export const WithIcons: Story = {
  render: () => ({
    components: { VBreadcrumb },
    setup: () => ({
      items: computed(() => [
        { label: t.value.home, href: '/', iconStart: 'home' },
        { label: t.value.projects, href: '/projects', iconStart: 'folder' },
        {
          label: 'Vectis',
          href: '/projects/vectis',
          iconStart: {
            src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect x='2' y='2' width='12' height='12' rx='3' fill='none' stroke='%23999' stroke-width='1.5'/%3E%3C/svg%3E",
          },
        },
      ]),
    }),
    template: `<VBreadcrumb :items="items" current-path="/projects/vectis" />`,
  }),
}

export const Truncated: Story = {
  render: () => ({
    components: { VBreadcrumb },
    setup: () => ({
      items: computed(() => [
        { label: t.value.home, href: '/', iconStart: 'home' },
        { label: t.value.projects, href: '/a' },
        { label: t.value.designSystem, href: '/a/b' },
        { label: 'Vectis', href: '/a/b/c' },
        { label: t.value.components, href: '/a/b/c/d' },
        { label: t.value.navigation, href: '/a/b/c/d/e' },
        { label: 'Breadcrumb', href: '/a/b/c/d/e/f' },
        { label: t.value.settings, href: '/a/b/c/d/e/f/g' },
      ]),
    }),
    template: `<VBreadcrumb :items="items" :max-items="4" current-path="/a/b/c/d/e/f/g" />`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const menu = canvasElement.querySelector('[role="menu"]') as HTMLElement

    // visible: first, second-to-last, last (active) + the ellipsis button
    await expect(canvas.getAllByRole('listitem')).toHaveLength(4)
    await expect(canvas.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Breadcrumb' })).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Settings' })).toHaveAttribute(
      'aria-current',
      'page',
    )

    // when closed, the menu panel is out of the layout: it does not cover the neighbouring links
    await expect(getComputedStyle(menu).display).toBe('none')

    // the ellipsis opens the menu of the hidden items only, which are links
    const trigger = canvas.getByRole('button', { name: 'Show intermediate pages' })
    await userEvent.click(trigger)
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(true))
    const items = canvas.getAllByRole('menuitem')
    await expect(items.map((item) => item.textContent?.trim())).toEqual([
      'Projects',
      'Design system',
      'Vectis',
      'Components',
      'Navigation',
    ])
    await expect(canvas.getByRole('menuitem', { name: 'Vectis' })).toHaveAttribute('href', '/a/b/c')

    // Escape closes and hands the focus back to the trigger
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(false))
    await waitFor(() => expect(trigger).toHaveFocus())
  },
}

export const LongLabels: Story = {
  render: () => ({
    components: { VBreadcrumb },
    setup: () => ({
      items: computed(() => [
        { label: t.value.firstLevelLong, href: '/first' },
        { label: t.value.secondLevelLonger, href: '/second' },
        { label: t.value.endlessCurrentPage, href: '/current' },
      ]),
    }),
    template: `
      <div style="max-width: 280px">
        <VBreadcrumb :items="items" current-path="/current" />
      </div>
    `,
  }),
}
