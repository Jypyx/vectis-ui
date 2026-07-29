<script setup lang="ts">
import { computed, inject, ref, useId, useSlots } from 'vue'

import Icon from '../Icon/Icon.vue'
import { iconProps } from '../Icon/iconProps'
import type { IconSource } from '../Icon/types'
import MenuPanel from './MenuPanel.vue'
import { menuKey, SUBMENU_HOVER_DELAY } from './context'

import { useTimer } from '../../composables/useTimer'

/**
 * Item de menu (role="menuitem") : le focus est piloté par le panneau (roving
 * focus), la sélection ferme toute la pile via le contexte injecté. Avec
 * `href`, l'item est un <a> ; un <a> n'ayant pas de `disabled` natif, il passe
 * par le pont « lien inerte » (href retiré + aria-disabled).
 *
 * Avec le slot #submenu, l'item devient l'invocateur `popovertarget` d'un
 * panneau imbriqué (= son ancre implicite ; le panneau est un descendant DOM
 * du panneau parent → pile native de popovers : light dismiss total, ouvrir
 * une branche sœur ferme l'autre, fermeture en cascade). JS justifié :
 * ouverture clavier et survol avec délai d'intention — le clic passe par le
 * toggle natif.
 */
interface MenuItemProps {
  /** Libellé de l'item (le slot #default prime). */
  label?: string
  /** Sous-libellé sous le label (le slot #sublabel prime). */
  sublabel?: string
  /**
   * Icône avant le libellé : nom Material Symbols Rounded, ou URL
   * d'icône, ou rendu explicite (`{ src }`, `{ component }`…). Le slot #start
   * prime.
   */
  iconStart?: IconSource
  /** Icône après le libellé (mêmes formes). Le slot #end prime. */
  iconEnd?: IconSource
  /** État sélectionné (accent + aria-current). */
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

const props = withDefaults(defineProps<MenuItemProps>(), {
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
  /** Contenu du sous-menu (MenuItem/MenuGroup/MenuSeparator, récursif). */
  submenu?(): unknown
}>()

const slots = useSlots()
const hasSubmenu = computed(() => !!slots.submenu)
const tag = computed(() =>
  !hasSubmenu.value && props.href !== undefined ? ('a' as const) : ('button' as const),
)

const menu = inject(menuKey, null)

function onClick() {
  if (props.disabled || hasSubmenu.value) return
  emit('select')
  menu?.closeAll()
}

const subId = useId()
const subOpen = ref(false)
const subPanel = ref<InstanceType<typeof MenuPanel> | null>(null)
// Ouvertures programmatiques : l'item est passé en `source` à showPopover(),
// sinon le sous-panneau n'a pas d'ancre implicite (posée nativement au clic
// seulement) et perd son positionnement.
const itemEl = ref<HTMLElement | null>(null)

// Ouverture clavier : le toggle natif ne couvre que le clic.
function onKeydown(event: KeyboardEvent) {
  if (!hasSubmenu.value || props.disabled) return
  if (!['ArrowRight', 'Enter', ' '].includes(event.key)) return
  // bloque l'activation native du bouton (clic synthétique → toggle) : on
  event.preventDefault()
  subPanel.value?.show(itemEl.value ?? undefined)
  subPanel.value?.focusFirst()
}

// Survol avec délai d'intention (cf. useTimer). Une seule instance : ouverture
// et fermeture s'excluent — armer l'une annule toujours l'autre.
// La fermeture est refusée si le focus est dans le sous-panneau : un pointeur
// qui traîne ne doit pas couper un utilisateur clavier.
const hoverTimer = useTimer()

function onPointerEnter() {
  if (props.disabled) return
  // le survol pilote aussi le focus : hover et roving focus restent
  // synchronisés, une seule surbrillance à la fois (pattern menu)
  itemEl.value?.focus({ preventScroll: true })
  if (!hasSubmenu.value) return
  hoverTimer.start(() => subPanel.value?.show(itemEl.value ?? undefined), SUBMENU_HOVER_DELAY)
}

function onPointerLeave() {
  if (!hasSubmenu.value) return
  hoverTimer.start(() => {
    if (subPanel.value?.el?.contains(document.activeElement)) return
    subPanel.value?.hide()
  }, SUBMENU_HOVER_DELAY)
}
</script>

<template>
  <component
    :is="tag"
    ref="itemEl"
    v-bind="$attrs"
    role="menuitem"
    tabindex="-1"
    class="ds-menu-item"
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
    <span class="ds-menu-item-content">
      <span class="ds-menu-item-label"
        ><slot>{{ label }}</slot></span
      >
      <span v-if="sublabel !== undefined || $slots.sublabel" class="ds-menu-item-sublabel">
        <slot name="sublabel">{{ sublabel }}</slot>
      </span>
    </span>
    <!-- un item à sous-menu signale l'ouverture latérale : chevron, jamais iconEnd -->
    <Icon v-if="hasSubmenu" name="chevron_right" class="ds-menu-item-chevron" />
    <slot v-else name="end">
      <Icon v-if="iconEnd" v-bind="iconProps(iconEnd)" />
    </slot>
  </component>
  <MenuPanel
    v-if="hasSubmenu"
    :id="subId"
    ref="subPanel"
    placement="right-start"
    submenu
    @toggle="subOpen = $event"
    @pointerenter="hoverTimer.cancel()"
    @pointerleave="onPointerLeave"
  >
    <slot name="submenu" />
  </MenuPanel>
</template>

<style>
@layer ds.components {
  .ds-menu-item {
    /*
     * Taille : variables `--_control-*` héritées du panneau racine, qui porte
     * `ds-control` (styles/control-size.css) — une seule table pour tout le
     * DS. Les icônes suivent sans rien écrire : `--ds-icon-size`/`-opsz` font
     * partie du même bloc et héritent aussi.
     *
     * Seule la typo est composite : la TAILLE vient de l'échelle, le leading
     * reste celui de `body-md` (ratio unitless, donc il suit) et le poids
     * reste regular. Pas la recette `control` complète : elle vaut medium/1,
     * or une rangée peut passer à la ligne et porter un sous-libellé.
     */
    display: flex;
    align-items: center;
    gap: var(--_control-gap);
    width: 100%;
    min-height: var(--_control-height);
    padding: var(--ds-space-1) var(--_control-padding-inline);
    border: none;
    background: transparent;
    color: var(--ds-color-text);
    border-radius: var(--ds-radius-sm);
    font-family: inherit;
    font-size: var(--_control-font-size);
    line-height: var(--ds-text-body-md-leading);
    text-align: start;
    text-decoration: none;
    cursor: pointer;
  }

  .ds-menu-item-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .ds-menu-item-sublabel {
    font-size: var(--ds-text-caption-size);
    color: var(--ds-color-text-muted);
  }

  .ds-menu-item-chevron {
    color: var(--ds-color-text-muted);
  }

  .ds-menu-item-chevron:dir(rtl) {
    transform: scaleX(-1);
  }

  /* Le focus EST la surbrillance (roving focus programmatique → :focus, pas :focus-visible) */
  .ds-menu-item:hover:not(:disabled, [aria-disabled='true']),
  .ds-menu-item:focus {
    background: var(--ds-color-surface-muted);
    outline: none;
  }

  /* sous-menu ouvert : la surbrillance persiste sur l'item parent */
  .ds-menu-item[aria-expanded='true'] {
    background: var(--ds-color-surface-muted);
  }

  .ds-menu-item[data-selected] {
    background: var(--ds-color-accent-surface);
    color: var(--ds-color-accent-text);
  }

  .ds-menu-item[data-selected] .ds-menu-item-sublabel {
    color: inherit;
  }

  .ds-menu-item[data-selected]:hover:not(:disabled, [aria-disabled='true']),
  .ds-menu-item[data-selected]:focus,
  .ds-menu-item[data-selected][aria-expanded='true'] {
    /* assombrit légèrement la surface accent */
    background: color-mix(in oklab, var(--ds-color-accent-surface), var(--ds-color-accent-text) 8%);
  }

  .ds-menu-item[data-danger] {
    color: var(--ds-color-danger-text);
  }

  .ds-menu-item[data-danger] .ds-menu-item-sublabel {
    color: inherit;
  }

  .ds-menu-item[data-danger]:hover:not(:disabled, [aria-disabled='true']),
  .ds-menu-item[data-danger]:focus,
  .ds-menu-item[data-danger][aria-expanded='true'] {
    background: var(--ds-color-danger-surface);
  }

  /* :disabled ne s'applique qu'au <button> ; le lien inerte passe par aria-disabled */
  .ds-menu-item:disabled,
  .ds-menu-item[aria-disabled='true'] {
    background: transparent;
    color: var(--ds-color-text-subtle);
    cursor: not-allowed;
  }

  .ds-menu-item:disabled .ds-menu-item-sublabel,
  .ds-menu-item[aria-disabled='true'] .ds-menu-item-sublabel {
    color: inherit;
  }
}
</style>
