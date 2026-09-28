<script setup lang="ts">
/** Native fragment links navigate; JavaScript only discovers and highlights headings. */
import { VTypography } from 'vectis-ui'

const { t } = useI18n()
const route = useRoute()
const outline = ref<{ id: string; title: string; level: number }[]>([])
const activeId = ref('')
let headings: HTMLElement[] = []
let frame = 0
let scrollLine = 0

function measureOffset() {
  // Read CSS so the active section follows the same desktop/mobile offsets as native links.
  const padding = getComputedStyle(document.documentElement).scrollPaddingBlockStart
  const margin = headings[0] ? getComputedStyle(headings[0]).scrollMarginBlockStart : '0'
  scrollLine = (Number.parseFloat(padding) || 0) + (Number.parseFloat(margin) || 0) + 1
}

function highlight() {
  let active = headings[0]?.id ?? ''
  for (const heading of headings) {
    if (heading.getBoundingClientRect().top <= scrollLine) active = heading.id
  }
  // A short final section may never reach the sticky header.
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4)
    active = headings.at(-1)?.id ?? ''
  activeId.value = active
}

function onScroll() {
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    highlight()
  })
}

function onResize() {
  measureOffset()
  onScroll()
}

async function harvest() {
  await nextTick()
  headings = [...document.querySelectorAll<HTMLElement>('.vd-prose > h2[id], .vd-prose > h3[id]')]
  outline.value = headings.map((heading) => ({
    id: heading.id,
    title: heading.textContent ?? '',
    level: heading.tagName === 'H3' ? 3 : 2,
  }))
  measureOffset()
  highlight()
}

onMounted(() => {
  void harvest()
  // Hash changes are native navigation within the same article, so only its path is watched.
  watch(() => route.path, harvest, { flush: 'post' })
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  if (frame) cancelAnimationFrame(frame)
})
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
      :aria-current="heading.id === activeId ? 'location' : undefined"
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
