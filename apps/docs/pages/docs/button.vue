<script setup lang="ts">
import { VButton, VIconButton, VTypography } from '@vectis/ui'
import {
  arrow_right_alt as arrowRightAltIcon,
  check_circle as checkCircleIcon,
  close as closeIcon,
  cloud_upload as cloudUploadIcon,
  more_horiz as moreHorizIcon,
} from '@vectis/ui/icons'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
const { apiColumns } = useDocsTable()
useHead({ title: () => t('button.title') })

const loading = ref(false)

const variantsCode = `<VButton>Solid</VButton>
<VButton variant="soft">Soft</VButton>
<VButton variant="outline">Outline</VButton>
<VButton variant="ghost">Ghost</VButton>
<VButton elevated>Elevated</VButton>`

const linkCode = `<VButton href="/pricing">Pricing</VButton>

<!-- disabled or loading, the address is dropped: an inert link
     can be neither focused nor followed -->
<VButton href="/pricing" disabled>Pricing</VButton>`
</script>

<template>
  <h1>{{ t('button.title') }}</h1>
  <DocsProse class="vd-lead" keypath="button.lead" />

  <h2 id="variants">{{ t('button.variantsHeading') }}</h2>
  <DocsProse keypath="button.variantsBody" />
  <DocsDemo>
    <VButton variant="solid" tone="accent">Solid</VButton>
    <VButton variant="soft" tone="accent">Soft</VButton>
    <VButton variant="outline" tone="accent">Outline</VButton>
    <VButton variant="ghost" tone="accent">Ghost</VButton>
    <VButton variant="solid" tone="accent" elevated>Elevated</VButton>
  </DocsDemo>
  <DocsCode lang="vue" :code="variantsCode" />
  <DocsProse keypath="button.variantsElevation" />

  <h2 id="tones">{{ t('button.tonesHeading') }}</h2>
  <DocsProse keypath="button.tonesBody" />
  <DocsDemo>
    <VButton tone="accent">Accent</VButton>
    <VButton tone="neutral">Neutral</VButton>
    <VButton tone="danger">Delete</VButton>
    <VButton tone="danger" variant="soft">Delete</VButton>
    <VButton tone="neutral" variant="ghost">Cancel</VButton>
  </DocsDemo>
  <DocsProse keypath="button.tonesRule" />

  <h2 id="sizes">{{ t('button.sizesHeading') }}</h2>
  <DocsProse keypath="button.sizesBody" />
  <DocsDemo>
    <VButton size="xs">xs</VButton>
    <VButton size="sm">sm</VButton>
    <VButton size="md">md</VButton>
    <VButton size="lg">lg</VButton>
    <VButton size="xl">xl</VButton>
    <VButton size="xl" compact>xl compact</VButton>
  </DocsDemo>

  <h2 id="icons">{{ t('button.iconsHeading') }}</h2>
  <DocsProse keypath="button.iconsBody" />
  <DocsDemo>
    <VButton :icon-start="cloudUploadIcon">Upload</VButton>
    <VButton variant="outline" tone="neutral" :icon-end="arrowRightAltIcon">Continue</VButton>
    <VButton variant="soft" tone="accent" :icon-start="checkCircleIcon" icon-filled
      >Approved</VButton
    >
    <VIconButton label="More actions" :icon="moreHorizIcon" variant="ghost" tone="neutral" />
    <VIconButton
      label="Dismiss"
      :icon="closeIcon"
      variant="ghost"
      tone="neutral"
      shape="circular"
    />
  </DocsDemo>

  <h2 id="states">{{ t('button.statesHeading') }}</h2>
  <DocsProse keypath="button.statesBody" />
  <DocsDemo>
    <VButton disabled>Disabled</VButton>
    <VButton variant="outline" tone="neutral" disabled>Disabled</VButton>
    <VButton :loading="loading" :icon-start="cloudUploadIcon" @click="loading = !loading">
      Deploy
    </VButton>
    <VTypography variant="body-sm" as="span" tone="muted">
      {{ t('button.statesCaption') }}
    </VTypography>
  </DocsDemo>
  <DocsCode lang="vue" :code="linkCode" />

  <h2 id="api">{{ t('button.apiHeading') }}</h2>
  <DocsTable :columns="apiColumns">
    <tr>
      <td><code>variant</code></td>
      <td><code>'solid' | 'outline' | 'ghost' | 'soft'</code></td>
      <td><code>'solid'</code></td>
    </tr>
    <tr>
      <td><code>tone</code></td>
      <td><code>'accent' | 'neutral' | 'danger'</code></td>
      <td><code>'accent'</code></td>
    </tr>
    <tr>
      <td><code>size</code></td>
      <td><code>'xs' | 'sm' | 'md' | 'lg' | 'xl'</code></td>
      <td><code>'md'</code></td>
    </tr>
    <tr>
      <td><code>elevated</code> · <code>compact</code></td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>href</code></td>
      <DocsProse tag="td" keypath="button.apiHref" />
      <td>—</td>
    </tr>
    <tr>
      <td><code>type</code></td>
      <td><code>'button' | 'submit' | 'reset'</code></td>
      <td><code>'button'</code></td>
    </tr>
    <tr>
      <td><code>disabled</code> · <code>loading</code></td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>iconStart</code> · <code>iconEnd</code></td>
      <td><code>IconSource</code></td>
      <td>—</td>
    </tr>
    <tr>
      <td><code>iconFilled</code></td>
      <DocsProse tag="td" keypath="button.apiIconFilled" />
      <td><code>false</code></td>
    </tr>
  </DocsTable>
  <DocsProse keypath="button.apiSlots" />

  <h3 id="icon-button">{{ t('button.iconButtonHeading') }}</h3>
  <DocsTable :columns="apiColumns">
    <tr>
      <td><code>label</code></td>
      <DocsProse tag="td" keypath="button.apiLabel" />
      <td>—</td>
    </tr>
    <tr>
      <td><code>icon</code></td>
      <DocsProse tag="td" keypath="button.apiIcon" />
      <td>—</td>
    </tr>
    <tr>
      <td><code>shape</code></td>
      <td><code>'square' | 'circular'</code></td>
      <td><code>'square'</code></td>
    </tr>
    <tr>
      <td><code>variant</code></td>
      <td><code>'solid' | 'outline' | 'ghost' | 'soft'</code></td>
      <td><code>'ghost'</code></td>
    </tr>
    <tr>
      <td><code>tone</code></td>
      <td><code>'accent' | 'neutral' | 'danger'</code></td>
      <td><code>'neutral'</code></td>
    </tr>
  </DocsTable>
  <DocsProse tag="blockquote" keypath="button.iconButtonQuote" />
</template>
