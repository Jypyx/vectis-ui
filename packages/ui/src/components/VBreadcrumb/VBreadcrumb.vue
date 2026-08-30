<script setup lang="ts">
import { computed } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import { chevron_right as chevronRightIcon } from '../VIcon/icons/chevron_right'
import { more_horiz as moreHorizIcon } from '../VIcon/icons/more_horiz'
import type { IconSource } from '../VIcon/types'
import VIconButton from '../VIconButton/VIconButton.vue'
import VMenu from '../VMenu/VMenu.vue'
import VMenuItem from '../VMenu/VMenuItem.vue'

import { useAriaLabel } from '../../composables/useAriaLabel'
import { useMessages } from '../../i18n/state'

// @ssr @core
/**
 * A breadcrumb trail: the path that leads to the page being read, from the most
 * general section down to the current one. It is a `<nav>` holding an ordered list,
 * built entirely from the `items` prop — nothing is read from the browser, so the
 * server and the client render exactly the same thing.
 *
 * The separators between the segments are decorative icons, hidden from screen
 * readers, and the very first one is removed in CSS rather than by a condition in
 * the markup. The current page is found by comparing each segment's address with
 * `currentPath`: it is marked with `aria-current="page"` and stays a working link,
 * as the ARIA authoring practices recommend. When the trail grows past `maxItems`,
 * the middle segments are folded into a menu opened by an "…" button.
 */
export interface BreadcrumbItem {
  /** The text shown for this segment. */
  label: string
  /**
   * Where the segment leads. It is also the value compared with `currentPath` to
   * decide which segment is the current page.
   */
  href: string
  /**
   * An icon placed before the label: a Material Symbols Rounded name, an icon URL,
   * or an explicit render (`{ src: '/logo.svg' }`, `{ component }`…).
   */
  iconStart?: IconSource
}

interface BreadcrumbProps {
  /** The segments of the trail, ordered from the most general down to the deepest. */
  items: BreadcrumbItem[]
  /**
   * The name screen readers announce for this navigation. It falls back to the
   * wording of the DS dictionary, in the current language.
   */
  label?: string
  /**
   * The address of the page being displayed. The segment whose `href` matches it is
   * the current one; a trailing slash on either side makes no difference.
   */
  currentPath?: string
  /**
   * The icon drawn between two segments: an icon name, or an explicit render,
   * exactly like `iconStart`.
   */
  separator?: IconSource
  /**
   * The length past which the trail folds: only the first segment, an "…" button and
   * the last two remain, the button opening a menu that lists the hidden segments
   * alone. Below 3 there would be nothing left to fold, so 3 is the effective
   * minimum.
   */
  maxItems?: number
  /**
   * The name screen readers announce for the "…" button. It falls back to the
   * wording of the DS dictionary.
   */
  ellipsisLabel?: string
}

const props = withDefaults(defineProps<BreadcrumbProps>(), {
  label: undefined,
  currentPath: undefined,
  separator: () => chevronRightIcon,
  maxItems: undefined,
  ellipsisLabel: undefined,
})

const m = useMessages()
const ariaLabel = useAriaLabel(() => props.label ?? m.value.breadcrumb.label)
const resolvedEllipsisLabel = computed(() => props.ellipsisLabel ?? m.value.breadcrumb.ellipsis)

/**
 * Drops a trailing slash so that `/docs` and `/docs/` compare as the same page; the
 * root `/` is left alone. Pure string handling, hence safe to run on the server.
 */
function normalize(path: string): string {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
}

// @a11y — this is what feeds `aria-current="page"`, the only marker telling
// assistive technology where the trail ends.
function isCurrent(item: BreadcrumbItem): boolean {
  if (props.currentPath === undefined) return false
  return normalize(item.href) === normalize(props.currentPath)
}

const truncated = computed(
  () => props.maxItems !== undefined && props.items.length > Math.max(props.maxItems, 3),
)
/** The segments folded into the menu: everything between the first and the last two. */
const hiddenItems = computed(() => (truncated.value ? props.items.slice(1, -2) : []))
/**
 * The segments actually rendered in the list — when the trail is folded, the first
 * one followed by the last two.
 */
const visibleItems = computed(() =>
  truncated.value ? [props.items[0] as BreadcrumbItem, ...props.items.slice(-2)] : props.items,
)
</script>

<template>
  <nav class="v-breadcrumb" :aria-label="ariaLabel">
    <ol class="v-breadcrumb-list">
      <template v-for="(item, index) in visibleItems" :key="item.href">
        <li v-if="truncated && index === 1" class="v-breadcrumb-item v-breadcrumb-ellipsis">
          <VIcon class="v-breadcrumb-separator" v-bind="iconProps(separator)" />
          <VMenu compact>
            <template #trigger="{ triggerProps }">
              <VIconButton size="sm" compact :label="resolvedEllipsisLabel" v-bind="triggerProps">
                <VIcon :name="moreHorizIcon" />
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
