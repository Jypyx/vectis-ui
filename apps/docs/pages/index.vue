<script setup lang="ts">
/**
 * The home page: what the library is, the three decisions that produced it, and the figures
 * that back them up.
 *
 * The numbers in the stats band are read from the source rather than remembered — the
 * component count is `content/nav.ts` counting itself, and the palette and stylesheet
 * figures come from the token source and a measured build.
 */
import { VButton } from '@vectis/ui'

import { components } from '~/content/nav'

const { t } = useI18n()
const localePath = useLocalePath()

useHead({ title: () => t('home.documentTitle') })

const repositoryUrl = 'https://github.com/Jypyx/vectis-ui'

const docsHome = computed(() => localePath('/docs/installation'))

const installCode = 'pnpm add @vectis/ui vue'
const importCode = `import { VButton } from '@vectis/ui'
import '@vectis/ui/styles.css'`

/**
 * The three decisions, as data.
 *
 * They were three copies of the same twenty-line `<article>` before the prose moved out; with
 * the words gone the only thing that differed between them was two keys, so the markup is
 * written once and the loop supplies those. The card's own chrome moved to a class in the
 * scoped block for the same reason — an inline style cannot be written once and reused.
 */
const cards = [
  { title: 'home.htmlFirstTitle', body: 'home.htmlFirstBody' },
  { title: 'home.tokensTitle', body: 'home.tokensBody' },
  { title: 'home.overridesTitle', body: 'home.overridesBody' },
]

/** One entry per exported component family — the same list the sidebar is built from. */
const componentCount = components.length

/**
 * The figures band. Three of the four values are bare numbers and stay here; the fourth carries
 * a unit and a decimal mark, both of which are language, so it comes from the catalogue.
 */
const stats = computed(() => [
  { value: String(componentCount), caption: t('home.statFamilies') },
  { value: '26', caption: t('home.statPalettes') },
  { value: t('home.statCssValue'), caption: t('home.statCss') },
  { value: '0', caption: t('home.statDeps') },
])
</script>

