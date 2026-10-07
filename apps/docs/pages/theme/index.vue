<script setup lang="ts">
/**
 * The theme builder: settings on the left, and on the right the preview frame, which receives
 * the whole theme each time a setting changes. The frame posts once it is listening; nothing is
 * sent before, since a message to a page still loading is lost.
 */
import { VToggle, VToggleItem, VTypography } from 'vectis-ui'

import { iconLibraryById } from '~/theme-builder/options'
import { themeCss, themeDeclarations } from '~/theme-builder/output'
import { previewMessage, stateMessage, type PreviewState } from '~/theme-builder/preview'
import type { Scheme } from '~/theme-builder/model'

const { t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()

useHead(() => {
  const title = t('themeBuilder.title')
  const description = metaDescription(t('themeBuilder.lead'))
  return {
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: documentTitle(title) },
      { property: 'og:description', content: description },
    ],
  }
})

const { config, restore, persist } = useThemeBuilder()

const scheme = ref<Scheme>('light')
const frame = ref<HTMLIFrameElement | null>(null)
const previewSrc = computed(() => router.resolve(localePath('/theme/preview')).href)

const state = computed<PreviewState>(() => {
  const declarations = themeDeclarations(config.value, true)
  const library = iconLibraryById(config.value.icons)
  return {
    css: themeCss(declarations, false),
    stylesheets: [...declarations.imports, ...(library.kind === 'class' ? library.cdn : [])],
    icons: config.value.icons,
    scheme: scheme.value,
  }
})

let ready = false

function post() {
  if (ready)
    frame.value?.contentWindow?.postMessage(stateMessage(state.value), window.location.origin)
}

function onMessage(event: MessageEvent) {
  if (previewMessage(event)?.type !== 'ready') return
  ready = true
  post()
}

watch(state, post)

onMounted(() => {
  // The pre-paint script has set the page's theme; the preview starts from it.
  scheme.value = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
  restore()
  watch(config, persist, { deep: true })
  window.addEventListener('message', onMessage)
})
onBeforeUnmount(() => window.removeEventListener('message', onMessage))
</script>

<template>
  <main class="vd-limit vd-tb">
    <header class="vd-tb-head">
      <VTypography variant="heading-1" as="h1">{{ t('themeBuilder.title') }}</VTypography>
      <DocsProse keypath="themeBuilder.lead" variant="body-lg" tone="muted" class="vd-tb-lead" />
    </header>

    <div class="vd-tb-layout">
      <ThemeBuilderPanel />

      <section class="vd-tb-preview" :aria-label="t('themeBuilder.preview')">
        <div class="vd-tb-preview-bar">
          <VTypography variant="label" as="h2">{{ t('themeBuilder.preview') }}</VTypography>
          <VToggle
            v-model="scheme"
            :label="t('themeBuilder.previewScheme')"
            mandatory
            size="sm"
            item-variant="ghost"
            selected-variant="soft"
            tone="accent"
          >
            <VToggleItem value="light" icon-start="light_mode" :label="t('themeBuilder.light')" />
            <VToggleItem value="dark" icon-start="dark_mode" :label="t('themeBuilder.dark')" />
          </VToggle>
        </div>
        <iframe
          ref="frame"
          :src="previewSrc"
          :title="t('themeBuilder.previewFrame')"
          class="vd-tb-frame"
        />
      </section>
    </div>
  </main>
</template>
