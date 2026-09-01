<script setup lang="ts">
import { VIcon, VTypography } from 'vectis-ui'
import {
  builtinIcons,
  check_circle as checkCircleIcon,
  close as closeIcon,
  code as codeIcon,
  notifications as notificationsIcon,
  schedule as scheduleIcon,
  search as searchIcon,
  warning as warningIcon,
} from 'vectis-ui/icons'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('iconography.title') })

/**
 * The whole registry, for the gallery at the foot of the page.
 *
 * Importing the barrel is legitimate HERE and nowhere in the library: a component doing it
 * would put the flat table back into every consumer's bundle and undo the per-icon split. This
 * page is the one place that genuinely wants all 34 — it is showing them.
 *
 * `Object.values` already returns a fresh array, so sorting it in place moves nothing but the
 * copy. Sorted by CODE POINT and never with `localeCompare`: an `undefined` locale resolves
 * differently in Node and in the browser, so the order — which is rendered markup — would come
 * out different on the two sides of hydration.
 */
const iconGallery = Object.values(builtinIcons).sort((a, b) => (a.name < b.name ? -1 : 1))

/*
 * The samples are NOT translated, here or anywhere on the site: a demo has to match the code
 * printed beside it, and the code is the same in every language. The heading `id`s are not
 * translated either — they are the site's permalinks.
 *
 * The three resolver samples are written against the real factory signatures: `className`
 * receives the mapped name and the filled flag, `components` is a table, `props` is optional.
 * A sample that would not compile is worse than no sample, so read `VIcon/resolver.ts` before
 * changing one.
 */
const importCode = `import { close, search } from 'vectis-ui/icons'`

const usageCode = `<!-- one of the design system's own icons, imported above -->
<VIcon :name="close" />

<!-- every icon prop takes the same value -->
<VButton :icon-start="search">Search</VButton>

<!-- a bare NAME: your resolver, then the icon font as a ligature -->
<VIcon name="favorite" />`

const classCode = `import { classIconResolver, setIconResolver } from 'vectis-ui'

// Font Awesome: the class names the icon, and the family carries the fill.
setIconResolver(
  classIconResolver({
    aliases: { close: 'xmark', search: 'magnifying-glass', expand_more: 'chevron-down' },
    className: (name, filled) => \`\${filled ? 'fa-solid' : 'fa-regular'} fa-\${name}\`,
  }),
)`

const ligatureCode = `import { ligatureIconResolver, setIconResolver } from 'vectis-ui'

// The name IS the glyph, so one line covers every icon in the application.
setIconResolver(ligatureIconResolver())

// Or, for a font spelling a few of them differently. The names left out
// are passed on as they stand.
setIconResolver(ligatureIconResolver({ aliases: { close: 'clear', more_horiz: 'more' } }))`

const componentCode = `import { componentIconResolver, setIconResolver } from 'vectis-ui'
import { Check, Search, X } from 'lucide-vue-next'

setIconResolver(
  componentIconResolver({
    // Three names answered here; every other one falls back to the built-in drawing.
    components: { check: Check, close: X, search: Search },
    props: () => ({ strokeWidth: 1.75 }),
  }),
)`

const handWrittenCode = `import { setIconResolver } from 'vectis-ui'

import { docsIcons } from '~/icons/icons'

// A resolver is only a function, so a table is not compulsory. This one is
// the site you are reading: the icons its chrome needs, and \`undefined\` for
// everything else, which hands the name back to the icon that carries it.
setIconResolver((name, context) => {
  const paths = docsIcons[name]
  if (!paths) return undefined
  return { path: (context.filled && paths[1]) || paths[0] }
})`

const sizingCode = `<!-- 1em: the icon follows the text around it -->
<p>Ready <VIcon :name="check" /></p>

<!-- one icon, in pixels -->
<VIcon :name="check" :size="32" />

<!-- a context: every icon below is 20px unless it names its own -->
<div class="toolbar"><VIcon :name="check" /></div>

<style>
  .toolbar {
    --vectis-icon-size: 20px;
  }
</style>`

const orderCode = `<!-- an explicit render wins over everything else -->
<VIcon :render="{ src: '/logo.svg' }" label="Logo" />

<!-- an imported icon: your resolver is asked first, its own drawing answers next -->
<VIcon :name="close" />

<!-- a bare name: your resolver, then the ligature font -->
<VIcon name="favorite" />

<!-- nothing named at all: the slot is drawn -->
<VIcon><svg viewBox="0 0 24 24"><path d="…" /></svg></VIcon>`
</script>

