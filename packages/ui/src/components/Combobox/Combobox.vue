<script setup lang="ts">
import { computed, ref, useAttrs, useId, watch } from 'vue'
import type { StyleValue } from 'vue'

import Chip from '../Chip/Chip.vue'
import Dropdown from '../Dropdown/Dropdown.vue'
import DropdownItem from '../Dropdown/DropdownItem.vue'
import Icon from '../Icon/Icon.vue'
import Input from '../Input/Input.vue'

/**
 * Combobox avec recherche et sélection multiple, composé des briques du DS :
 * `Input` (champ de recherche `role="combobox"`), `Dropdown` en mode `listbox`
 * (panneau popover + options `role="option"`, ancré en pur CSS), et `Chip` pour
 * les valeurs en mode multiple.
 *
 * Le JS implémente le pattern ARIA combobox/listbox que le natif ne couvre pas
 * (pas de `<datalist>` stylable/multiple) : filtrage, navigation par
 * `aria-activedescendant` (le focus DOM reste dans l'input — d'où le mode
 * `listbox` du Dropdown, qui désactive son roving focus « menu »), sélection
 * simple ou multiple. Ouverture pilotée par `v-model:open`, fermeture au
 * `focusout` (le champ vit hors du panneau `popover="manual"`).
 */
export interface ComboboxOption {
  value: string
  label: string
  disabled?: boolean
}

interface ComboboxProps {
  options: ComboboxOption[]
  /** Sélection multiple — le v-model devient string[] et des Chips s'affichent. */
  multiple?: boolean
  /** Hauteur du champ : sm (32px) ou md (40px, défaut — aligné sur Button/Input). */
  size?: 'sm' | 'md'
  /** Hauteur réduite de 4px (comme les autres contrôles). */
  compact?: boolean
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  /** Bouton d'effacement (croix) qui vide la sélection et la recherche. */
  clearable?: boolean
  /** Message quand aucune option ne correspond à la recherche. */
  emptyText?: string
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
})

// Les Chips sont une taille sous le champ : chip + padding-block = hauteur du
// champ (sm→chips xs, md→chips sm), garantissant un alignement pile.
const chipSize = computed(() => (props.size === 'md' ? 'sm' : 'xs'))

const model = defineModel<string | string[]>({ default: '' })

