<script setup lang="ts">
/**
 * Zone de texte complète : label, icônes internes (cliquables), compteur,
 * limite souple, loading, clearable — autour d'un <textarea> natif stylé.
 * Miroir d'Input avec deux différences : `autoGrow` (pur CSS, `field-sizing:
 * content`) et le compteur rendu SOUS le champ (ligne meta avec le hint),
 * jamais dedans. Pas de prop pattern : <textarea> ne le supporte pas
 * nativement et on ne l'émule pas (décision projet).
 *
 * Racine wrapper (label + champ + meta) → `inheritAttrs: false` : les
 * attributs natifs sont reportés sur le <textarea> via v-bind, SAUF
 * class/style qui restent sur la racine (les consommateurs dimensionnent le
 * composant entier — dérogation volontaire au pattern wrapper de CLAUDE.md).
 *
 * Validation native : `required`/`minlength` passent en fallthrough et
 * `:user-invalid` fait le style d'erreur sans JS ; la prop `invalid` force
 * l'état (validation serveur) via aria-invalid. La limite souple passe par
 * setCustomValidity : le rouge (:user-invalid) n'apparaît qu'après
 * interaction et la validité est exposée par l'API standard (el.validity).
 *
 * JS de comportement propre au composant : le pont v-model (defineModel) et le
 * clear + refocus (le bouton disparaît au clic, sinon le focus serait perdu).
 * Tout le reste est partagé avec l'autre champ du DS (Input) et vit dans
 * `composables/` : ids et aria-describedby (useFieldIds), split de $attrs
 * (useRootAttrs), icônes cliquables (useIconClickHandlers), compteur et limite
 * souple (useTextLimit).
 */
import { computed, ref } from 'vue'

import Icon from '../Icon/Icon.vue'
import Spinner from '../Spinner/Spinner.vue'
import Typography from '../Typography/Typography.vue'

import { useFieldIds } from '../../composables/useFieldIds'
import { useIconClickHandlers } from '../../composables/useIconClickHandlers'
import { useRootAttrs } from '../../composables/useRootAttrs'
import { useTextLimit } from '../../composables/useTextLimit'

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

// class/style sur la racine ; tout le reste sur le contrôle natif
const { attrs, rootClass, rootStyle, forwardedAttrs: restAttrs } = useRootAttrs()

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
    class="ds-textarea ds-control"
    :class="rootClass"
    :style="rootStyle"
    :data-size="size"
    :data-compact="compact ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
  >
    <Typography v-if="label" as="label" variant="label" class="ds-textarea-label" :for="fieldId">
      {{ label }}
    </Typography>

    <div class="ds-textarea-field" :data-auto-grow="autoGrow ? '' : undefined">
      <slot name="start">
        <button
          v-if="iconStart && hasIconStartHandler"
          type="button"
          class="ds-textarea-action"
          :aria-label="iconStartLabel ?? iconStart"
          :disabled="disabled"
          @click="emit('click:icon-start', $event)"
        >
          <Icon :name="iconStart" />
        </button>
        <Icon v-else-if="iconStart" :name="iconStart" />
      </slot>

      <textarea
        v-bind="restAttrs"
        :id="fieldId"
        ref="controlEl"
        v-model="model"
        class="ds-textarea-control"
        :maxlength="softLimit ? undefined : maxlength"
        :disabled="disabled"
        :readonly="readonly || undefined"
        :aria-invalid="invalid || undefined"
        :aria-describedby="describedBy"
      />

      <button
        v-if="showClear"
        type="button"
        class="ds-textarea-action ds-textarea-clear"
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
          class="ds-textarea-action"
          :aria-label="iconEndLabel ?? iconEnd"
          :disabled="disabled"
          @click="emit('click:icon-end', $event)"
        >
          <Icon :name="iconEnd" />
        </button>
        <Icon v-else-if="iconEnd" :name="iconEnd" />
      </slot>
    </div>

    <div v-if="hint || counter" class="ds-textarea-meta">
      <Typography v-if="hint" :id="hintId" variant="caption" tone="muted" class="ds-textarea-hint">
        {{ hint }}
      </Typography>
      <span v-if="counter" class="ds-textarea-counter" :data-over="over ? '' : undefined">
        {{ counterText }}
      </span>
    </div>
  </div>
</template>

