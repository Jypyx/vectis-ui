import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import Avatar from '../Avatar/Avatar.vue'
import Button from '../Button/Button.vue'
import Chip from '../Chip/Chip.vue'
import Input from '../Input/Input.vue'
import Typography from '../Typography/Typography.vue'
import SkeletonLoader from './SkeletonLoader.vue'

const meta = {
  title: 'Composants/SkeletonLoader',
  component: SkeletonLoader,
  argTypes: {
    shape: { control: 'select', options: ['text', 'control', 'pill', 'circle', 'surface'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    animation: { control: 'select', options: ['wave', 'pulse', 'none'] },
    lines: { control: { type: 'number', min: 1, max: 12, step: 1 } },
    color: { control: 'color' },
  },
  args: {
    shape: 'text',
    size: 'md',
    compact: false,
    lines: 3,
    animation: 'wave',
    announce: false,
  },
  render: (args) => ({
    components: { SkeletonLoader },
    setup: () => ({ args }),
    // une silhouette a besoin d'une largeur pour se voir : le composant n'en a
    // pas d'intrinsèque, c'est au conteneur de la donner (idiome ProgressLinear)
    template: '<div style="width: 320px"><SkeletonLoader v-bind="args" /></div>',
  }),
} satisfies Meta<typeof SkeletonLoader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const item = canvasElement.querySelector('.ds-skeleton-item')!

    // Canari de câblage : jsdom ne voit ni pseudo-élément ni keyframes. Rougit
    // si l'animation est renommée, mal layerisée, ou si le ::after disparaît.
    await waitFor(() =>
      expect(getComputedStyle(item, '::after').animationName).toBe('ds-skeleton-wave'),
    )

    // Canari de la syntaxe de couleur relative : si `oklch(from …)` n'était pas
    // supporté, `--_highlight` serait invalide au calcul, la déclaration
    // entière le deviendrait avec elle (elle contient un var()) et le dégradé
    // retomberait à `none` — bande invisible, sans la moindre erreur console.
    await expect(getComputedStyle(item, '::after').backgroundImage).not.toBe('none')

    // La dernière ligne d'un paragraphe est raccourcie : c'est ce détail qui
    // fait lire « bloc de texte » plutôt que « tableau ».
    const items = canvasElement.querySelectorAll('.ds-skeleton-item')
    const first = items[0]!.getBoundingClientRect().width
    const last = items[items.length - 1]!.getBoundingClientRect().width
    await expect(last).toBeLessThan(first)
  },
}

/**
 * Chaque forme pose un rayon du design system et une règle de hauteur. `text`
 * suit la typo héritée, `control`/`pill`/`circle` l'échelle des contrôles,
 * `surface` un token dédié.
 */