<template>
  <main class="vd-home">
    <div class="vd-limit vd-hero">
      <div>
        <!--
          The headline comes from the catalogue WITH its line break and its accent span: where a
          headline breaks is a decision about the sentence, and the two languages break in
          different places. The accent colour is applied from the scoped block through `:deep`,
          since content rendered as raw HTML carries no scope attribute of its own.
        -->
        <DocsProse
          tag="h1"
          keypath="home.heroTitle"
          style="
            margin: 0 0 16px;
            font-family: var(--vectis-font-family-display);
            font-size: var(--vectis-text-display-size);
            font-weight: var(--vectis-text-display-weight);
            line-height: var(--vectis-text-display-leading);
            letter-spacing: var(--vectis-text-display-tracking);
            text-wrap: pretty;
          "
        />
        <DocsProse
          keypath="home.heroBody"
          style="
            margin: 0 auto 28px;
            max-width: 52ch;
            font-size: 18px;
            line-height: 1.65;
            color: var(--vectis-color-text-muted);
            text-wrap: pretty;
          "
        />
        <div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center">
          <NuxtLink :to="docsHome" custom>
            <template #default="{ href, navigate }">
              <VButton
                variant="solid"
                tone="accent"
                size="lg"
                icon-end="arrow_right_alt"
                :href="href ?? undefined"
                @click="navigate"
              >
                {{ t('home.heroCta') }}
              </VButton>
            </template>
          </NuxtLink>
        </div>
      </div>
    </div>

    <section
      style="
        border-top: 1px solid var(--vectis-color-border);
        background: var(--vectis-color-surface-muted);
      "
    >
      <div class="vd-limit" style="padding-block: 48px">
        <h2
          style="
            margin: 0 0 8px;
            font-family: var(--vectis-font-family-display);
            font-size: var(--vectis-text-heading-1-size);
            font-weight: var(--vectis-text-heading-1-weight);
            line-height: var(--vectis-text-heading-1-leading);
            letter-spacing: var(--vectis-text-heading-1-tracking);
          "
        >
          {{ t('home.whyHeading') }}
        </h2>
        <DocsProse
          keypath="home.whyBody"
          style="
            margin: 0 0 28px;
            max-width: 64ch;
            font-size: 16px;
            line-height: 1.65;
            color: var(--vectis-color-text-muted);
          "
        />
        <div class="vd-grid-3">
          <article v-for="card in cards" :key="card.title" class="vd-home-card">
            <h3
              style="
                margin: 0 0 8px;
                font-family: var(--vectis-font-family-display);
                font-size: var(--vectis-text-heading-3-size);
                font-weight: var(--vectis-text-heading-3-weight);
              "
            >
              {{ t(card.title) }}
            </h3>
            <DocsProse
              :keypath="card.body"
              style="
                margin: 0;
                font-size: var(--vectis-text-body-md-size);
                line-height: 1.6;
                color: var(--vectis-color-text-muted);
              "
            />
          </article>
        </div>
      </div>
    </section>

    <section class="vd-limit" style="padding-block: 48px">
      <div class="vd-grid-2" style="align-items: start">
        <div>
          <h2
            style="
              margin: 0 0 8px;
              font-family: var(--vectis-font-family-display);
              font-size: var(--vectis-text-heading-1-size);
              font-weight: var(--vectis-text-heading-1-weight);
              line-height: var(--vectis-text-heading-1-leading);
              letter-spacing: var(--vectis-text-heading-1-tracking);
            "
          >
            {{ t('home.installHeading') }}
          </h2>
          <DocsProse
            keypath="home.installBody"
            style="
              margin: 0 0 20px;
              font-size: 16px;
              line-height: 1.65;
              color: var(--vectis-color-text-muted);
            "
          />
          <NuxtLink :to="docsHome" custom>
            <template #default="{ href, navigate }">
              <VButton
                variant="soft"
                tone="accent"
                size="md"
                icon-end="arrow_right_alt"
                :href="href ?? undefined"
                @click="navigate"
              >
                {{ t('home.installCta') }}
              </VButton>
            </template>
          </NuxtLink>
        </div>
        <div>
          <DocsCode lang="bash" :code="installCode" />
          <DocsCode lang="ts" :code="importCode" />
        </div>
      </div>
    </section>

    <section class="vd-limit" style="padding-block: 48px">
      <div class="vd-stats">
        <div v-for="stat in stats" :key="stat.caption">
          <p
            style="
              margin: 0;
              font-family: var(--vectis-font-family-display);
              font-size: var(--vectis-text-display-size);
              font-weight: var(--vectis-text-display-weight);
              line-height: 1.1;
              letter-spacing: var(--vectis-text-display-tracking);
            "
          >
            {{ stat.value }}
          </p>
          <p
            style="
              margin: 4px 0 0;
              font-size: var(--vectis-text-body-sm-size);
              color: var(--vectis-color-text-muted);
            "
          >
            {{ stat.caption }}
          </p>
        </div>
      </div>
    </section>

    <section style="border-top: 1px solid var(--vectis-color-border)">
      <div class="vd-limit" style="padding-block: 48px">
        <div class="vd-grid-2" style="gap: 24px; align-items: start">
          <article>
            <h3
              style="
                margin: 0 0 8px;
                font-family: var(--vectis-font-family-display);
                font-size: var(--vectis-text-heading-2-size);
                font-weight: var(--vectis-text-heading-2-weight);
              "
            >
              {{ t('home.a11yHeading') }}
            </h3>
            <DocsProseList
              keypath="home.a11yPoints"
              style="
                margin: 0;
                padding-inline-start: 20px;
                font-size: 16px;
                line-height: 1.65;
                color: var(--vectis-color-text-muted);
              "
            />
          </article>
          <article>
            <h3
              style="
                margin: 0 0 8px;
                font-family: var(--vectis-font-family-display);
                font-size: var(--vectis-text-heading-2-size);
                font-weight: var(--vectis-text-heading-2-weight);
              "
            >
              {{ t('home.supportHeading') }}
            </h3>
            <DocsProse
              keypath="home.supportBody"
              style="
                margin: 0 0 12px;
                font-size: 16px;
                line-height: 1.65;
                color: var(--vectis-color-text-muted);
              "
            />
            <DocsProse
              keypath="home.supportFirefox"
              style="
                margin: 0;
                font-size: 16px;
                line-height: 1.65;
                color: var(--vectis-color-text-muted);
              "
            />
            <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-top: 20px">
              <VButton
                variant="outline"
                tone="neutral"
                size="md"
                icon-end="open_in_new"
                :href="repositoryUrl"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </VButton>
            </div>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/*
 * The hero's glow — two pools of colour bleeding out of the top of the page, so the first
 * screen is not one flat fill from edge to edge.
 *
 * It lives here rather than in docs-layout.css for the reason that file states: a pseudo-
 * element is one of the things an inline style cannot carry, like the outline's link states
 * in DocsOutline.vue. It hangs off <main>, which is a direct child of the flex column and so
 * spans the full width already — anchoring it on .vd-hero instead would stop the glow at the
 * 1440px content column and leave a vertical seam on a wider screen, and the usual
 * `calc(50% - 50vw)` bleed would then overflow by half a scrollbar.
 *
 * The colours are RELATIVE to the accent role (`oklch(from …)`, the VSkeletonLoader idiom):
 * this site repoints that role to violet, and the second pool sits 45 degrees round the hue
 * circle from wherever it lands. Repointing the accent repaints the glow, with no hue written
 * as a number and no second place to keep in step.
 */
