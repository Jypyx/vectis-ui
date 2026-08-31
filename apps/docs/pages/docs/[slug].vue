<script setup lang="ts">
/**
 * The page for a component that is in the inventory but has not been written yet.
 *
 * Nuxt prefers a static route over this one, so every written page resolves to its own file
 * and only the rest land here. A slug that is not in `content/nav.ts` at all is a genuine 404
 * rather than a stub — the inventory is the contract.
 *
 * One file, thirty-six routes, in each of two languages: translating it is what localises
 * seventy of the site's hundred-odd pages.
 */
import { VButton } from 'vectis-ui'

import { pageOf } from '~/content/nav'

definePageMeta({ layout: 'docs' })

const route = useRoute()
const page = computed(() => pageOf(String(route.params.slug)))

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'No such page', fatal: true })
}

const { t } = useI18n()
const localePath = useLocalePath()

const title = computed(() => (page.value ? t(`nav.${page.value.slug}`) : t('stub.notFound')))

useHead({ title })

const sourceUrl = 'https://github.com/Jypyx/vectis-ui/tree/main/packages/ui/src/components'
</script>

<template>
  <h1>{{ title }}</h1>
  <p class="vd-lead">{{ t('stub.lead') }}</p>
  <!--
    The body does NOT open on the component's name, unlike an earlier English-only draft.
    "Avatar exists upstream and is…" needs an article and an agreement in French that the bare
    noun cannot supply, and it would need a different one for each of the thirty-six. Starting
    the sentence from "the component" costs the English nothing and makes one message serve all
    of them in both languages.
  -->
  <DocsProse keypath="stub.body" />
  <blockquote>{{ t('stub.quote') }}</blockquote>

  <h2 id="in-the-meantime">{{ t('stub.meantimeHeading') }}</h2>
  <DocsProse keypath="stub.meantime" />
  <div class="vd-actions">
    <VButton
      variant="outline"
      tone="neutral"
      size="md"
      icon-end="open_in_new"
      :href="sourceUrl"
      target="_blank"
      rel="noreferrer"
    >
      {{ t('stub.readSource') }}
    </VButton>
    <NuxtLink :to="localePath('/docs/installation')" custom>
      <template #default="{ href, navigate }">
        <VButton
          variant="ghost"
          tone="neutral"
          size="md"
          :href="href ?? undefined"
          @click="navigate"
        >
          {{ t('stub.backToInstallation') }}
        </VButton>
      </template>
    </NuxtLink>
  </div>
</template>
