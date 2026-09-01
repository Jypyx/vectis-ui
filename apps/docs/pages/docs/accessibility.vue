<script setup lang="ts">
import {
  VButton,
  VCheckbox,
  VChip,
  VIconButton,
  VInput,
  VRadio,
  VSwitch,
  VTypography,
} from 'vectis-ui'
import { search as searchIcon } from 'vectis-ui/icons'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('accessibility.title') })

/*
 * The focus demo is a row of controls of DIFFERENT shapes, because the ring is not one
 * drawing repeated: it is drawn outside a button, outside a field, around the box of a
 * checkbox rather than its label, and pulled inwards on a control whose container clips.
 * Tabbing through them is the only way to see that, so each one here is a real tab stop.
 */
const search = ref('Vectis')
const notify = ref(true)
const backups = ref(false)
const plan = ref('monthly')
const filter = ref(true)
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
    <VButton variant="solid" tone="accent">Deploy</VButton>
    <VButton variant="outline" tone="neutral">Cancel</VButton>
    <VIconButton label="Search" :icon="searchIcon" variant="ghost" tone="neutral" />
    <VInput v-model="search" label="Project" clearable clear-visible />
    <VCheckbox v-model="backups">Nightly backups</VCheckbox>
    <VSwitch v-model="notify">Notify</VSwitch>
    <VRadio v-model="plan" name="a11y-plan" value="monthly">Monthly</VRadio>
    <VRadio v-model="plan" name="a11y-plan" value="yearly">Yearly</VRadio>
    <VChip v-model:selected="filter" selectable check>Archived</VChip>
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
  <DocsProseList keypath="accessibility.forcedColorsRules" />
</template>
