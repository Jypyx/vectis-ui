<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Icon from '../Icon/Icon.vue'
import { iconProps } from '../Icon/iconProps'
import type { IconSource } from '../Icon/types'

import { isDev } from '../../utils/env'

import { useAriaLabel } from '../../composables/useAriaLabel'
import { useMessages } from '../../i18n/state'

/**
 * Code à usage unique (OTP). Il n'existe pas de primitive « code à N
 * caractères » : chaque case reste un <input> natif, le JS orchestre le
 * clavier et le collage (justifié) — avance auto, retour arrière, collage
 * distribué sur les cases, flèches. `autocomplete="one-time-code"` sur la
 * première case : le remplissage automatique (SMS/gestionnaire) est distribué.
 *
 * `pattern` découpe le gabarit en cellules : les '#' deviennent des cases,
 * les autres caractères des littéraux affichés (hors v-model). Le collage est
 * « pattern-aware » : les littéraux présents dans le texte collé (« GT-123 »,
 * « 123.456.789 ») sont consommés positionnellement, le reste filtré par
 * `format` (majuscules forcées hors numeric : v-model canonique).
 */
interface InputOTPProps {
  /** Nombre de cases. Ignoré si `pattern` est fourni. */
  length?: number
  /** Jeu de caractères accepté : filtre saisie/collage + inputmode. */
  format?: 'numeric' | 'alpha' | 'alphanumeric'
  /**
   * Gabarit : '#' = case éditable, tout autre caractère = littéral affiché
   * (hors v-model). Prime sur `length`. Ex. 'GT-###', '###.###.###'.
   */
  pattern?: string
  /**
   * Nom Material Symbols remplaçant TOUS les littéraux du pattern — prévu
   * pour les gabarits purement séparateurs ('###-###') ; ne pas le fournir
   * avec un préfixe textuel ('GT-###').
   */
  separatorIcon?: IconSource
  /** Côté des cases : sm 32px, md 40px (défaut), lg 48px. */
  size?: 'sm' | 'md' | 'lg'
  /** Hauteur réduite de 4px ; typo et icônes inchangées (comme Button/Input). */
  compact?: boolean
  disabled?: boolean
  invalid?: boolean
  /** Nom accessible du groupe. Défaut : dictionnaire du DS. */
  label?: string
}

const props = withDefaults(defineProps<InputOTPProps>(), {
  length: 6,
  format: 'numeric',
  pattern: undefined,
  separatorIcon: undefined,
  size: 'md',
  compact: false,
  disabled: false,
  invalid: false,
  label: undefined,
})

const m = useMessages()
const ariaLabel = useAriaLabel(() => props.label ?? m.value.inputOTP.label)

const model = defineModel<string>({ default: '' })

const emit = defineEmits<{
  /** Émis quand toutes les cases sont remplies. */
  complete: [code: string]
}>()

type Cell = { type: 'slot'; slotIndex: number } | { type: 'literal'; char: string }

const cells = computed<Cell[]>(() => {
  if (props.pattern?.includes('#')) {
    let slotIndex = 0
    return [...props.pattern].map((char): Cell =>
      char === '#' ? { type: 'slot', slotIndex: slotIndex++ } : { type: 'literal', char },
    )
  }
  return Array.from({ length: props.length }, (_, i) => ({ type: 'slot', slotIndex: i }))
})
const slotCount = computed(() => cells.value.filter((cell) => cell.type === 'slot').length)

if (isDev) {
  if (props.pattern && !props.pattern.includes('#'))
    console.warn("[InputOTP] pattern sans '#' — repli sur `length`.")
}

const filters: Record<NonNullable<InputOTPProps['format']>, RegExp> = {
  numeric: /[^0-9]/g,
  alpha: /[^A-Z]/g,
  alphanumeric: /[^A-Z0-9]/g,
}

/** Majuscules forcées hors numeric (v-model canonique), puis filtre du format. */
function sanitize(text: string) {
  const upper = props.format === 'numeric' ? text : text.toUpperCase()
  return upper.replace(filters[props.format], '')
}

const inputs = ref<(HTMLInputElement | null)[]>([])
const digits = ref<string[]>([])

function syncFromModel(value: string) {
  // modèle plus long que les cases : tronqué visuellement, sans réécrire le
  // modèle spontanément (pas de boucle model → digits → model)
  digits.value = Array.from({ length: slotCount.value }, (_, i) => value[i] ?? '')
}
syncFromModel(model.value)
watch([model, slotCount], ([value, count]) => {
  if (value !== digits.value.join('') || digits.value.length !== count) syncFromModel(value)
})

function commit() {
  const code = digits.value.join('')
  model.value = code
  if (code.length === slotCount.value) emit('complete', code)
}

/**
 * Distribution pattern-aware : marche sur les cellules depuis la case cible —
 * un littéral consomme le caractère collé s'il lui est égal (collage de la
 * chaîne formatée), une case consomme le prochain caractère valide. Renvoie
 * le dernier slot rempli, ou null si rien d'exploitable.
 */
function distribute(raw: string, startSlot: number): number | null {
  const allCells = cells.value
  let start = allCells.findIndex((cell) => cell.type === 'slot' && cell.slotIndex === startSlot)
  // remonter la série de littéraux contigus qui précède la case : un collage
  // de la chaîne complète (« GT-123 » sur slot 0) les inclut
  while (start > 0 && allCells[start - 1]?.type === 'literal') start--
  const chars = [...raw]
  let charIndex = 0
  let lastFilled: number | null = null
  for (const cell of allCells.slice(start)) {
    if (charIndex >= chars.length) break
    if (cell.type === 'literal') {
      if (chars[charIndex]?.toUpperCase() === cell.char.toUpperCase()) charIndex++
      continue
    }
    let char = ''
    while (charIndex < chars.length && !char) {
      char = sanitize(chars[charIndex] ?? '')
      charIndex++
    }
    if (!char) break
    digits.value[cell.slotIndex] = char
    lastFilled = cell.slotIndex
  }
  return lastFilled
}

