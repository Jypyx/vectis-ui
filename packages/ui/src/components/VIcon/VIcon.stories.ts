import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import { computed, defineComponent, h } from 'vue'

import { storyText } from '../../stories/storyText'
import VAccordion from '../VAccordion/VAccordion.vue'
import VAccordionItem from '../VAccordion/VAccordionItem.vue'
import VBreadcrumb from '../VBreadcrumb/VBreadcrumb.vue'
import VButton from '../VButton/VButton.vue'
import VChip from '../VChip/VChip.vue'
import VInput from '../VInput/VInput.vue'
import VPagination from '../VPagination/VPagination.vue'

import VIcon from './VIcon.vue'
import { builtinIcons, type VectisIconName } from './icons'
import {
  classIconResolver,
  componentIconResolver,
  ligatureIconResolver,
  setIconResolver,
  type IconAliases,
  type IconResolver,
} from './resolver'

const t = storyText({
  en: {
    followsSm: 'Follows sm text (1em)',
    followsXl: 'Follows xl text (1em)',
    numericOverrides: '(numeric overrides 16 / 24 / 48)',
    fourSources: '(embedded SVG / ligature / image / inline SVG)',
    outsideRegistry:
      '↖ outside the registry: the ligature falls back to the consumer font, absent here',
    builtinSecondPath: '(built-in registry: second path embedded)',
    ligatureFillAxis: '(ligature: the font FILL axis)',
    contextWins: '(lg context / 16px prop, which wins)',
    image: 'image',
    search: 'Search',
    filters: 'Filters',
    tag: 'Tag',
    selected: 'Selected',
    searchLabel: 'Search',
    collapsedPanel: 'Collapsed panel',
    allFromDs: 'The chevron, the cross, the tick and the arrows all come from the DS.',
    home: 'Home',
    projects: 'Projects',
  },
  fr: {
    followsSm: 'Suit un texte sm (1em)',
    followsXl: 'Suit un texte xl (1em)',
    numericOverrides: '(surcharges numériques 16 / 24 / 48)',
    fourSources: '(SVG intégré / ligature / image / SVG inline)',
    outsideRegistry:
      '↖ hors registre : la ligature retombe sur la police du consommateur, absente ici',
    builtinSecondPath: '(registre intégré : second path embarqué)',
    ligatureFillAxis: '(ligature : axe FILL de la police)',
    contextWins: '(contexte lg / prop 16px qui prime)',
    image: 'image',
    search: 'Rechercher',
    filters: 'Filtres',
    tag: 'Étiquette',
    selected: 'Sélectionné',
    searchLabel: 'Recherche',
    collapsedPanel: 'Panneau replié',
    allFromDs: 'Le chevron, la croix, la coche et les flèches viennent tous du DS.',
    home: 'Accueil',
    projects: 'Projets',
  },
})

