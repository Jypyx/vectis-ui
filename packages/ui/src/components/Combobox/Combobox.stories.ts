import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { computed, ref } from 'vue'

import Combobox from './Combobox.vue'
import type { ComboboxOption } from './Combobox.vue'

const PAYS = [
  { value: 'fr', label: 'France' },
  { value: 'be', label: 'Belgique' },
  { value: 'ch', label: 'Suisse' },
  { value: 'ca', label: 'Canada' },
  { value: 'lu', label: 'Luxembourg' },
  { value: 'mc', label: 'Monaco', disabled: true },
  { value: 'sn', label: 'Sénégal' },
  { value: 'ci', label: "Côte d'Ivoire" },
]

const CAPITALES: Record<string, string> = {
  fr: 'Paris',
  be: 'Bruxelles',
  ch: 'Berne',
  ca: 'Ottawa',
  lu: 'Luxembourg',
  mc: 'Monaco',
  sn: 'Dakar',
  ci: 'Yamoussoukro',
}

// « API » simulée pour les stories asynchrones : latence réseau, filtrage et
// pagination côté source (le composant n'en refait aucun).
const CATALOGUE: ComboboxOption[] = Array.from({ length: 120 }, (_, i) => ({
  value: `ref-${i + 1}`,
  label: `Référence ${String(i + 1).padStart(3, '0')}`,
}))
const TAILLE_PAGE = 20
const attendre = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function chercher(query: string, page: number) {
  await attendre(400)
  const trouves = CATALOGUE.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
  return {
    items: trouves.slice(page * TAILLE_PAGE, (page + 1) * TAILLE_PAGE),
    total: trouves.length,
  }
}

const meta = {
  title: 'Composants/Combobox',
  component: Combobox,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    compact: { control: 'boolean' },
    clearable: { control: 'boolean' },
    loading: { control: 'boolean' },
    // union booléen | prédicat : pas de contrôle possible
    filter: { control: false },
    hasMore: { control: false },
  },
  args: { options: PAYS, placeholder: 'Choisir un pays…' },
} satisfies Meta<typeof Combobox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { Combobox },
    setup: () => ({ args, value: ref('') }),
    template: `
      <div style="display: grid; gap: 8px; width: 300px">
        <Combobox v-bind="args" v-model="value" aria-label="Pays" />
        <output data-testid="mirror">{{ value }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')

    // recherche insensible aux accents, navigation clavier, sélection
    await userEvent.click(input)
    await userEvent.keyboard('sene')
    await waitFor(() => expect(canvas.getByRole('option', { name: /Sénégal/ })).toBeVisible())
    await userEvent.keyboard('{ArrowDown}{Enter}')
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent('sn'))
    await expect(input).toHaveValue('Sénégal')
  },
}

export const SelectionMultiple: Story = {
  render: (args) => ({
    components: { Combobox },
    setup: () => ({ args, value: ref<string[]>(['fr']), other: ref<string[]>(['ch', 'ca']) }),
    template: `
      <div style="display: grid; gap: 16px; width: 340px">
        <div style="display: grid; gap: 4px">
          <span style="font: 12px sans-serif; color: #888">Effacement activé (défaut)</span>
          <Combobox v-bind="args" multiple v-model="value" aria-label="Pays desservis" />
          <output data-testid="mirror">{{ value.join(',') }}</output>
        </div>
        <div style="display: grid; gap: 4px">
          <span style="font: 12px sans-serif; color: #888">Effacement désactivé (clearable=false)</span>
          <Combobox v-bind="args" multiple :clearable="false" v-model="other" aria-label="Autres pays" />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getAllByRole('combobox')[0]!

    // sélection multiple : le panneau reste ouvert, des tags apparaissent
    await userEvent.click(input)
    await userEvent.keyboard('bel')
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent('fr,be'))

    // Backspace sur champ vide retire le dernier tag
    await userEvent.keyboard('{Backspace}')
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent(/^fr$/))

    // retrait via le bouton du tag
    await userEvent.click(canvas.getByRole('button', { name: 'Retirer France' }))
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent(/^$/))

    // la croix (clearable) est visible dès qu'il y a une sélection et vide tout
    await userEvent.keyboard('bel')
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent('be'))
    await userEvent.click(canvas.getByRole('button', { name: 'Effacer la sélection' }))
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent(/^$/))
  },
}

