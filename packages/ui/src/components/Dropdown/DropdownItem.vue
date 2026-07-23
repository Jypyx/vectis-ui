<script setup lang="ts">
import { computed, inject, onBeforeUnmount, ref, useId, useSlots } from 'vue'

import Icon from '../Icon/Icon.vue'
import { iconProps } from '../Icon/iconProps'
import DropdownPanel from './DropdownPanel.vue'
import { dropdownKey, SUBMENU_HOVER_DELAY } from './context'

/**
 * Item de menu (role="menuitem"). tabindex="-1" : le focus est piloté par le
 * panneau (roving focus). La sélection émet `select` puis ferme toute la pile
 * via le contexte injecté. Avec `href`, l'item est un <a> (item de navigation,
 * permis par ARIA) ; un <a> n'a pas de `disabled` natif → pattern « lien
 * inerte » de Button (href retiré + aria-disabled).
 *
 * Avec le slot #submenu, l'item devient l'invocateur `popovertarget` d'un
 * panneau imbriqué (= son ancre implicite ; le panneau est un descendant DOM
 * du panneau parent → pile native de popovers : light dismiss total, ouvrir
 * une branche sœur ferme l'autre, fermeture en cascade). `href`, `iconEnd`
 * (remplacé par un chevron) et `select` sont alors ignorés. JS justifié :
 * ouverture clavier (Flèche droite/Entrée/Espace + focus du 1er sous-item)
 * et survol avec délai d'intention — le clic passe par le toggle natif.
 */
interface DropdownItemProps {
  /** Libellé de l'item (le slot #default prime). */
  label?: string
  /** Sous-libellé sous le label (le slot #sublabel prime). */
  sublabel?: string
  /**
   * Icône avant le libellé : nom Material Symbols Rounded, ou URL
   * d'image/SVG (toute valeur contenant '.', '/' ou ':' est traitée comme
   * une URL). Le slot #start prime.
   */
  iconStart?: string
  /** Icône après le libellé (même détection). Le slot #end prime. */
  iconEnd?: string
  /** État sélectionné (couleurs accent + aria-current). */
  selected?: boolean
  /** Item destructif (couleur danger). */
  danger?: boolean
  disabled?: boolean
  /** Rendu <a role="menuitem"> (item de navigation). disabled → lien inerte. */
  href?: string
}

// Racine multi-nœuds quand #submenu est présent (item + panneau imbriqué) :
// les attrs (name, aria-*, class…) vont explicitement sur l'item.
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<DropdownItemProps>(), {
  label: undefined,
  sublabel: undefined,
  iconStart: undefined,
  iconEnd: undefined,
  selected: false,
  danger: false,
  disabled: false,
  href: undefined,
})

const emit = defineEmits<{
  /** Émis à l'activation (clic ou Entrée/Espace), avant fermeture du menu. */
  select: []
}>()

defineSlots<{
  /** Libellé de l'item (prime sur la prop `label`). */
  default?(): unknown
  /** Sous-libellé (prime sur la prop `sublabel`). */
  sublabel?(): unknown
  /** Contenu libre avant le libellé (prime sur `iconStart`). */
  start?(): unknown
  /** Contenu libre après le libellé (prime sur `iconEnd`). */
  end?(): unknown
  /** Contenu du sous-menu (DropdownItem/DropdownGroup/DropdownSeparator, récursif). */
  submenu?(): unknown
}>()

const slots = useSlots()
const hasSubmenu = computed(() => !!slots.submenu)
const tag = computed(() =>
  !hasSubmenu.value && props.href !== undefined ? ('a' as const) : ('button' as const),
)

const dropdown = inject(dropdownKey, null)

function onClick() {
  if (props.disabled || hasSubmenu.value) return
  emit('select')
  dropdown?.closeAll()
}

// ——— Sous-menu ———
const subId = useId()
const subOpen = ref(false)
const subPanel = ref<InstanceType<typeof DropdownPanel> | null>(null)
// Ouvertures programmatiques : l'item est passé en `source` à showPopover(),
// sinon le sous-panneau n'a pas d'ancre implicite (posée nativement au clic
// seulement) et perd son positionnement.
const itemEl = ref<HTMLElement | null>(null)

// Ouverture clavier : le toggle natif ne couvre que le clic.
function onKeydown(event: KeyboardEvent) {
  if (!hasSubmenu.value || props.disabled) return
  if (!['ArrowRight', 'Enter', ' '].includes(event.key)) return
  // bloque l'activation native du bouton (clic synthétique → toggle) : on
  // ouvre nous-mêmes pour pouvoir focuser le premier sous-item
  event.preventDefault()
  subPanel.value?.show(itemEl.value ?? undefined)
  subPanel.value?.focusFirst()
}

// Survol avec délai d'intention : timers annulés au unmount (modèle Tooltip).
// La fermeture est refusée si le focus est dans le sous-panneau — un pointeur
// qui traîne ne doit pas couper un utilisateur clavier.
let openTimer: ReturnType<typeof setTimeout> | undefined
let closeTimer: ReturnType<typeof setTimeout> | undefined

function clearTimers() {
  clearTimeout(openTimer)
  clearTimeout(closeTimer)
}

function onPointerEnter() {
  if (props.disabled) return
  // le survol pilote aussi le focus : hover et roving focus restent
  // synchronisés, une seule surbrillance à la fois (pattern menu)
  itemEl.value?.focus({ preventScroll: true })
  if (!hasSubmenu.value) return
  clearTimers()
  openTimer = setTimeout(() => subPanel.value?.show(itemEl.value ?? undefined), SUBMENU_HOVER_DELAY)
}

