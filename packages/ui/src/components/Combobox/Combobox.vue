<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'

/**
 * Combobox avec recherche et sélection multiple. Il n'existe pas de primitive
 * native stylable pour ce besoin (<datalist> n'est ni stylable ni multiple) :
 * le JS implémente le pattern ARIA combobox/listbox — filtrage, navigation
 * par aria-activedescendant (le focus DOM reste dans l'input), sélection
 * simple ou multiple. Le panneau est un popover (top-layer) ancré en pur CSS
 * (anchor-name statique, même technique que Tooltip ; largeur alignée sur le
 * contrôle via anchor-size()).
 */
export interface ComboboxOption {
  value: string
  label: string
  disabled?: boolean
}

interface ComboboxProps {
  options: ComboboxOption[]
  /** Sélection multiple — le v-model devient string[] et des tags s'affichent. */
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

const rootEl = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)
const panelEl = ref<HTMLElement | null>(null)
const listboxId = useId()

const open = ref(false)
const query = ref('')
const activeIndex = ref(-1)

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

// mode simple : hors édition, l'input affiche le libellé sélectionné
if (!props.multiple && typeof model.value === 'string' && model.value) {
  query.value = labelOf(model.value)
}

const optionId = (index: number) => `${listboxId}-option-${index}`

function openPanel() {
  if (props.disabled || open.value) return
  open.value = true
  panelEl.value?.showPopover()
  const list = filtered.value
  const selectedIdx = list.findIndex((o) => !o.disabled && selectedValues.value.includes(o.value))
  activeIndex.value = selectedIdx >= 0 ? selectedIdx : list.findIndex((o) => !o.disabled)
}

function closePanel() {
  if (!open.value) return
  open.value = false
  panelEl.value?.hidePopover()
  activeIndex.value = -1
  query.value =
    !props.multiple && typeof model.value === 'string' && model.value ? labelOf(model.value) : ''
}

/** Fermeture quand le focus sort du composant (panneau compris). */
function onFocusout(event: FocusEvent) {
  const next = event.relatedTarget as Node | null
  if (!next || !rootEl.value?.contains(next)) closePanel()
}

function select(option: ComboboxOption) {
  if (option.disabled) return
  if (props.multiple) {
    const current = selectedValues.value
    model.value = current.includes(option.value)
      ? current.filter((v) => v !== option.value)
      : [...current, option.value]
    query.value = ''
    inputEl.value?.focus()
  } else {
    model.value = option.value
    closePanel()
  }
}

