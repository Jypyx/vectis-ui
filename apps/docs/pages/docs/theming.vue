<script setup lang="ts">
import { VButton, VChip } from '@vectis/ui'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('theming.title') })

const darkCode = '<html data-theme="dark">'

const coralCode = `/* a "coral" theme: accent + pill radii */
:root {
  --vectis-color-accent: oklch(58% 0.2 25);
  --vectis-color-accent-hover: oklch(51% 0.19 25);
  --vectis-radius-interactive: 9999px;
}`

const layersCode = `@layer vectis.reset, vectis.tokens, vectis.components, vectis.utilities;

/* your rule, in no layer at all, wins */
.checkout-cta { border-radius: 9999px; }`
</script>

<template>
  <h1>{{ t('theming.title') }}</h1>
  <DocsProse class="vd-lead" keypath="theming.lead" />

  <h2 id="token-architecture">{{ t('theming.architectureHeading') }}</h2>
  <DocsProse keypath="theming.architectureIntro" />
  <DocsProseList keypath="theming.levels" />
  <DocsProse keypath="theming.architectureBody" />
  <DocsProse keypath="theming.palettes" />

  <h2 id="dark-mode">{{ t('theming.darkHeading') }}</h2>
  <DocsCode lang="html" :code="darkCode" />
  <DocsProse keypath="theming.darkBody" />
  <div class="vd-demo" data-theme="dark" style="background: var(--vectis-color-surface)">
    <VButton variant="solid" tone="accent" size="sm">Accent</VButton>
    <VButton variant="soft" tone="accent" size="sm">Soft</VButton>
    <VButton variant="outline" tone="neutral" size="sm">Outline</VButton>
    <VChip tone="success" size="sm">Deployed</VChip>
    <span style="font-size: var(--vectis-text-body-sm-size); color: var(--vectis-color-text-muted)">
      {{ t('theming.darkCaption') }}
    </span>
  </div>
  <DocsProse keypath="theming.darkNoQuery" />

  <h2 id="runtime-overrides">{{ t('theming.overridesHeading') }}</h2>
  <DocsCode lang="css" :code="coralCode" />
  <DocsProse keypath="theming.oklch" />

  <h3 id="layers">{{ t('theming.layersHeading') }}</h3>
  <DocsProse keypath="theming.layers" />
  <DocsCode lang="css" :code="layersCode" />
</template>
