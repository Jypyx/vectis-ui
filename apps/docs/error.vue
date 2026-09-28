<script setup lang="ts">
/**
 * It matters more here than on most sites: GitHub Pages serves `404.html` for anything it does
 * not recognise, and nitro emits that file as an empty shell, so this component is what the
 * visitor actually sees. Without it they would get Nuxt's own default page; correct, and
 * belonging to no site in particular.
 */
import type { NuxtError } from '#app'

import { VButton, VTypography } from 'vectis-ui'
import { arrow_right_alt as arrowRightAltIcon } from 'vectis-ui/icons'

const props = defineProps<{ error: NuxtError }>()

const notFound = computed(() => props.error.statusCode === 404)

const { t } = useI18n()
const localePath = useLocalePath()

useHead({
  title: () => (notFound.value ? t('error.notFoundTitle') : t('error.errorTitle')),
})

/*
 * It is a best effort and not a guarantee: GitHub Pages serves the single `404.html` for
 * anything it does not recognise, and that file is prerendered in the default locale; an
 * unknown `/fr/…` address therefore shows the English page before offering these two ways back.
 */
const leave = (to: string) => clearError({ redirect: localePath(to) })
</script>

<template>
  <NuxtLayout>
    <main class="vd-limit vd-error">
      <VTypography variant="code" as="p" tone="subtle" class="vd-stack-sm">
        {{ error.statusCode }}
      </VTypography>
      <VTypography variant="heading-1" class="vd-stack-xs">
        {{ notFound ? t('error.notFoundHeading') : t('error.errorTitle') }}
      </VTypography>
      <VTypography variant="body-xl" tone="muted" class="vd-stack-lg">
        <template v-if="notFound">
          {{ t('error.notFoundBody') }}
        </template>
        <template v-else>
          {{ error.message || t('error.errorBody') }}
        </template>
      </VTypography>
      <div class="vd-actions">
        <VButton
          variant="solid"
          tone="accent"
          size="md"
          :icon-end="arrowRightAltIcon"
          @click="leave('/docs/installation')"
        >
          {{ t('error.toDocs') }}
        </VButton>
        <VButton variant="outline" tone="neutral" size="md" @click="leave('/')">
          {{ t('error.toHome') }}
        </VButton>
      </div>
    </main>
  </NuxtLayout>
</template>
