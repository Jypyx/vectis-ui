<script setup lang="ts">
definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('installation.title') })

/*
 * The samples are NOT translated, here or anywhere on the site: a demo has to match the code
 * printed beside it, and the code is the same in every language. The heading `id`s are not
 * translated either — they are the site's permalinks, and a reader who bookmarks
 * `#component-css` must land there whichever language they read it in.
 *
 * The two install COMMANDS are deliberately not written here: they depend on the manager the
 * reader uses, so DocsInstall composes each one from the packages that route needs.
 */
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

  <!--
    Component CSS is a section of its own and no longer a subsection of the Nuxt one: it
    describes what the package does in both, so hanging it under either would have made it look
    like a property of that one. The `id` is unchanged, the heading having only moved a level.
  -->
  <h2 id="component-css">{{ t('installation.cssHeading') }}</h2>
  <DocsProse keypath="installation.cssBody" />
</template>
