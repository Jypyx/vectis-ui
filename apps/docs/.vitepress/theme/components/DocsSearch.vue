<script setup lang="ts">
/*
 * The search field: a `VCombobox` over vitepress's own MiniSearch index.
 *
 * Three things about the DS component shape the wiring, and none of them is guessable
 * from the outside:
 *   - it emits no `select`, so a choice is observed on the MODEL, not on an event;
 *   - it has no `defineExpose`, so ⌘K cannot call `focus()` on it — the shortcut reaches
 *     the field through this component's own wrapper ref;
 *   - it owns VInput's `#end` slot (its chevron and spinner live there), so the ⌘K badge
 *     sits BESIDE the field rather than inside it. Same reason there is no magnifier in
 *     the field: `iconStart` is not part of VCombobox's surface.
 *
 * `filter: false` hands filtering entirely to MiniSearch. Left on, the DS's own
 * accent-insensitive matcher would re-filter results it did not rank and drop the fuzzy
 * hits, which are the ones a search index exists to produce.
 */
import { useData, useRouter } from 'vitepress'
import { VCombobox, VHotkeys, type ComboboxOption } from '@vectis/ui'
import { ref, shallowRef, watch } from 'vue'

import { ensureIndex, excerpt, search, type SearchHit } from '../composables/useLocalSearch'

const MAX_RESULTS = 12

const { localeIndex } = useData()
const router = useRouter()

const wrapper = ref<HTMLElement | null>(null)
const selected = ref('')
const options = shallowRef<ComboboxOption[]>([])
const loading = ref(false)

/*
 * The `#option` slot only ever receives a `ComboboxOption` (value/label/icon/disabled),
 * so the breadcrumb and the excerpt travel alongside, keyed by the option's value — which
 * is the hit's id, hence unique.
 */
const hits = new Map<string, SearchHit>()

const field = () => wrapper.value?.querySelector('input')

async function onSearch(query: string) {
  // `@search` also fires when the panel opens, with whatever the field holds: an empty
  // term must clear rather than query, or the panel opens on the whole index.
  if (!query.trim()) {
    options.value = []
    return
  }

  loading.value = true
  try {
    const index = await ensureIndex(localeIndex.value)
    if (!index) return
    hits.clear()
    options.value = search(index, query, MAX_RESULTS).map((hit) => {
      hits.set(hit.id, hit)
      return { value: hit.id, label: hit.title }
    })
  } finally {
    loading.value = false
  }
}

watch(selected, (id) => {
  if (!id) return
  // The plugin builds its ids with `base` and `cleanUrls` already applied, so this is a
  // href already — passing it through `withBase()` would double the base.
  void router.go(id)
  selected.value = ''
  options.value = []
  // VCombobox closes on focusout; blurring is what dismisses the panel after a choice.
  field()?.blur()
})

function focusField() {
  field()?.focus()
}
</script>

<template>
  <div ref="wrapper" class="docs-search">
    <VCombobox
      v-model="selected"
      :options="options"
      :filter="false"
      :loading="loading"
      :search-debounce="120"
      size="sm"
      placeholder="Search"
      aria-label="Search the documentation"
      empty-text="No result"
      @search="onSearch"
    >
      <template #option="{ option }">
        <span class="docs-hit">
          <span class="docs-hit-title">{{ option.label }}</span>
          <span v-if="hits.get(option.value)?.titles.length" class="docs-hit-crumb">
            {{ hits.get(option.value)?.titles.join(' › ') }}
          </span>
          <span v-if="excerpt(hits.get(option.value))" class="docs-hit-excerpt">
            {{ excerpt(hits.get(option.value)) }}
          </span>
        </span>
      </template>
    </VCombobox>

    <!--
      `preventDefault` is already this component's default, which is the point of taking
      ⌘K from the browser; `allowInInput` stays false, so the shortcut does not re-fire
      while the user is typing in the field it opened.
    -->
    <VHotkeys
      class="docs-search-hint"
      keys="mod+k"
      listen
      variant="outlined"
      @trigger="focusField"
    />
  </div>
</template>
