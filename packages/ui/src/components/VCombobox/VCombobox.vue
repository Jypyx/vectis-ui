<script setup lang="ts">
import { computed, nextTick, reactive, ref, useId, watch, watchEffect } from 'vue'

import VChip from '../VChip/VChip.vue'
import VIcon from '../VIcon/VIcon.vue'
import type { IconSource } from '../VIcon/types'
import VInput from '../VInput/VInput.vue'
import VPopover from '../VPopover/VPopover.vue'
// alias : les types publics `VComboboxOption`/`VComboboxGroup`/`VComboboxSeparator`
// occupent déjà ces noms dans ce module
import OptionRow from './VComboboxOption.vue'
import OptionGroup from './VComboboxGroup.vue'
import OptionSeparator from './VComboboxSeparator.vue'
import VSpinner from '../VSpinner/VSpinner.vue'

import { toggleValue } from '../../utils/array'
import { normalizeText } from '../../utils/text'

import { useRootAttrs } from '../../composables/useRootAttrs'

import { useFocusoutDismiss } from '../../composables/useFocusoutDismiss'

import { useTimer } from '../../composables/useTimer'
import { useMessages } from '../../i18n/state'

/**
 * VCombobox avec recherche et sélection multiple, composé de `VInput`, `VChip` et
 * d'un `VPopover` qui porte lui-même `role="listbox"`. Le JS implémente le
 * pattern ARIA combobox/listbox que le natif ne couvre pas (pas de `<datalist>`
 * stylable/multiple) : filtrage, navigation par `aria-activedescendant` (le
 * focus DOM reste dans l'input — le panneau n'a donc aucun clavier propre),
 * sélection simple ou multiple. C'est ce composant qui possède TOUT le contrat
 * ARIA du champ. Fermeture au `focusout` : le champ vit hors du panneau, ouvert
 * en `mode="manual"` (pas de light dismiss).
 */
export interface VComboboxOption {
  value: string
  label: string
  /**
   * Icône avant le libellé : nom d'icône, ou rendu explicite (`{ src }`…).
   */
  icon?: IconSource
  disabled?: boolean
}

/**
 * Groupe nommé d'options, rendu en `role="group"` + `aria-labelledby` (le
 * pendant du `<optgroup>` natif). Un groupe dont plus aucune option ne passe le
 * filtre disparaît, libellé compris.
 */
export interface VComboboxGroup {
  label: string
  options: VComboboxOption[]
}

/**
 * Filet de séparation entre deux blocs d'options. Purement décoratif : les
 * séparateurs devenus orphelins au filtrage (en tête, en fin, ou consécutifs)
 * ne sont pas rendus.
 */
export interface VComboboxSeparator {
  separator: true
}

/** Une entrée de la prop `options` : option, groupe ou séparateur. */
export type ComboboxItem = VComboboxOption | VComboboxGroup | VComboboxSeparator

const isGroup = (item: ComboboxItem): item is VComboboxGroup => 'options' in item
const isSeparator = (item: ComboboxItem): item is VComboboxSeparator => 'separator' in item

/**
 * Filtrage local : `true` (défaut), `false` (les options arrivent déjà filtrées
 * — recherche serveur) ou un prédicat de correspondance personnalisé.
 */
export type ComboboxFilter = boolean | ((option: VComboboxOption, query: string) => boolean)

interface ComboboxProps {
  /**
   * Options du panneau. Une entrée peut aussi être un `VComboboxGroup` (bloc
   * nommé) ou un `VComboboxSeparator` ; une liste plate d'options reste valide.
   */
  options: ComboboxItem[]
  /** Sélection multiple — le v-model devient string[] et des Chips s'affichent. */
  multiple?: boolean
  /** Hauteur du champ : sm 32px, md 40px (défaut — aligné sur VInput), lg 48px. */
  size?: 'sm' | 'md' | 'lg'
  /** Hauteur réduite de 4px (comme les autres contrôles). */
  compact?: boolean
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  /** Bouton d'effacement (croix) qui vide la sélection et la recherche. */
  clearable?: boolean
  /** Message quand aucune option ne correspond à la recherche. */
  emptyText?: string
  /**
   * Filtrage local des options. `false` : les options sont déjà filtrées par la
   * source (recherche serveur) et sont affichées telles quelles. Une fonction
   * reçoit la requête BRUTE (trimée), pas sa forme normalisée NFD.
   */
  filter?: ComboboxFilter
  /** Délai avant émission de `search`, en ms. `0` = émission synchrone. */
  searchDebounce?: number
  /**
   * Chargement en cours : panneau sans option → état plein panneau ; options
   * déjà affichées → spinner en pied de liste (page suivante). Le champ montre
   * un spinner à la place du chevron dans les deux cas.
   */
  loading?: boolean
  /** Message et libellé du spinner pendant le chargement. */
  loadingText?: string
  /** Il reste des pages à charger : rend la sentinelle qui émet `load-more`. */
  hasMore?: boolean
}

