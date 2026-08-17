<script setup lang="ts">
/**
 * The page for a component that is in the inventory but has not been written yet.
 *
 * Nuxt prefers a static route over this one, so every written page resolves to its own file
 * and only the rest land here. A slug that is not in `content/nav.ts` at all is a genuine 404
 * rather than a stub — the inventory is the contract.
 */
import { VButton } from '@vectis/ui'

import { pageOf } from '~/content/nav'

definePageMeta({ layout: 'docs' })

const route = useRoute()
const page = computed(() => pageOf(String(route.params.slug)))

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'No such page', fatal: true })
}

useHead({ title: () => page.value?.title ?? 'Not found' })

const sourceUrl = 'https://github.com/Jypyx/vectis-ui/tree/main/packages/ui/src/components'
</script>

<template>
  <h1>{{ page?.title }}</h1>
  <p class="vd-lead">This page is not written yet.</p>
  <p>
    {{ page?.title }} exists upstream and is a legitimate part of the inventory; it is listed here
    so the shape of the library is honest. It is absent because it has not been read in full, not
    because it was judged unnecessary — and approximating it would document an API the library does
    not have.
  </p>
  <blockquote>
    Ask for it and it will be written the same way as the others: from the source, with values
    unrounded.
  </blockquote>

  <h2 id="in-the-meantime">In the meantime</h2>
  <p>
    The component's own stories and its <code>.mdx</code> page are the reference until then, and
    they are generated from the same source this documentation would be.
  </p>
  <div style="display: flex; flex-wrap: wrap; gap: 12px">
    <VButton
      variant="outline"
      tone="neutral"
      size="md"
      icon-end="open_in_new"
      :href="sourceUrl"
      target="_blank"
      rel="noreferrer"
    >
      Read the source
    </VButton>
    <NuxtLink to="/docs/installation" custom>
      <template #default="{ href, navigate }">
        <VButton
          variant="ghost"
          tone="neutral"
          size="md"
          :href="href ?? undefined"
          @click="navigate"
        >
          Back to installation
        </VButton>
      </template>
    </NuxtLink>
  </div>
</template>