function onPointerLeave() {
  if (!hasSubmenu.value) return
  clearTimers()
  closeTimer = setTimeout(() => {
    if (subPanel.value?.el?.contains(document.activeElement)) return
    subPanel.value?.hide()
  }, SUBMENU_HOVER_DELAY)
}

onBeforeUnmount(clearTimers)
</script>

<template>
  <component
    :is="tag"
    ref="itemEl"
    v-bind="$attrs"
    role="menuitem"
    tabindex="-1"
    class="ds-dropdown-item"
    :type="tag === 'button' ? 'button' : undefined"
    :disabled="tag === 'button' ? disabled : undefined"
    :href="tag === 'a' && !disabled ? href : undefined"
    :aria-disabled="tag === 'a' && disabled ? 'true' : undefined"
    :data-danger="danger ? '' : undefined"
    :data-selected="selected ? '' : undefined"
    :aria-current="selected ? 'true' : undefined"
    :aria-haspopup="hasSubmenu ? 'menu' : undefined"
    :aria-expanded="hasSubmenu ? subOpen : undefined"
    :aria-controls="hasSubmenu ? subId : undefined"
    :popovertarget="hasSubmenu ? subId : undefined"
    @click="onClick"
    @keydown="onKeydown"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
  >
    <slot name="start">
      <Icon v-if="iconStart" v-bind="iconProps(iconStart)" />
    </slot>
    <span class="ds-dropdown-item-content">
      <span class="ds-dropdown-item-label"
        ><slot>{{ label }}</slot></span
      >
      <span v-if="sublabel !== undefined || $slots.sublabel" class="ds-dropdown-item-sublabel">
        <slot name="sublabel">{{ sublabel }}</slot>
      </span>
    </span>
    <!-- un item à sous-menu signale l'ouverture latérale : chevron, jamais iconEnd -->
    <Icon v-if="hasSubmenu" name="chevron_right" class="ds-dropdown-item-chevron" />
    <slot v-else name="end">
      <Icon v-if="iconEnd" v-bind="iconProps(iconEnd)" />
    </slot>
  </component>
  <DropdownPanel
    v-if="hasSubmenu"
    :id="subId"
    ref="subPanel"
    placement="right-start"
    submenu
    @toggle="subOpen = $event"
    @pointerenter="clearTimers"
    @pointerleave="onPointerLeave"
  >
    <slot name="submenu" />
  </DropdownPanel>
</template>

<style>
@layer ds.components {
  .ds-dropdown-item {
    display: flex;
    align-items: center;
    gap: var(--ds-space-2);
    width: 100%;
    min-height: calc(
      var(--_dropdown-item-min-h, var(--ds-control-height-sm)) - var(--_dropdown-item-delta, 0px)
    );
    padding: var(--ds-space-1) var(--_dropdown-item-pad-i, var(--ds-space-3));
    border: none;
    background: transparent;
    color: var(--ds-color-text);
    border-radius: var(--ds-radius-sm);
    font-family: inherit;
    font-size: var(--ds-font-size-sm);
    line-height: var(--ds-font-leading-snug);
    text-align: start;
    text-decoration: none;
    cursor: pointer;
  }

  .ds-dropdown-item-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .ds-dropdown-item-sublabel {
    font-size: var(--ds-font-size-xs);
    color: var(--ds-color-text-muted);
  }

  .ds-dropdown-item-chevron {
    color: var(--ds-color-text-muted);
  }

  .ds-dropdown-item-chevron:dir(rtl) {
    transform: scaleX(-1);
  }

  /* Le focus EST la surbrillance (roving focus programmatique → :focus, pas :focus-visible) */
  .ds-dropdown-item:hover:not(:disabled, [aria-disabled='true']),
  .ds-dropdown-item:focus {
    background: var(--ds-color-surface-muted);
    outline: none;
  }

  /* sous-menu ouvert : la surbrillance persiste sur l'item parent */
  .ds-dropdown-item[aria-expanded='true'] {
    background: var(--ds-color-surface-muted);
  }

  .ds-dropdown-item[data-selected] {
    background: var(--ds-color-accent-surface);
    color: var(--ds-color-accent-text);
  }

  .ds-dropdown-item[data-selected] .ds-dropdown-item-sublabel {
    color: inherit;
  }

  .ds-dropdown-item[data-selected]:hover:not(:disabled, [aria-disabled='true']),
  .ds-dropdown-item[data-selected]:focus,
  .ds-dropdown-item[data-selected][aria-expanded='true'] {
    /* assombrit légèrement la surface accent (modèle Button tonal) */
    background: color-mix(in oklab, var(--ds-color-accent-surface), var(--ds-color-accent-text) 8%);
  }

  .ds-dropdown-item[data-danger] {
    color: var(--ds-color-danger-text);
  }

  .ds-dropdown-item[data-danger] .ds-dropdown-item-sublabel {
    color: inherit;
  }

  .ds-dropdown-item[data-danger]:hover:not(:disabled, [aria-disabled='true']),
  .ds-dropdown-item[data-danger]:focus,
  .ds-dropdown-item[data-danger][aria-expanded='true'] {
    background: var(--ds-color-danger-surface);
  }

  /* :disabled ne s'applique qu'au <button> ; le lien inerte passe par aria-disabled */
  .ds-dropdown-item:disabled,
  .ds-dropdown-item[aria-disabled='true'] {
    background: transparent;
    color: var(--ds-color-text-subtle);
    cursor: not-allowed;
  }

  .ds-dropdown-item:disabled .ds-dropdown-item-sublabel,
  .ds-dropdown-item[aria-disabled='true'] .ds-dropdown-item-sublabel {
    color: inherit;
  }
}
</style>
