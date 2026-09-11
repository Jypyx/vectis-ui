<script setup lang="ts">
import api from '~/content/api/dialog'
import DialogAlert from '~/examples/dialog/Alert.vue'
import dialogAlertSource from '~/examples/dialog/Alert.vue?raw'
import DialogBasic from '~/examples/dialog/Basic.vue'
import dialogBasicSource from '~/examples/dialog/Basic.vue?raw'
import DialogCustomHeader from '~/examples/dialog/CustomHeader.vue'
import dialogCustomHeaderSource from '~/examples/dialog/CustomHeader.vue?raw'
import DialogDismissal from '~/examples/dialog/Dismissal.vue'
import dialogDismissalSource from '~/examples/dialog/Dismissal.vue?raw'
import DialogHeaderActions from '~/examples/dialog/HeaderActions.vue'
import dialogHeaderActionsSource from '~/examples/dialog/HeaderActions.vue?raw'
import DialogLongContent from '~/examples/dialog/LongContent.vue'
import dialogLongContentSource from '~/examples/dialog/LongContent.vue?raw'
import DialogWidth from '~/examples/dialog/Width.vue'
import dialogWidthSource from '~/examples/dialog/Width.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('dialog')
</script>

<template>
  <h1>{{ t('dialog.title') }}</h1>
  <DocsProse class="vd-lead" keypath="dialog.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="dialogBasicSource">
    <DialogBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="width">{{ t('dialog.examples.width.title') }}</h3>
  <DocsProse keypath="dialog.examples.width.text" />
  <DocsExample :source="dialogWidthSource">
    <DialogWidth />
  </DocsExample>

  <h3 id="long-content">{{ t('dialog.examples.longContent.title') }}</h3>
  <DocsProse keypath="dialog.examples.longContent.text" />
  <DocsExample :source="dialogLongContentSource">
    <DialogLongContent />
  </DocsExample>

  <h3 id="custom-header">{{ t('dialog.examples.customHeader.title') }}</h3>
  <DocsProse keypath="dialog.examples.customHeader.text" />
  <DocsExample :source="dialogCustomHeaderSource">
    <DialogCustomHeader />
  </DocsExample>

  <h3 id="header-actions">{{ t('dialog.examples.headerActions.title') }}</h3>
  <DocsProse keypath="dialog.examples.headerActions.text" />
  <DocsExample :source="dialogHeaderActionsSource">
    <DialogHeaderActions />
  </DocsExample>

  <h3 id="dismissal">{{ t('dialog.examples.dismissal.title') }}</h3>
  <DocsProse keypath="dialog.examples.dismissal.text" />
  <DocsExample :source="dialogDismissalSource">
    <DialogDismissal />
  </DocsExample>

  <h3 id="alert">{{ t('dialog.examples.alert.title') }}</h3>
  <DocsProse keypath="dialog.examples.alert.text" />
  <DocsExample :source="dialogAlertSource">
    <DialogAlert />
  </DocsExample>

  <DocsApi page="dialog" :api="api" />
</template>
