<script setup lang="ts">
import { VIcon, VTypography } from '@vectis/ui'
import {
  check_circle as checkCircleIcon,
  close as closeIcon,
  code as codeIcon,
  notifications as notificationsIcon,
  schedule as scheduleIcon,
  search as searchIcon,
  warning as warningIcon,
} from '@vectis/ui/icons'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('iconography.title') })

const importCode = `import { close, search } from '@vectis/ui/icons'`

const basicCode = `<!-- one of the design system's own icons, imported above -->
<VIcon :name="close" />

<!-- a bare NAME: your resolver first, then the icon font as a ligature -->
<VIcon name="favorite" />

<VIcon :render="{ src: '/logo.svg' }" label="Logo" />`

const resolverCode = `import { setIconResolver, ligatureIconResolver } from '@vectis/ui'

setIconResolver(ligatureIconResolver())`

const partialCode = `// this site's own resolver: six icons the library does not ship.
// Answering \`undefined\` hands the name back to whatever the icon
// itself carries, which is what makes a PARTIAL mapping legal.
setIconResolver((name, context) => {
  const paths = docsIcons[name]
  if (!paths) return undefined
  return { path: (context.filled && paths[1]) || paths[0] }
})`
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
  <DocsProse keypath="iconography.importWhy" />

  <h2 id="resolution-order">{{ t('iconography.orderHeading') }}</h2>
  <DocsProse keypath="iconography.orderBody" />
  <DocsCode lang="vue" :code="basicCode" />
  <DocsProse keypath="iconography.noHeuristic" />

  <h2 id="wiring-your-own-library">{{ t('iconography.wiringHeading') }}</h2>
  <DocsCode lang="ts" :code="resolverCode" />
  <DocsProse keypath="iconography.wiringBody" />
  <DocsProse keypath="iconography.wiringWhere" />

  <h3 id="partial-mappings">{{ t('iconography.partialHeading') }}</h3>
  <DocsProse keypath="iconography.partialBody" />
  <DocsCode lang="ts" :code="partialCode" />
  <DocsProse tag="blockquote" keypath="iconography.partialQuote" />

  <h2 id="sizing-and-semantics">{{ t('iconography.sizingHeading') }}</h2>
  <DocsProse keypath="iconography.sizingBody" />
  <DocsProse keypath="iconography.semantics" />
  <DocsProse keypath="iconography.forcedColors" />
</template>
