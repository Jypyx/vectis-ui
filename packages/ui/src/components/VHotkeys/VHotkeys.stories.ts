import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VButton from '../VButton/VButton.vue'
import VChip from '../VChip/VChip.vue'
import VInput from '../VInput/VInput.vue'
import VHotkeys from './VHotkeys.vue'

const t = storyText({
  en: {
    onMacOS: 'macOS',
    onWindows: 'Windows',
    onLinux: 'Linux',
    detected: 'Detected (this machine)',
    searchHint: 'Press to search',
    commandPalette: 'Command palette',
    newFile: 'New file',
    save: 'Save',
    settings: 'Settings',
    detachedRow: 'Default (one key each)',
    attachedRow: 'Attached (a single key)',
    defaultSeparator: 'Default separator',
    macConvention: 'macOS convention (no separator)',
    inProse: 'To open the palette, press',
    thenType: 'then type the name of a command.',
    sameHeight: 'Same height as a Button and a Chip of the same size',
    chipLabel: 'Chip',
    buttonLabel: 'Button',
    pressIt: 'Press Ctrl+K anywhere on the page',
    triggered: 'Triggered',
    focusThenPress: 'Focus the field, then press Ctrl+K',
    ignoresFields: 'Ignores text fields (default)',
    listensEverywhere: 'Listens in text fields too',
  },
  fr: {
    onMacOS: 'macOS',
    onWindows: 'Windows',
    onLinux: 'Linux',
    detected: 'Détecté (cette machine)',
    searchHint: 'Appuyez pour rechercher',
    commandPalette: 'Palette de commandes',
    newFile: 'Nouveau fichier',
    save: 'Enregistrer',
    settings: 'Paramètres',
    detachedRow: 'Défaut (une touche chacun)',
    attachedRow: 'Attached (une seule touche)',
    defaultSeparator: 'Séparateur par défaut',
    macConvention: 'Convention macOS (sans séparateur)',
    inProse: 'Pour ouvrir la palette, appuyez sur',
    thenType: 'puis saisissez le nom d’une commande.',
    sameHeight: 'Même hauteur qu’un Button et qu’un Chip de même taille',
    chipLabel: 'Chip',
    buttonLabel: 'Button',
    pressIt: 'Appuyez sur Ctrl+K n’importe où dans la page',
    triggered: 'Déclenché',
    focusThenPress: 'Placez le focus dans le champ, puis appuyez sur Ctrl+K',
    ignoresFields: 'Ignore les champs de saisie (défaut)',
    listensEverywhere: 'Écoute aussi dans les champs de saisie',
  },
})

const meta = {
  title: 'Components/Hotkeys',
  component: VHotkeys,
  argTypes: {
    variant: { control: 'select', options: ['flat', 'outlined', 'elevated'] },
    size: { control: 'select', options: ['xs', 'sm'] },
    platform: { control: 'select', options: [undefined, 'mac', 'windows', 'linux', 'other'] },
    attached: { control: 'boolean' },
    compact: { control: 'boolean' },
    listen: { control: 'boolean' },
    allowDefault: { control: 'boolean' },
    allowInInput: { control: 'boolean' },
    keys: { control: 'text' },
    separator: { control: 'text' },
    label: { control: 'text' },
  },
  args: {
    keys: 'mod+k',
    variant: 'flat',
    attached: false,
    size: 'xs',
    compact: false,
    separator: '+',
    listen: false,
    allowInInput: false,
  },
  render: (args) => ({
    components: { VHotkeys },
    setup: () => ({ args }),
    template: '<VHotkeys v-bind="args" />',
  }),
} satisfies Meta<typeof VHotkeys>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** `flat` (the default), `outlined` and `elevated` mirror the neutral tone of VButton. */
export const Variants: Story = {
  render: () => ({
    components: { VHotkeys },
    setup: () => ({ variants: ['flat', 'outlined', 'elevated'] }),
    template: `
      <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center">
        <VHotkeys v-for="variant in variants" :key="variant" :variant="variant" keys="mod+shift+k" />
      </div>
    `,
  }),
}

/**
 * The whole point of the component: `mod` is ⌘ on macOS and Ctrl everywhere else, and `meta`
 * names the physical key (Command, Windows, Super). The last column is the OS actually
 * detected on this machine — it is what a consumer gets without the `platform` prop.
 */
