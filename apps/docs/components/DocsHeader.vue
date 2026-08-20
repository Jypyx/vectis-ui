<script setup lang="ts">
/**
 * The site's header: identity, the three destinations, and the four controls.
 *
 * Nothing here measures the viewport. Which controls are visible is entirely the business of
 * `docs-layout.css` (`.vd-from-768`, `.vd-from-1024`, `.vd-only-compact`), so the burger and
 * the full row are the SAME markup revealed at different widths rather than two trees kept
 * in step by hand.
 *
 * Every destination is a real `<a href>` wrapped in a `<NuxtLink custom>`: the anchor is what
 * makes middle-click, "open in new tab" and a crawler work, and `navigate` is what keeps an
 * ordinary click a client-side transition. A `@click`-only button would lose the first and a
 * bare `href` the second.
 *
 * The `href ?? undefined` repeated below is not noise: the slot types it `string | null`, and
 * the library's `href` prop is optional rather than nullable. `null` would be rendered as the
 * literal attribute value on the anchor, so the coercion is the honest form and not a cast.
 */
import {
  VButton,
  VHotkeys,
  VIcon,
  VIconButton,
  VMenu,
  VMenuGroup,
  VMenuItem,
  VMenuSeparator,
} from '@vectis/ui'

const route = useRoute()
const { theme, setTheme, toggleTheme } = useDocsTheme()
const { locale, localeOptions, setDocsLocale } = useDocsLocale()
const { openSearch } = useDocsSearch()

const isHome = computed(() => route.path === '/')
const isDocs = computed(() => route.path.startsWith('/docs'))

/** The current destination is tinted, the others are bare — the whole of the "you are here". */
const variantFor = (active: boolean) => (active ? 'soft' : 'ghost')

const themeIcon = computed(() => (theme.value === 'dark' ? 'dark_mode' : 'light_mode'))
const themeLabel = computed(() =>
  theme.value === 'dark' ? 'Switch to the light theme' : 'Switch to the dark theme',
)

/**
 * The xs control height (24px) crowds the 32px field, so this one instance comes down a
 * step. Written on the element, because the size table sets those variables there too and a
 * stylesheet rule would have to out-specify it.
 */
const hotkeyStyle = {
  '--control-height': '20px',
  '--control-font-size': '11px',
  '--control-padding-inline': '5px',
  '--control-gap': '3px',
}

/** Where "Docs" and "Get started" go: the section has no index of its own. */
const DOCS_HOME = '/docs/installation'
</script>