const meta = {
  title: 'Components/Icon',
  component: VIcon,
  argTypes: {
    size: { control: { type: 'number', min: 12, max: 96, step: 4 } },
    name: { control: 'text' },
    src: { control: 'text' },
    label: { control: 'text' },
    filled: { control: 'boolean' },
  },
  args: {
    name: 'favorite',
  },
} satisfies Meta<typeof VIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const TextAdapted: Story = {
  render: () => ({
    components: { VIcon },
    setup: () => ({ t }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px">
        <span style="font-size: var(--vectis-font-size-sm); display: inline-flex; gap: 8px; align-items: center">
          <VIcon name="favorite" /> {{ t.followsSm }}
        </span>
        <span style="font-size: var(--vectis-font-size-xl); display: inline-flex; gap: 8px; align-items: center">
          <VIcon name="favorite" /> {{ t.followsXl }}
        </span>
        <span style="display: inline-flex; gap: 8px; align-items: center">
          <VIcon name="favorite" :size="16" />
          <VIcon name="favorite" :size="24" />
          <VIcon name="favorite" :size="48" />
          <span>{{ t.numericOverrides }}</span>
        </span>
      </div>
    `,
  }),
}

export const FourSources: Story = {
  render: () => ({
    components: { VIcon },
    setup: () => ({ icons: builtinIcons, t }),
    template: `
      <div style="display: flex; gap: 12px; align-items: center">
        <VIcon :name="icons.close" :size="24" />
        <VIcon name="rocket_launch" :size="24" />
        <VIcon
          :size="24"
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%236366f1'/%3E%3C/svg%3E"
        />
        <VIcon :size="24">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 12h16M12 4v16" stroke="currentcolor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </VIcon>
        <span>{{ t.fourSources }}</span>
      </div>
    `,
  }),
}

/** The icons the library renders itself — embedded, no font required. */
export const Library: Story = {
  render: () => ({
    components: { VIcon },
    setup: () => ({ icons: Object.values(builtinIcons) }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px">
        <div v-for="icon in icons" :key="icon.name" style="display: flex; gap: 8px; align-items: center">
          <VIcon :name="icon" :size="24" />
          <code style="font-size: var(--vectis-font-size-xs)">{{ icon.name }}</code>
        </div>
      </div>
    `,
  }),
}

/**
 * The acceptance criterion for the autonomy: the icon font is neutralized
 * (`--vectis-font-family-icon: sans-serif`). Anything still a ligature then shows
 * up SPELLED OUT IN FULL — the DS's own icons do not budge.
 */
export const WithoutFont: Story = {
  render: () => ({
    components: { VIcon },
    setup: () => ({ icons: Object.values(builtinIcons), t }),
    template: `
      <div style="--vectis-font-family-icon: sans-serif; display: flex; flex-direction: column; gap: 16px">
        <div style="display: flex; gap: 12px; flex-wrap: wrap">
          <VIcon v-for="icon in icons" :key="icon.name" :name="icon" :size="24" />
        </div>
        <div style="display: flex; gap: 12px; align-items: center">
          <VIcon name="favorite" :size="24" />
          <span style="font-size: var(--vectis-font-size-sm)">
            {{ t.outsideRegistry }}
          </span>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    // None of the built-in icons depends on a font: they are all SVGs.
    const svgs = canvasElement.querySelectorAll('.v-icon-svg')
    await expect(svgs).toHaveLength(Object.keys(builtinIcons).length)
    await expect(canvasElement.querySelectorAll('.v-icon-symbol')).toHaveLength(1)
  },
}

export const Filled: Story = {
  render: () => ({
    components: { VIcon },
    setup: () => ({
      t,
      filledPairs: [
        builtinIcons.check_circle,
        builtinIcons.warning,
        builtinIcons.info,
        builtinIcons.notifications,
      ],
    }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px">
        <div style="display: flex; gap: 16px; align-items: center">
          <span v-for="icon in filledPairs" :key="icon.name" style="display: inline-flex; gap: 8px; align-items: center">
            <VIcon :name="icon" :size="24" />
            <VIcon :name="icon" :size="24" filled />
          </span>
          <span>{{ t.builtinSecondPath }}</span>
        </div>
        <div style="display: flex; gap: 16px; align-items: center">
          <span v-for="name in ['favorite', 'home', 'settings', 'star']" :key="name" style="display: inline-flex; gap: 8px; align-items: center">
            <VIcon :name="name" :size="24" />
            <VIcon :name="name" :size="24" filled />
          </span>
          <span>{{ t.ligatureFillAxis }}</span>
        </div>
      </div>
    `,
  }),
}

/**
 * The DS invariant: whatever the SOURCE of the icon, its size stays that of the
 * context (here the VButton's — lg → 24px, xs → 16px). Measured for real: jsdom
 * does no layout, so this check exists only here.
 */
export const SizeInvariant: Story = {
  beforeEach: () => {
    // Fake "component" set (Lucide-style): HARDCODED dimensions, which the DS's
    // CSS must beat — they are presentation attributes, so they lose.
    const Lucide = defineComponent({
      setup: () => () =>
        h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', 'data-testid': 'component' }, [
          h('path', { d: 'M6 6l12 12M18 6L6 18', stroke: 'currentcolor', 'stroke-width': 2 }),
        ]),
    })
    // Fake class font (Font Awesome / Phosphor style): glyph in a ::before.
    const style = document.createElement('style')
    style.textContent = `.fake-glyph::before { content: '\\2716' }`
    document.head.append(style)

    setIconResolver((name) => {
      if (name === 'component') return { component: Lucide }
      if (name === 'class') return { class: 'fake-glyph' }
      return undefined
    })

    return () => {
      setIconResolver(undefined)
      style.remove()
    }
  },
  render: () => ({
    components: { VButton, VIcon },
    setup: () => ({ sources: ['close', 'favorite', 'component', 'class'], t }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; align-items: start">
        <div v-for="size in ['lg', 'xs']" :key="size" :data-row-size="size" style="display: flex; gap: 8px">
          <VButton v-for="name in sources" :key="name" :size="size" variant="outline" tone="neutral">
            <template #start><VIcon :name="name" /></template>
            {{ name }}
          </VButton>
          <VButton :size="size" variant="outline" tone="neutral">
            <template #start>
              <VIcon src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%236366f1'/%3E%3C/svg%3E" />
            </template>
            {{ t.image }}
          </VButton>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    for (const [size, expected] of [
      ['lg', 24],
      ['xs', 16],
    ] as const) {
      const row = canvasElement.querySelector(`[data-row-size='${size}']`) as HTMLElement
      const icons = [...row.querySelectorAll('.v-icon')]
      await expect(icons).toHaveLength(5)

      for (const icon of icons) {
        const box = icon.getBoundingClientRect()
        await expect(Math.round(box.width)).toBe(expected)
        await expect(Math.round(box.height)).toBe(expected)

        // A child SVG fills the square, even with a hardcoded width/height.
        const svg = icon.querySelector('svg')
        if (svg) {
          const inner = svg.getBoundingClientRect()
          await expect(Math.round(inner.width)).toBe(expected)
          await expect(Math.round(inner.height)).toBe(expected)
        }
      }
    }
  },
}

export const WithLabel: Story = {
  args: { name: 'warning', label: 'Warning' },
  play: async ({ canvasElement }) => {
    const icon = within(canvasElement).getByRole('img', { name: 'Warning' })
    await expect(icon).not.toHaveAttribute('aria-hidden')
  },
}

export const DrivenByParent: Story = {
  render: () => ({
    components: { VIcon },
    setup: () => ({ icons: builtinIcons, t }),
    template: `
      <div style="--vectis-icon-size: var(--vectis-icon-size-lg); --vectis-icon-opsz: 24; display: flex; gap: 12px; align-items: center">
        <VIcon name="palette" />
        <VIcon name="palette" :size="16" />
        <span>{{ t.contextWins }}</span>
      </div>
    `,
  }),
}

/*
 * Third-party icon fonts (setIconResolver).
 *
 * The CDN stylesheets are loaded by `.storybook/preview-head.html` — no npm
 * dependency is added to the package. Each story sets ITS resolver in
 * `beforeEach` and removes it in the cleanup function: the state is module-level
 * and would otherwise leak from one story to the next (the same discipline as the
 * `dismissToast()` decorator in the VToast stories).
 *
 * The alias tables below were checked class by class against each library's real
 * CSS. A non-existent name throws nothing: it renders an empty square.
 */

/** Component icon factory, in the manner of a Lucide-style SVG set: a
    `currentcolor` stroke, a single `<svg>` root, and hardcoded dimensions (24)
    that the DS's CSS must beat. Functional components: with no declared `props`,
    everything arrives in the argument, hence the spread. */
const strokeSvg = (d: string) => (props: Record<string, unknown>) =>
  h(
    'svg',
    { viewBox: '0 0 24 24', width: 24, height: 24, 'data-set': '', fill: 'none', ...props },
    [h('path', { d, stroke: 'currentcolor', 'stroke-linecap': 'round' })],
  )

/** Shared showcase: components whose DEFAULT icons come from the DS — that is what
    makes a library switch visible at a glance. */
const SHOWCASE_COMPONENTS = {
  VAccordion,
  VAccordionItem,
  VBreadcrumb,
  VButton,
  VChip,
  VIcon,
  VInput,
  VPagination,
}

const SHOWCASE = `
  <div style="display: flex; flex-direction: column; gap: 20px; max-inline-size: 640px">
    <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
      <VButton :icon-start="icons.search">{{ t.search }}</VButton>
      <VButton variant="outline" tone="neutral" :icon-end="icons.expand_more">{{ t.filters }}</VButton>
      <VChip dismissible>{{ t.tag }}</VChip>
      <VChip selectable check :selected="true" tone="accent">{{ t.selected }}</VChip>
    </div>

    <VInput v-model="search" :label="t.searchLabel" :icon-start="icons.search" clearable />

    <VBreadcrumb :items="trail" current-path="/projects/vectis" />

    <VAccordion>
      <VAccordionItem :title="t.collapsedPanel" :icon-start="icons.notifications">
        {{ t.allFromDs }}
      </VAccordionItem>
    </VAccordion>

    <VPagination v-model="page" :length="12" :total-visible="7" />

    <div style="display: flex; gap: 10px; flex-wrap: wrap; padding-block-start: 4px">
      <VIcon v-for="icon in gallery" :key="icon.name" :name="icon" :size="24" :title="icon.name" />
    </div>
  </div>
`

/* A computed, not a plain array built from `t.value`: reading `.value` in the
   setup body would freeze the labels in the language of the first render. */
const trail = computed(() => [
  { label: t.value.home, href: '/' },
  { label: t.value.projects, href: '/projects' },
  { label: 'Vectis', href: '/projects/vectis' },
])

/** Story factory for "one icon library" — same showcase, different resolver. */
function fontShowcase(resolver: IconResolver): Story {
  return {
    beforeEach: () => {
      setIconResolver(resolver)
      return () => setIconResolver(undefined)
    },
    render: () => ({
      components: SHOWCASE_COMPONENTS,
      setup: () => ({
        t,
        icons: builtinIcons,
        search: 'Vectis',
        page: 4,
        gallery: Object.values(builtinIcons),
        trail,
      }),
      template: SHOWCASE,
    }),
  }
}

/** Typed `Record<VectisIconName, string>` (and not Partial): TS refuses to compile
    until every DS icon is mapped. This is the exhaustiveness guard to recommend to
    consumers. */
const PHOSPHOR: Record<VectisIconName, string> = {
  arrow_downward: 'arrow-down',
  arrow_downward_alt: 'arrow-down',
  arrow_drop_down: 'caret-down',
  arrow_drop_up: 'caret-up',
  arrow_left_alt: 'arrow-left',
  arrow_right_alt: 'arrow-right',
  arrow_upward: 'arrow-up',
  arrow_upward_alt: 'arrow-up',
  attach_file: 'paperclip',
  audio_file: 'file-audio',
  calendar_today: 'calendar-blank',
  check: 'check',
  check_circle: 'check-circle',
  chevron_left: 'caret-left',
  chevron_right: 'caret-right',
  close: 'x',
  cloud_upload: 'cloud-arrow-up',
  code: 'code',
  description: 'file-text',
  error: 'warning-circle',
  expand_less: 'caret-up',
  expand_more: 'caret-down',
  folder_zip: 'file-zip',
  image: 'image',
  info: 'info',
  more_horiz: 'dots-three',
  notifications: 'bell',
  picture_as_pdf: 'file-pdf',
  schedule: 'clock',
  search: 'magnifying-glass',
  swap_vert: 'arrows-down-up',
  table_chart: 'table',
  video_file: 'file-video',
  warning: 'warning',
}

const FONT_AWESOME: Record<VectisIconName, string> = {
  arrow_downward: 'arrow-down',
  arrow_downward_alt: 'arrow-down',
  arrow_drop_down: 'caret-down',
  arrow_drop_up: 'caret-up',
  arrow_left_alt: 'arrow-left',
  arrow_right_alt: 'arrow-right',
  arrow_upward: 'arrow-up',
  arrow_upward_alt: 'arrow-up',
  attach_file: 'paperclip',
  audio_file: 'file-audio',
  calendar_today: 'calendar',
  check: 'check',
  check_circle: 'circle-check',
  chevron_left: 'angle-left',
  chevron_right: 'angle-right',
  close: 'xmark',
  cloud_upload: 'cloud-arrow-up',
  code: 'code',
  description: 'file-lines',
  error: 'circle-exclamation',
  expand_less: 'angle-up',
  expand_more: 'angle-down',
  folder_zip: 'file-zipper',
  image: 'image',
  info: 'circle-info',
  more_horiz: 'ellipsis',
  notifications: 'bell',
  picture_as_pdf: 'file-pdf',
  schedule: 'clock',
  search: 'magnifying-glass',
  swap_vert: 'sort',
  table_chart: 'table',
  video_file: 'file-video',
  warning: 'triangle-exclamation',
}

const BOOTSTRAP: Record<VectisIconName, string> = {
  arrow_downward: 'arrow-down',
  arrow_downward_alt: 'arrow-down',
  arrow_drop_down: 'caret-down-fill',
  arrow_drop_up: 'caret-up-fill',
  arrow_left_alt: 'arrow-left',
  arrow_right_alt: 'arrow-right',
  arrow_upward: 'arrow-up',
  arrow_upward_alt: 'arrow-up',
  attach_file: 'paperclip',
  audio_file: 'file-earmark-music',
  calendar_today: 'calendar',
  check: 'check-lg',
  check_circle: 'check-circle-fill',
  chevron_left: 'chevron-left',
  chevron_right: 'chevron-right',
  close: 'x-lg',
  cloud_upload: 'cloud-arrow-up-fill',
  code: 'code',
  description: 'file-earmark-text',
  error: 'exclamation-circle-fill',
  expand_less: 'chevron-up',
  expand_more: 'chevron-down',
  folder_zip: 'file-earmark-zip',
  image: 'image',
  info: 'info-circle-fill',
  more_horiz: 'three-dots',
  notifications: 'bell-fill',
  picture_as_pdf: 'file-earmark-pdf',
  schedule: 'clock-fill',
  search: 'search',
  swap_vert: 'arrow-down-up',
  table_chart: 'table',
  video_file: 'file-earmark-play',
  warning: 'exclamation-triangle-fill',
}

/**
 * **Phosphor** — a class font, with two classes on the same element (`ph` for the
 * weight, `ph-<name>` for the glyph). `filled` switches to the `ph-fill` family,
 * which requires importing `@phosphor-icons/web/fill`.
 */
export const PhosphorFont: Story = {
  ...fontShowcase(
    classIconResolver({
      aliases: PHOSPHOR,
      className: (name, filled) => `${filled ? 'ph-fill' : 'ph'} ph-${name}`,
    }),
  ),
  play: async ({ canvasElement }) => {
    // The resolver really is wired in: the VChip's cross carries the Phosphor classes.
    const cross = canvasElement.querySelector("[data-icon='close'] .v-icon-glyph")
    await expect(cross).toHaveClass('ph', 'ph-x')
    // …and the LOGICAL name survives the library switch.
    await expect(canvasElement.querySelector("[data-icon='search']")).toBeTruthy()
  },
}

/**
 * **Font Awesome 6 (CSS mode)** — the family class carries the `content`
 * (`.fa-solid:before { content: var(--fa) }`) and the icon class the value
 * (`.fa-xmark { --fa: "\\f00d" }`). FA's "SVG with JS" mode is NOT supported: it
 * replaces the elements in the DOM from under Vue's feet.
 *
 * `fa-solid` unconditionally, and that matters: the **Free** tier only draws a
 * small fraction of the catalogue in Regular (25 kB of glyphs against 158 kB in
 * Solid). Mapping `filled: false` onto `fa-regular` — the reflex — therefore
 * renders empty squares for the vast majority of icons. FA's outline/filled
 * distinction requires the Pro tier (`fa-light`, `fa-thin`, `fa-duotone`).
 */
export const FontAwesomeFont: Story = {
  ...fontShowcase(
    classIconResolver({
      aliases: FONT_AWESOME,
      className: (name) => `fa-solid fa-${name}`,
    }),
  ),
  play: async ({ canvasElement }) => {
    const cross = canvasElement.querySelector("[data-icon='close'] .v-icon-glyph")
    await expect(cross).toHaveClass('fa-xmark')
  },
}

/** **Bootstrap Icons** — a single family class (`bi`) and no filled variant. */
export const BootstrapIconsFont: Story = {
  ...fontShowcase(
    classIconResolver({
      aliases: BOOTSTRAP,
      className: (name) => `bi bi-${name}`,
    }),
  ),
  play: async ({ canvasElement }) => {
    const cross = canvasElement.querySelector("[data-icon='close'] .v-icon-glyph")
    await expect(cross).toHaveClass('bi', 'bi-x-lg')
  },
}

/**
 * **Material Symbols as a ligature** — `ligatureIconResolver()` sends the DS's
 * icons back to the FONT instead of the built-in registry. The only benefit:
 * getting back the optical axis `--vectis-icon-opsz` (20 in xs/sm/md, 24 in
 * lg/xl), which the registry — drawn at opsz 24 — cannot reproduce. It also
 * serves ligature IcoMoon builds and the Outlined/Sharp variants.
 */
export const LigatureFont: Story = {
  ...fontShowcase(ligatureIconResolver()),
  play: async ({ canvasElement }) => {
    const cross = canvasElement.querySelector("[data-icon='close'] .v-icon-symbol")
    await expect(cross).toHaveTextContent('close')
  },
}

/**
 * **SVG set as components** (Lucide, Untitled UI…) through `componentIconResolver`.
 * Here the components are built on the spot — the DS adds no dependency — but the
 * contract is the real one: a single `<svg>` root, since that is what
 * `.v-icon > svg` sizes, even against a hardcoded `width`/`height`.
 *
 * The table is deliberately PARTIAL: unmapped icons fall back to the built-in
 * registry. That is what makes a progressive adoption possible.
 */
export const ComponentSet: Story = {
  ...fontShowcase(
    componentIconResolver({
      components: {
        close: strokeSvg('M6 6l12 12M18 6L6 18'),
        check: strokeSvg('M4 12l6 6L20 6'),
        chevron_left: strokeSvg('M15 5l-7 7 7 7'),
        chevron_right: strokeSvg('M9 5l7 7-7 7'),
        expand_more: strokeSvg('M5 9l7 7 7-7'),
        search: strokeSvg('M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14M20 20l-4-4'),
      },
      props: () => ({ 'stroke-width': 1.75 }),
    }),
  ),
  play: async ({ canvasElement }) => {
    // Mapped → component; unmapped (notifications) → built-in registry.
    await expect(canvasElement.querySelector("[data-icon='close'] [data-set]")).toBeTruthy()
    await expect(
      canvasElement.querySelector("[data-icon='notifications'] .v-icon-svg"),
    ).toBeTruthy()
  },
}

/**
 * **Partial mapping** — five Phosphor aliases only, `strict` left at its default.
 * The other fifteen DS icons stay embedded SVGs instead of becoming non-existent
 * `ph-swap_vert` (hence empty squares), and the consumer's own names still pass,
 * even when absent from the table.
 */
export const PartialMapping: Story = fontShowcase(
  classIconResolver({
    aliases: {
      close: 'x',
      check: 'check',
      search: 'magnifying-glass',
      expand_more: 'caret-down',
      chevron_right: 'caret-right',
    } satisfies IconAliases,
    className: (name) => `ph ph-${name}`,
  }),
)