export const Platforms: Story = {
  render: () => ({
    components: { VHotkeys },
    setup: () => ({
      t,
      combos: ['mod+k', 'meta+shift+p', 'alt+enter', 'mod+backspace'],
    }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(4, max-content); gap: 12px 24px; align-items: center; justify-items: start">
        <strong style="font: inherit">{{ t.onMacOS }}</strong>
        <strong style="font: inherit">{{ t.onWindows }}</strong>
        <strong style="font: inherit">{{ t.onLinux }}</strong>
        <strong style="font: inherit">{{ t.detected }}</strong>
        <template v-for="combo in combos" :key="combo">
          <VHotkeys :keys="combo" platform="mac" />
          <VHotkeys :keys="combo" platform="windows" />
          <VHotkeys :keys="combo" platform="linux" />
          <VHotkeys :keys="combo" />
        </template>
      </div>
    `,
  }),
}

/**
 * `attached` joins the caps into a single key: the variant's decoration moves from each cap
 * to the root, so the separator ends up inside the key instead of between two of them.
 */
export const Attached: Story = {
  render: () => ({
    components: { VHotkeys },
    setup: () => ({ t, variants: ['flat', 'outlined', 'elevated'] }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(3, max-content); gap: 16px 32px; align-items: center; justify-items: start">
        <span style="font: inherit; opacity: 0.7">{{ t.detachedRow }}</span>
        <VHotkeys keys="mod+shift+k" platform="windows" />
        <VHotkeys keys="k" platform="windows" />
        <span style="font: inherit; opacity: 0.7">{{ t.attachedRow }}</span>
        <VHotkeys keys="mod+shift+k" platform="windows" attached />
        <VHotkeys keys="k" platform="windows" attached />
        <template v-for="variant in variants" :key="variant">
          <span style="font: inherit; opacity: 0.7">{{ variant }}</span>
          <VHotkeys keys="mod+shift+k" platform="windows" attached :variant="variant" />
          <VHotkeys keys="mod+shift+k" platform="mac" attached :variant="variant" separator="" />
        </template>
      </div>
    `,
  }),
  /* The whole feature is one CSS rule with two carriers, and nothing else covers
     it: jsdom evaluates no styles, and a typo in the `:not([data-attached])` half
     would decorate BOTH the root and the caps with no error anywhere. Verified
     red by dropping that `:not()`. */
  play: async ({ canvasElement }) => {
    const roots = [...canvasElement.querySelectorAll<HTMLElement>('.v-hotkeys')]
    const [detached, , attached] = roots

    const bg = (el: Element) => getComputedStyle(el).backgroundColor
    const TRANSPARENT = 'rgba(0, 0, 0, 0)'
    /* Detached: the caps are the keys, the root is bare. */
    await expect(bg(detached!)).toBe(TRANSPARENT)
    await expect(bg(detached!.querySelector('.v-hotkeys-key')!)).not.toBe(TRANSPARENT)
    /* Attached: the decoration has moved to the root, so the separator is inside it. */
    await expect(bg(attached!)).not.toBe(TRANSPARENT)
    await expect(bg(attached!.querySelector('.v-hotkeys-key')!)).toBe(TRANSPARENT)

    /* A single key holds the whole combination, so its ends take exactly the gap
       that spaces its insides — while a detached cap keeps a cap's wider padding.
       Verified red by dropping the [data-attached] --hotkeys-pad override. */
    const gapOf = (root: Element) =>
      getComputedStyle(root.querySelector('.v-hotkeys-keys')!).columnGap
    const padOf = (el: Element) => getComputedStyle(el).paddingLeft
    await expect(padOf(attached!)).toBe(gapOf(attached!))
    await expect(padOf(detached!.querySelector('.v-hotkeys-key')!)).not.toBe(gapOf(detached!))

    /* NOTHING but the padding on the sides. The key is `inline-flex`, so it is
       content-sized on its own — but a grid cell or a flex column stretches it
       like any other DS root (VChip, VButton), and only `attached` makes that
       visible, since the root is the decorated box. This locks the story's own
       `justify-items: start`, without which the pill was 138.5px wide for 92.5px
       of content: 23px of dead space at each end, read as "too much padding". */
    const cs = getComputedStyle(attached!)
    const outer = attached!.getBoundingClientRect().width
    const inner = attached!.querySelector('.v-hotkeys-keys')!.getBoundingClientRect().width
    const sides = (parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth)) * 2
    await expect(outer).toBeCloseTo(inner + sides, 1)
  },
}

