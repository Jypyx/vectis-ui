<script setup lang="ts">
/**
 * VDialog supplies native modal behaviour. Name it with aria-label because the search field
 * occupies the header slot instead of a title.
 */
import { VDialog, VInput } from 'vectis-ui'
import { search as searchIcon } from 'vectis-ui/icons'

const { open, query, results, closeSearch } = useDocsSearch()
const router = useRouter()
const { t } = useI18n()

function go(to: string) {
  closeSearch()
  router.push(to)
}

function onEnter() {
  const first = results.value[0]
  if (first) go(first.to)
}

function onEscape() {
  closeSearch()
}
</script>

<template>
  <VDialog
    v-model:open="open"
    class="vd-modal"
    width="640px"
    :aria-label="t('common.search.label')"
    hide-close
  >
    <template #header>
      <VInput
        v-model="query"
        size="lg"
        type="search"
        :icon-start="searchIcon"
        :placeholder="t('common.search.placeholder')"
        clearable
        class="vd-search-field"
        @keydown.enter="onEnter"
        @keydown.escape="onEscape"
      />
    </template>

    <div class="vd-results">
      <NuxtLink v-for="result in results" :key="result.slug" :to="result.to" custom>
        <template #default="{ href }">
          <a class="vd-result" :href="href ?? undefined" @click.prevent="go(result.to)">
            <span class="vd-result-title">{{ result.title }}</span>
            <span class="vd-result-section">{{ result.section }}</span>
          </a>
        </template>
      </NuxtLink>
      <p v-if="results.length === 0" class="vd-result-empty">{{ t('common.search.empty') }}</p>
    </div>
  </VDialog>
</template>

<style scoped>
.vd-search-field {
  flex: 1 1 auto;
}

.vd-results {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.vd-result {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--vectis-space-2) var(--vectis-space-3);
  border-radius: var(--vectis-radius-sm);
  color: inherit;
  text-decoration: none;
}
.vd-result:hover {
  background: var(--vectis-color-surface-muted);
}
.vd-result:focus-visible {
  outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
  outline-offset: calc(-1 * var(--vectis-focus-ring-width));
}

.vd-result-title {
  font-size: var(--vectis-text-label-size);
  font-weight: var(--vectis-text-label-weight);
}
.vd-result-section {
  font-size: var(--vectis-text-caption-size);
  color: var(--vectis-color-text-muted);
}

.vd-result-empty {
  margin: 0;
  padding: var(--vectis-space-3);
  font-size: var(--vectis-text-body-md-size);
  color: var(--vectis-color-text-muted);
}
</style>
