<script setup lang="ts">
import { Comment, Fragment, Text, computed, provide, useSlots } from 'vue'
import type { StyleValue, VNode } from 'vue'

import Avatar from './Avatar.vue'
import type { AvatarSize } from './Avatar.vue'
import { avatarGroupKey } from './context'

/**
 * Empile des Avatar (celui de droite passe par-dessus celui de gauche, via un
 * chevauchement négatif + l'ordre de peinture DOM naturel — aucun JS de
 * positionnement). L'anneau `--_ring-color` sépare visuellement les disques.
 *
 * JS justifié : compter/tronquer les enfants du slot (impossible en HTML/CSS)
 * pour l'agrégat « +X » ; la propagation taille/compact passe par provide.
 */
interface AvatarGroupProps {
  /** Nombre max d'Avatars affichés avant l'agrégat « +X » (0/absent = tous). */
  max?: number
  /** Taille propagée aux Avatars enfants (sauf prop `size` explicite sur l'enfant). */
  size?: AvatarSize
  /** Compact propagé aux Avatars enfants. */
  compact?: boolean
  /** Couleur de l'anneau de séparation (défaut : fond de page). */
  ringColor?: string
}

const props = withDefaults(defineProps<AvatarGroupProps>(), {
  max: undefined,
  size: undefined,
  compact: false,
  ringColor: undefined,
})

defineSlots<{
  /** Les Avatars à empiler. */
  default?(): unknown
  /** Agrégat des Avatars masqués ; `count` = nombre restant. */
  overflow?(props: { count: number }): unknown
}>()

provide(avatarGroupKey, {
  get size() {
    return props.size
  },
  get compact() {
    return props.compact
  },
})

const slots = useSlots()

// Aplatit les VNodes du slot : les Fragments (v-for) sont dépliés, les
// commentaires (v-if faux) et textes blancs ignorés — pour un comptage exact.
const flatten = (nodes: VNode[] | undefined): VNode[] => {
  const out: VNode[] = []
  for (const node of nodes ?? []) {
    if (node.type === Fragment) {
      out.push(...flatten(node.children as VNode[]))
    } else if (node.type === Comment) {
      continue
    } else if (node.type === Text && !String(node.children).trim()) {
      continue
    } else {
      out.push(node)
    }
  }
  return out
}

const items = computed(() => flatten(slots.default?.()))
const visibleItems = computed(() =>
  props.max != null ? items.value.slice(0, props.max) : items.value,
)
const overflowCount = computed(() => items.value.length - visibleItems.value.length)

// Composant fonctionnel : rend les VNodes déjà capturés (impossible via
// <component :is> qui attend une définition, pas un vnode).
const VisibleAvatars = () => visibleItems.value

const rootStyle = computed<StyleValue>(() =>
  props.ringColor !== undefined ? { '--_ring-color': props.ringColor } : undefined,
)

// Le groupe porte ds-control pour définir --_control-height à SON niveau : le
// chevauchement reste calculable même si un enfant est enveloppé (ex. un
// Tooltip pose un <span> entre le groupe et l'Avatar). Un Avatar de taille
// propre redéfinit --_control-height sur lui-même → son overlap suit sa taille.
const resolvedGroupSize = computed<AvatarSize>(() => props.size ?? 'md')
</script>

<template>
  <div
    class="ds-avatar-group ds-control"
    role="group"
    :style="rootStyle"
    :data-size="resolvedGroupSize"
    :data-compact="compact ? '' : undefined"
  >
    <component :is="VisibleAvatars" />
    <slot v-if="overflowCount > 0" name="overflow" :count="overflowCount">
      <Avatar>+{{ overflowCount }}</Avatar>
    </slot>
  </div>
</template>

<style>
@layer ds.components {
  .ds-avatar-group {
    /* anneau de séparation hérité par chaque .ds-avatar enfant */
    --_ring-color: var(--ds-color-surface);
    display: inline-flex;
    align-items: center;
  }

  /* Chevauchement : chaque disque mord sur le précédent ; l'ordre DOM fait que
     le suivant (à droite) peint par-dessus. Cible l'enfant direct quel qu'il
     soit (Avatar nu OU wrapper d'un Tooltip) → --_control-height vient du
     groupe, un Avatar de taille propre l'écrase sur lui-même. Ratio unitless. */
  .ds-avatar-group > * + * {
    margin-inline-start: calc(var(--_control-height) * -0.3);
  }

  /* Au survol/focus, l'élément remonte au-dessus de ses voisins. */
  .ds-avatar-group > *:hover,
  .ds-avatar-group > *:focus-within {
    z-index: 1;
  }
}
</style>
