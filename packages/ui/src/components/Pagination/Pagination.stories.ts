import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import Pagination from './Pagination.vue'

const meta = {
  title: 'Composants/Pagination',
  component: Pagination,
  args: { count: 12 },
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { Pagination },
    setup: () => ({ args, page: ref(5) }),
    template: '<Pagination v-bind="args" v-model="page" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: 'Page 5' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await userEvent.click(canvas.getByRole('button', { name: 'Page suivante' }))
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Page 6' })).toHaveAttribute(
        'aria-current',
        'page',
      ),
    )
  },
}

export const PremierePage: Story = {
  render: (args) => ({
    components: { Pagination },
    setup: () => ({ args, page: ref(1) }),
    template: '<Pagination v-bind="args" v-model="page" />',
  }),
  play: async ({ canvasElement }) => {
    // bouton précédent désactivé en butée
    await expect(
      within(canvasElement).getByRole('button', { name: 'Page précédente' }),
    ).toBeDisabled()
  },
}

export const PeuDePages: Story = {
  args: { count: 4 },
  render: (args) => ({
    components: { Pagination },
    setup: () => ({ args, page: ref(2) }),
    template: '<Pagination v-bind="args" v-model="page" />',
  }),
}

export const BeaucoupDePages: Story = {
  args: { count: 120, siblingCount: 2 },
  render: (args) => ({
    components: { Pagination },
    setup: () => ({ args, page: ref(60) }),
    template: '<Pagination v-bind="args" v-model="page" />',
  }),
}
