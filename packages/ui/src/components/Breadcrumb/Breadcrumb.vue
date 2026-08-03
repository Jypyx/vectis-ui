<script setup lang="ts">
import { computed } from 'vue'

import Icon from '../Icon/Icon.vue'
import { iconProps } from '../Icon/iconProps'
import type { IconSource } from '../Icon/types'
import IconButton from '../IconButton/IconButton.vue'
import Menu from '../Menu/Menu.vue'
import MenuItem from '../Menu/MenuItem.vue'

import { useAriaLabel } from '../../composables/useAriaLabel'
import { useMessages } from '../../i18n/state'

/**
 * Fil d'Ariane : <nav> + liste ordonnée, piloté par la prop `items` (pure
 * dérivation de données, aucune API navigateur — SSR-safe). Les séparateurs
 * sont des Icon décoratifs (aria-hidden), le premier est masqué en CSS.
 * L'item actif est dérivé de `currentPath` (aria-current="page" sur l'item
 * au href correspondant, qui reste un lien cliquable — pattern ARIA APG).
 * Au-delà de `maxItems`, les items intermédiaires sont repliés dans un
 * Menu ouvert par un bouton « … ».
 */
export interface BreadcrumbItem {
  /** Libellé du segment. */
  label: string
  /** Destination du segment ; comparée à `currentPath` pour aria-current. */
  href: string
  /**
   * Icône avant le libellé : nom Material Symbols Rounded, ou URL
   * d'icône, ou rendu explicite (`{ src: '/logo.svg' }`, `{ component }`…).
   */
  iconStart?: IconSource
}

interface BreadcrumbProps {
  /** Les segments, du plus général au plus profond. */
  items: BreadcrumbItem[]
  /** Nom accessible de la navigation. Défaut : dictionnaire du DS. */
  label?: string
  /** Chemin courant ; l'item dont le href correspond reçoit aria-current="page". */
  currentPath?: string
  /** Séparateur : nom d'icône, ou rendu explicite (comme `iconStart`). */
  separator?: IconSource
  /**
   * Au-delà de ce nombre d'items : 1er + « … » + avant-dernier + dernier ;
   * le menu du bouton « … » liste uniquement les items masqués. Minimum
   * effectif : 3.
   */
  maxItems?: number
  /** Libellé accessible du bouton d'ellipsis. Défaut : dictionnaire du DS. */
  ellipsisLabel?: string
}

const props = withDefaults(defineProps<BreadcrumbProps>(), {
  label: undefined,
  currentPath: undefined,
  separator: 'chevron_right',
  maxItems: undefined,
  ellipsisLabel: undefined,
})

const m = useMessages()
const ariaLabel = useAriaLabel(() => props.label ?? m.value.breadcrumb.label)
const resolvedEllipsisLabel = computed(() => props.ellipsisLabel ?? m.value.breadcrumb.ellipsis)

/** Normalisation pure (SSR-safe) : slash final retiré, sauf pour '/'. */
function normalize(path: string): string {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
}

function isCurrent(item: BreadcrumbItem): boolean {
  if (props.currentPath === undefined) return false
  return normalize(item.href) === normalize(props.currentPath)
}

const truncated = computed(
  () => props.maxItems !== undefined && props.items.length > Math.max(props.maxItems, 3),
)
/** Items repliés dans le menu (du 2e à l'anté-avant-dernier). */
const hiddenItems = computed(() => (truncated.value ? props.items.slice(1, -2) : []))
/** Items affichés dans la liste ; tronqué : 1er + avant-dernier + dernier. */
const visibleItems = computed(() =>
  truncated.value ? [props.items[0] as BreadcrumbItem, ...props.items.slice(-2)] : props.items,
)
</script>

<template>
  <nav class="v-breadcrumb" :aria-label="ariaLabel">
    <ol class="v-breadcrumb-list">
      <template v-for="(item, index) in visibleItems" :key="item.href">
        <!-- le menu « … » s'insère entre le 1er item et l'avant-dernier -->
        <li v-if="truncated && index === 1" class="v-breadcrumb-item v-breadcrumb-ellipsis">
          <Icon class="v-breadcrumb-separator" v-bind="iconProps(separator)" />
          <Menu compact>
            <template #trigger="{ triggerProps }">
              <IconButton size="sm" compact :label="resolvedEllipsisLabel" v-bind="triggerProps">
                <Icon name="more_horiz" />
              </IconButton>
            </template>
            <MenuItem
              v-for="hidden in hiddenItems"
              :key="hidden.href"
              :href="hidden.href"
              :label="hidden.label"
              :icon-start="hidden.iconStart"
            />
          </Menu>
        </li>
        <li class="v-breadcrumb-item">
          <Icon class="v-breadcrumb-separator" v-bind="iconProps(separator)" />
          <a
            class="v-breadcrumb-link"
            :href="item.href"
            :aria-current="isCurrent(item) ? 'page' : undefined"
          >
            <Icon v-if="item.iconStart" v-bind="iconProps(item.iconStart)" />
            {{ item.label }}
          </a>
        </li>
      </template>
    </ol>
  </nav>
</template>

<style>
@layer vectis.components {
  .v-breadcrumb {
    /* API de contexte d'Icon : icônes d'items et séparateurs suivent la
       typo sm du fil d'Ariane */
    --vectis-icon-size: var(--vectis-icon-size-sm);
    --vectis-icon-opsz: 20;
  }

  .v-breadcrumb-list {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--vectis-space-2);
    margin: 0;
    padding: 0;
    list-style: none;
    font-family: var(--vectis-text-family);
    font-size: var(--vectis-text-body-md-size);
  }

  .v-breadcrumb-item {
    display: inline-flex;
    align-items: center;
    gap: var(--vectis-space-2);
    color: var(--vectis-color-text-muted);
  }

  .v-breadcrumb-list > .v-breadcrumb-item:first-child > .v-breadcrumb-separator {
    display: none;
  }

  .v-breadcrumb-separator {
    color: var(--vectis-color-text-subtle);
  }

  .v-breadcrumb-link {
    display: inline-flex;
    align-items: center;
    gap: var(--vectis-space-1);
    color: var(--vectis-color-text-muted);
    text-decoration: none;
    border-radius: var(--vectis-radius-xs);
    transition: color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-breadcrumb-link:hover {
    color: var(--vectis-color-text);
    text-decoration: underline;
  }

  .v-breadcrumb-link:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  .v-breadcrumb-link[aria-current='page'] {
    color: var(--vectis-color-text);
    font-weight: var(--vectis-text-label-weight);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-breadcrumb-link {
      transition: none;
    }
  }
}
</style>