const props = withDefaults(defineProps<ComboboxProps>(), {
  multiple: false,
  size: 'md',
  compact: false,
  placeholder: undefined,
  disabled: false,
  invalid: false,
  clearable: true,
  emptyText: undefined,
  filter: true,
  searchDebounce: 250,
  loading: false,
  loadingText: undefined,
  hasMore: false,
})

// Cascade prop > dictionnaire : la prop garde la priorité, son défaut suit
// désormais la locale du DS.
const m = useMessages()
const resolvedEmptyText = computed(() => props.emptyText ?? m.value.combobox.empty)
const resolvedLoadingText = computed(() => props.loadingText ?? m.value.common.loading)

const emit = defineEmits<{
  /**
   * Terme de recherche à envoyer à la source (débouncé ; immédiat à l'ouverture
   * du panneau, pour le premier chargement). Un même terme n'est pas réémis :
   * rouvrir le panneau ne relance pas la requête.
   */
  search: [query: string]
  /** La fin de liste est entrée dans la vue : charger la page suivante. */
  'load-more': []
}>()

defineSlots<{
  /** Contenu d'une option (défaut : son libellé). */
  option?(props: {
    option: VComboboxOption
    index: number
    active: boolean
    selected: boolean
  }): unknown
  /**
   * VChip d'une valeur sélectionnée en mode multiple (défaut : un `VChip`
   * dismissible portant le libellé). `option` peut être `undefined` si la
   * valeur n'a jamais été vue dans `options` ; `size`/`compact` sont ceux
   * calculés pour tenir dans le champ, les reprendre pour garder le gabarit.
   */
  chip?(props: {
    value: string
    option: VComboboxOption | undefined
    label: string
    remove: () => void
    size: 'xs' | 'sm'
    compact: boolean
  }): unknown
  /** Panneau sans résultat (défaut : `emptyText`) ; `query` = terme recherché. */
  empty?(props: { query: string }): unknown
  /** Panneau en chargement, aucune option affichée (défaut : `loadingText`). */
  loading?(): unknown
}>()

// Les Chips restent un cran sous le champ pour tenir dedans sans le faire
// grandir : xs (24px) jusqu'à `md`, sm (32px) en `lg`. Sous le cran le plus
// bas de chaque paire, le rattrapage passe par `compact` plutôt que par une
// taille de moins — d'où `sm` → xs compact (20px dans 32px) et `lg` compact →
// sm compact (28px dans 44px). En `md` la marge suffit déjà, le `compact` du
// VCombobox ne touche donc pas les Chips.
// Toute évolution de ce mapping doit être reportée sur `--chip-height` (CSS
// plus bas) : la hauteur est redite côté champ, hors de portée du sous-arbre.
const chipSize = computed(() => (props.size === 'lg' ? 'sm' : 'xs'))
const chipCompact = computed(() => (props.size === 'lg' ? props.compact : props.size === 'sm'))

const model = defineModel<string | string[]>({ default: '' })

