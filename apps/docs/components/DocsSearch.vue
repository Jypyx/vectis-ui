<script setup lang="ts">
/**
 * The search panel, opened from the header or with Ctrl/⌘+K.
 *
 * It is a VDialog rather than a hand-built overlay, and that is the whole reason it carries
 * so little code: a native `<dialog>` opened as a modal gives the top layer, the dimmed
 * background, the focus trap, Escape, the click outside and the focus handed back to the
 * trigger — none of which is written here.
 *
 * The field lives in the `#header` slot, so the dialog has no `title` of its own and cannot
 * be named by one; `aria-label` falls through onto the `<dialog>` and names it instead.
 *
 * Nothing carries `autofocus`, deliberately: `showModal()` focuses the first focusable thing
 * inside the dialog by itself, and the field is it. The attribute would only restate what the
 * platform already does — and would be flagged, rightly, as an autofocus nobody asked for.
 */
import { VDialog, VHotkeys, VInput } from '@vectis/ui'

const { open, query, results, closeSearch } = useDocsSearch()
const router = useRouter()
const { t } = useI18n()

function go(to: string) {
  closeSearch()
  router.push(to)
}

/**
 * Enter goes to the first result. Without it the obvious gesture — type three letters, press
 * Enter — does nothing at all, and the reader has to reach back for the mouse.
 */
function onEnter() {
  const first = results.value[0]
  if (first) go(first.to)
}

/**
 * Escape closes the panel, always — one press, whatever is typed.
 *
 * This is the one place the site overrides the platform, and the conflict is real: a native
 * `input[type="search"]` consumes the FIRST Escape to clear itself, so without this line the
 * reader presses Escape, watches their query vanish, and is still in the dialog. Inside a
 * modal, Escape belongs to the modal — and nothing is lost, because the field renders its own
 * clear cross, which is the gesture the native one was duplicating.
 */
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
    :closable="false"
  >
    <template #header>
      <VInput
        v-model="query"
        size="lg"
        type="search"
        icon-start="search"
        :placeholder="t('common.search.placeholder')"
        clearable
        style="flex: 1 1 auto"
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

    <template #footer>
      <span
        style="font-size: var(--vectis-text-caption-size); color: var(--vectis-color-text-subtle)"
      >
        {{ t('common.search.scope') }}
      </span>
      <VHotkeys keys="esc" size="xs" variant="flat" />
    </template>
  </VDialog>
</template>

<style scoped>
/*
 * Unlayered like the rest of the site's CSS, and scoped because it belongs to this panel
 * alone. It lives here rather than in docs-layout.css for the reason that file states about
 * itself: only what a MEDIA QUERY owns goes there, and a hover state is not that.
 */
.vd-results {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.vd-result {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 12px;
  border-radius: var(--vectis-radius-sm);
  color: inherit;
  text-decoration: none;
}
.vd-result:hover {
  background: var(--vectis-color-surface-muted);
}
.vd-result:focus-visible {
  outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
  /* Pulled inwards: the list scrolls, and a positive offset would be clipped at the edges. */
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
  padding: 12px;
  font-size: var(--vectis-text-body-md-size);
  color: var(--vectis-color-text-muted);
}
</style>
