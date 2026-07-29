<script setup lang="ts">
/**
 * Champ de saisie complet : label, icônes internes (cliquables), compteur,
 * limite souple, loading, clearable — autour d'un <input> natif stylé.
 * Wrapper-root : class/style restent sur la racine, tout le reste est reporté
 * sur l'<input>. La validation reste native (`:user-invalid`) ; la limite
 * souple passe par setCustomValidity, jamais par un événement maison.
 *
 * JS de comportement propre au composant : le pont v-model et le clear +
 * refocus (le bouton disparaît au clic, sinon le focus serait perdu).
 */
import { computed, ref } from 'vue'

import Icon from '../Icon/Icon.vue'
import { iconName, iconProps } from '../Icon/iconProps'
import type { IconSource } from '../Icon/types'
import Spinner from '../Spinner/Spinner.vue'
import Typography from '../Typography/Typography.vue'

import { useFieldIds } from '../../composables/useFieldIds'
import { useIconClickHandlers } from '../../composables/useIconClickHandlers'
import { useRootAttrs } from '../../composables/useRootAttrs'
import { useTextLimit } from '../../composables/useTextLimit'

interface InputProps {
  /** Hauteur du champ : sm 32px, md 40px (défaut), lg 48px. */
  size?: 'sm' | 'md' | 'lg'
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
  /** Icône à gauche dans le champ (le slot #start prime).
      Décorative ; devient un bouton si un listener @click:icon-start est attaché. */
  iconStart?: IconSource
  /** Idem à droite (slot #end prime). Remplacée par le spinner en loading. */
  iconEnd?: IconSource
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
  /** Force la visibilité de la croix (sinon : champ non-vide). Utile quand le
      « contenu à effacer » vit hors du champ texte (ex. Combobox : des Chips). */
  clearVisible?: boolean
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
  clearVisible: undefined,
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

/**
 * `string | number` et non `string` seul : sur un `<input type="number">`, Vue
 * convertit d'office la valeur de `v-model` en nombre (`vModelText` caste dès
 * que `el.type === 'number'`).
 */
const model = defineModel<string | number>({ default: '' })

/** Projection texte du modèle : toutes les mesures de longueur (compteur,
 * limite souple, visibilité de la croix) passent par elle — un nombre n'a pas
 * de `.length`. */
const modelText = computed(() => String(model.value ?? ''))

const { attrs, rootClass, rootStyle, forwardedAttrs: restAttrs } = useRootAttrs()

const { fieldId, hintId, describedBy } = useFieldIds(attrs, () => !!props.hint)

const { hasIconStartHandler, hasIconEndHandler } = useIconClickHandlers({
  name: 'Input',
  iconStartLabel: props.iconStartLabel,
  iconEndLabel: props.iconEndLabel,
})

const controlEl = ref<HTMLInputElement | null>(null)

const showClear = computed(
  () =>
    props.clearable &&
    !props.disabled &&
    !props.readonly &&
    // override explicite (Combobox…) sinon défaut « champ non-vide »
    (props.clearVisible ?? modelText.value.length > 0),
)

function onClear() {
  model.value = ''
  emit('clear')
  controlEl.value?.focus()
}

// Compteur et limite souple : mesurés sur `modelText`, un nombre n'a pas de `.length`.
const { counterText, over } = useTextLimit({
  el: controlEl,
  text: () => modelText.value,
  maxlength: () => props.maxlength,
  softLimit: () => props.softLimit,
})

// Le contrôle interne est masqué par le wrapper : exposer focus()/select()/el
// pour les composants qui le composent (ex. Combobox, refocus + select-all).
defineExpose({
  focus: (options?: FocusOptions) => controlEl.value?.focus(options),
  select: () => controlEl.value?.select(),
  el: controlEl,
})
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
    <Typography v-if="label" as="label" variant="label" class="ds-input-label" :for="fieldId">
      {{ label }}
    </Typography>

    <div class="ds-input-field">
      <slot name="start">
        <button
          v-if="iconStart && hasIconStartHandler"
          type="button"
          class="ds-input-action"
          :aria-label="iconStartLabel ?? iconName(iconStart)"
          :disabled="disabled"
          @click="emit('click:icon-start', $event)"
        >
          <Icon v-bind="iconProps(iconStart)" />
        </button>
        <Icon v-else-if="iconStart" v-bind="iconProps(iconStart)" />
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
        <!-- croix Material Symbols : même graisse de trait que les autres icônes
             (iconStart/iconEnd, chevrons…) ; police chargée par le consommateur -->
        <Icon name="close" />
      </button>

      <Spinner v-if="loading" :label="loadingLabel" />
      <slot v-else name="end">
        <button
          v-if="iconEnd && hasIconEndHandler"
          type="button"
          class="ds-input-action"
          :aria-label="iconEndLabel ?? iconName(iconEnd)"
          :disabled="disabled"
          @click="emit('click:icon-end', $event)"
        >
          <Icon v-bind="iconProps(iconEnd)" />
        </button>
        <Icon v-else-if="iconEnd" v-bind="iconProps(iconEnd)" />
      </slot>
    </div>

    <Typography v-if="hint" :id="hintId" variant="caption" tone="muted" class="ds-input-hint">
      {{ hint }}
    </Typography>
  </div>
</template>

<style>
@layer ds.components {
  .ds-input {
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-1);
    width: 100%;
    font-family: var(--ds-text-family);
  }

  /* Label et hint : rendus par Typography (label / caption muted) — les classes
     .ds-input-label/.ds-input-hint restent posées comme points d'accroche
     (surcharges consommateur, état disabled ci-dessous). */

  /* Le field porte bordure, fond et focus ; --_border-color est la seule
     source de vérité de la couleur (hover/erreur/disabled la redéfinissent).
     Tailles/compact : variables --_control-* héritées de la racine ds-control
     (styles/control-size.css), contexte d'Icon compris. */
  .ds-input-field {
    --_border-color: var(--ds-color-border-strong);

    display: flex;
    align-items: center;
    gap: var(--_control-gap);
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

  /* Décorations natives neutralisées : les contrôles internes viennent du DS
     (croix `clearable`, icônes) — la croix WebKit de type=search, les spinners
     de type=number et l'œil de révélation d'Edge feraient doublon ou
     détonneraient visuellement. */
  .ds-input-control::-webkit-search-cancel-button,
  .ds-input-control::-webkit-search-decoration,
  .ds-input-control::-webkit-search-results-button,
  .ds-input-control::-webkit-search-results-decoration,
  .ds-input-control::-webkit-inner-spin-button,
  .ds-input-control::-webkit-outer-spin-button {
    -webkit-appearance: none;
    appearance: none;
  }

  .ds-input-control[type='number'] {
    appearance: textfield;
  }

  .ds-input-control::-ms-reveal {
    display: none;
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

  /* Le compteur reste stylé localement : tabular-nums et l'état de dépassement
     ne sont pas des rôles typographiques. */
  .ds-input-counter {
    flex: none;
    font-size: var(--ds-text-caption-size);
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
