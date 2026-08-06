<script setup lang="ts">
/*
 * The on-page table of contents, from `useData().page.headers`.
 *
 * Deliberately NOT a `VSideNavigation`: in that component every node with children is a
 * `<details>`/`<summary>`, so an h2 owning h3s would become a summary that TOGGLES
 * instead of navigating. A table of contents is a flat list of destinations, and
 * flattening it here is cheaper and truer than fighting a disclosure widget.
 *
 * The active-heading tracking is the component's only behavioural JS, and it is a single
 * IntersectionObserver rather than a scroll listener: the browser does the geometry, and
 * nothing runs on a frame where no heading crossed. The `rootMargin` pulls the detection
 * band up under the sticky navbar and keeps it shallow, so the entry that "wins" is the
 * one nearest the top of the readable area rather than whichever is merely on screen.
 */
import { useData, useRoute } from 'vitepress'
import { VTypography } from '@vectis/ui'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const { page } = useData()
const route = useRoute()

/**
 * `page.headers` is a TREE (an h2 owns its h3s), and this rail is a flat list — see the
 * header comment. `markdown.headers.level` in `config.ts` is what bounds it to h2/h3.
 */
const headers = computed(() =>
  page.value.headers.flatMap((header) => [header, ...(header.children ?? [])]),
)

const activeLink = ref('')
let observer: IntersectionObserver | null = null

const disconnect = () => {
  observer?.disconnect()
  observer = null
}

watch(
  () => route.path,
  async () => {
    disconnect()
    if (typeof IntersectionObserver === 'undefined') return
    // The new page's headings are not in the DOM until the route's patch has flushed.
    await new Promise((resolve) => requestAnimationFrame(resolve))

    const targets = [...document.querySelectorAll<HTMLElement>('.vp-doc :is(h2, h3)[id]')]
    if (!targets.length) return

    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (visible) activeLink.value = `#${visible.target.id}`
      },
      { rootMargin: '-72px 0px -75% 0px' },
    )
    targets.forEach((target) => observer?.observe(target))
  },
  { immediate: true, flush: 'post' },
)

onBeforeUnmount(disconnect)
</script>

<template>
  <nav v-if="headers.length" class="docs-outline" aria-label="On this page">
    <VTypography variant="overline" tone="muted" as="p" class="docs-outline-title">
      On this page
    </VTypography>
    <ul>
      <li v-for="header in headers" :key="header.link" :data-level="header.level">
        <a :href="header.link" :aria-current="header.link === activeLink ? 'location' : undefined">
          {{ header.title }}
        </a>
      </li>
    </ul>
  </nav>
</template>
