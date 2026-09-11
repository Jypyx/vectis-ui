<script setup lang="ts">
import api from '~/content/api/side-navigation'
import SideNavigationBasic from '~/examples/side-navigation/Basic.vue'
import sideNavigationBasicSource from '~/examples/side-navigation/Basic.vue?raw'
import SideNavigationChevrons from '~/examples/side-navigation/Chevrons.vue'
import sideNavigationChevronsSource from '~/examples/side-navigation/Chevrons.vue?raw'
import SideNavigationDepth from '~/examples/side-navigation/Depth.vue'
import sideNavigationDepthSource from '~/examples/side-navigation/Depth.vue?raw'
import SideNavigationDisabled from '~/examples/side-navigation/Disabled.vue'
import sideNavigationDisabledSource from '~/examples/side-navigation/Disabled.vue?raw'
import SideNavigationEndContent from '~/examples/side-navigation/EndContent.vue'
import sideNavigationEndContentSource from '~/examples/side-navigation/EndContent.vue?raw'
import SideNavigationExclusive from '~/examples/side-navigation/Exclusive.vue'
import sideNavigationExclusiveSource from '~/examples/side-navigation/Exclusive.vue?raw'
import SideNavigationGroups from '~/examples/side-navigation/Groups.vue'
import sideNavigationGroupsSource from '~/examples/side-navigation/Groups.vue?raw'
import SideNavigationLinks from '~/examples/side-navigation/Links.vue'
import sideNavigationLinksSource from '~/examples/side-navigation/Links.vue?raw'
import SideNavigationOpenState from '~/examples/side-navigation/OpenState.vue'
import sideNavigationOpenStateSource from '~/examples/side-navigation/OpenState.vue?raw'
import SideNavigationSizes from '~/examples/side-navigation/Sizes.vue'
import sideNavigationSizesSource from '~/examples/side-navigation/Sizes.vue?raw'
import SideNavigationSublabels from '~/examples/side-navigation/Sublabels.vue'
import sideNavigationSublabelsSource from '~/examples/side-navigation/Sublabels.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('sideNavigation')
</script>

<template>
  <h1>{{ t('sideNavigation.title') }}</h1>
  <DocsProse class="vd-lead" keypath="sideNavigation.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="sideNavigationBasicSource">
    <SideNavigationBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="links">{{ t('sideNavigation.examples.links.title') }}</h3>
  <DocsProse keypath="sideNavigation.examples.links.text" />
  <DocsExample :source="sideNavigationLinksSource">
    <SideNavigationLinks />
  </DocsExample>

  <h3 id="sublabels">{{ t('sideNavigation.examples.sublabels.title') }}</h3>
  <DocsProse keypath="sideNavigation.examples.sublabels.text" />
  <DocsExample :source="sideNavigationSublabelsSource">
    <SideNavigationSublabels />
  </DocsExample>

  <h3 id="end-content">{{ t('sideNavigation.examples.endContent.title') }}</h3>
  <DocsProse keypath="sideNavigation.examples.endContent.text" />
  <DocsExample :source="sideNavigationEndContentSource">
    <SideNavigationEndContent />
  </DocsExample>

  <h3 id="groups">{{ t('sideNavigation.examples.groups.title') }}</h3>
  <DocsProse keypath="sideNavigation.examples.groups.text" />
  <DocsExample :source="sideNavigationGroupsSource">
    <SideNavigationGroups />
  </DocsExample>

  <h3 id="depth">{{ t('sideNavigation.examples.depth.title') }}</h3>
  <DocsProse keypath="sideNavigation.examples.depth.text" />
  <DocsExample :source="sideNavigationDepthSource">
    <SideNavigationDepth />
  </DocsExample>

  <h3 id="chevrons">{{ t('sideNavigation.examples.chevrons.title') }}</h3>
  <DocsProse keypath="sideNavigation.examples.chevrons.text" />
  <DocsExample :source="sideNavigationChevronsSource">
    <SideNavigationChevrons />
  </DocsExample>

  <h3 id="exclusive">{{ t('sideNavigation.examples.exclusive.title') }}</h3>
  <DocsProse keypath="sideNavigation.examples.exclusive.text" />
  <DocsExample :source="sideNavigationExclusiveSource">
    <SideNavigationExclusive />
  </DocsExample>

  <h3 id="open-state">{{ t('sideNavigation.examples.openState.title') }}</h3>
  <DocsProse keypath="sideNavigation.examples.openState.text" />
  <DocsExample :source="sideNavigationOpenStateSource">
    <SideNavigationOpenState />
  </DocsExample>

  <h3 id="disabled">{{ t('sideNavigation.examples.disabled.title') }}</h3>
  <DocsProse keypath="sideNavigation.examples.disabled.text" />
  <DocsExample :source="sideNavigationDisabledSource">
    <SideNavigationDisabled />
  </DocsExample>

  <h3 id="sizes">{{ t('sideNavigation.examples.sizes.title') }}</h3>
  <DocsProse keypath="sideNavigation.examples.sizes.text" />
  <DocsExample :source="sideNavigationSizesSource" stack>
    <SideNavigationSizes />
  </DocsExample>

  <DocsApi page="sideNavigation" :api="api" />
</template>
