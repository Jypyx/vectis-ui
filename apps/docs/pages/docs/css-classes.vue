<script setup lang="ts">
definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('cssClasses')

const vhCode = `<span class="v-visually-hidden">Notifications</span>`

const layersCode = `@layer vectis.reset, vectis.tokens, vectis.components, vectis.utilities;

/* Unlayered CSS overrides the library's normal declarations. */
.checkout-cta { border-radius: var(--vectis-radius-pill); }`
</script>

<template>
  <h1>{{ t('cssClasses.title') }}</h1>
  <DocsProse class="vd-lead" keypath="cssClasses.lead" />

  <h2 id="v-visually-hidden">{{ t('cssClasses.hiddenHeading') }}</h2>
  <DocsProse keypath="cssClasses.hiddenBody" />
  <DocsCode lang="html" :code="vhCode" />

  <h2 id="the-layers">{{ t('cssClasses.layersHeading') }}</h2>
  <DocsProse keypath="cssClasses.layersIntro" />
  <DocsCode lang="css" :code="layersCode" />
  <DocsProse keypath="cssClasses.layersBody" />

  <h2 id="internal-classes">{{ t('cssClasses.internalHeading') }}</h2>
  <DocsProse keypath="cssClasses.internalBody" />

  <h2 id="the-custom-properties-to-aim-at">{{ t('cssClasses.propertiesHeading') }}</h2>
  <DocsProse keypath="cssClasses.propertiesBody" />
</template>
