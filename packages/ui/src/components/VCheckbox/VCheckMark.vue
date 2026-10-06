<script setup lang="ts">
/**
 * The box drawn for a checkbox, for VCheckbox and the checkable rows of VTreeView. It draws the
 * unchecked box and carries both marks, hidden: each consumer paints the checked and mixed states
 * from wherever that state lives, the native input's pseudo-classes or the row's `aria-checked`.
 * The rules here weigh (0,1,0), so any qualified state rule overrides them.
 */
</script>

<template>
  <span class="v-check-mark" aria-hidden="true">
    <svg class="v-check-mark-glyph" viewBox="0 0 12 12">
      <path
        class="v-check-mark-tick"
        d="M2.5 6.5l2.5 2.5 4.5-5.5"
        fill="none"
        stroke="currentcolor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        class="v-check-mark-dash"
        d="M3 6h6"
        fill="none"
        stroke="currentcolor"
        stroke-width="1.75"
        stroke-linecap="round"
      />
    </svg>
  </span>
</template>

<style>
@layer vectis.components {
  /*
   * A pill override on --vectis-radius-interactive would otherwise turn the box into a disc,
   * and a round checkbox reads as a radio.
   */
  .v-check-mark {
    display: inline-grid;
    flex: none;
    place-items: center;
    inline-size: var(--vectis-control-size-check);
    block-size: var(--vectis-control-size-check);
    background: transparent;
    border: var(--vectis-control-border-width) solid var(--vectis-color-border-strong);
    border-radius: min(
      var(--vectis-radius-interactive),
      calc(var(--vectis-control-size-check) / 4)
    );
    color: var(--vectis-color-text-on-accent);
    transition:
      background-color var(--vectis-duration-fast) var(--vectis-ease-default),
      border-color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-check-mark-glyph {
    inline-size: var(--vectis-control-size-check-mark);
    block-size: var(--vectis-control-size-check-mark);
  }

  .v-check-mark-tick,
  .v-check-mark-dash {
    opacity: 0;
    transition: opacity var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-check-mark,
    .v-check-mark-tick,
    .v-check-mark-dash {
      transition: none;
    }
  }
}
</style>
