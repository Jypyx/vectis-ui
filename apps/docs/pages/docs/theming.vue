<script setup lang="ts">
import {
  VButton,
  VCheckbox,
  VChip,
  VIconButton,
  VInput,
  VRadio,
  VSwitch,
  VTextarea,
  VTypography,
} from 'vectis-ui'
/*
 * The icon is IMPORTED and not named, and the distinction is the library's: a bare string is
 * only ever a NAME, handed to a consumer resolver and then to an icon FONT's ligature — it
 * reaches none of the thirty-four drawings the library ships, which is exactly what makes them
 * tree-shakable. This site loads no icon font, and its own resolver answers only for the
 * handful of icons it ships itself — `search` not among them — so `icon="search"` would render
 * the word "search" as text. Importing the value hands VIcon the drawing.
 */
import { search as searchIcon } from 'vectis-ui/icons'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('theming.title') })

/*
 * The samples are NOT translated, here or anywhere on the site: a demo has to match the code
 * printed beside it, and the code is the same in every language. The heading `id`s are not
 * translated either — they are the site's permalinks.
 *
 * `coralCode` is the sharpest case of that rule on the site: it is not an illustration but the
 * ACTUAL declaration block painting the panel printed under it, the twin of the `.coral` rule
 * at the end of `assets/css/docs-layout.css`. Change one and change the other, or the page
 * shows a sample that produces something else. The two differ in wrapping alone, Prettier
 * breaking the `color-mix()` calls in the stylesheet where a code block reads better without.
 */
/**
 * The two theme panels: the same eight controls, twice, each side naming its own theme.
 *
 * Each panel carries its OWN state, and its own radio `group`. Sharing either would tie the
 * two together — a shared model literally, and a shared `name` through the platform: several
 * <input type="radio"> with one name form ONE native group whatever their place in the tree,
 * so choosing Yearly on the left would clear Monthly on the right.
 *
 * The controls are chosen for what they paint rather than for what they do: a field carries the
 * surface, the border and the placeholder; the three toggles carry the accent when they are on
 * and the border when they are not; the buttons carry the filled and outlined pairs; the chip
 * carries a status tone. Between them they touch nearly every colour role a theme moves.
 */
const panels = [
  {
    theme: 'light',
    label: 'theming.switchLight',
    group: 'theming-plan-light',
    state: reactive({ project: 'Vectis UI', deploy: true, notify: true, plan: 'monthly' }),
  },
  {
    theme: 'dark',
    label: 'theming.switchDark',
    group: 'theming-plan-dark',
    state: reactive({ project: 'Vectis UI', deploy: true, notify: true, plan: 'monthly' }),
  },
]

const themeAttrCode = `<!-- No attribute at all is the light theme -->
<html>

<!-- The same page, dark -->
<html data-theme="dark">`

const themeScopeCode = `<!-- A dark aside inside a light page: the nearest attribute wins,
     and everything under it inherits. -->
<main data-theme="light">
  <VDataTable :columns="columns" :rows="rows" />

  <aside data-theme="dark">
    <VButton tone="accent">Deploy</VButton>
  </aside>
</main>`

const themeSystemCode = `// Following the system, in one line. The application makes that call, not the library.
const dark = window.matchMedia('(prefers-color-scheme: dark)')
document.documentElement.dataset.theme = dark.matches ? 'dark' : 'light'`

const coralCode = `/* Any selector at all. This one is on the panel below. */
.coral {
  --vectis-color-accent: oklch(64% 0.16 32);
  --vectis-color-accent-hover: oklch(58% 0.16 32);
  --vectis-color-accent-active: oklch(52% 0.15 32);
  --vectis-color-accent-text: oklch(48% 0.15 32);
  /* Mixed towards the surface, so both tints follow whichever theme is showing. */
  --vectis-color-accent-surface: color-mix(in oklch, var(--vectis-color-accent) 14%, var(--vectis-color-surface));
  --vectis-color-accent-border: color-mix(in oklch, var(--vectis-color-accent) 40%, var(--vectis-color-surface));
  /* The focus ring is a role of its own, not the accent under another name: the accent
     carries white text, the ring has to be seen against the page. This one value clears 3:1
     on both grounds, so it needs no dark counterpart. */
  --vectis-focus-ring-color: oklch(58% 0.16 32);
  --vectis-radius-interactive: var(--vectis-radius-pill);
}

/* Text needs a lighter step on a dark ground: the one role that has to differ. */
[data-theme='dark'] .coral {
  --vectis-color-accent-text: oklch(78% 0.13 32);
}`

