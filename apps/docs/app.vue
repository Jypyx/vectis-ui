<script setup lang="ts">
/**
 * The site's one title rule. It is a FUNCTION rather than a `'%s · Vectis UI'` string, so a
 * page that sets no title of its own gets the bare name instead of a stray separator — which
 * is what the error pages need.
 */
useHead({
  titleTemplate: (title?: string) => (title ? `${title} · Vectis UI` : 'Vectis UI'),
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
