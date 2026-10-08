<script setup lang="ts">
/**
 * The theme builder: settings on the left, and on the right the preview frame, which receives
 * the whole theme each time a setting changes. The frame posts once it is listening; nothing is
 * sent before, since a message to a page still loading is lost. A loader covers the frame from
 * each message until the frame reports it painted, its fonts and icons loaded.
 */
import { VSpinner } from 'vectis-ui'

import { iconLibraryById } from '~/theme-builder/options'
import { themeCss, themeDeclarations } from '~/theme-builder/output'
import { previewMessage, stateMessage, type PreviewState } from '~/theme-builder/preview'

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
const { theme } = useDocsTheme()

const frame = ref<HTMLIFrameElement | null>(null)
const previewSrc = computed(() => router.resolve(localePath('/theme/preview')).href)

const state = computed<PreviewState>(() => {
  const declarations = themeDeclarations(config.value, true)
  const library = iconLibraryById(config.value.icons)
  return {
    css: themeCss(declarations, false),
    stylesheets: [...declarations.imports, ...(library.kind === 'class' ? library.cdn : [])],
    icons: config.value.icons,
    scheme: theme.value,
  }
})

let ready = false
/** The id of the last state sent: only its acknowledgement lifts the loader. */
let sent = 0
const loading = ref(true)

function post() {
  const target = frame.value?.contentWindow
  if (!ready || !target) return
  loading.value = true
  target.postMessage(stateMessage(++sent, state.value), window.location.origin)
}

function onMessage(event: MessageEvent) {
  const message = previewMessage(event)
  if (message?.type === 'applied' && message.id === sent) loading.value = false
  if (message?.type !== 'ready') return
  ready = true
  post()
}

watch(state, post)

onMounted(() => {
  restore()
  watch(config, persist, { deep: true })
  window.addEventListener('message', onMessage)
})
onBeforeUnmount(() => window.removeEventListener('message', onMessage))
</script>

<template>
  <main class="vd-limit vd-tb">
    <h1 class="v-visually-hidden">{{ t('themeBuilder.title') }}</h1>

    <div class="vd-tb-layout">
      <ThemeBuilderPanel />

      <section class="vd-tb-preview" :aria-label="t('themeBuilder.preview')" :aria-busy="loading">
        <iframe
          ref="frame"
          :src="previewSrc"
          :title="t('themeBuilder.previewFrame')"
          class="vd-tb-frame"
        />
        <!-- aria-busy speaks for it: a status announced at each setting would be noise. -->
        <div class="vd-tb-loading" :data-active="loading || undefined" aria-hidden="true">
          <VSpinner :size="32" />
        </div>
      </section>
    </div>
  </main>
</template>