function onInput(slotIndex: number, event: Event) {
  const el = event.target as HTMLInputElement
  // saisie simple OU collage multi-caractères : distribution à partir de la case
  const lastFilled = distribute(el.value, slotIndex)
  if (lastFilled === null) {
    // effacement, ou aucun caractère valide pour le format
    digits.value[slotIndex] = ''
    el.value = ''
    commit()
    return
  }
  el.value = digits.value[slotIndex] ?? ''
  inputs.value[Math.min(lastFilled + 1, slotCount.value - 1)]?.focus()
  commit()
}

function onKeydown(slotIndex: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !digits.value[slotIndex] && slotIndex > 0) {
    event.preventDefault()
    digits.value[slotIndex - 1] = ''
    commit()
    inputs.value[slotIndex - 1]?.focus()
  } else if (event.key === 'ArrowLeft' && slotIndex > 0) {
    event.preventDefault()
    inputs.value[slotIndex - 1]?.focus()
  } else if (event.key === 'ArrowRight' && slotIndex < slotCount.value - 1) {
    event.preventDefault()
    inputs.value[slotIndex + 1]?.focus()
  }
}
</script>

<template>
  <div
    class="ds-otp ds-control"
    role="group"
    :aria-label="ariaLabel"
    :data-invalid="invalid ? '' : undefined"
    :data-size="size"
    :data-compact="compact ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
  >
    <template v-for="(cell, i) in cells" :key="i">
      <input
        v-if="cell.type === 'slot'"
        :ref="
          (el) => {
            inputs[cell.slotIndex] = el as HTMLInputElement | null
          }
        "
        type="text"
        class="ds-otp-input"
        :inputmode="format === 'numeric' ? 'numeric' : 'text'"
        :autocomplete="cell.slotIndex === 0 ? 'one-time-code' : 'off'"
        :value="digits[cell.slotIndex]"
        :disabled="disabled"
        :aria-label="m.inputOTP.slot(cell.slotIndex + 1, slotCount)"
        :aria-invalid="invalid || undefined"
        @input="onInput(cell.slotIndex, $event)"
        @keydown="onKeydown(cell.slotIndex, $event)"
        @focus="($event.target as HTMLInputElement).select()"
      />
      <!-- littéral décoratif du gabarit : jamais focusable, hors v-model -->
      <span v-else class="ds-otp-literal" aria-hidden="true">
        <Icon v-if="separatorIcon" v-bind="iconProps(separatorIcon)" />
        <template v-else>{{ cell.char }}</template>
      </span>
    </template>
  </div>
</template>

<style>
@layer ds.components {
  .ds-otp {
    /*
     * Hauteur/icônes : classe partagée ds-control (styles/control-size.css).
     * La typo garde son échelle propre, majorée d'un à deux crans par rapport
     * aux autres champs : les chiffres remplissent les cases carrées.
     */
    --otp-font-size: var(--vectis-font-size-lg);

    display: inline-flex;
    align-items: center;
    gap: var(--control-gap);
  }

  .ds-otp-input {
    /* cases carrées : size/compact scalent les deux dimensions d'un coup */
    width: var(--control-height);
    height: var(--control-height);
    text-align: center;
    background: var(--vectis-color-surface);
    color: var(--vectis-color-text);
    border: 1px solid var(--vectis-color-border-strong);
    border-radius: var(--vectis-radius-interactive);
    font-family: var(--vectis-text-family-code);
    font-size: var(--otp-font-size);
    transition: border-color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  /* Focus « bordure 2px » : bordure 1px + shadow externe 1px de même couleur
     (aligné sur Input/Textarea) ; l'outline transparent est le filet
     forced-colors (Windows High Contrast supprime les box-shadow) */
  .ds-otp-input:focus-visible {
    border-color: var(--vectis-color-accent);
    box-shadow: 0 0 0 1px var(--vectis-color-accent);
    outline: var(--vectis-focus-ring-width) solid transparent;
  }

  .ds-otp[data-invalid] .ds-otp-input {
    border-color: var(--vectis-color-danger);
  }

  .ds-otp[data-invalid] .ds-otp-input:focus-visible {
    box-shadow: 0 0 0 1px var(--vectis-color-danger);
  }

  .ds-otp-literal {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--vectis-color-text-muted);
    font-family: var(--vectis-text-family-code);
    font-size: var(--otp-font-size);
    user-select: none;
  }

  /* Disabled : gris par tokens, sans opacité (aligné sur Input) */
  .ds-otp[data-disabled] .ds-otp-input {
    background: var(--vectis-color-surface-muted);
    color: var(--vectis-color-text-subtle);
    border-color: var(--vectis-color-border);
    cursor: not-allowed;
  }

  .ds-otp[data-disabled] .ds-otp-literal {
    color: var(--vectis-color-text-subtle);
  }

  /* --- Tailles : seule la typo majorée reste locale, le reste vient de
     ds-control --- */
  .ds-otp[data-size='sm'] {
    --otp-font-size: var(--vectis-font-size-md);
  }

  .ds-otp[data-size='lg'] {
    --otp-font-size: var(--vectis-font-size-xl);
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-otp-input {
      transition: none;
    }
  }
}
</style>
