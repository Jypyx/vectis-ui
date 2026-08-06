<script setup lang="ts">
/*
 * The top bar. Every control in it is a design-system component.
 *
 * The active top-level entry is expressed through the VARIANT (`soft` against `ghost`)
 * rather than a prop: `VButton` has no `active`, and inventing one on the docs side would
 * document an API the library does not have.
 *
 * The burger is hidden by CSS above the sidebar breakpoint, never by a `v-if` on a
 * viewport read — that would be a hydration mismatch, since the server has no viewport.
 */
import { useData } from 'vitepress'
import { VButton, VIconButton } from '@vectis/ui'
import { computed } from 'vue'

import type { Appearance } from '../composables/useDocsTheme'
import { useActiveLink, useDocsHref } from '../composables/useActiveLink'
import type { DocsThemeConfig } from '../types'
import DocsSearch from './DocsSearch.vue'
import DocsThemeToggle from './DocsThemeToggle.vue'

const drawerOpen = defineModel<boolean>('drawerOpen', { default: false })
const appearance = defineModel<Appearance>('appearance', { required: true })

const { theme } = useData<DocsThemeConfig>()
const active = useActiveLink()
const docsHref = useDocsHref()

/** A navbar entry owns the page when it is the section the page lives in. */
const isCurrent = (link: string) => {
  const section = link.slice(0, link.lastIndexOf('/') + 1)
  return active.value.startsWith(section)
}

const storybookHref = computed(() => docsHref(theme.value.storybook))
</script>

<template>
  <header class="docs-navbar">
    <VIconButton
      class="docs-burger"
      label="Open the navigation"
      icon="menu"
      size="sm"
      @click="drawerOpen = true"
    />

    <a class="docs-brand" :href="docsHref('/')">Vectis&nbsp;UI</a>

    <nav class="docs-navbar-links" aria-label="Main">
      <VButton
        v-for="item in theme.nav"
        :key="item.link"
        :href="docsHref(item.link)"
        :variant="isCurrent(item.link) ? 'soft' : 'ghost'"
        tone="neutral"
        size="sm"
      >
        {{ item.text }}
      </VButton>
    </nav>

    <div class="docs-navbar-end">
      <DocsSearch />
      <DocsThemeToggle v-model="appearance" />

      <!--
        Both of these leave the SPA, and both say so with `target`: vitepress's click
        interception bails as soon as a link carries one, which is exactly what is wanted
        for Storybook (a non-vitepress subtree of the same Pages artefact) and for an
        external repository.
      -->
      <VButton
        :href="storybookHref"
        target="_blank"
        rel="noreferrer"
        variant="ghost"
        tone="neutral"
        size="sm"
        icon-end="open_in_new"
      >
        Storybook
      </VButton>
      <VButton
        :href="theme.repository"
        target="_blank"
        rel="noreferrer"
        variant="ghost"
        tone="neutral"
        size="sm"
        icon-end="open_in_new"
      >
        GitHub
      </VButton>
    </div>
  </header>
</template>
