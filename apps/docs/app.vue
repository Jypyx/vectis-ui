<script setup lang="ts">
/**
 * The site's one title rule, and the head the two languages share.
 *
 * `titleTemplate` is a FUNCTION rather than a `'%s · Vectis UI'` string, so a page that sets no
 * title of its own gets the bare name instead of a stray separator — which is what the error
 * pages need. The name itself is not translated: it is the product.
 *
 * `useLocaleHead` supplies the rest and has to be spread here rather than left in
 * `nuxt.config.ts`: that block is serialized into the build, so a literal `lang` would claim
 * English on every French page. It also emits the `hreflang` alternates and the canonical, which
 * is how a search engine learns that two URLs are the same page in two languages rather than
 * duplicates of each other.
 */
const localeHead = useLocaleHead({ seo: true })

useHead(() => ({
  htmlAttrs: localeHead.value.htmlAttrs,
  link: localeHead.value.link,
  meta: localeHead.value.meta,
  titleTemplate: (title?: string) => (title ? `${title} · Vectis UI` : 'Vectis UI'),
}))
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
