<script setup lang="ts">
/**
 * The site's one title rule, and the head the two languages share.
 *
 * `titleTemplate` is `documentTitle`, a FUNCTION rather than a `'%s · Vectis UI'` string, so a
 * page that sets no title of its own gets the bare product name instead of a stray separator —
 * which is what the error pages need. The name itself is not translated: it is the product.
 *
 * `useLocaleHead` supplies the rest and has to be spread here rather than left in
 * `nuxt.config.ts`: that block is serialized into the build, so a literal `lang` would claim
 * English on every French page. It also emits the `hreflang` alternates and the canonical, which
 * is how a search engine learns that two URLs are the same page in two languages rather than
 * duplicates of each other.
 *
 * The three Open Graph and Twitter lines below are the site-wide half of the same job. The
 * per-page half — the title, the description and their `og:` twins — is `useDocsHead`'s, and
 * the home page adds the `WebSite` structured data on top of it. `og:site_name` is what stops a
 * search listing being headed by the bare domain, so it belongs on every page and not only on
 * the one that carries the structured data.
 */
import { SITE_NAME } from '~/content/site'

const localeHead = useLocaleHead({ seo: true })

useHead(() => ({
  htmlAttrs: localeHead.value.htmlAttrs,
  link: localeHead.value.link,
  meta: [
    ...localeHead.value.meta,
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: SITE_NAME },
    // `summary` and not `summary_large_image`: the site ships no Open Graph image, and the
    // large card renders as an empty band when the image it is promised is missing.
    { name: 'twitter:card', content: 'summary' },
  ],
  titleTemplate: documentTitle,
}))
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