<style>
@layer ds.components {
  .ds-textarea {
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-1);
    width: 100%;
    font-family: var(--ds-text-family);
  }

  /* Label et hint : rendus par Typography (label / caption muted) — les classes
     .ds-textarea-label/.ds-textarea-hint restent posées comme points d'accroche
     (surcharges consommateur, état disabled ci-dessous). */

  .ds-textarea-meta {
    display: flex;
    align-items: baseline;
    gap: var(--ds-space-2);
  }

  /* Le compteur reste stylé localement : tabular-nums et l'état de dépassement
     ne sont pas des rôles typographiques. */
  .ds-textarea-counter {
    margin-inline-start: auto;
    font-size: var(--ds-text-caption-size);
    color: var(--ds-color-text-muted);
    font-variant-numeric: tabular-nums;
  }

  .ds-textarea-counter[data-over] {
    color: var(--ds-color-danger-text);
  }

  /* Le field porte bordure, fond, focus ET le redimensionnement (resize exige
     overflow ≠ visible) ; --_border-color est la seule source de vérité de la
     couleur (hover/erreur/disabled la redéfinissent) */
  .ds-textarea-field {
    --_border-color: var(--ds-color-border-strong);

    /*
     * Tailles/compact : variables --_control-* héritées de la racine
     * ds-control (styles/control-size.css), contexte d'Icon compris.
     * Hauteur minimale = 2 lignes : base + hauteur effective — vaut 2×base
     * sans compact, 2×base - 4px avec (la hauteur effective porte le delta).
     */
    --_min-height: calc(var(--_control-height-base) + var(--_control-height));

    display: flex;
    align-items: flex-start;
    gap: var(--_control-gap);
    min-height: var(--_min-height);
    padding: var(--ds-space-2) var(--_control-padding-inline-field);
    background: var(--ds-color-surface);
    color: var(--ds-color-text);
    border: 1px solid var(--_border-color);
    border-radius: var(--ds-radius-interactive);
    font-size: var(--_control-font-size);
    /* texte multiligne : interlignage du corps de texte (le rôle `control`
       en leading-none ne vaut que pour les étiquettes d'une ligne) */
    line-height: var(--ds-text-body-md-leading);
    resize: vertical;
    overflow: hidden;
    transition:
      border-color var(--ds-duration-fast) var(--ds-ease-default),
      background-color var(--ds-duration-fast) var(--ds-ease-default),
      box-shadow var(--ds-duration-fast) var(--ds-ease-default);
  }

  .ds-textarea-control {
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

  .ds-textarea-control::placeholder {
    color: var(--ds-color-text-subtle);
  }

  /* icônes et boutons centrés sur la première ligne de texte */
  .ds-textarea-field > .ds-icon,
  .ds-textarea-field > .ds-spinner {
    margin-block-start: calc((1lh - var(--ds-icon-size)) / 2);
  }

  .ds-textarea-field > .ds-textarea-action {
    margin-block-start: calc((1lh - var(--_control-action-size)) / 2);
  }

  /* Icônes décoratives : gris foncé, moins présentes que le texte saisi */
  .ds-textarea-field > .ds-icon {
    color: var(--ds-color-text-muted);
  }

  /* le spinner (1em) remplit la taille d'icône du champ */
  .ds-textarea-field > .ds-spinner {
    font-size: var(--ds-icon-size);
  }

  .ds-textarea-field:hover:not(:has(.ds-textarea-control:focus)):not(
      :has(
        .ds-textarea-control:disabled,
        .ds-textarea-control:user-invalid,
        .ds-textarea-control[aria-invalid='true']
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
  .ds-textarea-field:has(.ds-textarea-control:focus) {
    --_border-color: var(--ds-color-accent);

    box-shadow: 0 0 0 1px var(--_border-color);
    outline: var(--ds-focus-ring-width) solid transparent;
  }

  /* État invalide : pseudo-classe native d'abord, prop (aria-invalid) ensuite.
     Seule la variable change → la bordure ET le ring focus passent en rouge. */
  .ds-textarea-field:has(.ds-textarea-control:user-invalid),
  .ds-textarea-field:has(.ds-textarea-control[aria-invalid='true']) {
    --_border-color: var(--ds-color-danger);
  }

  /* Boutons internes (effacer, icône cliquable) : gris foncé → noir au hover,
     radius aligné sur Button (focus ring carré aux bords arrondis) */
  .ds-textarea-action {
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

  .ds-textarea-action:hover:not(:disabled) {
    color: var(--ds-color-text);
  }

  .ds-textarea-action:focus-visible {
    outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color);
    outline-offset: calc(var(--ds-focus-ring-offset) * -1);
  }

  /* croix proportionnelle à la zone cliquable (16px dans 24px en md) */
  .ds-textarea-clear svg {
    inline-size: calc(var(--_control-action-size) - var(--ds-space-2));
    block-size: calc(var(--_control-action-size) - var(--ds-space-2));
  }

  /* Readonly : fond légèrement enfoncé, texte normal (la valeur reste lisible),
     focus accent conservé. [data-readonly] et jamais :read-only (matche :disabled). */
  .ds-textarea[data-readonly] .ds-textarea-field {
    --_border-color: var(--ds-color-border);

    background: var(--ds-color-surface-sunken);
  }

  /* Disabled : nuance de gris sans opacité (mêmes tokens que Checkbox/Radio).
     Placé après les états erreur/readonly : à spécificité égale, il gagne. */
  .ds-textarea[data-disabled] .ds-textarea-field {
    --_border-color: var(--ds-color-border);

    background: var(--ds-color-surface-muted);
    color: var(--ds-color-text-subtle);
    cursor: not-allowed;
    resize: none;
  }

  .ds-textarea[data-disabled] .ds-textarea-label,
  .ds-textarea[data-disabled] .ds-textarea-hint,
  .ds-textarea[data-disabled] .ds-textarea-counter {
    color: var(--ds-color-text-subtle);
  }

  .ds-textarea[data-disabled] .ds-textarea-action,
  .ds-textarea[data-disabled] .ds-textarea-field > .ds-icon {
    color: inherit;
    cursor: not-allowed;
  }

  .ds-textarea-control:disabled {
    cursor: not-allowed;
  }

  /* Auto-grow 100 % CSS : la hauteur du contrôle suit le contenu (progressive
     enhancement), le field suit ; plus de poignée de redimensionnement */
  .ds-textarea-field[data-auto-grow] {
    resize: none;
  }

  .ds-textarea-field[data-auto-grow] .ds-textarea-control {
    field-sizing: content;
  }

  /* --- Tailles : seul le padding-block reste local, le reste vient de
     ds-control ; suit la formule (hauteur - 1lh) / 2 par cran --- */
  .ds-textarea[data-size='sm'] .ds-textarea-field {
    padding-block: var(--ds-space-1);
  }

  .ds-textarea[data-size='lg'] .ds-textarea-field {
    padding-block: var(--ds-space-3);
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-textarea-field,
    .ds-textarea-action {
      transition: none;
    }
  }
}
</style>
