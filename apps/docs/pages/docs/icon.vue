<script setup lang="ts">
import api from '~/content/api/icon'
import IconBasic from '~/examples/icon/Basic.vue'
import iconBasicSource from '~/examples/icon/Basic.vue?raw'
import IconFilled from '~/examples/icon/Filled.vue'
import iconFilledSource from '~/examples/icon/Filled.vue?raw'
import IconRendering from '~/examples/icon/Rendering.vue'
import iconRenderingSource from '~/examples/icon/Rendering.vue?raw'
import IconSize from '~/examples/icon/Size.vue'
import iconSizeSource from '~/examples/icon/Size.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
const localePath = useLocalePath()
useDocsHead('icon')
</script>

<template>
  <h1>{{ t('icon.title') }}</h1>
  <DocsProse class="vd-lead" keypath="icon.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="iconBasicSource">
    <IconBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="size">{{ t('icon.examples.size.title') }}</h3>
  <DocsProse keypath="icon.examples.size.text" />
  <DocsExample :source="iconSizeSource">
    <IconSize />
  </DocsExample>

  <h3 id="filled">{{ t('icon.examples.filled.title') }}</h3>
  <DocsProse keypath="icon.examples.filled.text" />
  <DocsExample :source="iconFilledSource">
    <IconFilled />
  </DocsExample>

  <h3 id="rendering">{{ t('icon.examples.rendering.title') }}</h3>
  <DocsProse keypath="icon.examples.rendering.text" />
  <DocsProseList tag="ol" keypath="icon.examples.rendering.order" />
  <DocsExample :source="iconRenderingSource" stack>
    <IconRendering />
  </DocsExample>
  <!--
    A paragraph with a component in the middle of it, so it takes two keys with the link
    between them: the same shape the font family page uses, and the link's own text is the
    target page's title, which the navigation catalogue already translates.
  -->
  <p>
    <DocsProse tag="span" keypath="icon.examples.rendering.moreBefore" />
    {{ ' ' }}
    <NuxtLink :to="localePath('/docs/iconography')">{{ t('nav.iconography') }}</NuxtLink>
    <DocsProse tag="span" keypath="icon.examples.rendering.moreAfter" />
  </p>

  <DocsApi page="icon" :api="api" />
</template>