// Racine wrapper : class/style restent sur la racine, le reste (aria-label…)
// est reporté sur le VInput pour nommer le role="combobox".
defineOptions({ inheritAttrs: false })
const { rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

const rootEl = ref<HTMLElement | null>(null)
const inputRef = ref<InstanceType<typeof VInput> | null>(null)
// Sert à la fois d'id du panneau Listbox (cible d'`aria-controls`) et de
// préfixe des ids d'options (`optionId`) : chaînes distinctes, pas de collision.
const optionsId = useId()

const open = ref(false)
const query = ref('')
const activeIndex = ref(-1)
const focused = ref(false)
// `query` sert à la fois d'affichage (libellé sélectionné en simple) et de
// recherche. `typed` distingue les deux : tant qu'il est faux, `query` n'est
// PAS un filtre (toute la liste est proposée à la réouverture) — il ne passe
// vrai qu'à la frappe de l'utilisateur.
const typed = ref(false)

const selectedValues = computed<string[]>(() => {
  if (props.multiple) return Array.isArray(model.value) ? model.value : []
  return typeof model.value === 'string' && model.value ? [model.value] : []
})

// Options de `props.options` à plat (groupes dépliés, séparateurs écartés),
// dans l'ordre du source. C'est l'UNIQUE lecture des options par le reste du
// composant : filtrage, cache, libellés et pagination ignorent la hiérarchie,
// que seul le rendu (`rendered`) connaît.
const allOptions = computed<VComboboxOption[]>(() =>
  props.options.flatMap((item) => {
    if (isSeparator(item)) return []
    return isGroup(item) ? item.options : [item]
  }),
)

// Mémoire des options SÉLECTIONNÉES : en source asynchrone, `options` ne
// contient que le dernier jeu de résultats et une valeur déjà choisie en est
// souvent absente — sans cache, le VChip afficherait son identifiant brut (et le
// slot #chip perdrait l'icône de l'option).
// watchEffect (et non watch sur `props.options`) : il traque l'itération, donc
// aussi les ajouts en place d'une page (scroll infini). Borné à la sélection :
// les autres options se relisent dans `options`.
const optionCache = reactive(new Map<string, VComboboxOption>())
watchEffect(() => {
  const wanted = new Set(selectedValues.value)
  for (const option of allOptions.value) {
    if (wanted.has(option.value)) optionCache.set(option.value, option)
  }
})

/**
 * Option connue pour cette valeur : `options` courantes d'abord, cache en repli.
 * Une option issue du cache est un proxy réactif (`reactive` convertit les
 * valeurs objet) : comparer par `value`, jamais par identité.
 */
function optionOf(value: string) {
  return allOptions.value.find((o) => o.value === value) ?? optionCache.get(value)
}

function labelOf(value: string) {
  return optionOf(value)?.label ?? value
}

// Terme de recherche unique, consommé par le filtre local ET par l'émission
// `search` : la liste proposée et la requête envoyée ne peuvent pas diverger.
// Pas de frappe → terme vide (le libellé affiché ne restreint pas la liste).
const searchTerm = computed(() => (typed.value ? query.value.trim() : ''))

// Liste PLATE des options retenues, dans l'ordre d'affichage : c'est elle que
// la navigation clavier indexe (`activeIndex`, `optionId`) — les groupes et les
// séparateurs n'y apparaissent pas, ils ne sont donc jamais un arrêt clavier.
const filtered = computed(() => {
  const matcher = props.filter
  const list = allOptions.value
  if (matcher === false) return list
  const q = searchTerm.value
  if (!q) return list
  if (typeof matcher === 'function') return list.filter((o) => matcher(o, q))
  const needle = normalizeText(q)
  return list.filter((o) => normalizeText(o.label).includes(needle))
})

// ── Arbre de rendu ──────────────────────────────────────────────────────────
// Seul endroit qui connaît la hiérarchie. Chaque option y porte son index DANS
// `filtered` (et non sa position dans l'arbre) : ids, surbrillance et slot
// #option restent alignés sur la navigation clavier.
type RenderedOption = { kind: 'option'; key: string; option: VComboboxOption; index: number }
type RenderedNode =
  | RenderedOption
  | { kind: 'group'; key: string; label: string; options: RenderedOption[] }
  | { kind: 'separator'; key: string }

const rendered = computed<RenderedNode[]>(() => {
  const indexOf = new Map<string, number>()
  filtered.value.forEach((option, index) => indexOf.set(option.value, index))

  const entryOf = (option: VComboboxOption): RenderedOption | null => {
    const index = indexOf.get(option.value)
    if (index === undefined) return null
    return { kind: 'option', key: `option:${option.value}`, option, index }
  }

  const nodes: RenderedNode[] = []
  // Séparateur différé : matérialisé seulement si du contenu le précède ET le
  // suit. Un seul mécanisme couvre les trois cas d'orphelin nés du filtrage
  // (filet en tête, en fin, ou deux d'affilée).
  let pendingSeparator: string | null = null

  for (const [i, item] of props.options.entries()) {
    if (isSeparator(item)) {
      if (nodes.length > 0) pendingSeparator = `sep:${i}`
      continue
    }

    let node: RenderedNode | null
    if (isGroup(item)) {
      const options = item.options
        .map(entryOf)
        .filter((entry): entry is RenderedOption => entry !== null)
      // groupe vidé par le filtre : omis, libellé compris
      node =
        options.length > 0 ? { kind: 'group', key: `group:${i}`, label: item.label, options } : null
    } else {
      node = entryOf(item)
    }
    if (!node) continue

    if (pendingSeparator !== null) {
      nodes.push({ kind: 'separator', key: pendingSeparator })
      pendingSeparator = null
    }
    nodes.push(node)
  }

  return nodes
})

// ── Recherche (source externe) ──────────────────────────────────────────────
// JS justifié : aucune primitive native ne débounce ni ne dédoublonne une
// requête. Le report est délégué à `useTimer` (réarmement, délai ≤ 0 synchrone,
// annulation au démontage) ; ne reste ici que ce qui est propre au VCombobox :
// le dédoublonnage par terme et l'annulation à la fermeture du panneau.
const searchTimer = useTimer()
// undefined = jamais émis. Dédoublonnage : rouvrir le panneau sur le même terme
// ne relance pas la requête (le consommateur peut toujours ignorer son cache).
let lastEmitted: string | undefined

const cancelSearch = searchTimer.cancel

function emitSearch(term: string, immediate = false) {
  cancelSearch()
  if (term === lastEmitted) return
  searchTimer.start(
    () => {
      // le panneau a pu se fermer pendant le délai : plus rien à charger
      if (!open.value) return
      lastEmitted = term
      emit('search', term)
    },
    immediate ? 0 : props.searchDebounce,
  )
}

watch(searchTerm, (term) => {
  if (!open.value) return
  // Nouvelle recherche = nouvelle liste : l'index actif ne lui survit pas (en
  // source externe, `options` est remplacé en bloc — il pointerait une option
  // sans rapport). On repointe sur la première activable plutôt que sur -1 :
  // avec `filter: false`, `filtered` garde la même référence tant que la source
  // n'a pas répondu, donc le watch ci-dessous ne se déclencherait pas et Entrée
  // resterait inerte. Quand la nouvelle liste arrive, l'index reste dans les
  // bornes : il désigne alors sa première option.
  activeIndex.value = filtered.value.findIndex((o) => !o.disabled)
  emitSearch(term)
})

watch(filtered, (list) => {
  // Panneau ouvert : garder une option active valide. On repointe sur le 1er
  // résultat quand l'actif est hors liste OU inexistant (-1) — sinon, après un
  // filtre passé par « aucun résultat », l'index resterait à -1 et Entrée ne
  // sélectionnerait pas l'unique résultat suivant.
  if (!open.value) return
  if (activeIndex.value < 0 || activeIndex.value >= list.length) {
    activeIndex.value = list.findIndex((o) => !o.disabled)
  }
})

// mode simple : hors édition, l'input affiche le libellé sélectionné (texte)
if (!props.multiple && typeof model.value === 'string' && model.value) {
  query.value = labelOf(model.value)
}

// Ce libellé est une COPIE (pas une dérivation) : quand les options arrivent
// après coup (source asynchrone), il faut la rafraîchir — sinon un champ monté
// avec une valeur mais sans options affiche l'identifiant brut à vie. On
// n'écoute QUE `options` : écouter `model` réintroduirait la lecture prématurée
// que `select()` évite volontairement.
// Gardes `open`/`typed` : ne jamais écraser une saisie en cours.
watch(
  allOptions,
  () => {
    if (props.multiple || open.value || typed.value) return
    if (typeof model.value === 'string' && model.value) query.value = labelOf(model.value)
  },
  { flush: 'post' },
)

// multiple avec sélection et champ non focus : replier le champ de saisie
// (il reste dans le DOM, focusable) pour ne pas laisser d'espace vide.
const collapsed = computed(
  () => props.multiple && !focused.value && selectedValues.value.length > 0,
)

// La croix (prop `clearable` de VInput) doit apparaître dès qu'il y a QUELQUE CHOSE
// à effacer — une sélection (Chips) OU une recherche — pas seulement quand le
// champ texte est non-vide. On pilote donc explicitement sa visibilité (VInput
// l'expose via `clearVisible`) et on réserve la place à droite en conséquence.
const canClear = computed(
  () =>
    props.clearable &&
    !props.disabled &&
    (selectedValues.value.length > 0 || query.value.length > 0),
)

const optionId = (index: number) => `${optionsId}-option-${index}`

// Le rendu d'une option est écrit deux fois (dans un groupe, et à la racine du
// panneau) — un template Vue n'a pas de fragment réutilisable. Ces deux
// fabriques ramènent la duplication à une ligne de chaque côté.
function rowProps(entry: RenderedOption) {
  return {
    id: optionId(entry.index),
    icon: entry.option.icon,
    active: entry.index === activeIndex.value,
    selected: selectedValues.value.includes(entry.option.value),
    disabled: entry.option.disabled,
  }
}

function optionSlotProps(entry: RenderedOption) {
  return {
    option: entry.option,
    index: entry.index,
    active: entry.index === activeIndex.value,
    selected: selectedValues.value.includes(entry.option.value),
  }
}

function hover(entry: RenderedOption) {
  if (!entry.option.disabled) activeIndex.value = entry.index
}

// Le focus DOM ne quitte jamais l'input (navigation par aria-activedescendant) :
// le navigateur ne défile donc pas l'option active dans le panneau `overflow:auto`.
// On l'amène dans la vue à la main. `block: 'nearest'` = pas de saut si déjà visible.
watch(activeIndex, (index) => {
  if (index < 0) return
  nextTick(() => {
    // `?.scrollIntoView` : l'API n'existe pas en jsdom (tests).
    document.getElementById(optionId(index))?.scrollIntoView?.({ block: 'nearest' })
  })
})

function openPanel() {
  if (props.disabled || open.value) return
  open.value = true
  const list = filtered.value
  const selectedIdx = list.findIndex((o) => !o.disabled && selectedValues.value.includes(o.value))
  activeIndex.value = selectedIdx >= 0 ? selectedIdx : list.findIndex((o) => !o.disabled)
  // Après `open = true` (l'émission différée se re-vérifie sur `open`) : permet
  // à une source externe de charger sa première page à l'ouverture.
  emitSearch(searchTerm.value, true)
}

function closePanel() {
  if (!open.value) return
  cancelSearch()
  // une page jamais arrivée (requête en échec) ne doit pas geler la pagination
  pending = false
  open.value = false
  activeIndex.value = -1
  typed.value = false
  query.value =
    !props.multiple && typeof model.value === 'string' && model.value ? labelOf(model.value) : ''
}

/** Fermeture quand le focus sort du composant (panneau compris, descendant DOM). */
const onFocusout = useFocusoutDismiss(rootEl, closePanel)

/*
 * Le focus ne doit jamais quitter le champ : sans ce preventDefault, cliquer une
 * option le lui retire, le `focusout` ci-dessus ferme le panneau AVANT que la
 * sélection ne soit traitée — la sélection à la souris devient inopérante.
 * Invisible en jsdom : couvert par une play function.
 */
function onPanelMousedown(event: MouseEvent) {
  event.preventDefault()
}

/** Frappe utilisateur : active le filtre et ouvre le panneau. */
function onInput() {
  typed.value = true
  openPanel()
}

/** Focus : en simple, sélectionne le libellé affiché pour que la frappe le
    remplace (la liste complète reste proposée tant qu'on n'a pas tapé). */
function selectQuery() {
  if (!props.multiple && query.value) inputRef.value?.select()
}

function onFocus() {
  focused.value = true
  selectQuery()
}

/** Clic n'importe où dans le contrôle : focus le champ et ouvre le panneau. */
function onControlClick() {
  if (props.disabled) return
  inputRef.value?.focus()
  openPanel()
  // après le placement du curseur par le clic (souris) : re-sélectionne le libellé
  selectQuery()
}

function select(option: VComboboxOption) {
  if (option.disabled) return
  // mémorisée tout de suite : l'option peut disparaître d'`options` (recherche
  // suivante) avant que le parent n'ait propagé le modèle
  optionCache.set(option.value, option)
  typed.value = false
  if (props.multiple) {
    model.value = toggleValue(selectedValues.value, option.value)
    query.value = ''
    inputRef.value?.focus()
  } else {
    model.value = option.value
    // ce chemin ne passe pas par closePanel() : annuler le timer de recherche
    // ici aussi, sinon la frappe précédente partirait après la fermeture
    cancelSearch()
    // Le libellé vient de l'option choisie, PAS d'une relecture de model.value :
    // avec defineModel + v-model parent, `model.value` lu juste après l'écriture
    // renvoie encore l'ancienne valeur (le libellé afficherait la sélection
    // précédente). On ferme sans re-dériver la query.
    query.value = option.label
    open.value = false
    activeIndex.value = -1
  }
}

function removeValue(value: string) {
  if (!props.multiple) return
  model.value = selectedValues.value.filter((v) => v !== value)
  inputRef.value?.focus()
}

/** Événement `clear` de VInput (croix) : VInput a déjà vidé la recherche (query) ;
    on vide aussi toute la sélection (valeur en simple, Chips en multiple). */
function onClear() {
  model.value = props.multiple ? [] : ''
  typed.value = false
  activeIndex.value = -1
}

function move(delta: number) {
  const list = filtered.value
  if (list.length === 0) return
  let i = activeIndex.value
  for (let step = 0; step < list.length; step++) {
    i = (i + delta + list.length) % list.length
    if (!list[i]?.disabled) break
  }
  activeIndex.value = i
}

function onKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (open.value) move(1)
      else openPanel()
      break
    case 'ArrowUp':
      event.preventDefault()
      if (open.value) move(-1)
      else openPanel()
      break
    case 'Enter':
      if (open.value && activeIndex.value >= 0) {
        event.preventDefault()
        const option = filtered.value[activeIndex.value]
        if (option) select(option)
      }
      break
    case 'Escape':
      closePanel()
      break
    case 'Tab':
      closePanel()
      break
    case 'Backspace':
      if (props.multiple && !query.value) {
        const last = selectedValues.value.at(-1)
        if (last) removeValue(last)
      }
      break
  }
}

