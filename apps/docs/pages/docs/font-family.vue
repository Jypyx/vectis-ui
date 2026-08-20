<script setup lang="ts">
definePageMeta({ layout: 'docs' })

const { t } = useI18n()
const localePath = useLocalePath()
useHead({ title: () => t('fontFamily.title') })

const wireCode = `/* an unlayered stylesheet — this site's own */
@import url('https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;500;600;700&family=Geist:wght@400;500;600;700&display=swap');

:root {
  --vectis-font-family-display: 'Josefin Sans', system-ui, sans-serif;
  --vectis-font-family-sans: 'Geist', system-ui, -apple-system, sans-serif;
}`

const overrideCode = `/* small headings back to the text face, on this panel only */
.settings-panel {
  --vectis-text-family-heading: var(--vectis-font-family-sans);
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
  <DocsCode lang="css" :code="wireCode" />
  <div class="vd-demo" data-stack>
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
      Josefin Sans
    </p>
    <p
      style="
        margin: 0;
        font-size: var(--vectis-text-body-lg-size);
        line-height: var(--vectis-text-body-lg-leading);
        color: var(--vectis-color-text-muted);
      "
    >
      {{ t('fontFamily.demoText') }}
    </p>
    <p
      style="
        margin: 0;
        font-family: var(--vectis-font-family-mono);
        font-size: var(--vectis-text-code-size);
      "
    >
      ui-monospace · 'Cascadia Code' · Consolas
    </p>
  </div>
  <DocsProse keypath="fontFamily.wiringCdn" />

  <h2 id="the-split">{{ t('fontFamily.splitHeading') }}</h2>
  <DocsProse keypath="fontFamily.splitBody" />
  <DocsProseList keypath="fontFamily.splitList" />
  <DocsProse keypath="fontFamily.splitWhy" />

  <h2 id="overriding-a-family">{{ t('fontFamily.overrideHeading') }}</h2>
  <DocsProse keypath="fontFamily.overrideBody" />
  <DocsCode lang="css" :code="overrideCode" />
  <DocsProse keypath="fontFamily.overrideWeights" />

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
