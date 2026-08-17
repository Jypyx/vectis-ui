<script setup lang="ts">
/**
 * "On this page" — the article's own headings, and the one being read.
 *
 * Each entry is a real fragment link, so it works with no JavaScript at all and can be
 * copied out of the address bar. The click is intercepted only to add the sticky header's
 * offset, which `scroll-behavior` and `:target` cannot do on their own; a middle-click still
 * opens the anchor in a new tab.
 *
 * The rail is hidden below 1440px by docs-layout.css, but it is still mounted and still
 * harvesting: the headings it measures are in the prose, not in itself.
 */
const { outline, activeId, jumpTo } = useDocsOutline()
</script>

<template>
  <nav class="vd-outline" aria-label="On this page">
    <p
      style="
        margin: 0 0 8px;
        font-size: var(--vectis-text-overline-size);
        font-weight: var(--vectis-text-overline-weight);
        letter-spacing: var(--vectis-text-overline-tracking);
        text-transform: uppercase;
        color: var(--vectis-color-text-muted);
      "
    >
      On this page
    </p>
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
.vd-outline a {
  display: block;
  padding-block: 4px;
  font-size: var(--vectis-text-body-sm-size);
  line-height: 1.4;
  color: var(--vectis-color-text-muted);
  text-decoration: none;
}
.vd-outline a[data-level='3'] {
  padding-inline-start: 12px;
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
  font-weight: 500;
}
</style>
