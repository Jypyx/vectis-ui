<script setup lang="ts">
/**
 * The documentation's three-column reading frame: the rail, the article, the outline. It is a
 * LAYOUT rather than a wrapper component so that it survives a page change; the rail is
 * forty-odd rows, and remounting it on every link would throw away its scroll position each
 * time a reader walked down the list.
 */
import { VButton } from 'vectis-ui'

const { navOpen, toggleNav } = useDocsNav()
const { t } = useI18n()
</script>

<template>
  <NuxtLayout name="default" :show-footer="false">
    <div class="vd-limit">
      <!--
        `data-nav-open` is the whole of the compact navigation: the same rail, revealed by an
        attribute, rather than a second copy of the tree rendered below the breakpoint.
      -->
      <div class="vd-docs" :data-nav-open="navOpen ? '' : undefined">
        <div class="vd-docnav-compact">
          <VButton
            variant="outline"
            tone="neutral"
            size="md"
            full-width
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

        <!--
          The rail keeps reaching the bottom of the window because the same file makes it span
          both grid rows.
        -->
        <DocsFooter class="vd-docs-footer" />
      </div>
    </div>
  </NuxtLayout>
</template>
