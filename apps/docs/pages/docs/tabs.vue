<script setup lang="ts">
import api from '~/content/api/tabs'
import TabsActivation from '~/examples/tabs/Activation.vue'
import tabsActivationSource from '~/examples/tabs/Activation.vue?raw'
import TabsAlignment from '~/examples/tabs/Alignment.vue'
import tabsAlignmentSource from '~/examples/tabs/Alignment.vue?raw'
import TabsBasic from '~/examples/tabs/Basic.vue'
import tabsBasicSource from '~/examples/tabs/Basic.vue?raw'
import TabsCustomArrows from '~/examples/tabs/CustomArrows.vue'
import tabsCustomArrowsSource from '~/examples/tabs/CustomArrows.vue?raw'
import TabsDisabled from '~/examples/tabs/Disabled.vue'
import tabsDisabledSource from '~/examples/tabs/Disabled.vue?raw'
import TabsGrow from '~/examples/tabs/Grow.vue'
import tabsGrowSource from '~/examples/tabs/Grow.vue?raw'
import TabsOrientation from '~/examples/tabs/Orientation.vue'
import tabsOrientationSource from '~/examples/tabs/Orientation.vue?raw'
import TabsPanels from '~/examples/tabs/Panels.vue'
import tabsPanelsSource from '~/examples/tabs/Panels.vue?raw'
import TabsScrollButtons from '~/examples/tabs/ScrollButtons.vue'
import tabsScrollButtonsSource from '~/examples/tabs/ScrollButtons.vue?raw'
import TabsScrolling from '~/examples/tabs/Scrolling.vue'
import tabsScrollingSource from '~/examples/tabs/Scrolling.vue?raw'
import TabsSizes from '~/examples/tabs/Sizes.vue'
import tabsSizesSource from '~/examples/tabs/Sizes.vue?raw'
import TabsTabContent from '~/examples/tabs/TabContent.vue'
import tabsTabContentSource from '~/examples/tabs/TabContent.vue?raw'
import TabsVariants from '~/examples/tabs/Variants.vue'
import tabsVariantsSource from '~/examples/tabs/Variants.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('tabs')
</script>

<template>
  <h1>{{ t('tabs.title') }}</h1>
  <DocsProse class="vd-lead" keypath="tabs.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="tabsBasicSource" stack>
    <TabsBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="variants">{{ t('tabs.examples.variants.title') }}</h3>
  <DocsProse keypath="tabs.examples.variants.text" />
  <DocsExample :source="tabsVariantsSource" stack>
    <TabsVariants />
  </DocsExample>

  <h3 id="sizes">{{ t('tabs.examples.sizes.title') }}</h3>
  <DocsProse keypath="tabs.examples.sizes.text" />
  <DocsExample :source="tabsSizesSource" stack>
    <TabsSizes />
  </DocsExample>

  <h3 id="tab-content">{{ t('tabs.examples.tabContent.title') }}</h3>
  <DocsProse keypath="tabs.examples.tabContent.text" />
  <DocsExample :source="tabsTabContentSource" stack>
    <TabsTabContent />
  </DocsExample>

  <h3 id="panels">{{ t('tabs.examples.panels.title') }}</h3>
  <DocsProse keypath="tabs.examples.panels.text" />
  <DocsExample :source="tabsPanelsSource" stack>
    <TabsPanels />
  </DocsExample>

  <h3 id="alignment">{{ t('tabs.examples.alignment.title') }}</h3>
  <DocsProse keypath="tabs.examples.alignment.text" />
  <DocsExample :source="tabsAlignmentSource" stack>
    <TabsAlignment />
  </DocsExample>

  <h3 id="grow">{{ t('tabs.examples.grow.title') }}</h3>
  <DocsProse keypath="tabs.examples.grow.text" />
  <DocsExample :source="tabsGrowSource" stack>
    <TabsGrow />
  </DocsExample>

  <h3 id="orientation">{{ t('tabs.examples.orientation.title') }}</h3>
  <DocsProse keypath="tabs.examples.orientation.text" />
  <DocsExample :source="tabsOrientationSource" stack>
    <TabsOrientation />
  </DocsExample>

  <h3 id="scrolling">{{ t('tabs.examples.scrolling.title') }}</h3>
  <DocsProse keypath="tabs.examples.scrolling.text" />
  <DocsExample :source="tabsScrollingSource" stack>
    <TabsScrolling />
  </DocsExample>

  <h3 id="scroll-buttons">{{ t('tabs.examples.scrollButtons.title') }}</h3>
  <DocsProse keypath="tabs.examples.scrollButtons.text" />
  <DocsExample :source="tabsScrollButtonsSource" stack>
    <TabsScrollButtons />
  </DocsExample>

  <h3 id="custom-arrows">{{ t('tabs.examples.customArrows.title') }}</h3>
  <DocsProse keypath="tabs.examples.customArrows.text" />
  <DocsExample :source="tabsCustomArrowsSource" stack>
    <TabsCustomArrows />
  </DocsExample>

  <h3 id="activation">{{ t('tabs.examples.activation.title') }}</h3>
  <DocsProse keypath="tabs.examples.activation.text" />
  <DocsExample :source="tabsActivationSource" stack>
    <TabsActivation />
  </DocsExample>

  <h3 id="disabled">{{ t('tabs.examples.disabled.title') }}</h3>
  <DocsProse keypath="tabs.examples.disabled.text" />
  <DocsExample :source="tabsDisabledSource" stack>
    <TabsDisabled />
  </DocsExample>

  <DocsApi page="tabs" :api="api" />
</template>
