<script setup lang="ts">
import { computed, nextTick, reactive, ref, useId, watch, watchEffect } from 'vue'

import Chip from '../Chip/Chip.vue'
import Icon from '../Icon/Icon.vue'
import Input from '../Input/Input.vue'
import Listbox from '../Listbox/Listbox.vue'
import ListboxOption from '../Listbox/ListboxOption.vue'
import Spinner from '../Spinner/Spinner.vue'

import { toggleValue } from '../../utils/array'
import { normalizeText } from '../../utils/text'

import { useRootAttrs } from '../../composables/useRootAttrs'

import { useFocusoutDismiss } from '../../composables/useFocusoutDismiss'

import { useTimer } from '../../composables/useTimer'

/**
 * Combobox avec recherche et sélection multiple, composé d'`Input`, `Listbox`
 * et `Chip`. Le JS implémente le pattern ARIA combobox/listbox que le natif ne
 * couvre pas (pas de `<datalist>` stylable/multiple) : filtrage, navigation par
 * `aria-activedescendant` (le focus DOM reste dans l'input — le `Listbox` n'a
 * donc aucun clavier propre), sélection simple ou multiple. C'est ce composant
 * qui possède TOUT le contrat ARIA du champ. Fermeture au `focusout` : le champ
 * vit hors du panneau `popover="manual"`.
 */
export interface ComboboxOption {
  value: string
  label: string
  disabled?: boolean
}

/**
 * Filtrage local : `true` (défaut), `false` (les options arrivent déjà filtrées
 * — recherche serveur) ou un prédicat de correspondance personnalisé.
 */
export type ComboboxFilter = boolean | ((option: ComboboxOption, query: string) => boolean)

interface ComboboxProps {
  options: ComboboxOption[]
  /** Sélection multiple — le v-model devient string[] et des Chips s'affichent. */
  multiple?: boolean
  /** Hauteur du champ : sm 32px, md 40px (défaut — aligné sur Input), lg 48px. */
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
  emptyText: 'Aucun résultat',
  filter: true,
  searchDebounce: 250,
  loading: false,
  loadingText: 'Chargement…',
  hasMore: false,
})

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
    option: ComboboxOption
    index: number
    active: boolean
    selected: boolean
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
// Combobox ne touche donc pas les Chips.
// Toute évolution de ce mapping doit être reportée sur `--_chip-height` (CSS
// plus bas) : la hauteur est redite côté champ, hors de portée du sous-arbre.
const chipSize = computed(() => (props.size === 'lg' ? 'sm' : 'xs'))
const chipCompact = computed(() => (props.size === 'lg' ? props.compact : props.size === 'sm'))

const model = defineModel<string | string[]>({ default: '' })

