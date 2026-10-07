<script setup lang="ts">
/**
 * One VCommandPalette owns the ⌘K listener; its trigger slot holds both the field shown from
 * 640px and the icon button shown below it.
 */
import {
  VButton,
  VCommandPalette,
  VHotkeys,
  VIconButton,
  VInput,
  VMenu,
  VMenuGroup,
  VMenuItem,
  VMenuSeparator,
  VTooltip,
} from 'vectis-ui'
import type { CommandPaletteCommand, CommandPaletteItem } from 'vectis-ui'
import { arrow_right_alt as arrowRightAltIcon, search as searchIcon } from 'vectis-ui/icons'

import { groups } from '~/content/nav'
import { SITE_REPO_URL } from '~/content/site'
import { githubIcon } from '~/icons/github'

const route = useRoute()
const router = useRouter()
const { theme, toggleTheme } = useDocsTheme()

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
const isTheme = computed(() => baseName.value === 'theme')

const variantFor = (active: boolean) => (active ? 'soft' : 'ghost')
const toneFor = (active: boolean) => (active ? 'accent' : 'neutral')

const themeIcon = computed(() => (theme.value === 'dark' ? 'dark_mode' : 'light_mode'))
const themeLabel = computed(() =>
  theme.value === 'dark' ? t('common.header.toLight') : t('common.header.toDark'),
)

const docsHome = computed(() => localePath('/docs/installation'))
const themePath = computed(() => localePath('/theme'))

/**
 * Every documentation page, grouped as the rail groups them. The slug is a keyword so English
 * component names still match in French. `id` keeps the route for the router; `href` is the
 * resolved address, base URL included, that a modified click opens natively.
 */
const searchItems = computed<CommandPaletteItem[]>(() =>
  groups.map((group) => ({
    label: t(`nav.group.${group.id}`),
    commands: group.entries.map((page) => {
      const to = localePath(`/docs/${page.slug}`)
      return {
        id: to,
        label: t(`nav.${page.slug}`),
        keywords: [page.slug],
        href: router.resolve(to).href,
      }
    }),
  })),
)

/** Hand plain activations to the router; a modified click keeps opening a new tab. */
function onSearchSelect(command: CommandPaletteCommand, event: MouseEvent) {
  if (typeof command.id !== 'string' || event.ctrlKey || event.metaKey || event.shiftKey) return
  event.preventDefault()
  void router.push(command.id)
}

/**
 * Below 640px the theme, language and GitHub buttons move into the navigation menu. Menu items
 * cannot be hidden by CSS without leaving them in its keyboard order, so the width is read
 * after mount; the server renders the wide header.
 */
const narrow = ref(false)
onMounted(() => {
  const query = window.matchMedia('(width < 640px)')
  narrow.value = query.matches
  const onChange = (event: MediaQueryListEvent) => (narrow.value = event.matches)
  query.addEventListener('change', onChange)
  onBeforeUnmount(() => query.removeEventListener('change', onChange))
})
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
        <NuxtLink :to="themePath" custom>
          <template #default="{ href, navigate }">
            <VButton
              :variant="variantFor(isTheme)"
              :tone="toneFor(isTheme)"
              :href="href ?? undefined"
              @click="navigate"
            >
              {{ t('common.header.theme') }}
            </VButton>
          </template>
        </NuxtLink>
      </nav>

      <div class="vd-header-end">
        <VCommandPalette
          :items="searchItems"
          shortcut="mod+k"
          :label="t('common.search.label')"
          :placeholder="t('common.search.placeholder')"
          :empty-text="t('common.search.empty')"
          @select="onSearchSelect"
        >
          <template #trigger="{ triggerProps }">
            <!--
              Open search on activation, not focus, so tabbing through the header does not open
              a dialog.
            -->
            <span class="vd-search" @click="triggerProps.onClick">
              <VInput
                readonly
                :icon-start="searchIcon"
                :placeholder="t('common.search.open')"
                :aria-label="t('common.search.label')"
                :aria-haspopup="triggerProps['aria-haspopup']"
                :aria-keyshortcuts="triggerProps['aria-keyshortcuts']"
                @keydown.enter.prevent="triggerProps.onClick"
              >
                <template #end>
                  <VHotkeys keys="mod+k" size="xs" variant="outline" attached />
                </template>
              </VInput>
            </span>

            <span class="vd-under-640">
              <VIconButton
                :icon="searchIcon"
                :label="t('common.search.label')"
                variant="ghost"
                tone="neutral"
                v-bind="triggerProps"
              />
            </span>
          </template>
        </VCommandPalette>

        <span class="vd-from-640">
          <!--
            Place tooltips below the sticky header. Suppress duplicate descriptions when the
            button label already says the same words.
          -->
          <VTooltip :text="t('common.header.github')" placement="bottom">
            <VIconButton
              :icon="githubIcon"
              :label="t('common.header.github')"
              :href="SITE_REPO_URL"
              target="_blank"
              rel="noreferrer"
              variant="ghost"
              tone="neutral"
            />
          </VTooltip>

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
            Real localized anchors let the prerender crawler discover both languages and
            preserve the current page when switching.
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
        </span>

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
            <NuxtLink :to="themePath" custom>
              <template #default="{ href, navigate }">
                <VMenuItem
                  :label="t('common.header.theme')"
                  :href="href ?? undefined"
                  :selected="isTheme"
                  @click="navigate"
                />
              </template>
            </NuxtLink>
            <template v-if="narrow">
              <VMenuSeparator />
              <VMenuItem :icon-start="themeIcon" :label="themeLabel" @select="toggleTheme" />
              <VMenuItem
                :icon-start="githubIcon"
                icon-end="open_in_new"
                :label="t('common.header.github')"
                :href="SITE_REPO_URL"
                target="_blank"
                rel="noreferrer"
              />
              <VMenuSeparator />
              <VMenuGroup :label="t('common.header.language')">
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
              </VMenuGroup>
            </template>
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
