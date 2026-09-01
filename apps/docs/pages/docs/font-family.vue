<script setup lang="ts">
definePageMeta({ layout: 'docs' })

const { t } = useI18n()
const localePath = useLocalePath()
useHead({ title: () => t('fontFamily.title') })

/*
 * Both samples do the same thing twice, so that the only difference a reader has to read is
 * where the font comes from: the token lines are identical on purpose, and so is the family
 * they name.
 */
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
  <!--
    The one paragraph on the site that a single message cannot carry: it has a component in the
    middle of it. Two keys with the link between them, and the link's own text is the target
    page's title, which the navigation catalogue already translates.
  -->
  <p>
    <DocsProse tag="span" keypath="fontFamily.iconBefore" />
    {{ ' ' }}
    <NuxtLink :to="localePath('/docs/iconography')">{{ t('nav.iconography') }}</NuxtLink>
    <DocsProse tag="span" keypath="fontFamily.iconAfter" />
  </p>
</template>
