<script setup lang="ts">
import { computed } from 'vue'

/**
 * Pagination : <nav> + boutons natifs, aria-current="page" sur la page
 * active. Le JS est une pure dérivation d'état : calcul de la fenêtre de
 * pages visibles (bornes + voisines + ellipses).
 */
interface PaginationProps {
  /** Nombre total de pages. */
  count: number
  /** Pages voisines affichées de chaque côté de la page courante. */
  siblingCount?: number
  /** Pages affichées à chaque extrémité. */
  boundaryCount?: number
  disabled?: boolean
  /** Nom accessible de la navigation. */
  label?: string
}

const props = withDefaults(defineProps<PaginationProps>(), {
  siblingCount: 1,
  boundaryCount: 1,
  disabled: false,
  label: 'Pagination',
})

const page = defineModel<number>({ default: 1 })

/** Liste rendue : numéros de page + marqueurs d'ellipse (`gap-<après>`). */
const items = computed<(number | string)[]>(() => {
  const keep = new Set<number>()
  const add = (n: number) => {
    if (n >= 1 && n <= props.count) keep.add(n)
  }
  for (let i = 1; i <= props.boundaryCount; i++) add(i)
  for (let i = props.count - props.boundaryCount + 1; i <= props.count; i++) add(i)
  for (let i = page.value - props.siblingCount; i <= page.value + props.siblingCount; i++) add(i)

  const out: (number | string)[] = []
  let previous = 0
  for (const n of [...keep].sort((a, b) => a - b)) {
    if (previous && n - previous > 1) out.push(`gap-${previous}`)
    out.push(n)
    previous = n
  }
  return out
})

function goTo(n: number) {
  page.value = Math.min(Math.max(n, 1), props.count)
}
</script>

<template>
  <nav class="ds-pagination" :aria-label="label">
    <button
      type="button"
      class="ds-pagination-btn"
      aria-label="Page précédente"
      :disabled="disabled || page <= 1"
      @click="goTo(page - 1)"
    >
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path
          d="M10 3 5 8l5 5"
          fill="none"
          stroke="currentcolor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <template v-for="item in items" :key="item">
      <button
        v-if="typeof item === 'number'"
        type="button"
        class="ds-pagination-btn"
        :aria-label="`Page ${item}`"
        :aria-current="item === page ? 'page' : undefined"
        :disabled="disabled"
        @click="goTo(item)"
      >
        {{ item }}
      </button>
      <span v-else class="ds-pagination-gap" aria-hidden="true">…</span>
    </template>

    <button
      type="button"
      class="ds-pagination-btn"
      aria-label="Page suivante"
      :disabled="disabled || page >= count"
      @click="goTo(page + 1)"
    >
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path
          d="m6 3 5 5-5 5"
          fill="none"
          stroke="currentcolor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </nav>
</template>

<style>
@layer ds.components {
  .ds-pagination {
    display: flex;
    align-items: center;
    gap: var(--ds-space-1);
    font-family: var(--ds-font-family-sans);
  }

  .ds-pagination-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: var(--ds-control-height-sm);
    height: var(--ds-control-height-sm);
    padding-inline: var(--ds-space-2);
    border: 1px solid transparent;
    background: transparent;
    color: var(--ds-color-text-muted);
    border-radius: var(--ds-radius-interactive);
    font-size: var(--ds-font-size-sm);
    font-weight: var(--ds-font-weight-medium);
    cursor: pointer;
    transition:
      background-color var(--ds-duration-fast) var(--ds-ease-default),
      color var(--ds-duration-fast) var(--ds-ease-default);
  }

  .ds-pagination-btn:hover:not(:disabled):not([aria-current='page']) {
    background: var(--ds-color-surface-muted);
    color: var(--ds-color-text);
  }

  .ds-pagination-btn[aria-current='page'] {
    background: var(--ds-color-accent);
    color: var(--ds-color-text-on-accent);
  }

  .ds-pagination-btn:focus-visible {
    outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color);
    outline-offset: var(--ds-focus-ring-offset);
  }

  .ds-pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .ds-pagination-gap {
    min-width: var(--ds-control-height-sm);
    text-align: center;
    color: var(--ds-color-text-subtle);
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-pagination-btn {
      transition: none;
    }
  }
}
</style>
