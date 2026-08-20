<script setup lang="ts">
definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('cssClasses.title') })

/* Not the API table's Prop/Type/Default: this one names a class and what carries it. */
const classColumns = computed(() => [t('cssClasses.columnClass'), t('cssClasses.columnCarries')])

const vhCode = `.v-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}`

const layersCode = `@layer vectis.reset, vectis.tokens, vectis.components, vectis.utilities;

/* your rule, in no layer at all, wins */
.checkout-cta { border-radius: 9999px; }`
</script>

<template>
  <h1>{{ t('cssClasses.title') }}</h1>
  <DocsProse class="vd-lead" keypath="cssClasses.lead" />

  <h2 id="v-visually-hidden">{{ t('cssClasses.hiddenHeading') }}</h2>
  <DocsProse keypath="cssClasses.hiddenBody" />
  <DocsCode lang="css" :code="vhCode" />
  <DocsProse keypath="cssClasses.hiddenNot" />

  <h2 id="the-layers">{{ t('cssClasses.layersHeading') }}</h2>
  <DocsProse keypath="cssClasses.layersIntro" />
  <DocsCode lang="css" :code="layersCode" />
  <DocsProse keypath="cssClasses.layersBody" />
  <DocsProse tag="blockquote" keypath="cssClasses.layersQuote" />

  <h2 id="internal-classes">{{ t('cssClasses.internalHeading') }}</h2>
  <DocsProse keypath="cssClasses.internalBody" />
  <DocsTable :columns="classColumns">
    <tr>
      <td><code>.v-control</code></td>
      <DocsProse tag="td" keypath="cssClasses.control" />
    </tr>
    <tr>
      <td><code>.v-panel</code></td>
      <DocsProse tag="td" keypath="cssClasses.panel" />
    </tr>
    <tr>
      <td><code>.v-overlay</code> · <code>.v-floating</code></td>
      <DocsProse tag="td" keypath="cssClasses.overlay" />
    </tr>
    <tr>
      <td><code>.v-tone</code></td>
      <DocsProse tag="td" keypath="cssClasses.tone" />
    </tr>
    <tr>
      <td><code>.v-icon-ligature</code></td>
      <DocsProse tag="td" keypath="cssClasses.ligature" />
    </tr>
    <tr>
      <td><code>[data-theme]</code></td>
      <DocsProse tag="td" keypath="cssClasses.theme" />
    </tr>
  </DocsTable>

  <h2 id="the-custom-properties-to-aim-at">{{ t('cssClasses.propertiesHeading') }}</h2>
  <DocsProse keypath="cssClasses.propertiesBody" />
</template>
