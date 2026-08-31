<script setup lang="ts">
import { VButton, VInput, VTypography } from 'vectis-ui'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('accessibility.title') })
</script>

<template>
  <h1>{{ t('accessibility.title') }}</h1>
  <DocsProse class="vd-lead" keypath="accessibility.lead" />

  <h2 id="what-is-guaranteed">{{ t('accessibility.guaranteedHeading') }}</h2>
  <DocsProseList keypath="accessibility.guarantees" />
  <DocsProse keypath="accessibility.guaranteedBody" />

  <h2 id="focus">{{ t('accessibility.focusHeading') }}</h2>
  <DocsProse keypath="accessibility.focusBody" />
  <DocsDemo>
    <VButton variant="outline" tone="neutral">Focus me with Tab</VButton>
    <VInput placeholder="Then keep going" />
    <VTypography variant="body-sm" as="span" tone="muted">
      {{ t('accessibility.focusCaption') }}
    </VTypography>
  </DocsDemo>

  <h2 id="validation">{{ t('accessibility.validationHeading') }}</h2>
  <DocsProse keypath="accessibility.validationBody" />

  <h2 id="motion">{{ t('accessibility.motionHeading') }}</h2>
  <DocsProse keypath="accessibility.motionBody" />

  <h2 id="forced-colors">{{ t('accessibility.forcedColorsHeading') }}</h2>
  <DocsProse keypath="accessibility.forcedColorsBody" />

  <h2 id="what-a-tool-cannot-tell-you">{{ t('accessibility.toolHeading') }}</h2>
  <DocsProse keypath="accessibility.toolBody" />
  <DocsProse tag="blockquote" keypath="accessibility.toolQuote" />
</template>