function removeValue(value: string) {
  if (!props.multiple) return
  model.value = selectedValues.value.filter((v) => v !== value)
  inputEl.value?.focus()
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

function onToggle(event: Event) {
  // resynchronise si le popover est fermé par une voie externe
  if ((event as ToggleEvent).newState === 'closed' && open.value) {
    open.value = false
    activeIndex.value = -1
  }
}
</script>

<template>
  <div ref="rootEl" class="ds-combobox" @focusout="onFocusout">
    <div
      class="ds-combobox-control"
      :data-invalid="invalid ? '' : undefined"
      :data-disabled="disabled ? '' : undefined"
      @click="
        () => {
          inputEl?.focus()
          openPanel()
        }
      "
    >
      <template v-if="multiple">
        <span v-for="value in selectedValues" :key="value" class="ds-combobox-tag">
          {{ labelOf(value) }}
          <button
            type="button"
            class="ds-combobox-tag-remove"
            :aria-label="`Retirer ${labelOf(value)}`"
            :disabled="disabled"
            @click.stop="removeValue(value)"
          >
            <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden="true">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentcolor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </span>
      </template>
      <input
        ref="inputEl"
        v-model="query"
        type="text"
        role="combobox"
        class="ds-combobox-input"
        :aria-expanded="open"
        :aria-controls="listboxId"
        aria-autocomplete="list"
        :aria-activedescendant="open && activeIndex >= 0 ? optionId(activeIndex) : undefined"
        :aria-invalid="invalid || undefined"
        :placeholder="selectedValues.length === 0 ? placeholder : undefined"
        :disabled="disabled"
        @input="openPanel()"
        @keydown="onKeydown"
      />
    </div>

    <div
      :id="listboxId"
      ref="panelEl"
      popover="manual"
      role="listbox"
      class="ds-combobox-panel ds-floating"
      data-placement="bottom-start"
      :aria-multiselectable="multiple || undefined"
      @toggle="onToggle"
      @mousedown.prevent
    >
      <div
        v-for="(option, index) in filtered"
        :id="optionId(index)"
        :key="option.value"
        role="option"
        class="ds-combobox-option"
        :aria-selected="selectedValues.includes(option.value)"
        :aria-disabled="option.disabled || undefined"
        :data-active="index === activeIndex ? '' : undefined"
        @click="select(option)"
        @pointermove="!option.disabled && (activeIndex = index)"
      >
        <span class="ds-combobox-option-label">{{ option.label }}</span>
        <svg
          v-if="selectedValues.includes(option.value)"
          viewBox="0 0 16 16"
          width="14"
          height="14"
          aria-hidden="true"
        >
          <path
            d="m3 8.5 3.5 3.5L13 4.5"
            fill="none"
            stroke="currentcolor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div v-if="filtered.length === 0" class="ds-combobox-empty">{{ emptyText }}</div>
    </div>
  </div>
</template>

<style>
@layer ds.components {
  .ds-combobox {
    width: 100%;
    font-family: var(--ds-font-family-sans);
  }

  .ds-combobox-control {
    anchor-name: --ds-combobox-anchor;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--ds-space-1);
    min-height: var(--ds-control-height-md);
    padding: var(--ds-space-1) var(--ds-space-2);
    background: var(--ds-color-surface);
    border: 1px solid var(--ds-color-border-strong);
    border-radius: var(--ds-radius-interactive);
    cursor: text;
    transition: border-color var(--ds-duration-fast) var(--ds-ease-default);
  }

  .ds-combobox-control:focus-within {
    border-color: var(--ds-color-accent);
    outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color);
    outline-offset: var(--ds-focus-ring-offset);
  }

  .ds-combobox-control[data-invalid] {
    border-color: var(--ds-color-danger);
  }

  .ds-combobox-control[data-invalid]:focus-within {
    outline-color: var(--ds-color-danger);
  }

  .ds-combobox-control[data-disabled] {
    background: var(--ds-color-surface-muted);
    opacity: 0.5;
    cursor: not-allowed;
  }

  .ds-combobox-input {
    flex: 1;
    min-width: var(--ds-space-10);
    border: none;
    background: transparent;
    color: var(--ds-color-text);
    font-size: var(--ds-font-size-sm);
    outline: none;
  }

  .ds-combobox-input::placeholder {
    color: var(--ds-color-text-subtle);
  }

  .ds-combobox-tag {
    display: inline-flex;
    align-items: center;
    gap: var(--ds-space-1);
    padding: var(--ds-space-1) var(--ds-space-2);
    background: var(--ds-color-accent-surface);
    color: var(--ds-color-accent-text);
    border-radius: var(--ds-radius-pill);
    font-size: var(--ds-font-size-xs);
    font-weight: var(--ds-font-weight-medium);
    line-height: var(--ds-font-leading-none);
  }

  .ds-combobox-tag-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--ds-space-4);
    height: var(--ds-space-4);
    border: none;
    background: transparent;
    color: inherit;
    border-radius: var(--ds-radius-full);
    cursor: pointer;
  }

  .ds-combobox-tag-remove:hover {
    background: color-mix(in oklab, currentcolor, transparent 82%);
  }

  .ds-combobox-tag-remove:focus-visible {
    outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color);
    outline-offset: calc(var(--ds-focus-ring-offset) * -1);
  }

  .ds-combobox-panel {
    position-anchor: --ds-combobox-anchor;
    /* aligné sur la largeur du contrôle — pur CSS */
    min-width: anchor-size(width);
    max-height: calc(var(--ds-space-12) * 3);
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-1);
    padding: var(--ds-space-1);
    background: var(--ds-color-surface-overlay);
    color: var(--ds-color-text);
    border: 1px solid var(--ds-color-border);
    border-radius: var(--ds-radius-overlay);
    box-shadow: var(--ds-shadow-4);
  }

  .ds-combobox-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ds-space-2);
    padding: var(--ds-space-2) var(--ds-space-3);
    border-radius: var(--ds-radius-sm);
    font-size: var(--ds-font-size-sm);
    cursor: pointer;
  }

  .ds-combobox-option[data-active] {
    background: var(--ds-color-surface-muted);
  }

  .ds-combobox-option[aria-selected='true'] {
    color: var(--ds-color-accent-text);
  }

  .ds-combobox-option[aria-disabled='true'] {
    color: var(--ds-color-text-subtle);
    cursor: not-allowed;
  }

  .ds-combobox-empty {
    padding: var(--ds-space-3);
    font-size: var(--ds-font-size-sm);
    color: var(--ds-color-text-muted);
    text-align: center;
  }
}
</style>