/*
 * Three rules the prose move made necessary, all of them for the same reason: content rendered
 * from the message catalogue is raw HTML, so it carries no scope attribute and no inline style
 * of its own. `:deep` is what reaches it — a plain scoped selector matches nothing there, and
 * fails silently.
 */
.vd-home :deep(.vd-hero-accent) {
  color: var(--vectis-color-accent);
}
.vd-home :deep(code) {
  font-family: var(--vectis-font-family-mono);
  font-size: var(--vectis-text-code-size);
}

/* The card chrome, written once now that the three cards are a loop rather than three copies. */
.vd-home-card {
  padding: 20px;
  border: 1px solid var(--vectis-color-border);
  border-radius: var(--vectis-radius-surface);
  background: var(--vectis-color-surface-raised);
}

.vd-home {
  position: relative;
  /*
   * The glow paints at z-index -1 — above the shell's flat background, below the copy, so no
   * text contrast is measured against it. The stacking context is what confines that -1:
   * without it the glow would slide behind .vd-shell's own background and simply not appear,
   * with nothing in the console to say why.
   */
  isolation: isolate;
}
.vd-home::before {
  content: '';
  position: absolute;
  /*
   * Pulled up by exactly the header's height, so the band starts at the very top of the page
   * rather than under the bar. That is only worth anything because the header's background is
   * a translucent mix rather than the flat surface — see DocsHeader.vue, where the two halves
   * of this effect meet. The height gains the same amount, so the 60vh below the bar is
   * unchanged and the mask still fades over the same visible band.
   */
  inset: calc(-1 * var(--vd-header-h)) 0 auto;
  z-index: -1;
  block-size: calc(60vh + var(--vd-header-h));
  /* Two off-centre pools rather than one centred: a single one reads as a vignette, and this
     pair leaves the middle of the headline on the flat surface. */
  background:
    radial-gradient(
      60% 50% at 18% 0%,
      oklch(from var(--vectis-color-accent) 70% 0.17 h / 0.16),
      transparent 68%
    ),
    radial-gradient(
      50% 45% at 82% 8%,
      oklch(from var(--vectis-color-accent) 72% 0.15 calc(h + 45) / 0.11),
      transparent 70%
    );
  /* Fades the band out well before its own bottom edge, so the glow ends in nothing rather
     than on a horizontal line. */
  mask-image: linear-gradient(to bottom, black 40%, transparent);
  pointer-events: none;
}
</style>