const layersCode = `/* The order the library declares, for reference. */
@layer vectis.reset, vectis.tokens, vectis.components, vectis.utilities;

/* Your rule is in no layer, so it wins over all four.
   One class, no !important, nothing added to buy specificity. */
.v-button {
  text-transform: uppercase;
}`
</script>

<template>
  <h1>{{ t('theming.title') }}</h1>
  <DocsProse class="vd-lead" keypath="theming.lead" />

  <h2 id="switch-theme">{{ t('theming.switchHeading') }}</h2>
  <DocsProse keypath="theming.switchBody" />
  <DocsCode lang="html" :code="themeAttrCode" />

  <!--
    The two panels are the demonstration and not a picture of one: each names a theme, so the
    tokens resolve inside it and the components below are painted by the same stylesheet the
    reader would load. `.vd-demo[data-theme]` is what makes each box paint its own ground
    instead of borrowing the page's.
  -->
  <div class="vd-theme-pair">
    <DocsDemo v-for="panel in panels" :key="panel.theme" :data-theme="panel.theme">
      <VTypography variant="overline" as="p" tone="muted" class="vd-theme-name">
        {{ t(panel.label) }}
      </VTypography>
      <VInput v-model="panel.state.project" label="Project" size="sm" class="vd-theme-field" />
      <VCheckbox v-model="panel.state.deploy">Auto-deploy</VCheckbox>
      <VSwitch v-model="panel.state.notify">Notify</VSwitch>
      <VRadio v-model="panel.state.plan" :name="panel.group" value="monthly">Monthly</VRadio>
      <VRadio v-model="panel.state.plan" :name="panel.group" value="yearly">Yearly</VRadio>
      <VButton variant="solid" tone="accent" size="sm">Deploy</VButton>
      <VButton variant="outline" tone="neutral" size="sm">Cancel</VButton>
      <VIconButton label="Search" :icon="searchIcon" variant="outline" tone="neutral" size="sm" />
      <VChip tone="success" size="sm">Live</VChip>
    </DocsDemo>
  </div>

  <DocsProse keypath="theming.switchScope" />
  <DocsCode lang="html" :code="themeScopeCode" />
  <DocsProse keypath="theming.switchScopeBody" />
  <DocsProse keypath="theming.switchColorScheme" />
  <DocsProse keypath="theming.switchSystem" />
  <DocsCode lang="ts" :code="themeSystemCode" />

  <h2 id="customize-tokens">{{ t('theming.tokensHeading') }}</h2>
  <DocsProse keypath="theming.tokensBody" />
  <DocsProseList keypath="theming.tokensLevels" />
  <DocsProse keypath="theming.tokensRoles" />
  <DocsProse keypath="theming.tokensOverride" />
  <DocsCode lang="css" :code="coralCode" />
  <DocsDemo class="coral">
    <VButton variant="solid" tone="accent" size="sm">Checkout</VButton>
    <VButton variant="outline" tone="accent" size="sm">Details</VButton>
    <VChip tone="accent" size="sm">Beta</VChip>
    <VInput size="sm" aria-label="Email" placeholder="Email" />
    <VTextarea :rows="3" size="sm" aria-label="Notes" placeholder="Notes" />
  </DocsDemo>
  <DocsProse keypath="theming.tokensDemoCaption" variant="body-sm" tone="muted" />
  <DocsProse keypath="theming.tokensOklch" />
  <DocsProse keypath="theming.tokensPalettes" />

  <h2 id="css-layers">{{ t('theming.layersHeading') }}</h2>
  <DocsProse keypath="theming.layersBody" />
  <DocsCode lang="css" :code="layersCode" />
  <DocsProse keypath="theming.layersConsequence" />
  <DocsProse keypath="theming.layersTrap" />
</template>
