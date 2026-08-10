<script setup lang="ts">
import { computed } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import VIconButton from '../VIconButton/VIconButton.vue'
import VMenu from '../VMenu/VMenu.vue'
import VMenuItem from '../VMenu/VMenuItem.vue'

import { useAriaLabel } from '../../composables/useAriaLabel'
import { useMessages } from '../../i18n/state'

// @ssr @core
/**
 * A breadcrumb trail: <nav> + an ordered list, driven by the `items` prop (pure
 * data derivation, no browser API — SSR-safe). The separators are decorative VIcons
 * (aria-hidden), and the first one is hidden in CSS. The active item is derived from
 * `currentPath` (aria-current="page" on the item with the matching href, which stays
 * a clickable link — the ARIA APG pattern). Past `maxItems`, the intermediate items
 * are folded into a VMenu opened by an "…" button.
 */
export interface BreadcrumbItem {
  /** Label of the segment. */
  label: string
  /** Destination of the segment; compared with `currentPath` for aria-current. */
  href: string
  /**
   * Icon before the label: a Material Symbols Rounded name, an icon URL, or an
   * explicit render (`{ src: '/logo.svg' }`, `{ component }`…).
   */
  iconStart?: IconSource
}

interface BreadcrumbProps {
  /** The segments, from the most general to the deepest. */
  items: BreadcrumbItem[]
  /** Accessible name of the navigation. Default: the DS dictionary. */
  label?: string
  /** Current path; the item whose href matches receives aria-current="page". */
  currentPath?: string
  /** Separator: an icon name, or an explicit render (like `iconStart`). */
  separator?: IconSource
  /**
   * Past this number of items: first + "…" + second-to-last + last; the "…" button's
   * menu lists the hidden items only. Effective minimum: 3.
   */
  maxItems?: number
  /** Accessible label of the ellipsis button. Default: the DS dictionary. */
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

/** Pure normalization (SSR-safe): trailing slash removed, except for '/'. */
function normalize(path: string): string {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
}

// @a11y — feeds `aria-current="page"`, the only thing marking the trail's end.
function isCurrent(item: BreadcrumbItem): boolean {
  if (props.currentPath === undefined) return false
  return normalize(item.href) === normalize(props.currentPath)
}

const truncated = computed(
  () => props.maxItems !== undefined && props.items.length > Math.max(props.maxItems, 3),
)
/** Items folded into the menu (from the second to the third-from-last). */
const hiddenItems = computed(() => (truncated.value ? props.items.slice(1, -2) : []))
/** Items displayed in the list; when truncated: first + second-to-last + last. */
const visibleItems = computed(() =>
  truncated.value ? [props.items[0] as BreadcrumbItem, ...props.items.slice(-2)] : props.items,
)
</script>

<template>
  <nav class="v-breadcrumb" :aria-label="ariaLabel">
    <ol class="v-breadcrumb-list">
      <template v-for="(item, index) in visibleItems" :key="item.href">
        <!-- the "…" menu is inserted between the first item and the second-to-last -->
        <li v-if="truncated && index === 1" class="v-breadcrumb-item v-breadcrumb-ellipsis">
          <VIcon class="v-breadcrumb-separator" v-bind="iconProps(separator)" />
          <VMenu compact>
            <template #trigger="{ triggerProps }">
              <VIconButton size="sm" compact :label="resolvedEllipsisLabel" v-bind="triggerProps">
                <VIcon name="more_horiz" />
              </VIconButton>
            </template>
            <VMenuItem
              v-for="hidden in hiddenItems"
              :key="hidden.href"
              :href="hidden.href"
              :label="hidden.label"
              :icon-start="hidden.iconStart"
            />
          </VMenu>
        </li>
        <li class="v-breadcrumb-item">
          <VIcon class="v-breadcrumb-separator" v-bind="iconProps(separator)" />
          <a
            class="v-breadcrumb-link"
            :href="item.href"
            :aria-current="isCurrent(item) ? 'page' : undefined"
          >
            <VIcon v-if="item.iconStart" v-bind="iconProps(item.iconStart)" />
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
    /* VIcon's context API: item icons and separators follow the breadcrumb's sm
       typography */
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