export const AucunResultat: Story = {
  render: (args) => ({
    components: { Combobox },
    setup: () => ({ args, value: ref('') }),
    template: `
      <div style="width: 300px">
        <Combobox v-bind="args" v-model="value" aria-label="Pays" empty-text="Aucun pays trouvé" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('combobox'))
    await userEvent.keyboard('zzz')
    await waitFor(() => expect(canvas.getByText('Aucun pays trouvé')).toBeVisible())
  },
}

export const Invalide: Story = {
  render: (args) => ({
    components: { Combobox },
    setup: () => ({ args, value: ref('') }),
    template: `
      <div style="width: 300px">
        <Combobox v-bind="args" v-model="value" invalid aria-label="Pays" />
      </div>
    `,
  }),
}

export const Disabled: Story = {
  render: (args) => ({
    components: { Combobox },
    setup: () => ({ args, value: ref('fr') }),
    template: `
      <div style="width: 300px">
        <Combobox v-bind="args" v-model="value" disabled aria-label="Pays" />
      </div>
    `,
  }),
}

/**
 * Tailles `sm` (32px) et `md` (40px, défaut), combinables avec `compact` (-4px).
 * En multiple, les Chips gardent une taille constante (xs, 24px) ; seul `sm` les
 * passe en compact (20px) pour tenir dans la hauteur du champ.
 */
export const Tailles: Story = {
  render: (args) => ({
    components: { Combobox },
    setup: () => ({
      args,
      variants: [
        { label: 'sm', props: { size: 'sm' } },
        { label: 'sm compact', props: { size: 'sm', compact: true } },
        { label: 'md', props: { size: 'md' } },
        { label: 'md compact', props: { size: 'md', compact: true } },
      ],
      value: ['fr', 'be'],
    }),
    template: `
      <div style="display: grid; gap: 16px; width: 340px">
        <div v-for="v in variants" :key="v.label" style="display: grid; gap: 4px">
          <span style="font: 12px sans-serif; color: #888">{{ v.label }}</span>
          <Combobox v-bind="{ ...args, ...v.props }" multiple :model-value="value" aria-label="Pays" />
        </div>
      </div>
    `,
  }),
}

/**
 * Hors focus, en mode multiple, le champ de saisie est replié : seuls les Chips
 * restent, sans espace vide. Au focus, le champ de recherche réapparaît.
 */
export const RepliAuBlur: Story = {
  render: (args) => ({
    components: { Combobox },
    setup: () => ({ args, value: ref<string[]>(['fr', 'be', 'ch']) }),
    template: `
      <div style="display: grid; gap: 8px; width: 340px">
        <button type="button">Élément voisin (pour retirer le focus)</button>
        <Combobox v-bind="args" multiple v-model="value" aria-label="Pays desservis" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox') as HTMLInputElement

    // au focus, le champ de recherche est développé (largeur non nulle)
    await userEvent.click(input)
    await waitFor(() => expect(input.offsetWidth).toBeGreaterThan(0))

    // hors focus, le champ est replié (largeur nulle), seuls les Chips subsistent
    await userEvent.click(canvas.getByRole('button', { name: /voisin/ }))
    await waitFor(() => expect(input.offsetWidth).toBe(0))
    await expect(canvas.getByRole('button', { name: 'Retirer France' })).toBeVisible()
  },
}

/**
 * Recherche serveur : `filter: false` (la source a déjà filtré), `@search`
 * débouncé pour lancer la requête, `loading` pendant l'attente. Le composant
 * n'annule pas les requêtes : c'est au consommateur d'ignorer les réponses
 * obsolètes (jeton d'appel ci-dessous).
 */
export const RechercheAsynchrone: Story = {
  render: (args) => ({
    components: { Combobox },
    setup: () => {
      const value = ref('')
      const options = ref<ComboboxOption[]>([])
      const loading = ref(false)
      const requetes = ref(0)
      let jeton = 0

      async function onSearch(query: string) {
        const courant = ++jeton
        requetes.value += 1
        loading.value = true
        const { items } = await chercher(query, 0)
        // réponse obsolète (une frappe plus récente est partie) : on l'ignore
        if (courant !== jeton) return
        options.value = items
        loading.value = false
      }

      return { args, value, options, loading, requetes, onSearch }
    },
    template: `
      <div style="display: grid; gap: 8px; width: 340px">
        <Combobox
          v-bind="args"
          :options="options"
          :filter="false"
          :loading="loading"
          :search-debounce="400"
          v-model="value"
          aria-label="Référence"
          placeholder="Rechercher une référence…"
          empty-text="Aucune référence"
          @search="onSearch"
        />
        <output data-testid="mirror">{{ value }}</output>
        <output data-testid="requetes">{{ requetes }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')

    // ouverture : premier chargement immédiat (pas de debounce)
    await userEvent.click(input)
    await waitFor(() => expect(canvas.getByRole('option', { name: /Référence 001/ })).toBeVisible())

    // rafale de frappes : le debounce ne laisse partir qu'une requête
    await userEvent.keyboard('042')
    await waitFor(() => expect(canvas.getByRole('option', { name: /Référence 042/ })).toBeVisible())
    await expect(Number(canvas.getByTestId('requetes').textContent)).toBeLessThanOrEqual(2)

    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent('ref-42'))
  },
}

/**
 * Pagination : `hasMore` rend une sentinelle en pied de panneau, dont l'entrée
 * dans la vue émet `load-more`. Le spinner de page suivante s'affiche au même
 * endroit, sans remplacer les options déjà chargées.
 */
export const ScrollInfini: Story = {
  render: (args) => ({
    components: { Combobox },
    setup: () => {
      const value = ref('')
      const options = ref<ComboboxOption[]>([])
      const loading = ref(false)
      const total = ref(0)
      const page = ref(0)
      const requete = ref('')
      let jeton = 0

      async function onSearch(query: string) {
        const courant = ++jeton
        requete.value = query
        page.value = 0
        loading.value = true
        const resultat = await chercher(query, 0)
        if (courant !== jeton) return
        options.value = resultat.items
        total.value = resultat.total
        loading.value = false
      }

      async function onLoadMore() {
        loading.value = true
        const resultat = await chercher(requete.value, page.value + 1)
        page.value += 1
        options.value = [...options.value, ...resultat.items]
        loading.value = false
      }

      const hasMore = computed(() => options.value.length < total.value)

      return { args, value, options, loading, hasMore, total, onSearch, onLoadMore }
    },
    template: `
      <div style="display: grid; gap: 8px; width: 340px">
        <Combobox
          v-bind="args"
          :options="options"
          :filter="false"
          :loading="loading"
          :has-more="hasMore"
          v-model="value"
          aria-label="Référence"
          placeholder="Rechercher une référence…"
          @search="onSearch"
          @load-more="onLoadMore"
        />
        <output data-testid="compte">{{ options.length }} / {{ total }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('combobox'))
    await waitFor(() => expect(canvas.getByTestId('compte')).toHaveTextContent('20 / 120'))

    // défiler jusqu'en bas du panneau charge la page suivante
    const listbox = canvas.getByRole('listbox')
    listbox.scrollTop = listbox.scrollHeight
    await waitFor(() => expect(canvas.getByTestId('compte')).toHaveTextContent('40 / 120'))
  },
}

/**
 * Le slot `#option` remplace le libellé par le contenu de son choix (ici la
 * capitale en second niveau). Il reçoit l'option et son état (`active`,
 * `selected`, `index`).
 */
export const OptionPersonnalisee: Story = {
  render: (args) => ({
    components: { Combobox },
    setup: () => ({ args, value: ref('fr'), capitales: CAPITALES }),
    template: `
      <div style="width: 340px">
        <Combobox v-bind="args" v-model="value" aria-label="Pays">
          <template #option="{ option }">
            <span style="display: grid">
              <span>{{ option.label }}</span>
              <small style="opacity: 0.6">{{ capitales[option.value] }}</small>
            </span>
          </template>
        </Combobox>
      </div>
    `,
  }),
}

/**
 * Deux Combobox côte à côte : chaque panneau s'ancre à SON contrôle grâce à
 * `anchor-scope` (le nom d'ancre est confiné à chaque instance).
 */
export const DeuxComboboxes: Story = {
  render: (args) => ({
    components: { Combobox },
    setup: () => ({ args, a: ref(''), b: ref('') }),
    template: `
      <div style="display: flex; gap: 16px; width: 640px">
        <Combobox v-bind="args" v-model="a" aria-label="Pays A" />
        <Combobox v-bind="args" v-model="b" aria-label="Pays B" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const [first, second] = canvas.getAllByRole('combobox')

    await userEvent.click(first!)
    await waitFor(() => expect(canvas.getByRole('option', { name: 'France' })).toBeVisible())
    // le second reste fermé et indépendant
    await expect(second!).toHaveAttribute('aria-expanded', 'false')
  },
}
