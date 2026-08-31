<script setup lang="ts">
/**
 * The site's footer: the design system's licence on one side, what the site is built with on the
 * other.
 *
 * It is MOUNTED IN TWO PLACES, and that is forced by the documentation layout. `layouts/docs.vue`
 * nests inside `layouts/default.vue`, so a single mount in the default layout would put the
 * footer full width UNDER the navigation rail on every documentation page — where the design
 * calls for it beside the rail instead. The default layout therefore renders it behind a
 * `showFooter` prop, and the documentation layout turns that off and places its own copy inside
 * the grid. `docs-layout.css` holds the two grid rules that follow from it.
 *
 * The sentence carries its own two links, so it comes from the catalogue as markup and goes
 * through DocsProse. The heart does not: a symbol made of no words stays in the template, and it
 * is `aria-hidden` because "black heart suit" adds nothing to the sentence it follows.
 */
import { VTypography } from 'vectis-ui'

const { t } = useI18n()
</script>

<template>
  <footer class="vd-footer">
    <div class="vd-limit vd-footer-row">
      <VTypography variant="body-sm" as="p" tone="muted">
        {{ t('common.footer.licence') }}
      </VTypography>

      <p class="vd-footer-credit">
        <DocsProse
          tag="span"
          keypath="common.footer.builtWith"
          variant="body-sm"
          tone="muted"
          as="span"
        />
        <span class="vd-footer-heart" aria-hidden="true">♥</span>
      </p>
    </div>
  </footer>
</template>

<style scoped>
/*
 * Unlayered like the rest of the site's CSS, and scoped because it belongs to this footer alone.
 * It lives here rather than in docs-layout.css for the reason that file states about itself: what
 * a STATE owns goes with its component, and these are hover and focus-visible.
 *
 * `:deep` is what reaches the two anchors: they come out of the catalogue as raw HTML, so they
 * carry no scope attribute and a plain scoped selector would match nothing — silently.
 */
.vd-footer :deep(a) {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.vd-footer :deep(a:hover) {
  color: var(--vectis-color-accent-text);
}
.vd-footer :deep(a:focus-visible) {
  outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
  outline-offset: var(--vectis-focus-ring-offset);
  border-radius: var(--vectis-radius-xs);
}
</style>
