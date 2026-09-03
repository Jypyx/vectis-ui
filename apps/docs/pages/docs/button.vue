<script setup lang="ts">
import api from '~/content/api/button'
import ButtonBasic from '~/examples/button/Basic.vue'
import buttonBasicSource from '~/examples/button/Basic.vue?raw'
import ButtonCompact from '~/examples/button/Compact.vue'
import buttonCompactSource from '~/examples/button/Compact.vue?raw'
import ButtonCustomIcons from '~/examples/button/CustomIcons.vue'
import buttonCustomIconsSource from '~/examples/button/CustomIcons.vue?raw'
import ButtonElevated from '~/examples/button/Elevated.vue'
import buttonElevatedSource from '~/examples/button/Elevated.vue?raw'
import ButtonIcons from '~/examples/button/Icons.vue'
import buttonIconsSource from '~/examples/button/Icons.vue?raw'
import ButtonLink from '~/examples/button/Link.vue'
import buttonLinkSource from '~/examples/button/Link.vue?raw'
import ButtonSizes from '~/examples/button/Sizes.vue'
import buttonSizesSource from '~/examples/button/Sizes.vue?raw'
import ButtonStates from '~/examples/button/States.vue'
import buttonStatesSource from '~/examples/button/States.vue?raw'
import ButtonVariantsAndTones from '~/examples/button/VariantsAndTones.vue'
import buttonVariantsAndTonesSource from '~/examples/button/VariantsAndTones.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('button.title') })
</script>

<template>
  <h1>{{ t('button.title') }}</h1>
  <DocsProse class="vd-lead" keypath="button.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="buttonBasicSource">
    <ButtonBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="variants-and-tones">{{ t('button.examples.variantsAndTones.title') }}</h3>
  <DocsProse keypath="button.examples.variantsAndTones.text" />
  <DocsExample :source="buttonVariantsAndTonesSource" stack>
    <ButtonVariantsAndTones />
  </DocsExample>

  <h3 id="elevated">{{ t('button.examples.elevated.title') }}</h3>
  <DocsProse keypath="button.examples.elevated.text" />
  <DocsExample :source="buttonElevatedSource" stack>
    <ButtonElevated />
  </DocsExample>

  <h3 id="sizes">{{ t('button.examples.sizes.title') }}</h3>
  <DocsProse keypath="button.examples.sizes.text" />
  <DocsExample :source="buttonSizesSource">
    <ButtonSizes />
  </DocsExample>

  <h3 id="compact">{{ t('button.examples.compact.title') }}</h3>
  <DocsProse keypath="button.examples.compact.text" />
  <DocsExample :source="buttonCompactSource">
    <ButtonCompact />
  </DocsExample>

  <h3 id="with-icons">{{ t('button.examples.icons.title') }}</h3>
  <DocsProse keypath="button.examples.icons.text" />
  <DocsExample :source="buttonIconsSource">
    <ButtonIcons />
  </DocsExample>

  <h3 id="custom-icons">{{ t('button.examples.customIcons.title') }}</h3>
  <DocsProse keypath="button.examples.customIcons.text" />
  <DocsExample :source="buttonCustomIconsSource">
    <ButtonCustomIcons />
  </DocsExample>

  <h3 id="link">{{ t('button.examples.link.title') }}</h3>
  <DocsProse keypath="button.examples.link.text" />
  <DocsExample :source="buttonLinkSource">
    <ButtonLink />
  </DocsExample>

  <h3 id="states">{{ t('button.examples.states.title') }}</h3>
  <DocsProse keypath="button.examples.states.text" />
  <DocsExample :source="buttonStatesSource" stack>
    <ButtonStates />
  </DocsExample>

  <DocsApi page="button" :api="api" />
</template>
