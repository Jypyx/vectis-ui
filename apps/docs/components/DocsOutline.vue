<script setup lang="ts">
/**
 * Discover headings from the rendered article. Intercept ordinary clicks for the sticky offset
 * and fragment update; preserve native modified-click navigation.
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
/* Keep the current-entry colour after hover rules so hovering cannot hide the reading position. */
.vd-outline a[data-active='true'] {
  color: var(--vectis-color-accent-text);
  font-weight: var(--vectis-font-weight-medium);
}
</style>
