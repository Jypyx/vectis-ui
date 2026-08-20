<script setup lang="ts">
/**
 * The documentation's three-column reading frame: the rail, the article, the outline.
 *
 * It is a LAYOUT rather than a wrapper component so that it survives a page change — the
 * rail is forty-odd rows, and remounting it on every link would throw away its scroll
 * position each time a reader walked down the list.
 *
 * The tracks themselves are entirely `docs-layout.css`'s: one column below 1024px, two up to
 * 1440px, three above it. Nothing here measures anything.
 */
import { VButton } from '@vectis/ui'

const { navOpen, toggleNav } = useDocsNav()
const { t } = useI18n()
</script>

<template>
  <NuxtLayout name="default">
    <div class="vd-limit">
      <!--
        `data-nav-open` is the whole of the compact navigation: the SAME rail, revealed by an
        attribute, rather than a second copy of the tree rendered below the breakpoint.
      -->
      <div class="vd-docs" :data-nav-open="navOpen ? '' : undefined">
        <div class="vd-docnav-compact">
          <VButton
            variant="outline"
            tone="neutral"
            size="sm"
            icon-start="menu"
            :aria-expanded="navOpen"
            @click="toggleNav"
          >
            {{ t('common.sidebar') }}
          </VButton>
        </div>

        <aside class="vd-aside">
          <DocsSidebar />
        </aside>

        <main class="vd-main">
          <div class="vd-prose">
            <slot />
          </div>
        </main>

        <DocsOutline />
      </div>
    </div>
  </NuxtLayout>
</template>
