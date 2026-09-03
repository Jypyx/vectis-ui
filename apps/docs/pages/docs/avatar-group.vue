<script setup lang="ts">
import api from '~/content/api/avatar-group'
import AvatarGroupBasic from '~/examples/avatar-group/Basic.vue'
import avatarGroupBasicSource from '~/examples/avatar-group/Basic.vue?raw'
import AvatarGroupCompact from '~/examples/avatar-group/Compact.vue'
import avatarGroupCompactSource from '~/examples/avatar-group/Compact.vue?raw'
import AvatarGroupCustomOverflow from '~/examples/avatar-group/CustomOverflow.vue'
import avatarGroupCustomOverflowSource from '~/examples/avatar-group/CustomOverflow.vue?raw'
import AvatarGroupOverflow from '~/examples/avatar-group/Overflow.vue'
import avatarGroupOverflowSource from '~/examples/avatar-group/Overflow.vue?raw'
import AvatarGroupSize from '~/examples/avatar-group/Size.vue'
import avatarGroupSizeSource from '~/examples/avatar-group/Size.vue?raw'
import AvatarGroupTooltips from '~/examples/avatar-group/Tooltips.vue'
import avatarGroupTooltipsSource from '~/examples/avatar-group/Tooltips.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('avatarGroup.title') })
</script>

<template>
  <h1>{{ t('avatarGroup.title') }}</h1>
  <DocsProse class="vd-lead" keypath="avatarGroup.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="avatarGroupBasicSource">
    <AvatarGroupBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="overflow">{{ t('avatarGroup.examples.overflow.title') }}</h3>
  <DocsProse keypath="avatarGroup.examples.overflow.text" />
  <DocsExample :source="avatarGroupOverflowSource">
    <AvatarGroupOverflow />
  </DocsExample>

  <h3 id="size">{{ t('avatarGroup.examples.size.title') }}</h3>
  <DocsProse keypath="avatarGroup.examples.size.text" />
  <DocsExample :source="avatarGroupSizeSource" stack>
    <AvatarGroupSize />
  </DocsExample>

  <h3 id="compact">{{ t('avatarGroup.examples.compact.title') }}</h3>
  <DocsProse keypath="avatarGroup.examples.compact.text" />
  <DocsExample :source="avatarGroupCompactSource" stack>
    <AvatarGroupCompact />
  </DocsExample>

  <h3 id="custom-overflow">{{ t('avatarGroup.examples.customOverflow.title') }}</h3>
  <DocsProse keypath="avatarGroup.examples.customOverflow.text" />
  <DocsExample :source="avatarGroupCustomOverflowSource">
    <AvatarGroupCustomOverflow />
  </DocsExample>

  <h3 id="with-tooltips">{{ t('avatarGroup.examples.tooltips.title') }}</h3>
  <DocsProse keypath="avatarGroup.examples.tooltips.text" />
  <DocsExample :source="avatarGroupTooltipsSource">
    <AvatarGroupTooltips />
  </DocsExample>

  <DocsApi page="avatarGroup" :api="api" />
</template>
