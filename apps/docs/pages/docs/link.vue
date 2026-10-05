<script setup lang="ts">
import api from '~/content/api/link'
import LinkBasic from '~/examples/link/Basic.vue'
import linkBasicSource from '~/examples/link/Basic.vue?raw'
import LinkDisabled from '~/examples/link/Disabled.vue'
import linkDisabledSource from '~/examples/link/Disabled.vue?raw'
import LinkExternal from '~/examples/link/External.vue'
import linkExternalSource from '~/examples/link/External.vue?raw'
import LinkInheritedColour from '~/examples/link/InheritedColour.vue'
import linkInheritedColourSource from '~/examples/link/InheritedColour.vue?raw'
import LinkTones from '~/examples/link/Tones.vue'
import linkTonesSource from '~/examples/link/Tones.vue?raw'
import LinkUnderline from '~/examples/link/Underline.vue'
import linkUnderlineSource from '~/examples/link/Underline.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('link')

const routerCode = `<RouterLink v-slot="{ href, navigate }" to="/settings" custom>
  <VLink :href="href" @click="navigate">Settings</VLink>
</RouterLink>`
</script>

<template>
  <h1>{{ t('link.title') }}</h1>
  <DocsProse class="vd-lead" keypath="link.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="linkBasicSource">
    <LinkBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="tones">{{ t('link.examples.tones.title') }}</h3>
  <DocsProse keypath="link.examples.tones.text" />
  <DocsExample :source="linkTonesSource">
    <LinkTones />
  </DocsExample>

  <h3 id="inherited-colour">{{ t('link.examples.inheritedColour.title') }}</h3>
  <DocsProse keypath="link.examples.inheritedColour.text" />
  <DocsExample :source="linkInheritedColourSource">
    <LinkInheritedColour />
  </DocsExample>

  <h3 id="underline">{{ t('link.examples.underline.title') }}</h3>
  <DocsProse keypath="link.examples.underline.text" />
  <DocsExample :source="linkUnderlineSource">
    <LinkUnderline />
  </DocsExample>

  <h3 id="external">{{ t('link.examples.external.title') }}</h3>
  <DocsProse keypath="link.examples.external.text" />
  <DocsExample :source="linkExternalSource">
    <LinkExternal />
  </DocsExample>

  <h3 id="disabled">{{ t('link.examples.disabled.title') }}</h3>
  <DocsProse keypath="link.examples.disabled.text" />
  <DocsExample :source="linkDisabledSource">
    <LinkDisabled />
  </DocsExample>

  <h3 id="router">{{ t('link.examples.router.title') }}</h3>
  <DocsProse keypath="link.examples.router.text" />
  <DocsCode lang="vue" :code="routerCode" />

  <DocsApi page="link" :api="api" />
</template>