<template>
  <h1>{{ t('iconography.title') }}</h1>
  <DocsProse class="vd-lead" keypath="iconography.lead" />
  <DocsProse keypath="iconography.weight" />
  <DocsDemo>
    <VIcon :name="searchIcon" :size="24" />
    <VIcon :name="closeIcon" :size="24" />
    <VIcon :name="checkCircleIcon" :size="24" />
    <VIcon :name="checkCircleIcon" filled :size="24" />
    <VIcon :name="warningIcon" :size="24" />
    <VIcon :name="notificationsIcon" :size="24" />
    <VIcon :name="notificationsIcon" filled :size="24" />
    <VIcon :name="scheduleIcon" :size="24" />
    <VIcon :name="codeIcon" :size="24" />
    <VTypography variant="caption" as="span" tone="muted">
      {{ t('iconography.gridCaption') }}
    </VTypography>
  </DocsDemo>

  <h2 id="importing-an-icon">{{ t('iconography.importHeading') }}</h2>
  <DocsProse keypath="iconography.importBody" />
  <DocsCode lang="ts" :code="importCode" />
  <DocsCode lang="vue" :code="usageCode" />
  <DocsProse keypath="iconography.importWhy" />

  <h2 id="using-your-own-icons">{{ t('iconography.ownHeading') }}</h2>
  <DocsProse keypath="iconography.ownBody" />
  <DocsProse keypath="iconography.ownWhere" />
  <DocsProse keypath="iconography.ownPartial" />
  <DocsProse tag="blockquote" keypath="iconography.ownQuote" />

  <h3 id="class-based-font">{{ t('iconography.classHeading') }}</h3>
  <DocsProse keypath="iconography.classBody" />
  <DocsCode lang="ts" :code="classCode" />
  <DocsProse keypath="iconography.classPartial" />

  <h3 id="ligature-font">{{ t('iconography.ligatureHeading') }}</h3>
  <DocsProse keypath="iconography.ligatureBody" />
  <DocsCode lang="ts" :code="ligatureCode" />
  <DocsProse keypath="iconography.ligaturePartial" />

  <h3 id="component-set">{{ t('iconography.componentHeading') }}</h3>
  <DocsProse keypath="iconography.componentBody" />
  <DocsCode lang="ts" :code="componentCode" />
  <DocsProse keypath="iconography.componentPartial" />

  <h3 id="written-by-hand">{{ t('iconography.handHeading') }}</h3>
  <DocsProse keypath="iconography.handBody" />
  <DocsCode lang="ts" :code="handWrittenCode" />

  <h2 id="sizing">{{ t('iconography.sizingHeading') }}</h2>
  <DocsProse keypath="iconography.sizingBody" />
  <DocsProseList keypath="iconography.sizingOverrides" />
  <DocsProse keypath="iconography.sizingReason" />
  <DocsCode lang="vue" :code="sizingCode" />
  <DocsDemo>
    <VIcon :name="notificationsIcon" :size="16" />
    <VIcon :name="notificationsIcon" :size="24" />
    <VIcon :name="notificationsIcon" :size="40" />
    <VTypography variant="caption" as="span" tone="muted">
      {{ t('iconography.sizingCaption') }}
    </VTypography>
  </DocsDemo>

  <h2 id="resolution-order">{{ t('iconography.orderHeading') }}</h2>
  <DocsProse keypath="iconography.orderBody" />
  <DocsProseList tag="ol" keypath="iconography.orderRules" />
  <DocsCode lang="vue" :code="orderCode" />
  <DocsProse keypath="iconography.noHeuristic" />

  <h2 id="existing-icons">{{ t('iconography.listHeading') }}</h2>
  <DocsProse keypath="iconography.listBody" />
  <DocsProse keypath="iconography.listFilled" />
  <!--
    A real <ul>: the gallery is an enumeration, and saying so is what lets a screen reader
    announce how many icons there are. The drawings are decorative — the NAME beside each one
    is the information, and it is the thing a reader has come to copy.
  -->
  <ul class="vd-icon-grid">
    <li v-for="icon in iconGallery" :key="icon.name">
      <VIcon :name="icon" :size="24" />
      <VIcon v-if="icon.paths.length > 1" :name="icon" filled :size="24" />
      <code>{{ icon.name }}</code>
    </li>
  </ul>
</template>
