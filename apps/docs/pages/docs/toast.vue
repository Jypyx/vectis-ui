<script setup lang="ts">
import { VToaster } from 'vectis-ui'

import api from '~/content/api/toast'
import ToastAutoDismiss from '~/examples/toast/AutoDismiss.vue'
import toastAutoDismissSource from '~/examples/toast/AutoDismiss.vue?raw'
import ToastBasic from '~/examples/toast/Basic.vue'
import toastBasicSource from '~/examples/toast/Basic.vue?raw'
import ToastContents from '~/examples/toast/Contents.vue'
import toastContentsSource from '~/examples/toast/Contents.vue?raw'
import ToastDismissing from '~/examples/toast/Dismissing.vue'
import toastDismissingSource from '~/examples/toast/Dismissing.vue?raw'
import ToastIcons from '~/examples/toast/Icons.vue'
import toastIconsSource from '~/examples/toast/Icons.vue?raw'
import ToastPersistent from '~/examples/toast/Persistent.vue'
import toastPersistentSource from '~/examples/toast/Persistent.vue?raw'
import ToastPlacements from '~/examples/toast/Placements.vue'
import toastPlacementsSource from '~/examples/toast/Placements.vue?raw'
import ToastStacking from '~/examples/toast/Stacking.vue'
import toastStackingSource from '~/examples/toast/Stacking.vue?raw'
import ToastVariants from '~/examples/toast/Variants.vue'
import toastVariantsSource from '~/examples/toast/Variants.vue?raw'
import ToastWidth from '~/examples/toast/Width.vue'
import toastWidthSource from '~/examples/toast/Width.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('toast')
</script>

<template>
  <h1>{{ t('toast.title') }}</h1>
  <DocsProse class="vd-lead" keypath="toast.lead" />

  <!--
    One toaster for every example on this page, and it has to be exactly one: `toast()`
    is module-level state with a single renderer, so a second instance would show each
    notification twice and run a second countdown for it. It belongs to the page rather
    than to an example for that reason, which is also what each example says in its own
    comment.
  -->
  <VToaster />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="toastBasicSource">
    <ToastBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="variants">{{ t('toast.examples.variants.title') }}</h3>
  <DocsProse keypath="toast.examples.variants.text" />
  <DocsExample :source="toastVariantsSource" stack>
    <ToastVariants />
  </DocsExample>

  <h3 id="contents">{{ t('toast.examples.contents.title') }}</h3>
  <DocsProse keypath="toast.examples.contents.text" />
  <DocsExample :source="toastContentsSource">
    <ToastContents />
  </DocsExample>

  <h3 id="icons">{{ t('toast.examples.icons.title') }}</h3>
  <DocsProse keypath="toast.examples.icons.text" />
  <DocsExample :source="toastIconsSource">
    <ToastIcons />
  </DocsExample>

  <h3 id="width">{{ t('toast.examples.width.title') }}</h3>
  <DocsProse keypath="toast.examples.width.text" />
  <DocsExample :source="toastWidthSource">
    <ToastWidth />
  </DocsExample>

  <h3 id="placements">{{ t('toast.examples.placements.title') }}</h3>
  <DocsProse keypath="toast.examples.placements.text" />
  <DocsExample :source="toastPlacementsSource">
    <ToastPlacements />
  </DocsExample>

  <h3 id="stacking">{{ t('toast.examples.stacking.title') }}</h3>
  <DocsProse keypath="toast.examples.stacking.text" />
  <DocsExample :source="toastStackingSource">
    <ToastStacking />
  </DocsExample>

  <h3 id="auto-dismiss">{{ t('toast.examples.autoDismiss.title') }}</h3>
  <DocsProse keypath="toast.examples.autoDismiss.text" />
  <DocsExample :source="toastAutoDismissSource">
    <ToastAutoDismiss />
  </DocsExample>

  <h3 id="persistent">{{ t('toast.examples.persistent.title') }}</h3>
  <DocsProse keypath="toast.examples.persistent.text" />
  <DocsExample :source="toastPersistentSource">
    <ToastPersistent />
  </DocsExample>

  <h3 id="dismissing">{{ t('toast.examples.dismissing.title') }}</h3>
  <DocsProse keypath="toast.examples.dismissing.text" />
  <DocsExample :source="toastDismissingSource">
    <ToastDismissing />
  </DocsExample>

  <DocsApi page="toast" :api="api" />
</template>
