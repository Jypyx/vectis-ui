<script setup lang="ts">
definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('installation')

const viteStylesCode = `// main.ts
import 'vectis-ui/styles.css'`

const nuxtStylesCode = `// nuxt.config.ts
export default defineNuxtConfig({
  css: ['vectis-ui/styles.css'],
})`
</script>

<template>
  <h1>{{ t('installation.title') }}</h1>
  <DocsProse class="vd-lead" keypath="installation.lead" />

  <h2 id="using-vite">{{ t('installation.viteHeading') }}</h2>
  <DocsProse keypath="installation.viteBody" />
  <DocsInstall packages="vectis-ui vue" />
  <DocsProse keypath="installation.viteStyles" />
  <DocsCode lang="ts" :code="viteStylesCode" />

  <h2 id="using-nuxt">{{ t('installation.nuxtHeading') }}</h2>
  <DocsProse keypath="installation.nuxtBody" />
  <DocsInstall packages="vectis-ui" />
  <DocsProse keypath="installation.nuxtStyles" />
  <DocsCode lang="ts" :code="nuxtStylesCode" />
  <DocsProse keypath="installation.nuxtSsr" />

  <h2 id="component-css">{{ t('installation.cssHeading') }}</h2>
  <DocsProse keypath="installation.cssBody" />
</template>
