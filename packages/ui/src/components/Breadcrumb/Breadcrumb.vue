<script setup lang="ts">
import { computed } from 'vue'

import Icon from '../Icon/Icon.vue'
import { iconProps } from '../Icon/iconProps'
import IconButton from '../IconButton/IconButton.vue'
import Menu from '../Menu/Menu.vue'
import MenuItem from '../Menu/MenuItem.vue'

import { useAriaLabel } from '../../composables/useAriaLabel'

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
   * d'image/SVG (toute valeur contenant '.', '/' ou ':' est traitée
   * comme une URL).
   */
  iconStart?: string
}

interface BreadcrumbProps {
  /** Les segments, du plus général au plus profond. */
  items: BreadcrumbItem[]
  /** Nom accessible de la navigation. */
  label?: string
  /** Chemin courant ; l'item dont le href correspond reçoit aria-current="page". */
  currentPath?: string
  /** Séparateur : nom Material Symbols ou URL d'image (même détection qu'iconStart). */
  separator?: string
  /**
   * Au-delà de ce nombre d'items : 1er + « … » + avant-dernier + dernier ;
   * le menu du bouton « … » liste uniquement les items masqués. Minimum
   * effectif : 3.
   */
  maxItems?: number
  /** Libellé accessible du bouton d'ellipsis. */
  ellipsisLabel?: string
}

const props = withDefaults(defineProps<BreadcrumbProps>(), {
  label: "Fil d'Ariane",
  currentPath: undefined,
  separator: 'chevron_right',
  maxItems: undefined,
  ellipsisLabel: 'Afficher les pages intermédiaires',
})

// `label` n'est qu'un défaut : cf. useAriaLabel pour la précédence ARIA.
const ariaLabel = useAriaLabel(() => props.label)

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
  <nav class="ds-breadcrumb" :aria-label="ariaLabel">
    <ol class="ds-breadcrumb-list">
      <template v-for="(item, index) in visibleItems" :key="item.href">
        <!-- le menu « … » s'insère entre le 1er item et l'avant-dernier -->
        <li v-if="truncated && index === 1" class="ds-breadcrumb-item ds-breadcrumb-ellipsis">
          <Icon class="ds-breadcrumb-separator" v-bind="iconProps(separator)" />
          <Menu compact>
            <template #trigger="{ triggerProps }">
              <IconButton size="sm" compact :label="ellipsisLabel" v-bind="triggerProps">
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
        <li class="ds-breadcrumb-item">
          <Icon class="ds-breadcrumb-separator" v-bind="iconProps(separator)" />
          <a
            class="ds-breadcrumb-link"
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
@layer ds.components {
  .ds-breadcrumb {
    /* API de contexte d'Icon : icônes d'items et séparateurs suivent la
       typo sm du fil d'Ariane */
    --ds-icon-size: var(--ds-icon-size-sm);
    --ds-icon-opsz: 20;
  }

  .ds-breadcrumb-list {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--ds-space-2);
    margin: 0;
    padding: 0;
    list-style: none;
    font-family: var(--ds-text-family);
    font-size: var(--ds-text-body-md-size);
  }

  .ds-breadcrumb-item {
    display: inline-flex;
    align-items: center;
    gap: var(--ds-space-2);
    color: var(--ds-color-text-muted);
  }

  /* le premier item n'est précédé d'aucun séparateur */
  .ds-breadcrumb-list > .ds-breadcrumb-item:first-child > .ds-breadcrumb-separator {
    display: none;
  }

  /* le reste (display, centrage, taille) vient de .ds-icon */
  .ds-breadcrumb-separator {
    color: var(--ds-color-text-subtle);
  }

  .ds-breadcrumb-link {
    display: inline-flex;
    align-items: center;
    gap: var(--ds-space-1);
    color: var(--ds-color-text-muted);
    text-decoration: none;
    border-radius: var(--ds-radius-xs);
    transition: color var(--ds-duration-fast) var(--ds-ease-default);
  }

  .ds-breadcrumb-link:hover {
    color: var(--ds-color-text);
    text-decoration: underline;
  }

  .ds-breadcrumb-link:focus-visible {
    outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color);
    outline-offset: var(--ds-focus-ring-offset);
  }

  .ds-breadcrumb-link[aria-current='page'] {
    color: var(--ds-color-text);
    font-weight: var(--ds-text-label-weight);
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-breadcrumb-link {
      transition: none;
    }
  }
}
</style>
