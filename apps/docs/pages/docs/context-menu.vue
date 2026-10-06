<script setup lang="ts">
import api from '~/content/api/context-menu'
import ContextMenuBasic from '~/examples/context-menu/Basic.vue'
import contextMenuBasicSource from '~/examples/context-menu/Basic.vue?raw'
import ContextMenuNativeMenu from '~/examples/context-menu/NativeMenu.vue'
import contextMenuNativeMenuSource from '~/examples/context-menu/NativeMenu.vue?raw'
import ContextMenuOpen from '~/examples/context-menu/Open.vue'
import contextMenuOpenSource from '~/examples/context-menu/Open.vue?raw'
import ContextMenuSubmenus from '~/examples/context-menu/Submenus.vue'
import contextMenuSubmenusSource from '~/examples/context-menu/Submenus.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('contextMenu')
</script>

<template>
  <h1>{{ t('contextMenu.title') }}</h1>
  <DocsProse class="vd-lead" keypath="contextMenu.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="contextMenuBasicSource" stack>
    <ContextMenuBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="submenus">{{ t('contextMenu.examples.submenus.title') }}</h3>
  <DocsProse keypath="contextMenu.examples.submenus.text" />
  <DocsExample :source="contextMenuSubmenusSource" stack>
    <ContextMenuSubmenus />
  </DocsExample>

  <h3 id="native-menu">{{ t('contextMenu.examples.nativeMenu.title') }}</h3>
  <DocsProse keypath="contextMenu.examples.nativeMenu.text" />
  <DocsExample :source="contextMenuNativeMenuSource" stack>
    <ContextMenuNativeMenu />
  </DocsExample>

  <h3 id="open-state">{{ t('contextMenu.examples.open.title') }}</h3>
  <DocsProse keypath="contextMenu.examples.open.text" />
  <DocsExample :source="contextMenuOpenSource" stack>
    <ContextMenuOpen />
  </DocsExample>

  <DocsApi page="contextMenu" :api="api" />
</template>
