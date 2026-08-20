<script setup lang="ts">
import { VButton } from '@vectis/ui'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('installation.title') })

/*
 * The samples are NOT translated, here or anywhere on the site: a demo has to match the code
 * printed beside it, and the code is the same in every language. The heading `id`s are not
 * translated either — they are the site's permalinks, and a reader who bookmarks
 * `#component-css` must land there whichever language they read it in.
 */
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
  <h1>{{ t('installation.title') }}</h1>
  <DocsProse class="vd-lead" keypath="installation.lead" />

  <DocsCode lang="bash" :code="addCode" />

  <h2 id="vue-3">{{ t('installation.vueHeading') }}</h2>
  <DocsCode lang="ts" :code="vueCode" />
  <DocsProse keypath="installation.vueBody" />

  <h2 id="nuxt-3">{{ t('installation.nuxtHeading') }}</h2>
  <DocsCode lang="ts" :code="nuxtCode" />
  <DocsProse keypath="installation.nuxtBody" />

  <h3 id="component-css">{{ t('installation.cssHeading') }}</h3>
  <DocsProse keypath="installation.cssBody" />
  <DocsProse tag="blockquote" keypath="installation.cssQuote" />

  <h2 id="what-you-get">{{ t('installation.getHeading') }}</h2>
  <DocsProse keypath="installation.getBody" />
  <DocsCode lang="vue" :code="useCode" />
  <DocsDemo>
    <VButton variant="solid" tone="accent" size="md">Create</VButton>
    <VButton variant="outline" tone="neutral" size="md">Cancel</VButton>
  </DocsDemo>
</template>
