<script setup lang="ts">
import api from '~/content/api/avatar'
import AvatarBasic from '~/examples/avatar/Basic.vue'
import avatarBasicSource from '~/examples/avatar/Basic.vue?raw'
import AvatarColor from '~/examples/avatar/Color.vue'
import avatarColorSource from '~/examples/avatar/Color.vue?raw'
import AvatarCompact from '~/examples/avatar/Compact.vue'
import avatarCompactSource from '~/examples/avatar/Compact.vue?raw'
import AvatarIcon from '~/examples/avatar/Icon.vue'
import avatarIconSource from '~/examples/avatar/Icon.vue?raw'
import AvatarImage from '~/examples/avatar/Image.vue'
import avatarImageSource from '~/examples/avatar/Image.vue?raw'
import AvatarInitials from '~/examples/avatar/Initials.vue'
import avatarInitialsSource from '~/examples/avatar/Initials.vue?raw'
import AvatarInteractive from '~/examples/avatar/Interactive.vue'
import avatarInteractiveSource from '~/examples/avatar/Interactive.vue?raw'
import AvatarSizes from '~/examples/avatar/Sizes.vue'
import avatarSizesSource from '~/examples/avatar/Sizes.vue?raw'
import AvatarTooltip from '~/examples/avatar/Tooltip.vue'
import avatarTooltipSource from '~/examples/avatar/Tooltip.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('avatar.title') })
</script>

<template>
  <h1>{{ t('avatar.title') }}</h1>
  <DocsProse class="vd-lead" keypath="avatar.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="avatarBasicSource">
    <AvatarBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="with-a-picture">{{ t('avatar.examples.image.title') }}</h3>
  <DocsProse keypath="avatar.examples.image.text" />
  <DocsExample :source="avatarImageSource">
    <AvatarImage />
  </DocsExample>

  <h3 id="with-an-icon">{{ t('avatar.examples.icon.title') }}</h3>
  <DocsProse keypath="avatar.examples.icon.text" />
  <DocsExample :source="avatarIconSource">
    <AvatarIcon />
  </DocsExample>

  <h3 id="initials">{{ t('avatar.examples.initials.title') }}</h3>
  <DocsProse keypath="avatar.examples.initials.text" />
  <DocsExample :source="avatarInitialsSource">
    <AvatarInitials />
  </DocsExample>

  <h3 id="sizes">{{ t('avatar.examples.sizes.title') }}</h3>
  <DocsProse keypath="avatar.examples.sizes.text" />
  <DocsExample :source="avatarSizesSource">
    <AvatarSizes />
  </DocsExample>

  <h3 id="compact">{{ t('avatar.examples.compact.title') }}</h3>
  <DocsProse keypath="avatar.examples.compact.text" />
  <DocsExample :source="avatarCompactSource">
    <AvatarCompact />
  </DocsExample>

  <h3 id="custom-colour">{{ t('avatar.examples.color.title') }}</h3>
  <DocsProse keypath="avatar.examples.color.text" />
  <DocsExample :source="avatarColorSource">
    <AvatarColor />
  </DocsExample>

  <h3 id="buttons-and-links">{{ t('avatar.examples.interactive.title') }}</h3>
  <DocsProse keypath="avatar.examples.interactive.text" />
  <DocsExample :source="avatarInteractiveSource">
    <AvatarInteractive />
  </DocsExample>

  <h3 id="with-a-tooltip">{{ t('avatar.examples.tooltip.title') }}</h3>
  <DocsProse keypath="avatar.examples.tooltip.text" />
  <DocsExample :source="avatarTooltipSource">
    <AvatarTooltip />
  </DocsExample>

  <DocsApi page="avatar" :api="api" />
</template>
