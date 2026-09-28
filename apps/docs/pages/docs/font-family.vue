<script setup lang="ts">
definePageMeta({ layout: 'docs' })

const { t } = useI18n()
const localePath = useLocalePath()
useDocsHead('fontFamily')

const importCode = `/* Your own stylesheet, in no layer. */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --vectis-font-family-sans: 'Inter', system-ui, sans-serif;
  --vectis-font-family-display: 'Inter', system-ui, sans-serif;
}`

const faceCode = `/* Your own stylesheet, in no layer. The files are served from your origin. */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-variable.woff2') format('woff2-variations');
  font-weight: 400 700;
  font-display: swap;
}

:root {
  --vectis-font-family-sans: 'Inter', system-ui, sans-serif;
  --vectis-font-family-display: 'Inter', system-ui, sans-serif;
}`
</script>

<template>
  <h1>{{ t('fontFamily.title') }}</h1>
  <DocsProse class="vd-lead" keypath="fontFamily.lead" />

  <h2 id="the-three-families">{{ t('fontFamily.threeHeading') }}</h2>
  <DocsProseList keypath="fontFamily.families" />
  <DocsProse keypath="fontFamily.roles" />

  <h2 id="wiring-a-webfont">{{ t('fontFamily.wiringHeading') }}</h2>
  <DocsProse keypath="fontFamily.wiringBody" />
  <DocsCode lang="css" :code="importCode" />
  <DocsProse keypath="fontFamily.wiringSelfHosted" />
  <DocsCode lang="css" :code="faceCode" />

  <h2 id="which-family">{{ t('fontFamily.splitHeading') }}</h2>
  <DocsProse keypath="fontFamily.splitBody" />
  <DocsProseList keypath="fontFamily.splitList" />

  <h2 id="the-icon-font">{{ t('fontFamily.iconHeading') }}</h2>
  <p>
    <DocsProse tag="span" keypath="fontFamily.iconBefore" />
    {{ ' ' }}
    <NuxtLink :to="localePath('/docs/iconography')">{{ t('nav.iconography') }}</NuxtLink>
    <DocsProse tag="span" keypath="fontFamily.iconAfter" />
  </p>
</template>
