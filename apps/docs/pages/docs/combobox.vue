<script setup lang="ts">
import api from '~/content/api/combobox'
import ComboboxAsynchronousSearch from '~/examples/combobox/AsynchronousSearch.vue'
import comboboxAsynchronousSearchSource from '~/examples/combobox/AsynchronousSearch.vue?raw'
import ComboboxBasic from '~/examples/combobox/Basic.vue'
import comboboxBasicSource from '~/examples/combobox/Basic.vue?raw'
import ComboboxCustomChip from '~/examples/combobox/CustomChip.vue'
import comboboxCustomChipSource from '~/examples/combobox/CustomChip.vue?raw'
import ComboboxCustomOption from '~/examples/combobox/CustomOption.vue'
import comboboxCustomOptionSource from '~/examples/combobox/CustomOption.vue?raw'
import ComboboxFieldIcon from '~/examples/combobox/FieldIcon.vue'
import comboboxFieldIconSource from '~/examples/combobox/FieldIcon.vue?raw'
import ComboboxGroups from '~/examples/combobox/Groups.vue'
import comboboxGroupsSource from '~/examples/combobox/Groups.vue?raw'
import ComboboxIcons from '~/examples/combobox/Icons.vue'
import comboboxIconsSource from '~/examples/combobox/Icons.vue?raw'
import ComboboxInfiniteScroll from '~/examples/combobox/InfiniteScroll.vue'
import comboboxInfiniteScrollSource from '~/examples/combobox/InfiniteScroll.vue?raw'
import ComboboxLabelAndHint from '~/examples/combobox/LabelAndHint.vue'
import comboboxLabelAndHintSource from '~/examples/combobox/LabelAndHint.vue?raw'
import ComboboxMultiple from '~/examples/combobox/Multiple.vue'
import comboboxMultipleSource from '~/examples/combobox/Multiple.vue?raw'
import ComboboxPlacement from '~/examples/combobox/Placement.vue'
import comboboxPlacementSource from '~/examples/combobox/Placement.vue?raw'
import ComboboxSizes from '~/examples/combobox/Sizes.vue'
import comboboxSizesSource from '~/examples/combobox/Sizes.vue?raw'
import ComboboxStates from '~/examples/combobox/States.vue'
import comboboxStatesSource from '~/examples/combobox/States.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('combobox')
</script>

<template>
  <h1>{{ t('combobox.title') }}</h1>
  <DocsProse class="vd-lead" keypath="combobox.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="comboboxBasicSource" stack>
    <ComboboxBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="label-and-hint">{{ t('combobox.examples.labelAndHint.title') }}</h3>
  <DocsProse keypath="combobox.examples.labelAndHint.text" />
  <DocsExample :source="comboboxLabelAndHintSource" stack>
    <ComboboxLabelAndHint />
  </DocsExample>

  <h3 id="sizes">{{ t('combobox.examples.sizes.title') }}</h3>
  <DocsProse keypath="combobox.examples.sizes.text" />
  <DocsExample :source="comboboxSizesSource" stack>
    <ComboboxSizes />
  </DocsExample>

  <h3 id="states">{{ t('combobox.examples.states.title') }}</h3>
  <DocsProse keypath="combobox.examples.states.text" />
  <DocsExample :source="comboboxStatesSource" stack>
    <ComboboxStates />
  </DocsExample>

  <h3 id="placement">{{ t('combobox.examples.placement.title') }}</h3>
  <DocsProse keypath="combobox.examples.placement.text" />
  <DocsExample :source="comboboxPlacementSource" stack>
    <ComboboxPlacement />
  </DocsExample>

  <h3 id="groups">{{ t('combobox.examples.groups.title') }}</h3>
  <DocsProse keypath="combobox.examples.groups.text" />
  <DocsExample :source="comboboxGroupsSource" stack>
    <ComboboxGroups />
  </DocsExample>

  <h3 id="multiple">{{ t('combobox.examples.multiple.title') }}</h3>
  <DocsProse keypath="combobox.examples.multiple.text" />
  <DocsExample :source="comboboxMultipleSource" stack>
    <ComboboxMultiple />
  </DocsExample>

  <h3 id="field-icon">{{ t('combobox.examples.fieldIcon.title') }}</h3>
  <DocsProse keypath="combobox.examples.fieldIcon.text" />
  <DocsExample :source="comboboxFieldIconSource" stack>
    <ComboboxFieldIcon />
  </DocsExample>

  <h3 id="option-icons">{{ t('combobox.examples.icons.title') }}</h3>
  <DocsProse keypath="combobox.examples.icons.text" />
  <DocsExample :source="comboboxIconsSource" stack>
    <ComboboxIcons />
  </DocsExample>

  <h3 id="asynchronous-search">{{ t('combobox.examples.asynchronous.title') }}</h3>
  <DocsProse keypath="combobox.examples.asynchronous.text" />
  <DocsExample :source="comboboxAsynchronousSearchSource" stack>
    <ComboboxAsynchronousSearch />
  </DocsExample>

  <h3 id="infinite-scroll">{{ t('combobox.examples.infiniteScroll.title') }}</h3>
  <DocsProse keypath="combobox.examples.infiniteScroll.text" />
  <DocsExample :source="comboboxInfiniteScrollSource" stack>
    <ComboboxInfiniteScroll />
  </DocsExample>

  <h3 id="custom-options">{{ t('combobox.examples.customOption.title') }}</h3>
  <DocsProse keypath="combobox.examples.customOption.text" />
  <DocsExample :source="comboboxCustomOptionSource" stack>
    <ComboboxCustomOption />
  </DocsExample>

  <h3 id="custom-chips">{{ t('combobox.examples.customChip.title') }}</h3>
  <DocsProse keypath="combobox.examples.customChip.text" />
  <DocsExample :source="comboboxCustomChipSource" stack>
    <ComboboxCustomChip />
  </DocsExample>

  <DocsApi page="combobox" :api="api" />
</template>
