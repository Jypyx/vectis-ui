<script setup lang="ts">
/**
 * The theme builder's preview, which /theme loads in a frame. It paints what that page posts: a
 * stylesheet of tokens, font and icon stylesheets, an icon library and a scheme. A frame of its
 * own is what lets the root font size, which every rem follows, change for these components
 * without changing the page around them.
 */
import {
  VSnackbar,
  VToaster,
  classIconResolver,
  componentIconResolver,
  ligatureIconResolver,
  setIconResolver,
} from 'vectis-ui'

import { docsIconResolver } from '~/icons/resolver'
import { iconLibraryById, type IconLibraryId } from '~/theme-builder/options'
import { previewMessage, readyMessage, type PreviewState } from '~/theme-builder/preview'

definePageMeta({ layout: false })

const { t } = useI18n()
useHead(() => ({
  title: t('themeBuilder.preview'),
  meta: [{ name: 'robots', content: 'noindex' }],
}))

const { theme } = useDocsTheme()

const COMPONENT_SETS = {
  lucide: () => import('~/theme-builder/iconSets/lucide'),
  heroicons: () => import('~/theme-builder/iconSets/heroicons'),
}

/** Each change bumps it, so a slow component import cannot land after a newer choice. */
let iconRequest = 0

async function applyIcons(id: IconLibraryId) {
  const request = ++iconRequest
  const library = iconLibraryById(id)
  if (library.kind === 'builtin') return setIconResolver(docsIconResolver)
  if (library.kind === 'ligature') return setIconResolver(ligatureIconResolver())
  if (library.kind === 'class') {
    return setIconResolver(
      classIconResolver({ aliases: library.aliases, className: library.className }),
    )
  }
  const { components } = await COMPONENT_SETS[library.id as keyof typeof COMPONENT_SETS]()
  if (request !== iconRequest) return
  const filledProps = library.filledProps
  setIconResolver(
    componentIconResolver({
      components,
      props: filledProps ? (_name, filled) => (filled ? filledProps : {}) : undefined,
    }),
  )
}

let tokens: HTMLStyleElement | undefined
const links = new Map<string, HTMLLinkElement>()

/** Appended last in the head, so these unlayered rules follow the site's own sheets. */
function applyStyles(state: PreviewState) {
  tokens ??= document.head.appendChild(document.createElement('style'))
  tokens.textContent = state.css

  for (const [href, link] of links) {
    if (state.stylesheets.includes(href)) continue
    link.remove()
    links.delete(href)
  }
  for (const href of state.stylesheets) {
    if (links.has(href)) continue
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    document.head.append(link)
    links.set(href, link)
  }
}

let currentIcons: IconLibraryId | undefined

function onMessage(event: MessageEvent) {
  const message = previewMessage(event)
  if (message?.type !== 'state') return
  applyStyles(message.state)
  theme.value = message.state.scheme
  if (message.state.icons !== currentIcons) {
    currentIcons = message.state.icons
    void applyIcons(message.state.icons)
  }
}

onMounted(() => {
  window.addEventListener('message', onMessage)
  window.parent.postMessage(readyMessage(), window.location.origin)
})
onBeforeUnmount(() => window.removeEventListener('message', onMessage))
</script>

<template>
  <div class="tp-app">
    <ThemePreviewSidebar class="tp-sidebar" />
    <div class="tp-main">
      <ThemePreviewTopbar />
      <main class="tp-content">
        <ThemePreviewOverview />
        <ThemePreviewForms />
        <ThemePreviewWidgets />
      </main>
    </div>
    <VToaster />
    <VSnackbar />
  </div>
</template>

<style scoped>
.tp-app {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-block-size: 100dvh;
  background: var(--vectis-color-surface);
  color: var(--vectis-color-text);
  font-family: var(--vectis-text-family);
  font-size: var(--vectis-text-body-md-size);
  line-height: var(--vectis-text-body-md-leading);
}
.tp-main {
  display: flex;
  flex-direction: column;
  min-inline-size: 0;
}
.tp-content {
  display: grid;
  gap: var(--vectis-space-6);
  padding: var(--vectis-space-5);
}

/* The frame's own width, since the page is laid out inside it. */
@media (min-width: 900px) {
  .tp-app {
    grid-template-columns: 15rem minmax(0, 1fr);
  }
  .tp-content {
    padding: var(--vectis-space-6);
  }
}
</style>
