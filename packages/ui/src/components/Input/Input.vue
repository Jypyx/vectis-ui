<script setup lang="ts">
/**
 * Champ de saisie complet : label, icônes internes (cliquables), compteur,
 * limite souple, loading, clearable — autour d'un <input> natif stylé.
 *
 * Racine wrapper (label + champ + hint) → `inheritAttrs: false` : les attributs
 * natifs (type, placeholder, required, pattern…) sont reportés sur l'<input>
 * via v-bind, SAUF class/style qui restent sur la racine (les consommateurs
 * dimensionnent le composant entier, pas le contrôle interne — dérogation
 * volontaire au pattern wrapper de CLAUDE.md).
 *
 * La validation reste native : `pattern`/`required` passent en fallthrough et
 * `:user-invalid` fait le style d'erreur sans JS ; la prop `invalid` force
 * l'état (validation serveur) via aria-invalid. La limite souple passe par
 * setCustomValidity : le champ devient :invalid immédiatement mais le rouge
 * (:user-invalid) n'apparaît qu'après interaction — même timing que le natif —
 * et la soumission est bloquée ; la validité est exposée par l'API standard
 * (el.validity), pas par un événement maison.
 *
 * JS de comportement (chaque bloc justifié) :
 * - pont v-model (defineModel) ;
 * - useId() pour l'association label/for et aria-describedby (SSR-safe) ;
 * - split de $attrs (class/style → racine, reste → contrôle) ;
 * - détection des listeners @click:icon-* dans vnode.props pour rendre
 *   l'icône en <button> accessible (liste considérée statique — un listener
 *   ajouté dynamiquement après montage n'est pas re-détecté, cas marginal) ;
 * - clear + refocus (le bouton disparaît au clic, sinon le focus serait perdu) ;
 * - watchEffect → setCustomValidity pour la limite souple (flush post : la ref
 *   template doit être posée ; inerte côté serveur, la ref y reste nulle).
 */
import { computed, getCurrentInstance, ref, useAttrs, useId, watchEffect } from 'vue'
import type { StyleValue } from 'vue'

import Icon from '../Icon/Icon.vue'
import Spinner from '../Spinner/Spinner.vue'

interface InputProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Hauteur réduite de 4px ; padding, typo et icônes inchangés. */
  compact?: boolean
  /** Type de saisie natif — les claviers virtuels s'adaptent automatiquement. */
  type?: 'text' | 'email' | 'number' | 'password' | 'search' | 'tel' | 'url'
  /** Force l'état invalide (validation serveur) — pose aria-invalid. */
  invalid?: boolean
  disabled?: boolean
  /** Lecture seule : focusable, non modifiable ; masque le bouton d'effacement. */
  readonly?: boolean
  /** Libellé au-dessus du champ, associé via for/id. */
  label?: string
  /** Texte d'aide sous le champ, lié via aria-describedby. */
  hint?: string
  /** Nom Material Symbols à gauche dans le champ (le slot #start prime).
      Décorative ; devient un bouton si un listener @click:icon-start est attaché. */
  iconStart?: string
  /** Idem à droite (slot #end prime). Remplacée par le spinner en loading. */
  iconEnd?: string
  /** Libellé accessible du bouton icône start (si cliquable). */
  iconStartLabel?: string
  /** Libellé accessible du bouton icône end (si cliquable). */
  iconEndLabel?: string
  /** Spinner à droite, à la place de iconEnd / #end. */
  loading?: boolean
  /** Libellé du spinner pour les lecteurs d'écran. */
  loadingLabel?: string
  /** Bouton croix qui vide le champ (visible si non-vide, hors disabled/readonly). */
  clearable?: boolean
  /** Libellé accessible du bouton d'effacement. */
  clearLabel?: string
  /** Limite de caractères. Par défaut : attribut natif maxlength (saisie bloquée). */
  maxlength?: number
  /** Limite souple : la saisie peut dépasser maxlength, le champ passe en erreur
      (setCustomValidity → :user-invalid) au lieu de bloquer. */
  softLimit?: boolean
  /** Compteur de caractères (« 12/80 », ou « 12 » sans maxlength), à droite dans le champ. */
  counter?: boolean
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<InputProps>(), {
  size: 'md',
  compact: false,
  type: 'text',
  invalid: false,
  disabled: false,
  readonly: false,
  label: undefined,
  hint: undefined,
  iconStart: undefined,
  iconEnd: undefined,
  iconStartLabel: undefined,
  iconEndLabel: undefined,
  loading: false,
  loadingLabel: 'Chargement…',
  clearable: false,
  clearLabel: 'Effacer',
  maxlength: undefined,
  softLimit: false,
  counter: false,
})

