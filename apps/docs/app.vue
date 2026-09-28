<script setup lang="ts">
/**
 * Shared locale-aware metadata. Keep the social image URL absolute and its declared dimensions
 * aligned with the file checked by check-prerender.
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
