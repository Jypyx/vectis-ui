<script setup lang="ts">
import api from '~/content/api/drawer'
import DrawerBasic from '~/examples/drawer/Basic.vue'
import drawerBasicSource from '~/examples/drawer/Basic.vue?raw'
import DrawerNavigation from '~/examples/drawer/Navigation.vue'
import drawerNavigationSource from '~/examples/drawer/Navigation.vue?raw'
import DrawerSides from '~/examples/drawer/Sides.vue'
import drawerSidesSource from '~/examples/drawer/Sides.vue?raw'
import DrawerSize from '~/examples/drawer/Size.vue'
import drawerSizeSource from '~/examples/drawer/Size.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('drawer')
</script>

<template>
  <h1>{{ t('drawer.title') }}</h1>
  <DocsProse class="vd-lead" keypath="drawer.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="drawerBasicSource">
    <DrawerBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="sides">{{ t('drawer.examples.sides.title') }}</h3>
  <DocsProse keypath="drawer.examples.sides.text" />
  <DocsExample :source="drawerSidesSource">
    <DrawerSides />
  </DocsExample>

  <h3 id="size">{{ t('drawer.examples.size.title') }}</h3>
  <DocsProse keypath="drawer.examples.size.text" />
  <DocsExample :source="drawerSizeSource">
    <DrawerSize />
  </DocsExample>

  <h3 id="navigation">{{ t('drawer.examples.navigation.title') }}</h3>
  <DocsProse keypath="drawer.examples.navigation.text" />
  <DocsExample :source="drawerNavigationSource">
    <DrawerNavigation />
  </DocsExample>

  <DocsApi page="drawer" :api="api" />
</template>
