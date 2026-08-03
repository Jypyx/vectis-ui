<script setup lang="ts">
import { computed, inject, useSlots } from 'vue'

import Button from '../Button/Button.vue'
import Icon from '../Icon/Icon.vue'
import { iconProps } from '../Icon/iconProps'
import type { IconSource } from '../Icon/types'
import { toggleKey } from './context'
import type { ToggleValue } from './Toggle.vue'

/**
 * Un item de Toggle. C'est un `Button` : tone, variante, taille, focus et
 * désactivation viennent de lui, seul l'état bascule (`aria-pressed`) est
 * ajouté — il traverse le fallthrough de Button jusqu'au <button> rendu, qui
 * reste ainsi l'enfant direct exigé par la couture de ButtonGroup.
 *
 * L'item reste rendu hors d'un `Toggle` (comme Tab hors Tabs), simplement
 * jamais sélectionné.
 */
interface ToggleItemProps {
  /** Identifie l'item dans le v-model du groupe. Unique dans le groupe. */
  value: ToggleValue
  /** Libellé visible ; le slot par défaut prime. */
  label?: string
  /** Icône de début : nom, ou rendu explicite. */
  icon?: IconSource
  /** Item inerte : ni cliquable ni atteignable, gris par tokens. */
  disabled?: boolean
}

const props = withDefaults(defineProps<ToggleItemProps>(), {
  label: undefined,
  icon: undefined,
  disabled: false,
})

defineSlots<{
  /** Contenu libre de l'item (remplace `label`). */
  default?(): unknown
}>()

const slots = useSlots()
const toggle = inject(toggleKey, null)

const selected = computed(() => toggle != null && toggle.isSelected(props.value))

/** Aucun libellé visible : l'item se réduit à un carré, comme un IconButton. */
const iconOnly = computed(() => Boolean(props.icon) && !props.label && !slots.default)
</script>

<template>
  <!-- aria-pressed toujours posé (même à 'false') : c'est sa présence qui fait
       annoncer « bouton bascule ». `filled` posé directement sur Icon : la prop
       `iconFilled` de Button est sans effet sur les slots. -->
  <Button
    class="v-toggle-item"
    :aria-pressed="selected ? 'true' : 'false'"
    :variant="selected ? 'solid' : (toggle?.variant ?? 'ghost')"
    :tone="selected ? (toggle?.tone ?? 'accent') : 'neutral'"
    :size="toggle?.size ?? 'md'"
    :compact="toggle?.compact ?? false"
    :disabled="disabled || toggle?.disabled"
    :data-icon-only="iconOnly ? '' : undefined"
    @click="toggle?.select(value)"
  >
    <template v-if="icon" #start>
      <Icon v-bind="iconProps(icon)" :filled="selected && (toggle?.selectedIconFilled ?? false)" />
    </template>
    <slot v-if="!iconOnly">{{ label }}</slot>
  </Button>
</template>

<style>
@layer vectis.components {
  /*
   * Item réduit à son icône : carré, comme IconButton. [data-size] (toujours
   * rendu par Button) qualifie le sélecteur pour battre le padding de
   * .v-button[data-variant='…'] quel que soit l'ordre du CSS bundlé.
   */
  .v-toggle-item[data-size][data-icon-only] {
    padding-inline: 0;
    min-inline-size: var(--control-height);
  }
}
</style>
