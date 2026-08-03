import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import { defineComponent, h } from 'vue'

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

const meta = {
  title: 'Composants/Icon',
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

export const AdapteeAuTexte: Story = {
  render: () => ({
    components: { VIcon },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px">
        <span style="font-size: var(--vectis-font-size-sm); display: inline-flex; gap: 8px; align-items: center">
          <VIcon name="favorite" /> Suit un texte sm (1em)
        </span>
        <span style="font-size: var(--vectis-font-size-xl); display: inline-flex; gap: 8px; align-items: center">
          <VIcon name="favorite" /> Suit un texte xl (1em)
        </span>
        <span style="display: inline-flex; gap: 8px; align-items: center">
          <VIcon name="favorite" :size="16" />
          <VIcon name="favorite" :size="24" />
          <VIcon name="favorite" :size="48" />
          <span>(surcharges numériques 16 / 24 / 48)</span>
        </span>
      </div>
    `,
  }),
}

export const QuatreSources: Story = {
  render: () => ({
    components: { VIcon },
    template: `
      <div style="display: flex; gap: 12px; align-items: center">
        <VIcon name="close" :size="24" />
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
        <span>(SVG intégré / ligature / image / SVG inline)</span>
      </div>
    `,
  }),
}

/** Les icônes que la librairie rend elle-même — embarquées, aucune police requise. */
export const Bibliotheque: Story = {
  render: () => ({
    components: { VIcon },
    setup: () => ({ noms: Object.keys(builtinIcons) }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px">
        <div v-for="nom in noms" :key="nom" style="display: flex; gap: 8px; align-items: center">
          <VIcon :name="nom" :size="24" />
          <code style="font-size: var(--vectis-font-size-xs)">{{ nom }}</code>
        </div>
      </div>
    `,
  }),
}

/**
 * Critère d'acceptation de l'autonomie : la police d'icônes est neutralisée
 * (`--vectis-font-family-icon: sans-serif`). Tout ce qui reste une ligature apparaît
 * alors EN TOUTES LETTRES — les icônes du DS, elles, ne bougent pas.
 */
export const SansPolice: Story = {
  render: () => ({
    components: { VIcon },
    setup: () => ({ noms: Object.keys(builtinIcons) }),
    template: `
      <div style="--vectis-font-family-icon: sans-serif; display: flex; flex-direction: column; gap: 16px">
        <div style="display: flex; gap: 12px; flex-wrap: wrap">
          <VIcon v-for="nom in noms" :key="nom" :name="nom" :size="24" />
        </div>
        <div style="display: flex; gap: 12px; align-items: center">
          <VIcon name="favorite" :size="24" />
          <span style="font-size: var(--vectis-font-size-sm)">
            ↖ hors registre : la ligature retombe sur la police du consommateur, absente ici
          </span>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    // Aucune des icônes intégrées ne dépend d'une police : toutes sont des SVG.
    const svgs = canvasElement.querySelectorAll('.v-icon-svg')
    await expect(svgs).toHaveLength(Object.keys(builtinIcons).length)
    await expect(canvasElement.querySelectorAll('.v-icon-symbol')).toHaveLength(1)
  },
}

export const Filled: Story = {
  render: () => ({
    components: { VIcon },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px">
        <div style="display: flex; gap: 16px; align-items: center">
          <span v-for="name in ['check_circle', 'warning', 'info', 'notifications']" :key="name" style="display: inline-flex; gap: 8px; align-items: center">
            <VIcon :name="name" :size="24" />
            <VIcon :name="name" :size="24" filled />
          </span>
          <span>(registre intégré : second path embarqué)</span>
        </div>
        <div style="display: flex; gap: 16px; align-items: center">
          <span v-for="name in ['favorite', 'home', 'settings', 'star']" :key="name" style="display: inline-flex; gap: 8px; align-items: center">
            <VIcon :name="name" :size="24" />
            <VIcon :name="name" :size="24" filled />
          </span>
          <span>(ligature : axe FILL de la police)</span>
        </div>
      </div>
    `,
  }),
}

/**
 * L'invariant du DS : quelle que soit la SOURCE de l'icône, sa taille reste celle
 * du contexte (ici celle du VButton — lg → 24px, xs → 16px). Mesuré pour de vrai :
 * jsdom ne fait pas de layout, ce contrôle n'existe qu'ici.
 */
export const InvariantDeTaille: Story = {
  beforeEach: () => {
    // Faux jeu « composant » (à la Lucide) : dimensions EN DUR, que le CSS du DS
    // doit battre — ce sont des attributs de présentation, donc perdants.
    const Lucide = defineComponent({
      setup: () => () =>
        h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', 'data-testid': 'composant' }, [
          h('path', { d: 'M6 6l12 12M18 6L6 18', stroke: 'currentcolor', 'stroke-width': 2 }),
        ]),
    })
    // Fausse police à classes (à la Font Awesome / Phosphor) : glyphe en ::before.
    const style = document.createElement('style')
    style.textContent = `.faux-glyphe::before { content: '\\2716' }`
    document.head.append(style)

    setIconResolver((name) => {
      if (name === 'composant') return { component: Lucide }
      if (name === 'classe') return { class: 'faux-glyphe' }
      return undefined
    })

    return () => {
      setIconResolver(undefined)
      style.remove()
    }
  },
  render: () => ({
    components: { VButton, VIcon },
    setup: () => ({ sources: ['close', 'favorite', 'composant', 'classe'] }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; align-items: start">
        <div v-for="size in ['lg', 'xs']" :key="size" :data-taille="size" style="display: flex; gap: 8px">
          <VButton v-for="nom in sources" :key="nom" :size="size" variant="outline" tone="neutral">
            <template #start><VIcon :name="nom" /></template>
            {{ nom }}
          </VButton>
          <VButton :size="size" variant="outline" tone="neutral">
            <template #start>
              <VIcon src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%236366f1'/%3E%3C/svg%3E" />
            </template>
            image
          </VButton>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    for (const [taille, attendu] of [
      ['lg', 24],
      ['xs', 16],
    ] as const) {
      const rangee = canvasElement.querySelector(`[data-taille='${taille}']`) as HTMLElement
      const icones = [...rangee.querySelectorAll('.v-icon')]
      await expect(icones).toHaveLength(5)

      for (const icone of icones) {
        const boite = icone.getBoundingClientRect()
        await expect(Math.round(boite.width)).toBe(attendu)
        await expect(Math.round(boite.height)).toBe(attendu)

        // Un SVG enfant remplit le carré, y compris avec width/height en dur.
        const svg = icone.querySelector('svg')
        if (svg) {
          const interne = svg.getBoundingClientRect()
          await expect(Math.round(interne.width)).toBe(attendu)
          await expect(Math.round(interne.height)).toBe(attendu)
        }
      }
    }
  },
}

export const AvecLabel: Story = {
  args: { name: 'warning', label: 'Attention' },
  play: async ({ canvasElement }) => {
    const icon = within(canvasElement).getByRole('img', { name: 'Attention' })
    await expect(icon).not.toHaveAttribute('aria-hidden')
  },
}

export const PiloteParLeParent: Story = {
  render: () => ({
    components: { VIcon },
    template: `
      <!-- Le conteneur pose l'API de contexte ; la prop size numérique prime -->
      <div style="--vectis-icon-size: var(--vectis-icon-size-lg); --vectis-icon-opsz: 24; display: flex; gap: 12px; align-items: center">
        <VIcon name="palette" />
        <VIcon name="palette" :size="16" />
        <span>(contexte lg / prop 16px qui prime)</span>
      </div>
    `,
  }),
}

/* ------------------------------------------------------------------ *
 * Polices d'icônes tierces (setIconResolver)
 *
 * Les feuilles CDN sont chargées par `.storybook/preview-head.html` — aucune
 * dépendance npm ajoutée au package. Chaque story pose SON résolveur dans
 * `beforeEach` et le retire par la fonction de nettoyage : l'état est
 * module-level, il fuiterait sinon d'une story à l'autre (même discipline que
 * le décorateur `dismissToast()` des stories de VToast).
 *
 * Les tables d'alias ci-dessous ont été vérifiées classe par classe contre les
 * feuilles CSS réelles de chaque bibliothèque. Un nom inexistant ne lève rien :
 * il rend un carré vide.
 * ------------------------------------------------------------------ */

/** Fabrique d'icônes en COMPOSANT, à la manière d'un jeu SVG type Lucide : un
    trait `currentcolor`, une racine `<svg>` unique, et des dimensions en dur
    (24) que le CSS du DS doit battre. Composants fonctionnels : sans `props`
    déclarées, tout arrive dans l'argument, d'où le spread. */
const traitSvg = (d: string) => (props: Record<string, unknown>) =>
  h(
    'svg',
    { viewBox: '0 0 24 24', width: 24, height: 24, 'data-jeu': '', fill: 'none', ...props },
    [h('path', { d, stroke: 'currentcolor', 'stroke-linecap': 'round' })],
  )

/** Vitrine commune : des composants dont les icônes PAR DÉFAUT viennent du DS —
    c'est ce qui rend le changement de bibliothèque visible d'un coup d'œil. */
const VITRINE_COMPOSANTS = {
  VAccordion,
  VAccordionItem,
  VBreadcrumb,
  VButton,
  VChip,
  VIcon,
  VInput,
  VPagination,
}

const VITRINE = `
  <div style="display: flex; flex-direction: column; gap: 20px; max-inline-size: 640px">
    <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
      <VButton icon-start="search">Rechercher</VButton>
      <VButton variant="outline" tone="neutral" icon-end="expand_more">Filtres</VButton>
      <VChip dismissible>Étiquette</VChip>
      <VChip selectable check :selected="true" tone="accent">Sélectionné</VChip>
    </div>

    <VInput v-model="recherche" label="Recherche" icon-start="search" clearable />

    <VBreadcrumb :items="fil" current-path="/projets/vectis" />

    <VAccordion>
      <VAccordionItem title="Panneau replié" icon-start="notifications">
        Le chevron, la croix, la coche et les flèches viennent tous du DS.
      </VAccordionItem>
    </VAccordion>

    <VPagination v-model="page" :length="12" :total-visible="7" />

    <div style="display: flex; gap: 10px; flex-wrap: wrap; padding-block-start: 4px">
      <VIcon v-for="nom in noms" :key="nom" :name="nom" :size="24" :title="nom" />
    </div>
  </div>
`

/** Fabrique de story « une bibliothèque d'icônes » — même vitrine, résolveur différent. */
function vitrinePolice(resolver: IconResolver): Story {
  return {
    beforeEach: () => {
      setIconResolver(resolver)
      return () => setIconResolver(undefined)
    },
    render: () => ({
      components: VITRINE_COMPOSANTS,
      setup: () => ({
        recherche: 'Vectis',
        page: 4,
        noms: Object.keys(builtinIcons),
        fil: [
          { label: 'Accueil', href: '/' },
          { label: 'Projets', href: '/projets' },
          { label: 'Vectis', href: '/projets/vectis' },
        ],
      }),
      template: VITRINE,
    }),
  }
}

/** Typé `Record<VectisIconName, string>` (et non Partial) : TS refuse de compiler
    tant qu'une icône du DS n'est pas mappée. C'est le garde-fou d'exhaustivité
    à recommander aux consommateurs. */
const PHOSPHOR: Record<VectisIconName, string> = {
  arrow_downward: 'arrow-down',
  arrow_drop_down: 'caret-down',
  arrow_drop_up: 'caret-up',
  arrow_upward: 'arrow-up',
  calendar_today: 'calendar-blank',
  check: 'check',
  check_circle: 'check-circle',
  chevron_left: 'caret-left',
  chevron_right: 'caret-right',
  close: 'x',
  error: 'warning-circle',
  expand_less: 'caret-up',
  expand_more: 'caret-down',
  info: 'info',
  more_horiz: 'dots-three',
  notifications: 'bell',
  schedule: 'clock',
  search: 'magnifying-glass',
  swap_vert: 'arrows-down-up',
  warning: 'warning',
}

const FONT_AWESOME: Record<VectisIconName, string> = {
  arrow_downward: 'arrow-down',
  arrow_drop_down: 'caret-down',
  arrow_drop_up: 'caret-up',
  arrow_upward: 'arrow-up',
  calendar_today: 'calendar',
  check: 'check',
  check_circle: 'circle-check',
  chevron_left: 'angle-left',
  chevron_right: 'angle-right',
  close: 'xmark',
  error: 'circle-exclamation',
  expand_less: 'angle-up',
  expand_more: 'angle-down',
  info: 'circle-info',
  more_horiz: 'ellipsis',
  notifications: 'bell',
  schedule: 'clock',
  search: 'magnifying-glass',
  swap_vert: 'sort',
  warning: 'triangle-exclamation',
}

const BOOTSTRAP: Record<VectisIconName, string> = {
  arrow_downward: 'arrow-down',
  arrow_drop_down: 'caret-down-fill',
  arrow_drop_up: 'caret-up-fill',
  arrow_upward: 'arrow-up',
  calendar_today: 'calendar',
  check: 'check-lg',
  check_circle: 'check-circle-fill',
  chevron_left: 'chevron-left',
  chevron_right: 'chevron-right',
  close: 'x-lg',
  error: 'exclamation-circle-fill',
  expand_less: 'chevron-up',
  expand_more: 'chevron-down',
  info: 'info-circle-fill',
  more_horiz: 'three-dots',
  notifications: 'bell-fill',
  schedule: 'clock-fill',
  search: 'search',
  swap_vert: 'arrow-down-up',
  warning: 'exclamation-triangle-fill',
}

/**
 * **Phosphor** — police à classes, deux classes sur le même élément
 * (`ph` pour la graisse, `ph-<nom>` pour le glyphe). `filled` bascule sur la
 * famille `ph-fill`, qui exige l'import `@phosphor-icons/web/fill`.
 */
export const PolicePhosphor: Story = {
  ...vitrinePolice(
    classIconResolver({
      aliases: PHOSPHOR,
      className: (nom, filled) => `${filled ? 'ph-fill' : 'ph'} ph-${nom}`,
    }),
  ),
  play: async ({ canvasElement }) => {
    // Le résolveur est bien branché : la croix du VChip porte les classes Phosphor.
    const croix = canvasElement.querySelector("[data-icon='close'] .v-icon-glyph")
    await expect(croix).toHaveClass('ph', 'ph-x')
    // …et le nom LOGIQUE survit au changement de bibliothèque.
    await expect(canvasElement.querySelector("[data-icon='search']")).toBeTruthy()
  },
}

/**
 * **Font Awesome 6 (mode CSS)** — la classe de famille porte le `content`
 * (`.fa-solid:before { content: var(--fa) }`) et la classe d'icône la valeur
 * (`.fa-xmark { --fa: "\\f00d" }`). Le mode « SVG with JS » de FA n'est PAS
 * supporté : il remplace les éléments dans le DOM sous les pieds de Vue.
 *
 * `fa-solid` sans condition, et c'est important : le tier **Free** ne dessine
 * qu'une petite fraction du catalogue en style Regular (25 Ko de glyphes contre
 * 158 Ko en Solid). Mapper `filled: false` sur `fa-regular` — le réflexe — rend
 * donc des carrés vides pour la grande majorité des icônes. La distinction
 * contour/plein de FA demande le tier Pro (`fa-light`, `fa-thin`, `fa-duotone`).
 */
export const PoliceFontAwesome: Story = {
  ...vitrinePolice(
    classIconResolver({
      aliases: FONT_AWESOME,
      className: (nom) => `fa-solid fa-${nom}`,
    }),
  ),
  play: async ({ canvasElement }) => {
    const croix = canvasElement.querySelector("[data-icon='close'] .v-icon-glyph")
    await expect(croix).toHaveClass('fa-xmark')
  },
}

/** **Bootstrap Icons** — une seule classe de famille (`bi`) et pas de variante pleine. */
export const PoliceBootstrapIcons: Story = {
  ...vitrinePolice(
    classIconResolver({
      aliases: BOOTSTRAP,
      className: (nom) => `bi bi-${nom}`,
    }),
  ),
  play: async ({ canvasElement }) => {
    const croix = canvasElement.querySelector("[data-icon='close'] .v-icon-glyph")
    await expect(croix).toHaveClass('bi', 'bi-x-lg')
  },
}

/**
 * **Material Symbols en ligature** — `ligatureIconResolver()` renvoie les icônes
 * du DS vers la POLICE au lieu du registre intégré. Seul intérêt : retrouver
 * l'axe optique `--vectis-icon-opsz` (20 en xs/sm/md, 24 en lg/xl), que le registre
 * — dessiné à opsz 24 — ne peut pas reproduire. Sert aussi aux builds IcoMoon à
 * ligatures et aux variantes Outlined/Sharp.
 */
export const PoliceLigature: Story = {
  ...vitrinePolice(ligatureIconResolver()),
  play: async ({ canvasElement }) => {
    const croix = canvasElement.querySelector("[data-icon='close'] .v-icon-symbol")
    await expect(croix).toHaveTextContent('close')
  },
}

/**
 * **Jeu SVG en composants** (Lucide, Untitled UI…) via `componentIconResolver`.
 * Ici les composants sont fabriqués sur place — le DS n'ajoute aucune
 * dépendance — mais le contrat est le vrai : racine `<svg>` unique, c'est elle
 * que `.v-icon > svg` dimensionne, y compris contre un `width`/`height` en dur.
 *
 * La table est volontairement PARTIELLE : les icônes non mappées retombent sur
 * le registre intégré. C'est ce qui rend une adoption progressive possible.
 */
export const JeuDeComposants: Story = {
  ...vitrinePolice(
    componentIconResolver({
      components: {
        close: traitSvg('M6 6l12 12M18 6L6 18'),
        check: traitSvg('M4 12l6 6L20 6'),
        chevron_left: traitSvg('M15 5l-7 7 7 7'),
        chevron_right: traitSvg('M9 5l7 7-7 7'),
        expand_more: traitSvg('M5 9l7 7 7-7'),
        search: traitSvg('M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14M20 20l-4-4'),
      },
      props: () => ({ 'stroke-width': 1.75 }),
    }),
  ),
  play: async ({ canvasElement }) => {
    // Mappé → composant ; non mappé (notifications) → registre intégré.
    await expect(canvasElement.querySelector("[data-icon='close'] [data-jeu]")).toBeTruthy()
    await expect(
      canvasElement.querySelector("[data-icon='notifications'] .v-icon-svg"),
    ).toBeTruthy()
  },
}

/**
 * **Mapping partiel** — cinq alias Phosphor seulement, `strict` laissé à son
 * défaut. Les quinze autres icônes du DS restent des SVG intégrés au lieu de
 * devenir des `ph-swap_vert` inexistants (donc des carrés vides), et les noms
 * du consommateur passent toujours, eux, même absents de la table.
 */
export const MappingPartiel: Story = vitrinePolice(
  classIconResolver({
    aliases: {
      close: 'x',
      check: 'check',
      search: 'magnifying-glass',
      expand_more: 'caret-down',
      chevron_right: 'caret-right',
    } satisfies IconAliases,
    className: (nom) => `ph ph-${nom}`,
  }),
)
