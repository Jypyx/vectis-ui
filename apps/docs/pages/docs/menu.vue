<script setup lang="ts">
import api from '~/content/api/menu'
import MenuBasic from '~/examples/menu/Basic.vue'
import menuBasicSource from '~/examples/menu/Basic.vue?raw'
import MenuGroups from '~/examples/menu/Groups.vue'
import menuGroupsSource from '~/examples/menu/Groups.vue?raw'
import MenuMenuItems from '~/examples/menu/MenuItems.vue'
import menuMenuItemsSource from '~/examples/menu/MenuItems.vue?raw'
import MenuOpen from '~/examples/menu/Open.vue'
import menuOpenSource from '~/examples/menu/Open.vue?raw'
import MenuPlacement from '~/examples/menu/Placement.vue'
import menuPlacementSource from '~/examples/menu/Placement.vue?raw'
import MenuSelection from '~/examples/menu/Selection.vue'
import menuSelectionSource from '~/examples/menu/Selection.vue?raw'
import MenuSizes from '~/examples/menu/Sizes.vue'
import menuSizesSource from '~/examples/menu/Sizes.vue?raw'
import MenuSublabels from '~/examples/menu/Sublabels.vue'
import menuSublabelsSource from '~/examples/menu/Sublabels.vue?raw'
import MenuSubmenus from '~/examples/menu/Submenus.vue'
import menuSubmenusSource from '~/examples/menu/Submenus.vue?raw'
import MenuWidth from '~/examples/menu/Width.vue'
import menuWidthSource from '~/examples/menu/Width.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('menu')
</script>

<template>
  <h1>{{ t('menu.title') }}</h1>
  <DocsProse class="vd-lead" keypath="menu.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="menuBasicSource">
    <MenuBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="menu-items">{{ t('menu.examples.menuItems.title') }}</h3>
  <DocsProse keypath="menu.examples.menuItems.text" />
  <DocsExample :source="menuMenuItemsSource">
    <MenuMenuItems />
  </DocsExample>

  <h3 id="sublabels">{{ t('menu.examples.sublabels.title') }}</h3>
  <DocsProse keypath="menu.examples.sublabels.text" />
  <DocsExample :source="menuSublabelsSource">
    <MenuSublabels />
  </DocsExample>

  <h3 id="selection">{{ t('menu.examples.selection.title') }}</h3>
  <DocsProse keypath="menu.examples.selection.text" />
  <DocsExample :source="menuSelectionSource">
    <MenuSelection />
  </DocsExample>

  <h3 id="groups">{{ t('menu.examples.groups.title') }}</h3>
  <DocsProse keypath="menu.examples.groups.text" />
  <DocsExample :source="menuGroupsSource">
    <MenuGroups />
  </DocsExample>

  <h3 id="submenus">{{ t('menu.examples.submenus.title') }}</h3>
  <DocsProse keypath="menu.examples.submenus.text" />
  <DocsExample :source="menuSubmenusSource">
    <MenuSubmenus />
  </DocsExample>

  <h3 id="sizes">{{ t('menu.examples.sizes.title') }}</h3>
  <DocsProse keypath="menu.examples.sizes.text" />
  <DocsExample :source="menuSizesSource">
    <MenuSizes />
  </DocsExample>

  <h3 id="width">{{ t('menu.examples.width.title') }}</h3>
  <DocsProse keypath="menu.examples.width.text" />
  <DocsExample :source="menuWidthSource">
    <MenuWidth />
  </DocsExample>

  <h3 id="placement">{{ t('menu.examples.placement.title') }}</h3>
  <DocsProse keypath="menu.examples.placement.text" />
  <DocsExample :source="menuPlacementSource" stack>
    <MenuPlacement />
  </DocsExample>

  <h3 id="open-state">{{ t('menu.examples.open.title') }}</h3>
  <DocsProse keypath="menu.examples.open.text" />
  <DocsExample :source="menuOpenSource" stack>
    <MenuOpen />
  </DocsExample>

  <DocsApi page="menu" :api="api" />
</template>
