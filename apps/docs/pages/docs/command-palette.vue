<script setup lang="ts">
import api from '~/content/api/command-palette'
import CommandPaletteBasic from '~/examples/command-palette/Basic.vue'
import commandPaletteBasicSource from '~/examples/command-palette/Basic.vue?raw'
import CommandPaletteAsyncSearch from '~/examples/command-palette/AsyncSearch.vue'
import commandPaletteAsyncSearchSource from '~/examples/command-palette/AsyncSearch.vue?raw'
import CommandPaletteGroups from '~/examples/command-palette/Groups.vue'
import commandPaletteGroupsSource from '~/examples/command-palette/Groups.vue?raw'
import CommandPaletteLinks from '~/examples/command-palette/Links.vue'
import commandPaletteLinksSource from '~/examples/command-palette/Links.vue?raw'
import CommandPaletteRecent from '~/examples/command-palette/Recent.vue'
import commandPaletteRecentSource from '~/examples/command-palette/Recent.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('commandPalette')
</script>

<template>
  <h1>{{ t('commandPalette.title') }}</h1>
  <DocsProse class="vd-lead" keypath="commandPalette.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="commandPaletteBasicSource">
    <CommandPaletteBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="groups">{{ t('commandPalette.examples.groups.title') }}</h3>
  <DocsProse keypath="commandPalette.examples.groups.text" />
  <DocsExample :source="commandPaletteGroupsSource">
    <CommandPaletteGroups />
  </DocsExample>

  <h3 id="links">{{ t('commandPalette.examples.links.title') }}</h3>
  <DocsProse keypath="commandPalette.examples.links.text" />
  <DocsExample :source="commandPaletteLinksSource">
    <CommandPaletteLinks />
  </DocsExample>

  <h3 id="async-search">{{ t('commandPalette.examples.asyncSearch.title') }}</h3>
  <DocsProse keypath="commandPalette.examples.asyncSearch.text" />
  <DocsExample :source="commandPaletteAsyncSearchSource">
    <CommandPaletteAsyncSearch />
  </DocsExample>

  <h3 id="recent">{{ t('commandPalette.examples.recent.title') }}</h3>
  <DocsProse keypath="commandPalette.examples.recent.text" />
  <DocsExample :source="commandPaletteRecentSource">
    <CommandPaletteRecent />
  </DocsExample>

  <DocsApi page="commandPalette" :api="api" />
</template>
