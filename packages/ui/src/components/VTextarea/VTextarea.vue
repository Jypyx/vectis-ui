<script setup lang="ts">
/**
 * Zone de texte complète : label, icônes internes (cliquables), compteur,
 * limite souple, loading, clearable — autour d'un <textarea> natif stylé.
 * Miroir d'Input, avec `autoGrow` (pur CSS, `field-sizing: content`) et le
 * compteur rendu SOUS le champ, jamais dedans. Wrapper-root : class/style
 * restent sur la racine, tout le reste est reporté sur le <textarea>. La
 * validation reste native (`:user-invalid`) ; la limite souple passe par
 * setCustomValidity.
 *
 * JS de comportement propre au composant : le pont v-model et le clear +
 * refocus (le bouton disparaît au clic, sinon le focus serait perdu).
 */
import { computed, ref } from 'vue'

import Icon from '../VIcon/VIcon.vue'
import { iconName, iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import Spinner from '../VSpinner/VSpinner.vue'
import Typography from '../VTypography/VTypography.vue'

import { useFieldIds } from '../../composables/useFieldIds'
import { useIconClickHandlers } from '../../composables/useIconClickHandlers'
import { useRootAttrs } from '../../composables/useRootAttrs'
import { useTextLimit } from '../../composables/useTextLimit'
import { useMessages } from '../../i18n/state'

interface TextareaProps {
  /** Hauteur du champ : sm 32px, md 40px (défaut), lg 48px. */
  size?: 'sm' | 'md' | 'lg'
  /** Hauteur minimale réduite de 4px ; padding, typo et icônes inchangés. */
  compact?: boolean
  /** Hauteur qui suit le contenu (field-sizing: content ; sans support, textarea classique). */
  autoGrow?: boolean
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
  /** Libellé du spinner pour les lecteurs d'écran. Défaut : dictionnaire du DS. */
  loadingLabel?: string
  /** Bouton croix qui vide le champ (visible si non-vide, hors disabled/readonly). */
  clearable?: boolean
  /** Libellé accessible du bouton d'effacement. Défaut : dictionnaire du DS. */
  clearLabel?: string
  /** Limite de caractères. Par défaut : attribut natif maxlength (saisie bloquée). */
  maxlength?: number
  /** Limite souple : la saisie peut dépasser maxlength, le champ passe en erreur
      (setCustomValidity → :user-invalid) au lieu de bloquer. */
  softLimit?: boolean
  /** Compteur de caractères (« 12/80 », ou « 12 » sans maxlength), sous le champ à droite. */
  counter?: boolean
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<TextareaProps>(), {
  size: 'md',
  compact: false,
  autoGrow: false,
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
  loadingLabel: undefined,
  clearable: false,
  clearLabel: undefined,
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

// class/style sur la racine ; tout le reste sur le contrôle natif
const { attrs, rootClass, rootStyle, forwardedAttrs: restAttrs } = useRootAttrs()

// Cascade prop > dictionnaire : la prop garde la priorité, son défaut suit
// désormais la locale du DS.
const m = useMessages()
const resolvedLoadingLabel = computed(() => props.loadingLabel ?? m.value.common.loading)
const resolvedClearLabel = computed(() => props.clearLabel ?? m.value.common.clear)

const { fieldId, hintId, describedBy } = useFieldIds(attrs, () => !!props.hint)

const { hasIconStartHandler, hasIconEndHandler } = useIconClickHandlers({
  name: 'Textarea',
  iconStartLabel: props.iconStartLabel,
  iconEndLabel: props.iconEndLabel,
})

const controlEl = ref<HTMLTextAreaElement | null>(null)

const showClear = computed(
  () => props.clearable && model.value.length > 0 && !props.disabled && !props.readonly,
)

function onClear() {
  model.value = ''
  emit('clear')
  controlEl.value?.focus()
}

const { counterText, over } = useTextLimit({
  el: controlEl,
  text: () => model.value,
  maxlength: () => props.maxlength,
  softLimit: () => props.softLimit,
})
</script>

<template>
  <div
    class="v-textarea v-control"
    :class="rootClass"
    :style="rootStyle"
    :data-size="size"
    :data-compact="compact ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
  >
    <Typography v-if="label" as="label" variant="label" class="v-textarea-label" :for="fieldId">
      {{ label }}
    </Typography>

    <div class="v-textarea-field" :data-auto-grow="autoGrow ? '' : undefined">
      <slot name="start">
        <button
          v-if="iconStart && hasIconStartHandler"
          type="button"
          class="v-textarea-action"
          :aria-label="iconStartLabel ?? iconName(iconStart)"
          :disabled="disabled"
          @click="emit('click:icon-start', $event)"
        >
          <Icon v-bind="iconProps(iconStart)" />
        </button>
        <Icon v-else-if="iconStart" v-bind="iconProps(iconStart)" />
      </slot>

      <textarea
        v-bind="restAttrs"
        :id="fieldId"
        ref="controlEl"
        v-model="model"
        class="v-textarea-control"
        :maxlength="softLimit ? undefined : maxlength"
        :disabled="disabled"
        :readonly="readonly || undefined"
        :aria-invalid="invalid || undefined"
        :aria-describedby="describedBy"
      />

      <button
        v-if="showClear"
        type="button"
        class="v-textarea-action v-textarea-clear"
        :aria-label="resolvedClearLabel"
        @click="onClear"
      >
        <!-- croix Material Symbols : même graisse de trait que les autres icônes
             (iconStart/iconEnd…) ; police chargée par le consommateur -->
        <Icon name="close" />
      </button>

      <Spinner v-if="loading" :label="resolvedLoadingLabel" />
      <slot v-else name="end">
        <button
          v-if="iconEnd && hasIconEndHandler"
          type="button"
          class="v-textarea-action"
          :aria-label="iconEndLabel ?? iconName(iconEnd)"
          :disabled="disabled"
          @click="emit('click:icon-end', $event)"
        >
          <Icon v-bind="iconProps(iconEnd)" />
        </button>
        <Icon v-else-if="iconEnd" v-bind="iconProps(iconEnd)" />
      </slot>
    </div>

    <div v-if="hint || counter" class="v-textarea-meta">
      <Typography v-if="hint" :id="hintId" variant="caption" tone="muted" class="v-textarea-hint">
        {{ hint }}
      </Typography>
      <span v-if="counter" class="v-textarea-counter" :data-over="over ? '' : undefined">
        {{ counterText }}
      </span>
    </div>
  </div>
</template>

<style>
@layer vectis.components {
  .v-textarea {
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-1);
    width: 100%;
    font-family: var(--vectis-text-family);
  }

  /* Label et hint : rendus par Typography (label / caption muted) — les classes
     .v-textarea-label/.v-textarea-hint restent posées comme points d'accroche
     (surcharges consommateur, état disabled ci-dessous). */

  .v-textarea-meta {
    display: flex;
    align-items: baseline;
    gap: var(--vectis-space-2);
  }

  /* Le compteur reste stylé localement : tabular-nums et l'état de dépassement
     ne sont pas des rôles typographiques. */
  .v-textarea-counter {
    margin-inline-start: auto;
    font-size: var(--vectis-text-caption-size);
    color: var(--vectis-color-text-muted);
    font-variant-numeric: tabular-nums;
  }

  .v-textarea-counter[data-over] {
    color: var(--vectis-color-danger-text);
  }

  /* Le field porte bordure, fond, focus ET le redimensionnement (resize exige
     overflow ≠ visible) ; --field-border-color est la seule source de vérité de la
     couleur (hover/erreur/disabled la redéfinissent) */
  .v-textarea-field {
    --field-border-color: var(--vectis-color-border-strong);

    /*
     * Tailles/compact : variables --control-* héritées de la racine
     * v-control (styles/control-size.css), contexte d'Icon compris.
     * Hauteur minimale = 2 lignes : base + hauteur effective — vaut 2×base
     * sans compact, 2×base - 4px avec (la hauteur effective porte le delta).
     */
    --textarea-min-height: calc(var(--control-height-base) + var(--control-height));

    display: flex;
    align-items: flex-start;
    gap: var(--control-gap);
    min-height: var(--textarea-min-height);
    padding: var(--vectis-space-2) var(--control-padding-inline-field);
    background: var(--vectis-color-surface);
    color: var(--vectis-color-text);
    border: 1px solid var(--field-border-color);
    border-radius: var(--vectis-radius-interactive);
    font-size: var(--control-font-size);
    /* texte multiligne : interlignage du corps de texte (le rôle `control`
       en leading-none ne vaut que pour les étiquettes d'une ligne) */
    line-height: var(--vectis-text-body-md-leading);
    resize: vertical;
    overflow: hidden;
    transition:
      border-color var(--vectis-duration-fast) var(--vectis-ease-default),
      background-color var(--vectis-duration-fast) var(--vectis-ease-default),
      box-shadow var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-textarea-control {
    flex: 1;
    min-width: 0;
    align-self: stretch;
    padding: 0;
    border: none;
    background: none;
    color: inherit;
    font: inherit;
    outline: none; /* le focus est porté par le field (focus-within) */
    resize: none; /* le redimensionnement est porté par le field */
  }

  .v-textarea-control::placeholder {
    color: var(--vectis-color-text-subtle);
  }

  /* icônes et boutons centrés sur la première ligne de texte */
  .v-textarea-field > .v-icon,
  .v-textarea-field > .v-spinner {
    margin-block-start: calc((1lh - var(--vectis-icon-size)) / 2);
  }

  .v-textarea-field > .v-textarea-action {
    margin-block-start: calc((1lh - var(--control-action-size)) / 2);
  }

  /* Icônes décoratives : gris foncé, moins présentes que le texte saisi */
  .v-textarea-field > .v-icon {
    color: var(--vectis-color-text-muted);
  }

  .v-textarea-field > .v-spinner {
    font-size: var(--vectis-icon-size);
  }

  .v-textarea-field:hover:not(:has(.v-textarea-control:focus)):not(
      :has(
        .v-textarea-control:disabled,
        .v-textarea-control:user-invalid,
        .v-textarea-control[aria-invalid='true']
      )
    ) {
    --field-border-color: color-mix(
      in oklab,
      var(--vectis-color-border-strong),
      var(--vectis-color-text) 15%
    );
  }

  /* Focus « bordure 2px » : bordure 1px + shadow externe 1px de même couleur,
     sans saut de layout. On cible le focus du seul CONTRÔLE (pas :focus-within) :
     quand un bouton interne (clear, icône) est focus au clavier, seul son
     outline propre s'allume — sinon deux indicateurs simultanés, illisible.
     :focus (pas :focus-visible) : un champ texte montre toujours son focus,
     souris comprise. L'outline transparent est le filet forced-colors
     (Windows High Contrast supprime les box-shadow). */
  .v-textarea-field:has(.v-textarea-control:focus) {
    --field-border-color: var(--vectis-color-accent);

    box-shadow: 0 0 0 1px var(--field-border-color);
    outline: var(--vectis-focus-ring-width) solid transparent;
  }

  /* État invalide : pseudo-classe native d'abord, prop (aria-invalid) ensuite.
     Seule la variable change → la bordure ET le ring focus passent en rouge. */
  .v-textarea-field:has(.v-textarea-control:user-invalid),
  .v-textarea-field:has(.v-textarea-control[aria-invalid='true']) {
    --field-border-color: var(--vectis-color-danger);
  }

  /* Boutons internes (effacer, icône cliquable) : gris foncé → noir au hover,
     radius aligné sur Button (focus ring carré aux bords arrondis) */
  .v-textarea-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--control-action-size);
    height: var(--control-action-size);
    margin-inline: calc(var(--vectis-space-1) * -1);
    padding: 0;
    border: none;
    background: transparent;
    color: var(--vectis-color-text-muted);
    border-radius: var(--vectis-radius-interactive);
    cursor: pointer;
    flex: none;
    transition: color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-textarea-action:hover:not(:disabled) {
    color: var(--vectis-color-text);
  }

  .v-textarea-action:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: calc(var(--vectis-focus-ring-offset) * -1);
  }

  /* Readonly : fond légèrement enfoncé, texte normal (la valeur reste lisible),
     focus accent conservé. [data-readonly] et jamais :read-only (matche :disabled). */
  .v-textarea[data-readonly] .v-textarea-field {
    --field-border-color: var(--vectis-color-border);

    background: var(--vectis-color-surface-sunken);
  }

  /* Disabled : nuance de gris sans opacité (mêmes tokens que Checkbox/Radio).
     Placé après les états erreur/readonly : à spécificité égale, il gagne. */
  .v-textarea[data-disabled] .v-textarea-field {
    --field-border-color: var(--vectis-color-border);

    background: var(--vectis-color-surface-muted);
    color: var(--vectis-color-text-subtle);
    cursor: not-allowed;
    resize: none;
  }

  .v-textarea[data-disabled] .v-textarea-label,
  .v-textarea[data-disabled] .v-textarea-hint,
  .v-textarea[data-disabled] .v-textarea-counter {
    color: var(--vectis-color-text-subtle);
  }

  .v-textarea[data-disabled] .v-textarea-action,
  .v-textarea[data-disabled] .v-textarea-field > .v-icon {
    color: inherit;
    cursor: not-allowed;
  }

  .v-textarea-control:disabled {
    cursor: not-allowed;
  }

  /* Auto-grow 100 % CSS : la hauteur du contrôle suit le contenu (progressive
     enhancement), le field suit ; plus de poignée de redimensionnement */
  .v-textarea-field[data-auto-grow] {
    resize: none;
  }

  .v-textarea-field[data-auto-grow] .v-textarea-control {
    field-sizing: content;
  }

  /* --- Tailles : seul le padding-block reste local, le reste vient de
     v-control ; suit la formule (hauteur - 1lh) / 2 par cran --- */
  .v-textarea[data-size='sm'] .v-textarea-field {
    padding-block: var(--vectis-space-1);
  }

  .v-textarea[data-size='lg'] .v-textarea-field {
    padding-block: var(--vectis-space-3);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-textarea-field,
    .v-textarea-action {
      transition: none;
    }
  }
}
</style>
