<script setup lang="ts">
/**
 * The page a mistyped URL lands on.
 *
 * It matters more here than on most sites: GitHub Pages serves `404.html` for anything it does
 * not recognise, and nitro emits that file as an empty shell, so this component is what the
 * visitor actually sees. Without it they would get Nuxt's own default page — correct, and
 * belonging to no site in particular.
 *
 * Navigation goes through `clearError`, not through a link: while the error is set, the router
 * is holding the failed route, and pushing a new one without clearing it first leaves the page
 * in its error state.
 */
import type { NuxtError } from '#app'

import { VButton } from '@vectis/ui'

const props = defineProps<{ error: NuxtError }>()

const notFound = computed(() => props.error.statusCode === 404)

useHead({ title: () => (notFound.value ? 'Page not found' : 'Something went wrong') })

const leave = (to: string) => clearError({ redirect: to })
</script>

<template>
  <NuxtLayout>
    <main class="vd-limit" style="padding-block: 64px 96px; max-width: 72ch">
      <p
        style="
          margin: 0 0 8px;
          font-family: var(--vectis-font-family-mono);
          font-size: var(--vectis-text-code-size);
          color: var(--vectis-color-text-subtle);
        "
      >
        {{ error.statusCode }}
      </p>
      <h1
        style="
          margin: 0 0 12px;
          font-family: var(--vectis-font-family-display);
          font-size: var(--vectis-text-heading-1-size);
          font-weight: var(--vectis-text-heading-1-weight);
          line-height: var(--vectis-text-heading-1-leading);
          letter-spacing: var(--vectis-text-heading-1-tracking);
        "
      >
        {{ notFound ? 'This page does not exist' : 'Something went wrong' }}
      </h1>
      <p
        style="
          margin: 0 0 28px;
          font-size: 18px;
          line-height: 1.65;
          color: var(--vectis-color-text-muted);
        "
      >
        <template v-if="notFound">
          The address may be out of date, or the component may be listed under another name. The
          documentation's own search — Ctrl or ⌘ then K — covers every page and every component.
        </template>
        <template v-else>
          {{ error.message || 'The page could not be rendered.' }}
        </template>
      </p>
      <div style="display: flex; flex-wrap: wrap; gap: 12px">
        <VButton
          variant="solid"
          tone="accent"
          size="md"
          icon-end="arrow_right_alt"
          @click="leave('/docs/installation')"
        >
          Go to the documentation
        </VButton>
        <VButton variant="outline" tone="neutral" size="md" @click="leave('/')">
          Back to the home page
        </VButton>
      </div>
    </main>
  </NuxtLayout>
</template>