const emit = defineEmits<{
  'click:icon-start': [event: MouseEvent]
  'click:icon-end': [event: MouseEvent]
  clear: []
}>()

defineSlots<{
  /** Contenu au début du champ (prime sur iconStart). */
  start?(): unknown
  /** Contenu à la fin du champ (prime sur iconEnd, masqué en loading). */
  end?(): unknown
}>()

const model = defineModel<string>({ default: '' })

const attrs = useAttrs()
// class/style sur la racine ; tout le reste sur le contrôle natif
const rootClass = computed(() => attrs.class)
const rootStyle = computed(() => attrs.style as StyleValue)
const restAttrs = computed(() =>
  Object.fromEntries(Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style')),
)

const uid = useId()
const fieldId = computed(() => (attrs.id as string | undefined) ?? uid)
const hintId = useId()
const describedBy = computed(() => {
  const ids = [attrs['aria-describedby'] as string | undefined, props.hint ? hintId : undefined]
  return ids.filter(Boolean).join(' ') || undefined
})

// Les emits déclarés sont retirés de $attrs (pas de fuite sur l'<input>) ; leur
// présence se lit dans vnode.props (les deux graphies : template kebab / render camel).
const vnodeProps = getCurrentInstance()?.vnode.props ?? {}
const hasIconStartHandler = 'onClick:iconStart' in vnodeProps || 'onClick:icon-start' in vnodeProps
const hasIconEndHandler = 'onClick:iconEnd' in vnodeProps || 'onClick:icon-end' in vnodeProps

// accès optionnel : `env` n'est pas typé dans tsconfig.build.json (types: [])
// et peut être absent chez un consommateur non-Vite — le garde-fou devient inerte
if ((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV) {
  // garde-fou a11y : jamais de bouton sans nom accessible (repli = nom Material)
  if (hasIconStartHandler && !props.iconStartLabel)
    console.warn(
      '[Input] icône start cliquable sans iconStartLabel — fournir un libellé accessible.',
    )
  if (hasIconEndHandler && !props.iconEndLabel)
    console.warn('[Input] icône end cliquable sans iconEndLabel — fournir un libellé accessible.')
}

const controlEl = ref<HTMLInputElement | null>(null)

const showClear = computed(
  () => props.clearable && model.value.length > 0 && !props.disabled && !props.readonly,
)

function onClear() {
  model.value = ''
  emit('clear')
  controlEl.value?.focus()
}

const counterText = computed(() =>
  props.maxlength != null ? `${model.value.length}/${props.maxlength}` : `${model.value.length}`,
)
const over = computed(() => props.maxlength != null && model.value.length > props.maxlength)

// Limite souple : le composant possède la custom validity quand softLimit est actif
watchEffect(
  () => {
    const el = controlEl.value
    if (!el) return
    const overLimit =
      props.softLimit && props.maxlength != null && model.value.length > props.maxlength
    el.setCustomValidity(overLimit ? `Dépasse la limite de ${props.maxlength} caractères` : '')
  },
  { flush: 'post' },
)
</script>

<template>
  <div
    class="ds-input ds-control"
    :class="rootClass"
    :style="rootStyle"
    :data-size="size"
    :data-compact="compact ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
  >
    <label v-if="label" class="ds-input-label" :for="fieldId">{{ label }}</label>

    <div class="ds-input-field">
      <slot name="start">
        <button
          v-if="iconStart && hasIconStartHandler"
          type="button"
          class="ds-input-action"
          :aria-label="iconStartLabel ?? iconStart"
          :disabled="disabled"
          @click="emit('click:icon-start', $event)"
        >
          <Icon :name="iconStart" />
        </button>
        <Icon v-else-if="iconStart" :name="iconStart" />
      </slot>

      <input
        v-bind="restAttrs"
        :id="fieldId"
        ref="controlEl"
        v-model="model"
        class="ds-input-control"
        :type="type"
        :maxlength="softLimit ? undefined : maxlength"
        :disabled="disabled"
        :readonly="readonly || undefined"
        :aria-invalid="invalid || undefined"
        :aria-describedby="describedBy"
      />

      <span v-if="counter" class="ds-input-counter" :data-over="over ? '' : undefined">
        {{ counterText }}
      </span>

      <button
        v-if="showClear"
        type="button"
        class="ds-input-action ds-input-clear"
        :aria-label="clearLabel"
        @click="onClear"
      >
        <!-- croix en SVG inline : doit marcher sans la police d'icônes du consommateur ;
             dimensionnée en CSS selon la taille du champ -->
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M4 4l8 8M12 4l-8 8"
            stroke="currentcolor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>

      <Spinner v-if="loading" :label="loadingLabel" />
      <slot v-else name="end">
        <button
          v-if="iconEnd && hasIconEndHandler"
          type="button"
          class="ds-input-action"
          :aria-label="iconEndLabel ?? iconEnd"
          :disabled="disabled"
          @click="emit('click:icon-end', $event)"
        >
          <Icon :name="iconEnd" />
        </button>
        <Icon v-else-if="iconEnd" :name="iconEnd" />
      </slot>
    </div>

    <p v-if="hint" :id="hintId" class="ds-input-hint">{{ hint }}</p>
  </div>
</template>

<style>
@layer ds.components {
  .ds-input {
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-1);
    width: 100%;
    font-family: var(--ds-font-family-sans);
  }

  .ds-input-label {
    font-size: var(--ds-font-size-sm);
    font-weight: var(--ds-font-weight-medium);
    color: var(--ds-color-text);
  }

  .ds-input-hint {
    margin: 0;
    font-size: var(--ds-font-size-xs);
    color: var(--ds-color-text-muted);
  }

  /* Le field porte bordure, fond et focus ; --_border-color est la seule
     source de vérité de la couleur (hover/erreur/disabled la redéfinissent).
     Tailles/compact : variables --_control-* héritées de la racine ds-control
     (styles/control-size.css), contexte d'Icon compris. */
  .ds-input-field {
    --_border-color: var(--ds-color-border-strong);

    display: flex;
    align-items: center;
    gap: var(--ds-space-2);
    height: var(--_control-height);
    padding-inline: var(--_control-padding-inline-field);
    background: var(--ds-color-surface);
    color: var(--ds-color-text);
    border: 1px solid var(--_border-color);
    border-radius: var(--ds-radius-interactive);
    font-size: var(--_control-font-size);
    transition:
      border-color var(--ds-duration-fast) var(--ds-ease-default),
      background-color var(--ds-duration-fast) var(--ds-ease-default),
      box-shadow var(--ds-duration-fast) var(--ds-ease-default);
  }

  .ds-input-control {
    flex: 1;
    min-width: 0;
    height: 100%;
    padding: 0;
    border: none;
    background: none;
    color: inherit;
    font: inherit;
    outline: none; /* le focus est porté par le field (focus-within) */
  }

  .ds-input-control::placeholder {
    color: var(--ds-color-text-subtle);
  }

  /* le fond autofill du navigateur est peint sur l'input interne : au moins
     suivre le radius du champ (compromis, la couleur reste celle du navigateur) */
  .ds-input-control:-webkit-autofill {
    border-radius: var(--ds-radius-interactive);
  }

  .ds-input-field:hover:not(:has(.ds-input-control:focus)):not(
      :has(
        .ds-input-control:disabled,
        .ds-input-control:user-invalid,
        .ds-input-control[aria-invalid='true']
      )
    ) {
    --_border-color: color-mix(in oklab, var(--ds-color-border-strong), var(--ds-color-text) 15%);
  }

  /* Focus « bordure 2px » : bordure 1px + shadow externe 1px de même couleur,
     sans saut de layout. On cible le focus du seul CONTRÔLE (pas :focus-within) :
     quand un bouton interne (clear, icône) est focus au clavier, seul son
     outline propre s'allume — sinon deux indicateurs simultanés, illisible.
     :focus (pas :focus-visible) : un champ texte montre toujours son focus,
     souris comprise. L'outline transparent est le filet forced-colors
     (Windows High Contrast supprime les box-shadow). */
  .ds-input-field:has(.ds-input-control:focus) {
    --_border-color: var(--ds-color-accent);

    box-shadow: 0 0 0 1px var(--_border-color);
    outline: var(--ds-focus-ring-width) solid transparent;
  }

  /* État invalide : pseudo-classe native d'abord, prop (aria-invalid) ensuite.
     Seule la variable change → la bordure ET le ring focus passent en rouge. */
  .ds-input-field:has(.ds-input-control:user-invalid),
  .ds-input-field:has(.ds-input-control[aria-invalid='true']) {
    --_border-color: var(--ds-color-danger);
  }

  .ds-input-counter {
    flex: none;
    font-size: var(--ds-font-size-xs);
    color: var(--ds-color-text-muted);
    font-variant-numeric: tabular-nums;
  }

  .ds-input-counter[data-over] {
    color: var(--ds-color-danger-text);
  }

  /* Icônes décoratives : gris foncé, moins présentes que le texte saisi */
  .ds-input-field > .ds-icon {
    color: var(--ds-color-text-muted);
  }

  /* le spinner (1em) remplit la taille d'icône du champ */
  .ds-input-field > .ds-spinner {
    font-size: var(--ds-icon-size);
  }

  /* Boutons internes (effacer, icône cliquable) : gris foncé → noir au hover,
     radius aligné sur Button (focus ring carré aux bords arrondis) */
  .ds-input-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--_control-action-size);
    height: var(--_control-action-size);
    margin-inline: calc(var(--ds-space-1) * -1);
    padding: 0;
    border: none;
    background: transparent;
    color: var(--ds-color-text-muted);
    border-radius: var(--ds-radius-interactive);
    cursor: pointer;
    flex: none;
    transition: color var(--ds-duration-fast) var(--ds-ease-default);
  }

  .ds-input-action:hover:not(:disabled) {
    color: var(--ds-color-text);
  }

  .ds-input-action:focus-visible {
    outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color);
    outline-offset: calc(var(--ds-focus-ring-offset) * -1);
  }

  /* croix proportionnelle à la zone cliquable (16px dans 24px en md) */
  .ds-input-clear svg {
    inline-size: calc(var(--_control-action-size) - var(--ds-space-2));
    block-size: calc(var(--_control-action-size) - var(--ds-space-2));
  }

  /* Readonly : fond légèrement enfoncé, texte normal (la valeur reste lisible),
     focus accent conservé. [data-readonly] et jamais :read-only (matche :disabled). */
  .ds-input[data-readonly] .ds-input-field {
    --_border-color: var(--ds-color-border);

    background: var(--ds-color-surface-sunken);
  }

  /* Disabled : nuance de gris sans opacité (mêmes tokens que Checkbox/Radio).
     Placé après les états erreur/readonly : à spécificité égale, il gagne. */
  .ds-input[data-disabled] .ds-input-field {
    --_border-color: var(--ds-color-border);

    background: var(--ds-color-surface-muted);
    color: var(--ds-color-text-subtle);
    cursor: not-allowed;
  }

  .ds-input[data-disabled] .ds-input-label,
  .ds-input[data-disabled] .ds-input-hint,
  .ds-input[data-disabled] .ds-input-counter {
    color: var(--ds-color-text-subtle);
  }

  .ds-input[data-disabled] .ds-input-action,
  .ds-input[data-disabled] .ds-input-field > .ds-icon {
    color: inherit;
    cursor: not-allowed;
  }

  .ds-input-control:disabled {
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-input-field,
    .ds-input-action {
      transition: none;
    }
  }
}
</style>