export const Formes: Story = {
  render: () => ({
    components: { SkeletonLoader },
    setup: () => ({
      formes: ['text', 'control', 'pill', 'circle', 'surface'] as const,
    }),
    template: `
      <div style="display: grid; gap: 20px; width: 320px">
        <div v-for="forme in formes" :key="forme" style="display: grid; gap: 4px">
          <small style="color: var(--ds-color-text-muted)">{{ forme }}</small>
          <SkeletonLoader :shape="forme" />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    // une silhouette par forme, dans l'ordre du tableau `formes`
    const items = canvasElement.querySelectorAll('.ds-skeleton-item')

    // le cercle transfère sa largeur depuis sa hauteur
    const circle = items[3]!.getBoundingClientRect()
    await waitFor(() => expect(circle.width).toBeCloseTo(circle.height, 0))
    // la surface prend la hauteur de son token (96px)
    await expect(items[4]!.getBoundingClientRect().height).toBeCloseTo(96, 0)
    // la ligne de texte est à la hauteur de la police, pas d'un contrôle
    await expect(items[0]!.getBoundingClientRect().height).toBeLessThan(24)
  },
}

/**
 * Les deux animations éclaircissent la silhouette avec le même reflet dérivé du
 * fond : `wave` le fait traverser, `pulse` le fait monter et redescendre sur
 * place. `none` fige. La wave se lit surtout sur les grandes surfaces.
 */
export const Animations: Story = {
  render: () => ({
    components: { SkeletonLoader },
    setup: () => ({ animations: ['wave', 'pulse', 'none'] as const }),
    template: `
      <div style="display: grid; gap: 20px; width: 360px">
        <div v-for="a in animations" :key="a" style="display: grid; gap: 4px">
          <small style="color: var(--ds-color-text-muted)">{{ a }}</small>
          <SkeletonLoader shape="surface" :animation="a" />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const [wave, pulse, none] = canvasElement.querySelectorAll('.ds-skeleton-item')

    // Les deux animations partagent le calque et ÉCLAIRCISSENT : un pulse rendu
    // par l'opacité de la silhouette ferait fondre vers le fond de la page,
    // donc assombrirait en thème sombre. Le calque du pulse est un aplat.
    await waitFor(() =>
      expect(getComputedStyle(pulse!, '::after').animationName).toBe('ds-skeleton-pulse'),
    )
    await expect(getComputedStyle(pulse!, '::after').backgroundImage).toBe('none')
    await expect(getComputedStyle(wave!, '::after').backgroundImage).not.toBe('none')
    // `none` ne pose aucun calque : la règle est qualifiée par data-animation
    await expect(getComputedStyle(none!, '::after').content).toBe('none')
  },
}

/**
 * `size` et `compact` reprennent l'échelle des contrôles du design system
 * (24/32/40/48/56px) : un skeleton `md` fait exactement la hauteur d'un Button
 * `md`. Sans effet sur `text` et `surface`, qui ont leur propre règle.
 */
export const Tailles: Story = {
  render: () => ({
    components: { SkeletonLoader },
    setup: () => ({ tailles: ['xs', 'sm', 'md', 'lg', 'xl'] as const }),
    template: `
      <div style="display: grid; gap: 20px">
        <div style="display: flex; gap: 12px; align-items: flex-start">
          <SkeletonLoader v-for="t in tailles" :key="t" shape="circle" :size="t" />
        </div>
        <div style="display: grid; gap: 8px; width: 240px">
          <SkeletonLoader v-for="t in tailles" :key="t" shape="control" :size="t" />
        </div>
        <div style="display: grid; gap: 8px; width: 240px">
          <!-- compact : -4px de hauteur, comme partout ailleurs dans le DS -->
          <SkeletonLoader shape="control" size="md" />
          <SkeletonLoader shape="control" size="md" compact />
        </div>
      </div>
    `,
  }),
}

/**
 * En `shape="text"`, la hauteur vaut `1em` et la gouttière l'interlignage : N
 * lignes occupent exactement N lignes de texte, quelle que soit la typo du
 * parent — le remplacement par le contenu réel ne fait pas sauter la mise en
 * page.
 */
export const Paragraphe: Story = {
  render: () => ({
    components: { SkeletonLoader },
    template: `
      <div style="display: grid; gap: 24px; width: 360px">
        <div style="font-size: var(--ds-text-body-sm-size); line-height: var(--ds-text-body-sm-leading)">
          <SkeletonLoader :lines="5" />
        </div>
        <div style="font-size: var(--ds-text-heading-2-size); line-height: var(--ds-text-heading-2-leading)">
          <SkeletonLoader :lines="2" />
        </div>
      </div>
    `,
  }),
}

/**
 * La promesse du composant : reproduire la silhouette de n'importe quel
 * composant du design system. À gauche le composant réel, à droite son
 * skeleton — même forme, même taille, même rythme.
 */
export const SilhouettesDuDesignSystem: Story = {
  render: () => ({
    components: { SkeletonLoader, Avatar, Button, Chip, Input, Typography },
    template: `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px 32px; width: 560px; align-items: start">
        <Typography variant="overline" tone="muted" as="p">Composant</Typography>
        <Typography variant="overline" tone="muted" as="p">Skeleton</Typography>

        <Button size="md">Enregistrer</Button>
        <SkeletonLoader shape="control" size="md" width="128" />

        <Avatar size="lg" name="Ada Lovelace" />
        <SkeletonLoader shape="circle" size="lg" />

        <Chip size="xs">Filtre actif</Chip>
        <SkeletonLoader shape="pill" size="xs" width="88" />

        <Input size="md" label="Nom" model-value="Ada Lovelace" />
        <!-- l'étiquette est une ligne de texte, le champ une silhouette de contrôle -->
        <div style="display: grid; gap: 4px">
          <SkeletonLoader width="40%" />
          <SkeletonLoader shape="control" size="md" />
        </div>

        <div style="border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-surface); padding: 16px; display: grid; gap: 12px">
          <Typography variant="heading-4">Analyse des ventes</Typography>
          <Typography variant="body-sm" tone="muted">
            Le trimestre s'achève sur une progression de 12 % du chiffre d'affaires.
          </Typography>
        </div>
        <div style="border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-surface); padding: 16px; display: grid; gap: 12px">
          <SkeletonLoader shape="control" size="sm" width="60%" />
          <SkeletonLoader :lines="3" />
        </div>
      </div>
    `,
  }),
}

/**
 * Il n'existe pas de mode enveloppe : le composant ne mesure jamais le contenu
 * qu'il remplace. L'idiome est un `v-if`/`v-else`, avec `aria-busy` sur le
 * conteneur — c'est lui qui porte l'annonce, pas le placeholder.
 */
export const RemplacementProgressif: Story = {
  render: () => ({
    components: { SkeletonLoader, Button, Typography },
    setup: () => ({ pending: ref(true) }),
    template: `
      <div style="display: grid; gap: 16px; width: 360px">
        <Button size="sm" variant="outline" @click="pending = !pending">
          {{ pending ? 'Charger' : 'Recharger' }}
        </Button>
        <div :aria-busy="pending || undefined" style="display: grid; gap: 8px">
          <template v-if="pending">
            <SkeletonLoader shape="control" size="sm" width="55%" />
            <SkeletonLoader :lines="3" />
          </template>
          <template v-else>
            <Typography variant="heading-4">Analyse des ventes</Typography>
            <Typography variant="body-sm" tone="muted">
              Le trimestre s'achève sur une progression de 12 % du chiffre d'affaires,
              portée par les abonnements annuels.
            </Typography>
          </template>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvasElement.querySelectorAll('.ds-skeleton-item').length).toBeGreaterThan(0)

    await canvas.getByRole('button', { name: 'Charger' }).click()
    await waitFor(() => expect(canvasElement.querySelector('.ds-skeleton')).toBeNull())
  },
}

/**
 * `color` remplace le fond ; le reflet de la wave en est dérivé par un delta de
 * clarté OKLCH, il reste donc correct sur une surface inhabituelle comme en
 * thème sombre, sans second réglage.
 */
export const CouleurCustom: Story = {
  render: () => ({
    components: { SkeletonLoader },
    template: `
      <div style="display: grid; gap: 20px; width: 360px">
        <SkeletonLoader shape="surface" color="oklch(55% 0.14 265)" />
        <div style="background: var(--ds-color-surface-inverse); border-radius: var(--ds-radius-surface); padding: 16px; display: grid; gap: 8px">
          <SkeletonLoader shape="control" size="sm" color="oklch(38% 0.01 260)" width="60%" />
          <SkeletonLoader :lines="3" color="oklch(38% 0.01 260)" />
        </div>
      </div>
    `,
  }),
}

/**
 * Un skeleton est décoratif par défaut : douze silhouettes ne doivent pas
 * produire douze annonces. `announce` (ou `label`, qui l'implique) n'est posé
 * que sur **une** instance par zone.
 */
export const Annonce: Story = {
  render: () => ({
    components: { SkeletonLoader },
    template: `
      <div style="display: grid; gap: 8px; width: 320px">
        <!-- une seule annonce, située ; les suivantes sont muettes -->
        <SkeletonLoader shape="control" size="sm" label="Chargement des résultats…" />
        <SkeletonLoader v-for="n in 11" :key="n" shape="control" size="sm" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole('status')).toHaveLength(1)
  },
}

/**
 * Conteneurs dégénérés, hauteurs imposées et valeurs hors bornes : la
 * silhouette se dégrade sans jamais disparaître.
 */
export const CasLimites: Story = {
  render: () => ({
    components: { SkeletonLoader },
    template: `
      <div style="display: grid; gap: 24px">
        <div style="display: grid; gap: 4px">
          <small style="color: var(--ds-color-text-muted)">lines = 0 → une ligne quand même</small>
          <div style="width: 200px"><SkeletonLoader :lines="0" /></div>
        </div>

        <div style="display: grid; gap: 4px">
          <small style="color: var(--ds-color-text-muted)">12 lignes dans 120px de haut (compression)</small>
          <div style="width: 200px; height: 120px"><SkeletonLoader :lines="12" /></div>
        </div>

        <div style="display: grid; gap: 4px">
          <small style="color: var(--ds-color-text-muted)">surface dans un parent de hauteur définie : elle la prend</small>
          <div style="width: 200px; height: 40px"><SkeletonLoader shape="surface" /></div>
        </div>

        <div style="display: grid; gap: 4px">
          <small style="color: var(--ds-color-text-muted)">cercle dans un parent très large : il reste rond</small>
          <div style="width: 480px"><SkeletonLoader shape="circle" size="xl" /></div>
        </div>

        <div style="display: grid; gap: 4px">
          <small style="color: var(--ds-color-text-muted)">line-height serré : la gouttière ne devient pas négative</small>
          <div style="width: 200px; line-height: 0.5"><SkeletonLoader :lines="3" /></div>
        </div>

        <div style="display: grid; gap: 4px">
          <small style="color: var(--ds-color-text-muted)">hauteur explicite : elle prime sur shape et size</small>
          <div style="width: 200px"><SkeletonLoader shape="control" size="xs" height="72" /></div>
        </div>
      </div>
    `,
  }),
}