// ── Scroll infini ───────────────────────────────────────────────────────────
// JS justifié : aucune primitive CSS ne signale l'arrivée en fin de liste. Une
// sentinelle en pied de panneau est observée, le panneau (conteneur scrollable)
// servant de `root`.
const sentinelEl = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null
// Verrou SYNCHRONE, en plus de `props.loading` : le consommateur pose `loading`
// de façon asynchrone (au retour de sa requête) et la fenêtre entre l'émission
// et cette mise à jour suffirait à émettre plusieurs fois.
let pending = false

function onIntersect(entries: IntersectionObserverEntry[]) {
  if (!entries.some((entry) => entry.isIntersecting)) return
  if (!open.value || !props.hasMore || props.loading || pending) return
  pending = true
  emit('load-more')
}

watch(
  sentinelEl,
  (el, _previous, onCleanup) => {
    // `IntersectionObserver` n'existe pas en jsdom (même garde que le
    // `?.scrollIntoView?.()` plus haut) — le comportement se teste au navigateur.
    if (!el || typeof IntersectionObserver === 'undefined') return
    // Le panneau est le conteneur scrollable, désigné par son rôle ARIA (API
    // publique) plutôt que par une classe interne du Listbox. Sans lui,
    // `root: null` viserait le viewport : le panneau étant en top layer, la
    // sentinelle y paraîtrait toujours visible → rafale de `load-more`.
    const root = el.closest('[role="listbox"]')
    if (!root) return
    observer = new IntersectionObserver(onIntersect, {
      root,
      // précharge une demi-hauteur de panneau avant le bas (pas de littéral de
      // dimension : relatif à la racine)
      rootMargin: '0px 0px 50% 0px',
    })
    observer.observe(el)
    onCleanup(() => {
      observer?.disconnect()
      observer = null
    })
  },
  { flush: 'post' },
)