// Racine wrapper : class/style restent sur la racine, le reste (aria-label…)
// est reporté sur l'Input pour nommer le role="combobox".
defineOptions({ inheritAttrs: false })
const { rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

const rootEl = ref<HTMLElement | null>(null)
const inputRef = ref<InstanceType<typeof Input> | null>(null)
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

// Mémoire des libellés SÉLECTIONNÉS : en source asynchrone, `options` ne
// contient que le dernier jeu de résultats et une valeur déjà choisie en est
// souvent absente — sans cache, le Chip afficherait son identifiant brut.
// watchEffect (et non watch sur `props.options`) : il traque l'itération, donc
// aussi les ajouts en place d'une page (scroll infini). Borné à la sélection :
// les autres libellés se relisent dans `options`.
const labelCache = reactive(new Map<string, string>())
watchEffect(() => {
  const wanted = new Set(selectedValues.value)
  for (const option of props.options) {
    if (wanted.has(option.value)) labelCache.set(option.value, option.label)
  }
})

function labelOf(value: string) {
  return props.options.find((o) => o.value === value)?.label ?? labelCache.get(value) ?? value
}

// Terme de recherche unique, consommé par le filtre local ET par l'émission
// `search` : la liste proposée et la requête envoyée ne peuvent pas diverger.
// Pas de frappe → terme vide (le libellé affiché ne restreint pas la liste).
const searchTerm = computed(() => (typed.value ? query.value.trim() : ''))

const filtered = computed(() => {
  const matcher = props.filter
  if (matcher === false) return props.options
  const q = searchTerm.value
  if (!q) return props.options
  if (typeof matcher === 'function') return props.options.filter((o) => matcher(o, q))
  const needle = normalizeText(q)
  return props.options.filter((o) => normalizeText(o.label).includes(needle))
})

// ── Recherche (source externe) ──────────────────────────────────────────────
// JS justifié : aucune primitive native ne débounce ni ne dédoublonne une
// requête. Le report est délégué à `useTimer` (réarmement, délai ≤ 0 synchrone,
// annulation au démontage) ; ne reste ici que ce qui est propre au Combobox :
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
  () => props.options,
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

// La croix (prop `clearable` d'Input) doit apparaître dès qu'il y a QUELQUE CHOSE
// à effacer — une sélection (Chips) OU une recherche — pas seulement quand le
// champ texte est non-vide. On pilote donc explicitement sa visibilité (Input
// l'expose via `clearVisible`) et on réserve la place à droite en conséquence.
const canClear = computed(
  () =>
    props.clearable &&
    !props.disabled &&
    (selectedValues.value.length > 0 || query.value.length > 0),
)

const optionId = (index: number) => `${optionsId}-option-${index}`

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

function select(option: ComboboxOption) {
  if (option.disabled) return
  // mémorisé tout de suite : l'option peut disparaître d'`options` (recherche
  // suivante) avant que le parent n'ait propagé le modèle
  labelCache.set(option.value, option.label)
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

/** Événement `clear` d'Input (croix) : Input a déjà vidé la recherche (query) ;
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
  () => props.options.length,
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
    class="ds-combobox"
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
    <div class="ds-combobox-control" @click="onControlClick">
      <Input
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
        clear-label="Effacer la sélection"
        :placeholder="selectedValues.length === 0 ? placeholder : undefined"
        :aria-activedescendant="open && activeIndex >= 0 ? optionId(activeIndex) : undefined"
        @input="onInput"
        @keydown="onKeydown"
        @focus="onFocus"
        @blur="focused = false"
        @clear="onClear"
      >
        <template v-if="multiple" #start>
          <Chip
            v-for="value in selectedValues"
            :key="value"
            tone="accent"
            :size="chipSize"
            :compact="chipCompact"
            dismissible
            :dismiss-label="`Retirer ${labelOf(value)}`"
            :disabled="disabled"
            @dismiss="removeValue(value)"
            >{{ labelOf(value) }}</Chip
          >
        </template>

        <!-- Chevron posé en absolu à droite (cf. CSS), pivote à l'ouverture.
             La croix vient de la prop `clearable` d'Input, rendue à sa gauche.
             En chargement, le spinner prend EXACTEMENT sa place (Input pose
             `font-size: var(--ds-icon-size)` sur les spinners enfants directs
             du champ) : aucun saut de largeur. On ne passe pas par la prop
             `loading` d'Input, qui écraserait ce slot — donc le chevron.
             `aria-hidden` sur la racine du Spinner neutralise son
             role="status" : l'annonce vient du panneau, pas deux fois. -->
        <template #end>
          <Spinner v-if="loading" class="ds-combobox-spinner" aria-hidden="true" />
          <Icon v-else name="expand_more" class="ds-combobox-chevron" aria-hidden="true" />
        </template>
      </Input>
    </div>

    <Listbox
      :id="optionsId"
      v-model:open="open"
      anchor="--ds-combobox-anchor"
      :multiselectable="multiple"
      :size="size"
      :compact="compact"
      placement="bottom-start"
    >
      <ListboxOption
        v-for="(option, index) in filtered"
        :id="optionId(index)"
        :key="option.value"
        :active="index === activeIndex"
        :selected="selectedValues.includes(option.value)"
        :disabled="option.disabled"
        @select="select(option)"
        @pointermove="!option.disabled && (activeIndex = index)"
      >
        <!-- slot dans le #default de l'option : son #end n'est pas rendu quand
             l'option est sélectionnée (la coche prend sa place) -->
        <slot
          name="option"
          :option="option"
          :index="index"
          :active="index === activeIndex"
          :selected="selectedValues.includes(option.value)"
          >{{ option.label }}</slot
        >
      </ListboxOption>

      <!-- Ordre chargement → vide → contenu : pendant une
           requête, le panneau ne doit pas annoncer « aucun résultat ». -->
      <div v-if="loading && filtered.length === 0" class="ds-combobox-state">
        <slot name="loading">
          <Spinner :label="loadingText" />
          <span aria-hidden="true">{{ loadingText }}</span>
        </slot>
      </div>
      <div v-else-if="filtered.length === 0" class="ds-combobox-state">
        <slot name="empty" :query="searchTerm">{{ emptyText }}</slot>
      </div>

      <!-- Sentinelle du scroll infini ET emplacement du spinner de page
           suivante : un seul nœud, donc stable — un `v-if` sur `loading`
           détruirait la sentinelle et invaliderait l'observation. -->
      <div v-if="hasMore" ref="sentinelEl" class="ds-combobox-more" aria-hidden="true">
        <Spinner v-if="loading" />
      </div>
    </Listbox>
  </div>
</template>

<style>
@layer ds.components {
  .ds-combobox {
    /* confine l'ancre à cette instance (posée sur la racine, ancêtre commun du
       contrôle et du panneau — même en top-layer le panneau reste descendant) */
    anchor-scope: --ds-combobox-anchor;
    width: 100%;
    font-family: var(--ds-text-family);
  }

  .ds-combobox-control {
    anchor-name: --ds-combobox-anchor;
    display: block;
  }

  /* Chevron + croix (clearable d'Input) posés en ABSOLU à droite du champ : ils
     restent alignés à droite/centrés quels que soient les Chips (retour à la
     ligne) ou le repli de l'input. On réserve la place correspondante à droite
     pour que le texte/les Chips ne passent pas dessous (chevron seul, ou croix
     + chevron). Vertical : translate séparé du rotate (le chevron pivote). */
  .ds-combobox .ds-input-field {
    position: relative;
    padding-inline-end: calc(
      var(--_control-padding-inline-field) + var(--ds-icon-size) + var(--ds-space-2)
    );
  }

  .ds-combobox[data-can-clear] .ds-input-field {
    padding-inline-end: calc(
      var(--_control-padding-inline-field) + var(--_control-action-size) + var(--ds-icon-size) +
        var(--ds-space-2)
    );
  }

  /* Chevron et spinner partagent l'emplacement : même boîte (--ds-icon-size,
     posée par Input sur les spinners enfants directs du champ), donc le padding
     réservé ci-dessus vaut pour les deux et l'échange ne décale rien. */
  .ds-combobox-chevron,
  .ds-combobox-spinner {
    position: absolute;
    inset-inline-end: var(--_control-padding-inline-field);
    top: 50%;
    translate: 0 -50%;
    color: var(--ds-color-text-muted);
  }

  .ds-combobox-chevron {
    transition: rotate var(--ds-duration-fast) var(--ds-ease-default);
  }

  .ds-combobox[data-open] .ds-combobox-chevron {
    rotate: 180deg;
  }

  /* croix d'Input : posée à gauche du chevron, centrée, marge négative annulée */
  .ds-combobox .ds-input-clear {
    position: absolute;
    inset-inline-end: calc(
      var(--_control-padding-inline-field) + var(--ds-icon-size) + var(--ds-space-1)
    );
    top: 50%;
    translate: 0 -50%;
    margin-inline: 0;
  }

  /* multiple : le champ accueille les Chips (retour à la ligne). Hauteur calée
     sur le contrôle (`--_control-height`, size/compact via .ds-control d'Input).
     La hauteur des Chips est redite ici en `--_chip-height` parce qu'elle vit
     dans le sous-arbre du Chip, hors de portée du champ : ces quatre règles
     doivent rester le miroir exact de `chipSize`/`chipCompact` (script).
     L'input est forcé à cette MÊME hauteur au lieu du `100%` hérité d'Input :
     sinon sa hauteur intrinsèque dépasse les Chips et fait grandir le champ.
     Résultat : champ = --_control-height constant, input jamais plus haut que
     les Chips, aucun saut au focus. Ordre significatif : les tailles sont à
     spécificité égale entre elles, la variante compact vient en dernier. */
  .ds-combobox[data-multiple] {
    --_chip-height: var(--ds-control-height-xs);
  }

  .ds-combobox[data-multiple][data-size='sm'] {
    --_chip-height: calc(var(--ds-control-height-xs) - var(--ds-space-1));
  }

  .ds-combobox[data-multiple][data-size='lg'] {
    --_chip-height: var(--ds-control-height-sm);
  }

  .ds-combobox[data-multiple][data-size='lg'][data-compact] {
    --_chip-height: calc(var(--ds-control-height-sm) - var(--ds-space-1));
  }

  .ds-combobox[data-multiple] .ds-input-field {
    flex-wrap: wrap;
    height: auto;
    min-height: var(--_control-height);
    padding-block: var(--ds-space-1);
  }

  .ds-combobox[data-multiple] .ds-input-control {
    height: var(--_chip-height);
  }

  /* hors édition (avec sélection) : sortir l'input du flux (position absolue,
     taille nulle) — sinon, même à largeur nulle, il déborde sur une seconde
     ligne sous les Chips et laisse un vide. Il reste dans le DOM et focusable :
     onControlClick / Tab le réaffichent (data-collapsed retombe au focus). */
  .ds-combobox[data-collapsed] .ds-input-control {
    position: absolute;
    width: 0;
    height: 0;
    padding: 0;
  }

  /* États plein panneau (« aucun résultat », chargement) : même gabarit qu'une
     option — mêmes `--_control-*` héritées du panneau, qui porte `ds-control`
     (le spinner suit aussi, via le contexte Icon du même bloc).
     `flex: none` : le panneau est un flex column, l'état ne doit pas s'écraser. */
  .ds-combobox-state {
    display: flex;
    flex: none;
    align-items: center;
    gap: var(--_control-gap);
    min-height: var(--_control-height);
    padding: var(--ds-space-1) var(--_control-padding-inline);
    font-size: var(--_control-font-size);
    color: var(--ds-color-text-muted);
  }

  /* Pied de liste : sentinelle du scroll infini (une boîte de hauteur nulle
     rendrait l'intersection fragile) et emplacement du spinner de page suivante. */
  .ds-combobox-more {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    min-height: var(--ds-space-6);
    color: var(--ds-color-text-muted);
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-combobox-chevron {
      transition: none;
    }
  }
}
</style>
