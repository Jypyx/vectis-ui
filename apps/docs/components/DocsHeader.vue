<script setup lang="ts">
/** Keep both search triggers mounted so one shortcut listener serves every viewport width. */
import { VButton, VHotkeys, VIconButton, VInput, VMenu, VMenuItem, VTooltip } from 'vectis-ui'
import { arrow_right_alt as arrowRightAltIcon, search as searchIcon } from 'vectis-ui/icons'

const route = useRoute()
const { theme, toggleTheme } = useDocsTheme()
const { openSearch } = useDocsSearch()

const { t, locale } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const routeBaseName = useRouteBaseName()

const homePath = computed(() => localePath('/'))

/**
 * Read section membership from route names: the /docs redirect has no localized route for path
 * comparisons.
 */
const baseName = computed(() => {
  // Guard route names because vue-router also permits symbols.
  const name = routeBaseName(route)
  return typeof name === 'string' ? name : undefined
})
const isHome = computed(() => baseName.value === 'index')
const isDocs = computed(() => baseName.value?.startsWith('docs') ?? false)

const variantFor = (active: boolean) => (active ? 'soft' : 'ghost')
const toneFor = (active: boolean) => (active ? 'accent' : 'neutral')

const themeIcon = computed(() => (theme.value === 'dark' ? 'dark_mode' : 'light_mode'))
const themeLabel = computed(() =>
  theme.value === 'dark' ? t('common.header.toLight') : t('common.header.toDark'),
)

const docsHome = computed(() => localePath('/docs/installation'))
</script>

<template>
  <header class="vd-header">
    <div class="vd-limit vd-header-row">
      <NuxtLink :to="homePath" class="vd-brand">
        <span class="vd-logo" role="img" aria-label="Vectis UI" />
      </NuxtLink>

      <nav class="vd-nav-links" :aria-label="t('common.header.mainNav')">
        <NuxtLink :to="homePath" custom>
          <template #default="{ href, navigate }">
            <VButton
              :variant="variantFor(isHome)"
              :tone="toneFor(isHome)"
              :href="href ?? undefined"
              @click="navigate"
            >
              {{ t('common.header.home') }}
            </VButton>
          </template>
        </NuxtLink>
        <NuxtLink :to="docsHome" custom>
          <template #default="{ href, navigate }">
            <VButton
              :variant="variantFor(isDocs)"
              :tone="toneFor(isDocs)"
              :href="href ?? undefined"
              @click="navigate"
            >
              {{ t('common.header.docs') }}
            </VButton>
          </template>
        </NuxtLink>
      </nav>

      <div class="vd-header-end">
        <!--
          Open search on activation, not focus, so tabbing through the header does not open a
          dialog.
        -->
        <span class="vd-search" @click="openSearch">
          <VInput
            readonly
            :icon-start="searchIcon"
            :placeholder="t('common.search.open')"
            :aria-label="t('common.search.label')"
            aria-keyshortcuts="Meta+K Control+K"
            @keydown.enter.prevent="openSearch"
          >
            <template #end>
              <!--
                Keep the shortcut on this persistent field so only one document listener serves
                every width.
              -->
              <VHotkeys
                keys="mod+k"
                size="xs"
                variant="outline"
                attached
                listen
                @trigger="openSearch"
              />
            </template>
          </VInput>
        </span>

        <span class="vd-under-640">
          <VIconButton
            :icon="searchIcon"
            :label="t('common.search.label')"
            variant="ghost"
            tone="neutral"
            @click="openSearch"
          />
        </span>

        <!--
          Place tooltips below the sticky header. Suppress duplicate descriptions when the
          button label already says the same words.
        -->
        <VTooltip :text="themeLabel" placement="bottom">
          <VIconButton
            :icon="themeIcon"
            :label="themeLabel"
            variant="ghost"
            tone="neutral"
            @click="toggleTheme"
          />
        </VTooltip>

        <!--
          Real localized anchors let the prerender crawler discover both languages and preserve
          the current page when switching.
        -->
        <VMenu placement="bottom-end" size="md" width="max-content">
          <template #trigger="{ triggerProps }">
            <!--
              Wrap the trigger button, not VMenu: a top-layer panel remains its DOM descendant
              and would otherwise retrigger the tooltip on entry.
            -->
            <VTooltip :text="t('common.header.changeLanguage')" placement="bottom">
              <VIconButton
                icon="translate"
                :label="t('common.header.changeLanguage')"
                variant="ghost"
                tone="neutral"
                v-bind="triggerProps"
              />
            </VTooltip>
          </template>
          <NuxtLink
            v-for="option in localeOptions"
            :key="option.code"
            :to="switchLocalePath(option.code)"
            custom
          >
            <template #default="{ href, navigate }">
              <VMenuItem
                :label="option.label"
                :selected="locale === option.code"
                :href="href ?? undefined"
                @click="navigate"
              />
            </template>
          </NuxtLink>
        </VMenu>

        <span class="vd-from-1024">
          <NuxtLink :to="docsHome" custom>
            <template #default="{ href, navigate }">
              <VButton
                variant="solid"
                tone="accent"
                :icon-end="arrowRightAltIcon"
                :href="href ?? undefined"
                @click="navigate"
              >
                {{ t('common.header.getStarted') }}
              </VButton>
            </template>
          </NuxtLink>
        </span>

        <span class="vd-under-1024">
          <VMenu placement="bottom-end" size="md" width="max-content">
            <template #trigger="{ triggerProps }">
              <VIconButton
                :label="t('common.header.openNavigation')"
                icon="menu"
                variant="ghost"
                tone="neutral"
                v-bind="triggerProps"
              />
            </template>

            <NuxtLink :to="homePath" custom>
              <template #default="{ href, navigate }">
                <VMenuItem
                  :label="t('common.header.home')"
                  :href="href ?? undefined"
                  :selected="isHome"
                  @click="navigate"
                />
              </template>
            </NuxtLink>
            <NuxtLink :to="docsHome" custom>
              <template #default="{ href, navigate }">
                <VMenuItem
                  :label="t('common.header.docs')"
                  :href="href ?? undefined"
                  :selected="isDocs"
                  @click="navigate"
                />
              </template>
            </NuxtLink>
          </VMenu>
        </span>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* Set the cursor on the inner field as well as its wrapper because it acts as a search button. */
.vd-search,
.vd-search :deep(.v-input-control) {
  cursor: pointer;
}
</style>