// Le callback n'est appelé qu'au FRANCHISSEMENT du seuil : si la page reçue ne
// remplit pas le panneau, la sentinelle reste visible sans jamais re-déclencher
// et le chargement s'arrêterait à la deuxième page. On ré-observe à chaque page
// pour forcer une nouvelle évaluation — et si la source n'a rien renvoyé (même
// longueur), rien ne relance la boucle : condition d'arrêt gratuite.
watch(
  () => allOptions.value.length,
  () => {
    pending = false
    const el = sentinelEl.value
    if (!observer || !el) return
    observer.unobserve(el)
    observer.observe(el)
  },
)
</script>

<template>
  <div
    ref="rootEl"
    class="v-combobox"
    :class="rootClass"
    :style="rootStyle"
    :data-size="size"
    :data-compact="compact ? '' : undefined"
    :data-multiple="multiple ? '' : undefined"
    :data-collapsed="collapsed ? '' : undefined"
    :data-open="open ? '' : undefined"
    :data-can-clear="canClear ? '' : undefined"
    @focusout="onFocusout"
  >
    <div class="v-combobox-control" @click="onControlClick">
      <VInput
        ref="inputRef"
        v-model="query"
        role="combobox"
        aria-haspopup="listbox"
        aria-autocomplete="list"
        :aria-expanded="open"
        :aria-controls="optionsId"
        v-bind="forwardedAttrs"
        :size="size"
        :compact="compact"
        :invalid="invalid"
        :disabled="disabled"
        :clearable="clearable"
        :clear-visible="canClear"
        :clear-label="m.combobox.clear"
        :placeholder="selectedValues.length === 0 ? placeholder : undefined"
        :aria-activedescendant="open && activeIndex >= 0 ? optionId(activeIndex) : undefined"
        @input="onInput"
        @keydown="onKeydown"
        @focus="onFocus"
        @blur="focused = false"
        @clear="onClear"
      >
        <template v-if="multiple" #start>
          <template v-for="value in selectedValues" :key="value">
            <slot
              name="chip"
              :value="value"
              :option="optionOf(value)"
              :label="labelOf(value)"
              :remove="() => removeValue(value)"
              :size="chipSize"
              :compact="chipCompact"
            >
              <VChip
                tone="accent"
                :size="chipSize"
                :compact="chipCompact"
                dismissible
                :dismiss-label="m.combobox.remove(labelOf(value))"
                :disabled="disabled"
                @dismiss="removeValue(value)"
                >{{ labelOf(value) }}</VChip
              >
            </slot>
          </template>
        </template>

        <!-- Chevron posé en absolu à droite (cf. CSS), pivote à l'ouverture.
             La croix vient de la prop `clearable` de VInput, rendue à sa gauche.
             En chargement, le spinner prend EXACTEMENT sa place (VInput pose
             `font-size: var(--vectis-icon-size)` sur les spinners enfants directs
             du champ) : aucun saut de largeur. On ne passe pas par la prop
             `loading` de VInput, qui écraserait ce slot — donc le chevron.
             `aria-hidden` sur la racine du VSpinner neutralise son
             role="status" : l'annonce vient du panneau, pas deux fois. -->
        <template #end>
          <VSpinner v-if="loading" class="v-combobox-spinner" aria-hidden="true" />
          <VIcon v-else name="expand_more" class="v-combobox-chevron" aria-hidden="true" />
        </template>
      </VInput>
    </div>

    <!-- Le panneau porte lui-même `role="listbox"` ET le défilement : c'est le
         contrat sur lequel s'appuient le `root` de l'IntersectionObserver et le
         `scrollIntoView` de l'option active — ne jamais intercaler de wrapper. -->
    <VPopover
      :id="optionsId"
      v-model:open="open"
      mode="manual"
      anchor="--combobox-anchor"
      placement="bottom-start"
      role="listbox"
      class="v-combobox-panel v-control"
      :data-size="size"
      :data-compact="compact ? '' : undefined"
      :aria-multiselectable="multiple ? 'true' : undefined"
      @mousedown="onPanelMousedown"
    >
      <!-- Groupes et séparateurs ne sont QUE du rendu : la navigation clavier
           indexe `filtered`, plat, et ne les rencontre donc jamais. -->
      <template v-for="node in rendered" :key="node.key">
        <OptionSeparator v-if="node.kind === 'separator'" />

        <OptionGroup v-else-if="node.kind === 'group'" :label="node.label">
          <OptionRow
            v-for="entry in node.options"
            :key="entry.key"
            v-bind="rowProps(entry)"
            @select="select(entry.option)"
            @pointermove="hover(entry)"
          >
            <slot name="option" v-bind="optionSlotProps(entry)">{{ entry.option.label }}</slot>
          </OptionRow>
        </OptionGroup>

        <OptionRow
          v-else
          v-bind="rowProps(node)"
          @select="select(node.option)"
          @pointermove="hover(node)"
        >
          <slot name="option" v-bind="optionSlotProps(node)">{{ node.option.label }}</slot>
        </OptionRow>
      </template>

      <!-- Ordre chargement → vide → contenu : pendant une
           requête, le panneau ne doit pas annoncer « aucun résultat ». -->
      <div v-if="loading && filtered.length === 0" class="v-combobox-state">
        <slot name="loading">
          <VSpinner :label="resolvedLoadingText" />
          <span aria-hidden="true">{{ resolvedLoadingText }}</span>
        </slot>
      </div>
      <div v-else-if="filtered.length === 0" class="v-combobox-state">
        <slot name="empty" :query="searchTerm">{{ resolvedEmptyText }}</slot>
      </div>

      <!-- Sentinelle du scroll infini ET emplacement du spinner de page
           suivante : un seul nœud, donc stable — un `v-if` sur `loading`
           détruirait la sentinelle et invaliderait l'observation. -->
      <div v-if="hasMore" ref="sentinelEl" class="v-combobox-more" aria-hidden="true">
        <VSpinner v-if="loading" :label="resolvedLoadingText" />
      </div>
    </VPopover>
  </div>
