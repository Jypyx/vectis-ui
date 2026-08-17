<script setup lang="ts">
import { VButton } from '@vectis/ui'

definePageMeta({ layout: 'docs' })
useHead({ title: 'Installation' })

const addCode = 'pnpm add @vectis/ui vue'

const vueCode = `// main.ts
import '@vectis/ui/styles.css'`

const nuxtCode = `export default defineNuxtConfig({
  css: ['@vectis/ui/styles.css'],
})`

/*
 * The sample below is a whole SFC, so it has to contain a closing `script` tag — and a literal
 * one cannot be written inside this block at all: the SFC parser ends the block at the first
 * one it meets, string literal or comment included. Escaping the slash satisfies the parser but
 * ESLint then reports a useless escape, since it only ever sees the extracted JavaScript, where
 * the backslash really is pointless. Splitting the token satisfies both, and is the reason this
 * comment talks around the tag rather than showing it.
 */
const CLOSE_SCRIPT = '</scr' + 'ipt>'

const useCode = `<script setup lang="ts">
import { VButton, VInput } from '@vectis/ui'
${CLOSE_SCRIPT}

<template>
  <VInput label="Project" hint="Shown in the sidebar" />
  <VButton tone="accent">Create</VButton>
</template>`
</script>

<template>
  <h1>Installation</h1>
  <p class="vd-lead">
    The library is pre-built as ESM and SSR-safe. Named imports are tree-shaken by Vite and Nitro;
    no <code>build.transpile</code> is required.
  </p>

  <DocsCode lang="bash" :code="addCode" />

  <h2 id="vue-3">Vue 3</h2>
  <DocsCode lang="ts" :code="vueCode" />
  <p>
    <code>styles.css</code> is the core: the reset, the tokens and the chrome shared by every
    component, 6.7 kB gzip. Each component's own CSS ships with the component and is pulled in by
    the import you already write.
  </p>

  <h2 id="nuxt-3">Nuxt 3</h2>
  <DocsCode lang="ts" :code="nuxtCode" />
  <p>
    This site is that configuration: it is a Nuxt 3 application, prerendered to static files, which
    is also what makes it an end-to-end test of the library's SSR safety — a component reaching for
    <code>window</code> outside a handler would fail the build rather than the visitor.
  </p>

  <h3 id="component-css">Component CSS</h3>
  <p>
    Component CSS travels with the component as a plain static import, which Vite, Nitro and webpack
    all turn into a render-blocking link — including for a lazily loaded route. Keep the client CSS
    extracted to a file and the question of a flash does not arise.
  </p>
  <blockquote>
    A page importing a single VButton downloads 7.25 kB gzip of CSS — the core plus that one
    component's sheet. The other fifty-five sheets are never requested.
  </blockquote>

  <h2 id="what-you-get">What you get</h2>
  <p>
    Named exports only, so the bundler prunes what you do not use. The French dictionary is opt-in
    for the same reason: not importing it is enough to leave it out.
  </p>
  <DocsCode lang="vue" :code="useCode" />
  <DocsDemo>
    <VButton variant="solid" tone="accent" size="md">Create</VButton>
    <VButton variant="outline" tone="neutral" size="md">Cancel</VButton>
  </DocsDemo>
</template>
