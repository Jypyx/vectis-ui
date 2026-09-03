<script setup lang="ts">
import api from '~/content/api/breadcrumb'
import BreadcrumbBasic from '~/examples/breadcrumb/Basic.vue'
import breadcrumbBasicSource from '~/examples/breadcrumb/Basic.vue?raw'
import BreadcrumbIcons from '~/examples/breadcrumb/Icons.vue'
import breadcrumbIconsSource from '~/examples/breadcrumb/Icons.vue?raw'
import BreadcrumbSeparator from '~/examples/breadcrumb/Separator.vue'
import breadcrumbSeparatorSource from '~/examples/breadcrumb/Separator.vue?raw'
import BreadcrumbTruncated from '~/examples/breadcrumb/Truncated.vue'
import breadcrumbTruncatedSource from '~/examples/breadcrumb/Truncated.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('breadcrumb.title') })
</script>

<template>
  <h1>{{ t('breadcrumb.title') }}</h1>
  <DocsProse class="vd-lead" keypath="breadcrumb.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="breadcrumbBasicSource" stack>
    <BreadcrumbBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="custom-separator">{{ t('breadcrumb.examples.separator.title') }}</h3>
  <DocsProse keypath="breadcrumb.examples.separator.text" />
  <DocsExample :source="breadcrumbSeparatorSource" stack>
    <BreadcrumbSeparator />
  </DocsExample>

  <h3 id="with-icons">{{ t('breadcrumb.examples.icons.title') }}</h3>
  <DocsProse keypath="breadcrumb.examples.icons.text" />
  <DocsExample :source="breadcrumbIconsSource" stack>
    <BreadcrumbIcons />
  </DocsExample>

  <h3 id="truncation">{{ t('breadcrumb.examples.truncated.title') }}</h3>
  <DocsProse keypath="breadcrumb.examples.truncated.text" />
  <DocsExample :source="breadcrumbTruncatedSource" stack>
    <BreadcrumbTruncated />
  </DocsExample>

  <DocsApi page="breadcrumb" :api="api" />
</template>
