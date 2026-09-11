<script setup lang="ts">
import api from '~/content/api/snackbar'
import SnackbarAutoDismiss from '~/examples/snackbar/AutoDismiss.vue'
import snackbarAutoDismissSource from '~/examples/snackbar/AutoDismiss.vue?raw'
import SnackbarBasic from '~/examples/snackbar/Basic.vue'
import snackbarBasicSource from '~/examples/snackbar/Basic.vue?raw'
import SnackbarPersistent from '~/examples/snackbar/Persistent.vue'
import snackbarPersistentSource from '~/examples/snackbar/Persistent.vue?raw'
import SnackbarPlacements from '~/examples/snackbar/Placements.vue'
import snackbarPlacementsSource from '~/examples/snackbar/Placements.vue?raw'
import SnackbarReplacement from '~/examples/snackbar/Replacement.vue'
import snackbarReplacementSource from '~/examples/snackbar/Replacement.vue?raw'
import SnackbarTones from '~/examples/snackbar/Tones.vue'
import snackbarTonesSource from '~/examples/snackbar/Tones.vue?raw'
import SnackbarWithIcon from '~/examples/snackbar/WithIcon.vue'
import snackbarWithIconSource from '~/examples/snackbar/WithIcon.vue?raw'
import SnackbarWithoutAction from '~/examples/snackbar/WithoutAction.vue'
import snackbarWithoutActionSource from '~/examples/snackbar/WithoutAction.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('snackbar')
</script>

<template>
  <h1>{{ t('snackbar.title') }}</h1>
  <DocsProse class="vd-lead" keypath="snackbar.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="snackbarBasicSource">
    <SnackbarBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="tones">{{ t('snackbar.examples.tones.title') }}</h3>
  <DocsProse keypath="snackbar.examples.tones.text" />
  <DocsExample :source="snackbarTonesSource">
    <SnackbarTones />
  </DocsExample>

  <h3 id="without-action">{{ t('snackbar.examples.withoutAction.title') }}</h3>
  <DocsProse keypath="snackbar.examples.withoutAction.text" />
  <DocsExample :source="snackbarWithoutActionSource">
    <SnackbarWithoutAction />
  </DocsExample>

  <h3 id="icon">{{ t('snackbar.examples.icon.title') }}</h3>
  <DocsProse keypath="snackbar.examples.icon.text" />
  <DocsExample :source="snackbarWithIconSource">
    <SnackbarWithIcon />
  </DocsExample>

  <h3 id="placements">{{ t('snackbar.examples.placements.title') }}</h3>
  <DocsProse keypath="snackbar.examples.placements.text" />
  <DocsExample :source="snackbarPlacementsSource">
    <SnackbarPlacements />
  </DocsExample>

  <h3 id="replacement">{{ t('snackbar.examples.replacement.title') }}</h3>
  <DocsProse keypath="snackbar.examples.replacement.text" />
  <DocsExample :source="snackbarReplacementSource">
    <SnackbarReplacement />
  </DocsExample>

  <h3 id="auto-dismiss">{{ t('snackbar.examples.autoDismiss.title') }}</h3>
  <DocsProse keypath="snackbar.examples.autoDismiss.text" />
  <DocsExample :source="snackbarAutoDismissSource">
    <SnackbarAutoDismiss />
  </DocsExample>

  <h3 id="persistent">{{ t('snackbar.examples.persistent.title') }}</h3>
  <DocsProse keypath="snackbar.examples.persistent.text" />
  <DocsExample :source="snackbarPersistentSource">
    <SnackbarPersistent />
  </DocsExample>

  <DocsApi page="snackbar" :api="api" />
</template>
