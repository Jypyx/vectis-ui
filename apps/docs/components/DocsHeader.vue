<script setup lang="ts">
/**
 * The site's header: identity, the three destinations, and the four controls.
 *
 * Nothing here measures the viewport, and nothing here states a measurement: the bar's own
 * chrome (`.vd-header`, including why its background is a translucent mix the home page's glow
 * reads through) and the visibility rules (`.vd-under-640`, `.vd-under-1024`, `.vd-from-1024`)
 * are all `docs-layout.css`'s business, so the burger and the full row are the SAME markup
 * revealed at different widths rather than two trees kept in step by hand. The theme and
 * language controls carry no class at all: they are the two the reader can reach at every
 * width, which is what the burger no longer has to duplicate.
 *
 * Search is the one place where that does not hold, and the exception is a real one: the
 * wide trigger is a FIELD, and a field has nowhere to sit on a phone. So the compact trigger
 * is a separate icon button, and exactly one of the two is visible at any width. The hidden
 * one stays MOUNTED — `display: none` is CSS, not a `v-if` — which is what keeps ⌘K working
 * on a phone from the single VHotkeys instance living inside the field.
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
import { VButton, VHotkeys, VIconButton, VInput, VMenu, VMenuItem, VTooltip } from '@vectis/ui'
import { arrow_right_alt as arrowRightAltIcon, search as searchIcon } from '@vectis/ui/icons'

const route = useRoute()
const { theme, toggleTheme } = useDocsTheme()
const { openSearch } = useDocsSearch()

const { t, locale } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()

/**
 * "You are here", measured on the LOCALE-STRIPPED path.
 *
 * `route.path` carries the `/fr` segment, so a literal `startsWith('/docs')` would report every
 * French page as being nowhere and leave both header buttons untinted. `localePath` gives the
 * same two destinations in the current language, which is what the comparison needs.
 */
const homePath = computed(() => localePath('/'))
const isHome = computed(() => route.path === homePath.value)
const isDocs = computed(() => route.path.startsWith(localePath('/docs')))

/**
 * The whole of the "you are here": the current destination is a soft fill in the ACCENT, the
 * others are bare neutral. Two functions rather than one returning a pair, so each call site
 * reads as the prop it feeds and neither button has to destructure in the template.
 */
const variantFor = (active: boolean) => (active ? 'soft' : 'ghost')
const toneFor = (active: boolean) => (active ? 'accent' : 'neutral')

const themeIcon = computed(() => (theme.value === 'dark' ? 'dark_mode' : 'light_mode'))
const themeLabel = computed(() =>
  theme.value === 'dark' ? t('common.header.toLight') : t('common.header.toDark'),
)

/**
 * Where "Documentation" and "Get started" go: the section has no index of its own.
 *
 * Through `localePath` because a bare `/docs/installation` would drop a French reader back into
 * the English site — silently, since the page exists and renders.
 */
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
          The trigger IS the search box, read-only: the reader sees the field they are about
          to type in rather than a button standing in for it. Read-only is what makes that
          honest — the box can be focused and copied from, and not one keystroke is swallowed
          by a field with no index behind it.

          The click sits on the wrapper rather than on the VInput, so the padding, the
          magnifier and the shortcut caps all open the dialog and not the input's own box
          alone; Enter does the same from the keyboard. Deliberately NOT `@focus`: a reader
          tabbing through the header would be dropped into a dialog they never asked for.
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
                The shortcut is the library's own component doing its own job: `listen` attaches
                the document handler, so the site writes no keyboard code of its own. `mod`
                rather than `ctrl` is what shows ⌘ on macOS and Ctrl everywhere else. It is
                declared HERE and nowhere else: the field is hidden below the desktop but never
                unmounted, so this one instance serves every width.
              -->
              <VHotkeys
                keys="mod+k"
                size="xs"
                variant="outlined"
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
          The two icon-only controls carry a tooltip, and both of them make the same two
          departures from VTooltip's default wiring.

          `placement="bottom"`, because the header is sticky at `top: 0` and there is no room
          above it. The default would be flipped down by `position-try-fallbacks` anyway, so
          naming the side that will actually be used costs nothing and states the intent.

          And `triggerProps` is deliberately NOT bound, which is the one place this deviates
          from what the slot documents. What it carries is `aria-describedby`, and the tooltip
          here says exactly what the button's `label` already says — an accessible name and a
          description holding the same words are read out twice in a row. The tooltip is the
          VISUAL echo of a name a screen reader already has, so it stays out of the
          accessibility tree. Give a tooltip text of its own and binding it becomes right
          again.
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
          Each language is a real LINK, not a click handler, and that is what publishes the
          French site: the prerender crawler follows anchors, so `/fr/…` is reachable from every
          page of the English one and vice versa. `switchLocalePath` keeps the reader on the
          page they are reading — including on the dynamic stub route, where a hard-coded
          `/fr/` would drop them at the top of the documentation instead.
        -->
        <VMenu placement="bottom-end" size="md" width="max-content">
          <template #trigger="{ triggerProps }">
            <!--
              `translate` is one of the six icons the site's own resolver supplies: the
              library ships the thirty-four its components draw, and a language switcher is
              not one of them. Adding a name means adding it to `scripts/build-icons.ts` and
              running `pnpm --filter @vectis/docs icons` — never leaving it to the ligature,
              which with no Material Symbols font loaded renders as the word "translate".

              The current language is no longer written on the trigger; it is the menu's
              selected item that carries it, which is also where a reader can act on it.

              The tooltip wraps the BUTTON and not the VMenu, and that is not tidiness: a
              popover panel stays a DOM descendant even when painted in the top layer, so
              wrapping the menu would put its panel inside the tooltip's span — where
              moving the pointer into the open menu would fire `pointerenter` and bring the
              tooltip back up over it. Wrapped this way the panel is a sibling, and the
              button remains the `popovertarget` invoker, hence still the menu's implicit
              anchor: an extra span around it changes nothing there.

              The click that opens the menu takes the tooltip down with it, and that is
              VTooltip's own business rather than something wired here: it closes on
              `pointerdown`, on every browser and for every consumer.
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
/*
 * Unlayered like the rest of the site's CSS, and scoped because it belongs to this header
 * alone. It lives here rather than in docs-layout.css for the reason that file states about
 * itself: only what a MEDIA QUERY owns goes there, and a cursor is not that.
 *
 * The field acts as a button, so it has to say so — and the declaration cannot stop at the
 * wrapper. `cursor` does inherit, but a browser gives a text input a value of its own, which
 * would leave an I-beam over the very box the reader is meant to click. Hence `:deep()`,
 * confined to `.vd-search`.
 */
.vd-search,
.vd-search :deep(.v-input-control) {
  cursor: pointer;
}
</style>