<template>
  <!--
    The background is translucent rather than flat, and that is what lets the home page's glow
    read THROUGH the bar instead of stopping under it. The blur is what pays for it: a sticky
    header 42% open onto the page would otherwise have its labels sitting on whatever text is
    scrolling beneath them. The saturation is not decoration either — what passes through is a
    0.16-alpha wash, and the mix takes more than half of what is left; boosting the backdrop's
    chroma buys back the tint without opening the veil any further, which is the half of the
    trade that costs legibility.

    At the top of a documentation page the mix is indistinguishable from the flat surface it
    replaces, since that is the very colour it is mixed with — the effect only shows where
    there is something behind: the glow here, scrolled content elsewhere.
  -->
  <header
    class="vd-header"
    style="
      position: sticky;
      top: 0;
      z-index: 30;
      background: color-mix(in oklch, var(--vectis-color-surface) 58%, transparent);
      backdrop-filter: blur(12px) saturate(1.7);
      border-bottom: 1px solid var(--vectis-color-border);
    "
  >
    <div class="vd-limit vd-header-row">
      <NuxtLink
        to="/"
        style="
          display: flex;
          align-items: center;
          gap: 8px;
          color: inherit;
          text-decoration: none;
          flex: none;
        "
      >
        <span
          class="vd-logo"
          role="img"
          aria-label="Vectis UI"
          style="display: block; width: 137px; height: 28px"
        />
      </NuxtLink>

      <nav class="vd-nav-links" aria-label="Main">
        <NuxtLink to="/" custom>
          <template #default="{ href, navigate }">
            <VButton
              :variant="variantFor(isHome)"
              tone="neutral"
              size="sm"
              :href="href ?? undefined"
              @click="navigate"
            >
              Home
            </VButton>
          </template>
        </NuxtLink>
        <NuxtLink :to="DOCS_HOME" custom>
          <template #default="{ href, navigate }">
            <VButton
              :variant="variantFor(isDocs)"
              tone="neutral"
              size="sm"
              :href="href ?? undefined"
              @click="navigate"
            >
              Docs
            </VButton>
          </template>
        </NuxtLink>
      </nav>

      <div class="vd-header-end">
        <!--
          A field-shaped button, not a read-only VInput: a real field would take a tab stop
          that leads nowhere, and would invite typing into a box that cannot answer.
        -->
        <button
          type="button"
          class="vd-search"
          aria-label="Search the documentation"
          aria-keyshortcuts="Meta+K Control+K"
          @click="openSearch"
        >
          <VIcon name="search" :size="20" />
          <span class="vd-search-text">Search</span>
          <span class="vd-search-hot">
            <!--
              The shortcut is the library's own component doing its own job: `listen` attaches
              the document handler, so the site writes no keyboard code of its own. `mod`
              rather than `ctrl` is what shows ⌘ on macOS and Ctrl everywhere else.
            -->
            <VHotkeys
              keys="mod+k"
              size="xs"
              variant="outlined"
              attached
              listen
              :style="hotkeyStyle"
              @trigger="openSearch"
            />
          </span>
        </button>

        <span style="display: inline-flex">
          <VIconButton
            :icon="themeIcon"
            :label="themeLabel"
            variant="ghost"
            tone="neutral"
            size="sm"
            @click="toggleTheme"
          />
        </span>

        <span class="vd-from-768">
          <VMenu placement="bottom-end" size="sm" width="13rem">
            <template #trigger="{ triggerProps }">
              <VButton
                variant="ghost"
                tone="neutral"
                size="sm"
                icon-end="expand_more"
                v-bind="triggerProps"
              >
                {{ locale.toUpperCase() }}
              </VButton>
            </template>
            <VMenuGroup label="Interface language">
              <VMenuItem
                v-for="option in localeOptions"
                :key="option.id"
                :label="option.label"
                :sublabel="option.sublabel"
                :selected="locale === option.id"
                @select="setDocsLocale(option.id)"
              />
            </VMenuGroup>
          </VMenu>
        </span>

        <span class="vd-from-1024">
          <NuxtLink :to="DOCS_HOME" custom>
            <template #default="{ href, navigate }">
              <VButton
                variant="solid"
                tone="accent"
                size="sm"
                icon-end="arrow_right_alt"
                :href="href ?? undefined"
                @click="navigate"
              >
                Get started
              </VButton>
            </template>
          </NuxtLink>
        </span>

        <span class="vd-only-compact">
          <VMenu placement="bottom-end" size="md" width="15rem">
            <template #trigger="{ triggerProps }">
              <VIconButton
                label="Open the navigation"
                icon="menu"
                variant="ghost"
                tone="neutral"
                size="sm"
                v-bind="triggerProps"
              />
            </template>

            <NuxtLink to="/" custom>
              <template #default="{ href, navigate }">
                <VMenuItem
                  label="Home"
                  :href="href ?? undefined"
                  :selected="isHome"
                  @click="navigate"
                />
              </template>
            </NuxtLink>
            <NuxtLink :to="DOCS_HOME" custom>
              <template #default="{ href, navigate }">
                <VMenuItem
                  label="Docs"
                  :href="href ?? undefined"
                  :selected="isDocs"
                  @click="navigate"
                />
              </template>
            </NuxtLink>

            <VMenuSeparator />
            <VMenuGroup label="Colour scheme">
              <VMenuItem
                label="Light"
                icon-start="light_mode"
                :selected="theme === 'light'"
                @select="setTheme('light')"
              />
              <VMenuItem
                label="Dark"
                icon-start="dark_mode"
                :selected="theme === 'dark'"
                @select="setTheme('dark')"
              />
            </VMenuGroup>

            <VMenuSeparator />
            <VMenuGroup label="Language">
              <VMenuItem
                v-for="option in localeOptions.slice(0, 2)"
                :key="option.id"
                :label="option.label"
                :selected="locale === option.id"
                @select="setDocsLocale(option.id)"
              />
            </VMenuGroup>
          </VMenu>
        </span>
      </div>
    </div>
  </header>
</template>