/** `xs` (the default) and `sm`, the VChip scale — `compact` takes 4px off the height. */
export const Sizes: Story = {
  render: () => ({
    components: { VHotkeys, VButton, VChip },
    setup: () => ({ t }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px">
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
          <VHotkeys keys="mod+k" size="xs" platform="windows" />
          <VHotkeys keys="mod+k" size="xs" compact platform="windows" />
          <VHotkeys keys="mod+k" size="sm" platform="windows" />
          <VHotkeys keys="mod+k" size="sm" compact platform="windows" />
        </div>
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
          <VButton size="sm">{{ t.buttonLabel }}</VButton>
          <VChip size="sm">{{ t.chipLabel }}</VChip>
          <VHotkeys keys="mod+k" size="sm" variant="outlined" platform="windows" />
          <span style="font: inherit; opacity: 0.7">{{ t.sameHeight }}</span>
        </div>
      </div>
    `,
  }),
}

/**
 * Named keys carry their word or their glyph; anything else is displayed as declared,
 * merely capitalized (`f5` → F5). The `+` key itself is the `plus` token.
 */
export const KeyGallery: Story = {
  render: () => ({
    components: { VHotkeys },
    setup: () => ({
      combos: [
        'mod+k',
        'ctrl+shift+p',
        'alt+enter',
        'esc',
        'shift+tab',
        'up',
        'mod+backspace',
        'meta+/',
        'mod+plus',
        'ctrl+f5',
      ],
    }),
    template: `
      <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center">
        <VHotkeys v-for="combo in combos" :key="combo" :keys="combo" variant="outlined" />
      </div>
    `,
  }),
}

/** `separator=""` gives the macOS convention, where the modifiers run into the key. */
export const Separator: Story = {
  render: () => ({
    components: { VHotkeys },
    setup: () => ({ t }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px">
        <div style="display: flex; gap: 8px; align-items: center">
          <VHotkeys keys="mod+shift+k" platform="mac" />
          <span style="font: inherit; opacity: 0.7">{{ t.defaultSeparator }}</span>
        </div>
        <div style="display: flex; gap: 8px; align-items: center">
          <VHotkeys keys="mod+shift+k" platform="mac" separator="" />
          <span style="font: inherit; opacity: 0.7">{{ t.macConvention }}</span>
        </div>
      </div>
    `,
  }),
}

/** `vertical-align: middle` keeps the caps on the line of the surrounding prose. */
export const InlineInText: Story = {
  render: () => ({
    components: { VHotkeys },
    setup: () => ({ t }),
    template: `
      <p style="max-width: 40rem; line-height: 1.8">
        {{ t.inProse }} <VHotkeys keys="mod+k" />, {{ t.thenType }}
      </p>
    `,
  }),
}

/** The usual home of the component: at the end of a command row, and inside a trigger. */
export const InContext: Story = {
  render: () => ({
    components: { VHotkeys, VButton },
    setup: () => ({
      t,
      rows: [
        { key: 'commandPalette', keys: 'mod+k' },
        { key: 'newFile', keys: 'mod+n' },
        { key: 'save', keys: 'mod+s' },
        { key: 'settings', keys: 'mod+,' },
      ],
    }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px; max-width: 22rem">
        <div style="display: flex; flex-direction: column; gap: 2px">
          <div
            v-for="row in rows"
            :key="row.key"
            style="display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 6px 8px"
          >
            <span style="font: inherit">{{ t[row.key] }}</span>
            <VHotkeys :keys="row.keys" />
          </div>
        </div>
        <VButton variant="outline" style="justify-content: space-between">
          {{ t.searchHint }}
          <VHotkeys keys="mod+k" variant="outlined" />
        </VButton>
      </div>
    `,
  }),
}

/**
 * `listen` wires a `keydown` listener on `document` and emits `trigger`. It is opt-in:
 * a display component must never silently capture the page's keyboard.
 */
export const Listening: Story = {
  render: () => ({
    components: { VHotkeys },
    setup: () => ({ t, count: ref(0) }),
    /* `platform="windows"` is PINNED on purpose: without it, `mod` would resolve to ⌘
       on a macOS machine while the play function sends Control, and the story would
       fail depending on who runs it. */
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px">
        <div style="display: flex; gap: 8px; align-items: center">
          <VHotkeys keys="mod+k" platform="windows" listen @trigger="count++" />
          <span style="font: inherit">{{ t.pressIt }}</span>
        </div>
        <p style="font: inherit" data-testid="count">{{ t.triggered }}: {{ count }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.keyboard('{Control>}k{/Control}')
    await waitFor(() => expect(canvas.getByTestId('count')).toHaveTextContent('Triggered: 1'))
  },
}

/** By default the shortcut goes quiet inside a text field; `allow-in-input` keeps it live. */
export const ListeningInInput: Story = {
  render: () => ({
    components: { VHotkeys, VInput },
    setup: () => ({ t, strict: ref(0), permissive: ref(0) }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; max-width: 24rem">
        <VInput :label="t.focusThenPress" data-testid="field" />
        <div style="display: flex; gap: 8px; align-items: center">
          <VHotkeys keys="mod+k" platform="windows" listen @trigger="strict++" />
          <span style="font: inherit" data-testid="strict">{{ t.ignoresFields }}: {{ strict }}</span>
        </div>
        <div style="display: flex; gap: 8px; align-items: center">
          <VHotkeys keys="mod+k" platform="windows" listen allow-in-input @trigger="permissive++" />
          <span style="font: inherit" data-testid="permissive">
            {{ t.listensEverywhere }}: {{ permissive }}
          </span>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByLabelText('Focus the field, then press Ctrl+K'))
    await userEvent.keyboard('{Control>}k{/Control}')
    await waitFor(() => expect(canvas.getByTestId('permissive')).toHaveTextContent(': 1'))
    await expect(canvas.getByTestId('strict')).toHaveTextContent(': 0')
  },
}