// Racine wrapper : class/style restent sur la racine, le reste (aria-label…)
// est reporté sur l'Input pour nommer le role="combobox".
defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const rootClass = computed(() => attrs.class)
const rootStyle = computed(() => attrs.style as StyleValue)
const forwardedAttrs = computed(() =>
  Object.fromEntries(Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style')),
)

const rootEl = ref<HTMLElement | null>(null)
const inputRef = ref<InstanceType<typeof Input> | null>(null)
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

function labelOf(value: string) {
  return props.options.find((o) => o.value === value)?.label ?? value
}

/** Filtrage insensible à la casse et aux accents. */
const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const filtered = computed(() => {
  // pas de frappe → pas de filtre (le libellé affiché ne restreint pas la liste)
  const q = typed.value ? normalize(query.value.trim()) : ''
  return q ? props.options.filter((o) => normalize(o.label).includes(q)) : props.options
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

// multiple avec sélection et champ non focus : replier le champ de saisie
// (il reste dans le DOM, focusable) pour ne pas laisser d'espace vide.
const collapsed = computed(
  () => props.multiple && !focused.value && selectedValues.value.length > 0,
)

// La croix vient de la prop `clearable` d'Input (elle s'affiche dès que le champ
// a du contenu) ; on reflète sa visibilité pour réserver la place à droite.
const canClear = computed(() => props.clearable && !props.disabled && query.value.length > 0)

const optionId = (index: number) => `${optionsId}-option-${index}`

function openPanel() {
  if (props.disabled || open.value) return
  open.value = true
  const list = filtered.value
  const selectedIdx = list.findIndex((o) => !o.disabled && selectedValues.value.includes(o.value))
  activeIndex.value = selectedIdx >= 0 ? selectedIdx : list.findIndex((o) => !o.disabled)
}

function closePanel() {
  if (!open.value) return
  open.value = false
  activeIndex.value = -1
  typed.value = false
  query.value =
    !props.multiple && typeof model.value === 'string' && model.value ? labelOf(model.value) : ''
}

/** Fermeture quand le focus sort du composant (panneau compris, descendant DOM). */
function onFocusout(event: FocusEvent) {
  const next = event.relatedTarget as Node | null
  if (!next || !rootEl.value?.contains(next)) closePanel()
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

function select(option: ComboboxOption) {
  if (option.disabled) return
  typed.value = false // la sélection n'est pas une recherche
  if (props.multiple) {
    const current = selectedValues.value
    model.value = current.includes(option.value)
      ? current.filter((v) => v !== option.value)
      : [...current, option.value]
    query.value = ''
    inputRef.value?.focus()
  } else {
    model.value = option.value
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
    en simple on vide aussi la valeur sélectionnée (en multiple, les Chips se
    retirent un par un — la croix ne touche qu'à la recherche). */
function onClear() {
  if (!props.multiple) model.value = ''
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
</script>

<template>
  <div
    ref="rootEl"
    class="ds-combobox"
    :class="rootClass"
    :style="rootStyle"
    :data-multiple="multiple ? '' : undefined"
    :data-collapsed="collapsed ? '' : undefined"
    :data-open="open ? '' : undefined"
    :data-can-clear="canClear ? '' : undefined"
    @focusout="onFocusout"
  >
    <Dropdown
      v-model:open="open"
      role="listbox"
      anchor="--ds-combobox-anchor"
      :multiselectable="multiple"
      :size="size"
      :compact="compact"
      placement="bottom-start"
    >
      <template #trigger="{ triggerProps }">
        <div class="ds-combobox-control" @click="onControlClick">
          <Input
            ref="inputRef"
            v-model="query"
            v-bind="{ ...triggerProps, ...forwardedAttrs }"
            :size="size"
            :compact="compact"
            :invalid="invalid"
            :disabled="disabled"
            :clearable="clearable"
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
                :compact="compact"
                dismissible
                :dismiss-label="`Retirer ${labelOf(value)}`"
                :disabled="disabled"
                @dismiss="removeValue(value)"
                >{{ labelOf(value) }}</Chip
              >
            </template>

            <!-- Chevron posé en absolu à droite (cf. CSS), pivote à l'ouverture.
                 La croix vient de la prop `clearable` d'Input, rendue à sa gauche. -->
            <template #end>
              <Icon name="expand_more" class="ds-combobox-chevron" aria-hidden="true" />
            </template>
          </Input>
        </div>
      </template>

      <DropdownItem
        v-for="(option, index) in filtered"
        :id="optionId(index)"
        :key="option.value"
        :active="index === activeIndex"
        :selected="selectedValues.includes(option.value)"
        :disabled="option.disabled"
        @select="select(option)"
        @pointermove="!option.disabled && (activeIndex = index)"
        >{{ option.label }}</DropdownItem
      >
      <div v-if="filtered.length === 0" class="ds-combobox-empty">{{ emptyText }}</div>
    </Dropdown>
  </div>
</template>

<style>
@layer ds.components {
  .ds-combobox {
    /* confine l'ancre à cette instance (posée sur la racine, ancêtre commun du
       contrôle et du panneau — même en top-layer le panneau reste descendant) */
    anchor-scope: --ds-combobox-anchor;
    width: 100%;
    font-family: var(--ds-font-family-sans);
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

  .ds-combobox-chevron {
    position: absolute;
    inset-inline-end: var(--_control-padding-inline-field);
    top: 50%;
    translate: 0 -50%;
    color: var(--ds-color-text-muted);
    transition: rotate var(--ds-duration-fast) var(--ds-ease-default);
  }

  /* le chevron se retourne à l'ouverture de la liste */
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
     Les Chips font une taille en dessous → chip + padding-block (2×space-1 =
     space-2) = --_control-height, pile. L'input est forcé à la MÊME hauteur que
     les Chips (`calc(--_control-height - space-2)`) au lieu du `100%` hérité
     d'Input : sinon sa hauteur intrinsèque dépasse les Chips et fait grandir le
     champ (34px au lieu de 32). Résultat : champ = --_control-height constant,
     input jamais plus haut que les Chips, aucun saut au focus. */
  .ds-combobox[data-multiple] .ds-input-field {
    flex-wrap: wrap;
    height: auto;
    min-height: var(--_control-height);
    padding-block: var(--ds-space-1);
  }

  .ds-combobox[data-multiple] .ds-input-control {
    height: calc(var(--_control-height) - var(--ds-space-2));
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

  /* Message « aucun résultat » : même gabarit qu'une option (hauteur héritée du
     panneau via --_dropdown-item-*, padding d'item) */
  .ds-combobox-empty {
    display: flex;
    align-items: center;
    min-height: calc(
      var(--_dropdown-item-min-h, var(--ds-control-height-sm)) - var(--_dropdown-item-delta, 0px)
    );
    padding: var(--ds-space-1) var(--ds-space-3);
    font-size: var(--ds-font-size-sm);
    color: var(--ds-color-text-muted);
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-combobox-chevron {
      transition: none;
    }
  }
}
</style>
