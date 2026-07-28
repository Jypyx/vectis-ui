<script setup lang="ts">
import { computed, inject, useSlots } from 'vue'

import Button from '../Button/Button.vue'
import Icon from '../Icon/Icon.vue'
import { iconProps } from '../Icon/iconProps'
import { tabsKey } from './context'

/**
 * Un onglet. C'est un `Button` : tone, variante, taille, focus et
 * désactivation viennent de lui, seuls les attributs ARIA du pattern tabs sont
 * ajoutés (ils traversent le fallthrough de Button jusqu'au <button> rendu).
 *
 * L'onglet reste rendu hors d'un `Tabs` (comme AccordionItem hors Accordion),
 * simplement jamais sélectionné.
 */
interface TabProps {
  /** Identifie l'onglet et le `TabPanel` correspondant. */
  value: string | number
  /** Libellé visible ; le slot par défaut prime. */
  label?: string
  /** Icône de début : nom Material Symbols ou URL. */
  icon?: string
  /** Onglet inerte : ni cliquable ni atteignable, gris par tokens. */
  disabled?: boolean
}

const props = withDefaults(defineProps<TabProps>(), {
  label: undefined,
  icon: undefined,
  disabled: false,
})

defineSlots<{
  /** Contenu libre de l'onglet (remplace `label`). */
  default?(): unknown
}>()

const slots = useSlots()
const tabs = inject(tabsKey, null)

const selected = computed(() => tabs != null && tabs.value === props.value)
const tabId = computed(() => tabs?.tabId(props.value))
const panelId = computed(() => (tabs?.hasPanels ? tabs.panelId(props.value) : undefined))

/** Aucun libellé visible : l'onglet se réduit à un carré, comme un IconButton. */
const iconOnly = computed(() => Boolean(props.icon) && !props.label && !slots.default)

/*
 * Activation automatique (option APG) : la sélection suit le focus. Elle vit
 * ici et non dans le handler clavier de Tabs, qui devrait sinon faire transiter
 * la valeur par un attribut du DOM — et perdrait l'union `string | number`.
 */
function onFocus() {
  if (tabs?.activation === 'automatic' && !props.disabled) tabs.select(props.value)
}
</script>

<template>
  <Button
    :id="tabId"
    class="ds-tab"
    role="tab"
    :aria-selected="selected ? 'true' : 'false'"
    :aria-controls="panelId"
    :tabindex="selected ? 0 : -1"
    :variant="selected && tabs?.variant === 'inset' ? 'elevated' : 'ghost'"
    :tone="selected ? (tabs?.tone ?? 'accent') : 'neutral'"
    :size="tabs?.size ?? 'md'"
    :compact="tabs?.compact ?? false"
    :disabled="disabled"
    :data-icon-only="iconOnly ? '' : undefined"
    @click="tabs?.select(value)"
    @focus="onFocus"
  >
    <template v-if="icon" #start>
      <Icon v-bind="iconProps(icon)" />
    </template>
    <!-- le libellé est enveloppé : `text-overflow` ne s'applique pas au texte
         anonyme d'un conteneur flex, et `grow` doit pouvoir le tronquer -->
    <span v-if="!iconOnly" class="ds-tab-label"
      ><slot>{{ label }}</slot></span
    >
  </Button>
</template>

<style>
@layer ds.components {
  /*
   * Surcharges de Button qualifiées par [data-size] (toujours rendu par
   * Button) : elles battent .ds-button[data-variant='…'] quel que soit l'ordre
   * du CSS bundlé — même hack de spécificité que .ds-icon-button.
   */
  .ds-tab[data-size] {
    /* ancre de l'indicateur ::after ; .ds-button ne pose pas de position */
    position: relative;
    /*
     * Jamais compressé : c'est CE QUI produit le débordement de la liste. Sans
     * `flex: none`, les onglets rétréciraient jusqu'à leur taille min-content
     * et le défilement ne se déclencherait jamais.
     */
    flex: none;
    white-space: nowrap;
  }

  .ds-tab[data-size][data-icon-only] {
    padding-inline: 0;
    min-inline-size: var(--_control-height);
  }

  /*
   * L'onglet vit dans un conteneur `overflow: auto` qui rognerait un
   * outline-offset positif : anneau intérieur.
   */
  .ds-tab[data-size]:focus-visible {
    outline-offset: calc(var(--ds-focus-ring-offset) * -1);
  }

  .ds-tab-label {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ds-tabs[data-grow] .ds-tab[data-size] {
    flex: 1 1 0;
    min-inline-size: 0;
  }

  /* Rayon emboîté dans la piste creuse (rayon de surface moins son padding) */
  .ds-tabs[data-variant='inset'] .ds-tab[data-size] {
    border-radius: calc(var(--ds-radius-surface) - var(--ds-space-1));
  }

  /*
   * Indicateur de la variante `line`. `currentColor` plutôt qu'une variable
   * privée de Button : il suit le tone de l'onglet actif ET le gris de l'état
   * désactivé, sans couplage.
   */
  .ds-tabs[data-variant='line'] .ds-tab[data-size]::after {
    content: '';
    position: absolute;
    inset-inline: 0;
    inset-block-end: 0;
    block-size: var(--ds-control-size-tab-indicator);
    background: currentColor;
    opacity: 0;
    transition: opacity var(--ds-duration-fast) var(--ds-ease-default);
  }

  .ds-tabs[data-variant='line'][data-orientation='vertical'] .ds-tab[data-size]::after {
    inset-block: 0;
    inset-inline: auto;
    inset-inline-start: 0;
    block-size: auto;
    inline-size: var(--ds-control-size-tab-indicator);
  }

  .ds-tabs[data-variant='line'] .ds-tab[data-size][aria-selected='true']::after {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-tabs[data-variant='line'] .ds-tab[data-size]::after {
      transition: none;
    }
  }
}
</style>
