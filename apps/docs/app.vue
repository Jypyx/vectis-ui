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
 * The Open Graph lines below are the site-wide half of the same job. The per-page half — the
 * title, the description and their `og:` twins — is `useDocsHead`'s, and the home page adds the
 * `WebSite` structured data on top of it. `og:site_name` is what stops a search listing being
 * headed by the bare domain, so it belongs on every page and not only on the one carrying the
 * structured data.
 *
 * The card image is ONE file for the whole site, and four things about it are load-bearing.
 * Its URL is ABSOLUTE: a scraper reads the tag without the page it came from, and a relative
 * path is ignored by nearly all of them. It is served from `public/`, which Vite copies
 * verbatim, where `assets/` would hash the name and hand out a new URL on every build,
 * orphaning what has already been scraped and cached. The declared width and height must be the
 * file's REAL ones, or a client reserves a box of the wrong shape and lays the card out around
 * it — `scripts/check-prerender.ts` reads them back off the file itself so the two cannot
 * drift, and it takes the file NAME from `og:image` here, so changing the picture is one line.
 * And it is a JPEG because the picture is a wide colour gradient, which is the one subject PNG
 * stores badly: the same image costs about twelve times more as a PNG, all of it in the
 * gradient rather than in the lettering.
 */
import { SITE_NAME, SITE_URL } from '~/content/site'

const { t } = useI18n()
const localeHead = useLocaleHead({ seo: true })

useHead(() => ({
  htmlAttrs: localeHead.value.htmlAttrs,
  link: localeHead.value.link,
  meta: [
    ...localeHead.value.meta,
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:image', content: `${SITE_URL}/og-image.jpg` },
    { property: 'og:image:type', content: 'image/jpeg' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: t('common.ogImageAlt') },
    // X falls back to `og:image` when no `twitter:image` is given, so the large card is this
    // one line and no second copy of the picture.
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
  titleTemplate: documentTitle,
}))
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