</template>

<style>
@layer vectis.components {
  .v-combobox {
    /* confine l'ancre à cette instance (posée sur la racine, ancêtre commun du
       contrôle et du panneau — même en top-layer le panneau reste descendant) */
    anchor-scope: --combobox-anchor;
    width: 100%;
    font-family: var(--vectis-text-family);
  }

  .v-combobox-control {
    anchor-name: --combobox-anchor;
    display: block;
  }

  /* Le panneau vient de `VPopover` : élément popover, état, ancrage, placement et
     chrome (`.v-panel` via `surface`). Il porte aussi `v-control` (le template)
     — les options et les rangées d'état lisent les `--control-*` hérités, aucune
     table de tailles locale. Ne restent ici que les règles propres à la liste :
     largeur calée sur l'ancre et zone défilante. */
  .v-combobox-panel {
    min-inline-size: anchor-size(width);
    max-block-size: var(--vectis-control-size-combobox-list-max-block);
    overflow: auto;
  }

  /* Chevron + croix (clearable de VInput) posés en ABSOLU à droite du champ : ils
     restent alignés à droite/centrés quels que soient les Chips (retour à la
     ligne) ou le repli de l'input. On réserve la place correspondante à droite
     pour que le texte/les Chips ne passent pas dessous (chevron seul, ou croix
     + chevron). Vertical : translate séparé du rotate (le chevron pivote). */
  .v-combobox .v-input-field {
    position: relative;
    padding-inline-end: calc(
      var(--control-padding-inline-field) + var(--vectis-icon-size) + var(--vectis-space-2)
    );
  }

  .v-combobox[data-can-clear] .v-input-field {
    padding-inline-end: calc(
      var(--control-padding-inline-field) + var(--control-action-size) + var(--vectis-icon-size) +
        var(--vectis-space-2)
    );
  }

  /* Chevron et spinner partagent l'emplacement : même boîte (--vectis-icon-size,
     posée par VInput sur les spinners enfants directs du champ), donc le padding
     réservé ci-dessus vaut pour les deux et l'échange ne décale rien. */
  .v-combobox-chevron,
  .v-combobox-spinner {
    position: absolute;
    inset-inline-end: var(--control-padding-inline-field);
    top: 50%;
    translate: 0 -50%;
    color: var(--vectis-color-text-muted);
  }

  .v-combobox-chevron {
    transition: rotate var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-combobox[data-open] .v-combobox-chevron {
    rotate: 180deg;
  }

  /* croix de VInput : posée à gauche du chevron, centrée, marge négative annulée */
  .v-combobox .v-input-clear {
    position: absolute;
    inset-inline-end: calc(
      var(--control-padding-inline-field) + var(--vectis-icon-size) + var(--vectis-space-1)
    );
    top: 50%;
    translate: 0 -50%;
    margin-inline: 0;
  }

  /* multiple : le champ accueille les Chips (retour à la ligne). Hauteur calée
     sur le contrôle (`--control-height`, size/compact via .v-control de VInput).
     La hauteur des Chips est redite ici en `--chip-height` parce qu'elle vit
     dans le sous-arbre du VChip, hors de portée du champ : ces quatre règles
     doivent rester le miroir exact de `chipSize`/`chipCompact` (script).
     L'input est forcé à cette MÊME hauteur au lieu du `100%` hérité de VInput :
     sinon sa hauteur intrinsèque dépasse les Chips et fait grandir le champ.
     Résultat : champ = --control-height constant, input jamais plus haut que
     les Chips, aucun saut au focus. Ordre significatif : les tailles sont à
     spécificité égale entre elles, la variante compact vient en dernier. */
  .v-combobox[data-multiple] {
    --chip-height: var(--vectis-control-height-xs);
  }

  .v-combobox[data-multiple][data-size='sm'] {
    --chip-height: calc(var(--vectis-control-height-xs) - var(--vectis-space-1));
  }

  .v-combobox[data-multiple][data-size='lg'] {
    --chip-height: var(--vectis-control-height-sm);
  }

  .v-combobox[data-multiple][data-size='lg'][data-compact] {
    --chip-height: calc(var(--vectis-control-height-sm) - var(--vectis-space-1));
  }

  .v-combobox[data-multiple] .v-input-field {
    flex-wrap: wrap;
    height: auto;
    min-height: var(--control-height);
    padding-block: var(--vectis-space-1);
  }

  .v-combobox[data-multiple] .v-input-control {
    height: var(--chip-height);
  }

  /* hors édition (avec sélection) : sortir l'input du flux (position absolue,
     taille nulle) — sinon, même à largeur nulle, il déborde sur une seconde
     ligne sous les Chips et laisse un vide. Il reste dans le DOM et focusable :
     onControlClick / Tab le réaffichent (data-collapsed retombe au focus). */
  .v-combobox[data-collapsed] .v-input-control {
    position: absolute;
    width: 0;
    height: 0;
    padding: 0;
  }

  /* États plein panneau (« aucun résultat », chargement) : même gabarit qu'une
     option — mêmes `--control-*` héritées du panneau, qui porte `v-control`
     (le spinner suit aussi, via le contexte VIcon du même bloc).
     `flex: none` : le panneau est un flex column, l'état ne doit pas s'écraser. */
  .v-combobox-state {
    display: flex;
    flex: none;
    align-items: center;
    gap: var(--control-gap);
    min-height: var(--control-height);
    padding: var(--vectis-space-1) var(--control-padding-inline);
    font-size: var(--control-font-size);
    color: var(--vectis-color-text-muted);
  }

  /* Pied de liste : sentinelle du scroll infini (une boîte de hauteur nulle
     rendrait l'intersection fragile) et emplacement du spinner de page suivante. */
  .v-combobox-more {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    min-height: var(--vectis-space-6);
    color: var(--vectis-color-text-muted);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-combobox-chevron {
      transition: none;
    }
  }
}
</style>
