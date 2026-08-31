<script setup lang="ts">
/**
 * "On this page" — the article's own headings, and the one being read.
 *
 * Each entry is a real fragment link, so it works with no JavaScript at all and can be
 * copied out of the address bar. The click is intercepted only to add the sticky header's
 * offset and to write the fragment without navigating, neither of which `scroll-behavior` and
 * `:target` can do on their own; a middle-click still opens the anchor in a new tab.
 *
 * The rail is hidden below 1440px by docs-layout.css, but it is still mounted and still
 * harvesting: the headings it measures are in the prose, not in itself.
 */
import { VTypography } from 'vectis-ui'

const { outline, activeId, jumpTo } = useDocsOutline()
const { t } = useI18n()
</script>

<template>
  <nav class="vd-outline" :aria-label="t('common.outline')">
    <!--
      `label` and not `overline`: the latter is the role that CARRIES the capitals and the
      widened tracking that go with them, so asking for lowercase there would mean undoing half
      a recipe. Naming the other role is how a consumer changes its mind about a type style.
    -->
    <VTypography variant="label" as="p" class="vd-outline-title">
      {{ t('common.outline') }}
    </VTypography>
    <a
      v-for="heading in outline"
      :key="heading.id"
      :href="`#${heading.id}`"
      :data-level="heading.level"
      :data-active="heading.id === activeId ? 'true' : 'false'"
      @click.prevent="jumpTo(heading.id)"
    >
      {{ heading.title }}
    </a>
  </nav>
</template>

<style scoped>
/* The title is as prominent as the entry being read, and more so than the rest of the list:
   it is what names the rail. `tone` is left at its default, which inherits, and the colour is
   then stated here rather than through the design system's private `--typography-*` variables
   — an unlayered consumer declaration is the sanctioned override path. */
.vd-outline-title {
  color: var(--vectis-color-text);
}
.vd-outline a {
  display: block;
  padding-block: var(--vectis-space-1);
  font-size: var(--vectis-text-body-sm-size);
  line-height: var(--vectis-text-caption-leading);
  color: var(--vectis-color-text-muted);
  text-decoration: none;
}
.vd-outline a[data-level='3'] {
  padding-inline-start: var(--vectis-space-3);
}
.vd-outline a:hover {
  color: var(--vectis-color-accent-text);
}
.vd-outline a:focus-visible {
  outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
  outline-offset: var(--vectis-focus-ring-offset);
  border-radius: var(--vectis-radius-xs);
}
/* The section being read. Last of the colour rules, so it wins over :hover at equal
   specificity — the reader moving the pointer down the list must not lose their place. */
.vd-outline a[data-active='true'] {
  color: var(--vectis-color-accent-text);
  font-weight: var(--vectis-font-weight-medium);
}
</style>
