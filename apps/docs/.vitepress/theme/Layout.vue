<script setup lang="ts">
/*
 * The shell. It owns the page grid and the landmarks; the chrome lives in its own
 * components and the markdown is rendered by vitepress's `<Content />`.
 *
 * `<Content />` must never end up inside a `.vp-raw` subtree: that is one of the
 * conditions under which vitepress's global click listener refuses to intercept a link,
 * and the sidebar's SPA navigation rests entirely on that interception.
 */
import { Content, useData } from 'vitepress'
import { ref } from 'vue'

import DocsFooter from './components/DocsFooter.vue'
import DocsMobileNav from './components/DocsMobileNav.vue'
import DocsNavBar from './components/DocsNavBar.vue'
import DocsOutline from './components/DocsOutline.vue'
import DocsSidebar from './components/DocsSidebar.vue'
import { useDocsTheme } from './composables/useDocsTheme'

const { frontmatter } = useData()

// One store per document: it installs the `data-theme` mirror and the media listener,
// and the switch in the navbar drives it through a model rather than owning it.
const { appearance } = useDocsTheme()

const drawerOpen = ref(false)
</script>

<template>
  <div class="docs-shell" :data-layout="frontmatter.layout ?? 'doc'">
    <DocsNavBar v-model:drawer-open="drawerOpen" v-model:appearance="appearance" />
    <DocsMobileNav v-model:open="drawerOpen" />

    <div class="docs-body">
      <aside v-if="frontmatter.layout !== 'home'" class="docs-aside">
        <DocsSidebar />
      </aside>

      <main class="docs-main">
        <div class="vp-doc"><Content /></div>
      </main>

      <DocsOutline v-if="frontmatter.layout !== 'home'" />
    </div>

    <DocsFooter />
  </div>
</template>
