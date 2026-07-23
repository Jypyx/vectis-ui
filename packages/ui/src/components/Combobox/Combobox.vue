<script setup lang="ts">
import { computed, ref, useAttrs, useId, watch } from 'vue'
import type { StyleValue } from 'vue'

import Chip from '../Chip/Chip.vue'
import Dropdown from '../Dropdown/Dropdown.vue'
import DropdownItem from '../Dropdown/DropdownItem.vue'
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
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  /** Message quand aucune option ne correspond à la recherche. */
  emptyText?: string
}

const props = withDefaults(defineProps<ComboboxProps>(), {
  multiple: false,
  placeholder: undefined,
  disabled: false,
  invalid: false,
  emptyText: 'Aucun résultat',
})

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
  const q = normalize(query.value.trim())
  return q ? props.options.filter((o) => normalize(o.label).includes(q)) : props.options
})

watch(filtered, (list) => {
  if (activeIndex.value >= list.length) {
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
  query.value =
    !props.multiple && typeof model.value === 'string' && model.value ? labelOf(model.value) : ''
}

/** Fermeture quand le focus sort du composant (panneau compris, descendant DOM). */
function onFocusout(event: FocusEvent) {
  const next = event.relatedTarget as Node | null
  if (!next || !rootEl.value?.contains(next)) closePanel()
}

/** Clic n'importe où dans le contrôle : focus le champ et ouvre le panneau. */
function onControlClick() {
  if (props.disabled) return
  inputRef.value?.focus()
  openPanel()
}

function select(option: ComboboxOption) {
  if (option.disabled) return
  if (props.multiple) {
    const current = selectedValues.value
    model.value = current.includes(option.value)
      ? current.filter((v) => v !== option.value)
      : [...current, option.value]
    query.value = ''
    inputRef.value?.focus()
  } else {
    model.value = option.value
    closePanel()
  }
}

function removeValue(value: string) {
  if (!props.multiple) return
  model.value = selectedValues.value.filter((v) => v !== value)
  inputRef.value?.focus()
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
    @focusout="onFocusout"
  >
    <Dropdown
      v-model:open="open"
      role="listbox"
      anchor="--ds-combobox-anchor"
      :multiselectable="multiple"
      placement="bottom-start"
    >
      <template #trigger="{ triggerProps }">
        <div class="ds-combobox-control" @click="onControlClick">
          <Input
            ref="inputRef"
            v-model="query"
            v-bind="{ ...triggerProps, ...forwardedAttrs }"
            :invalid="invalid"
            :disabled="disabled"
            :placeholder="selectedValues.length === 0 ? placeholder : undefined"
            :aria-activedescendant="open && activeIndex >= 0 ? optionId(activeIndex) : undefined"
            @input="openPanel"
            @keydown="onKeydown"
            @focus="focused = true"
            @blur="focused = false"
          >
            <template v-if="multiple" #start>
              <Chip
                v-for="value in selectedValues"
                :key="value"
                tone="accent"
                size="xs"
                dismissible
                :dismiss-label="`Retirer ${labelOf(value)}`"
                :disabled="disabled"
                @dismiss="removeValue(value)"
                >{{ labelOf(value) }}</Chip
              >
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

  /* multiple : le champ accueille les Chips (retour à la ligne, hauteur auto) */
  .ds-combobox[data-multiple] .ds-input-field {
    flex-wrap: wrap;
    height: auto;
    min-height: var(--ds-control-height-md);
    padding-block: var(--ds-space-1);
  }

  /* multiple hors édition (avec sélection) : replier le champ de saisie —
     il reste focusable/tabbable, on supprime juste l'espace vide après les Chips */
  .ds-combobox[data-collapsed] .ds-input-control {
    flex: 0 0 0;
    width: 0;
    min-width: 0;
    padding: 0;
  }

  .ds-combobox-empty {
    padding: var(--ds-space-3);
    font-size: var(--ds-font-size-sm);
    color: var(--ds-color-text-muted);
    text-align: center;
  }
}
</style>
