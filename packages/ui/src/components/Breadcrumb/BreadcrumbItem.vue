<script setup lang="ts">
/**
 * Segment de fil d'Ariane. Avec `href` → <a> ; sans href, le slot est rendu
 * tel quel (permet router-link/NuxtLink) ou en texte simple. `current` pose
 * aria-current="page".
 */
interface BreadcrumbItemProps {
  href?: string
  /** Page courante (dernier segment) — aria-current="page". */
  current?: boolean
}

withDefaults(defineProps<BreadcrumbItemProps>(), {
  href: undefined,
  current: false,
})

defineSlots<{
  /** Libellé (ou lien custom type NuxtLink si pas de href) */
  default(): unknown
}>()
</script>

<template>
  <li class="ds-breadcrumb-item">
    <a
      v-if="href"
      class="ds-breadcrumb-link"
      :href="href"
      :aria-current="current ? 'page' : undefined"
    >
      <slot />
    </a>
    <span v-else class="ds-breadcrumb-text" :aria-current="current ? 'page' : undefined">
      <slot />
    </span>
  </li>
</template>

<style>
@layer ds.components {
  .ds-breadcrumb-item {
    display: inline-flex;
    align-items: center;
    gap: var(--ds-space-2);
    color: var(--ds-color-text-muted);
  }

  /* séparateur décoratif, hors DOM accessible */
  .ds-breadcrumb-item + .ds-breadcrumb-item::before {
    content: '/';
    color: var(--ds-color-text-subtle);
  }

  .ds-breadcrumb-link {
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

  .ds-breadcrumb-link[aria-current='page'],
  .ds-breadcrumb-text[aria-current='page'] {
    color: var(--ds-color-text);
    font-weight: var(--ds-font-weight-medium);
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-breadcrumb-link {
      transition: none;
    }
  }
}
</style>
