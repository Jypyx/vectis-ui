<script setup lang="ts">
import { VHotkeys } from 'vectis-ui'

import api from '~/content/api/hotkeys'
import HotkeysAttached from '~/examples/hotkeys/Attached.vue'
import hotkeysAttachedSource from '~/examples/hotkeys/Attached.vue?raw'
import HotkeysBasic from '~/examples/hotkeys/Basic.vue'
import hotkeysBasicSource from '~/examples/hotkeys/Basic.vue?raw'
import HotkeysInText from '~/examples/hotkeys/InText.vue'
import hotkeysInTextSource from '~/examples/hotkeys/InText.vue?raw'
import HotkeysListening from '~/examples/hotkeys/Listening.vue'
import hotkeysListeningSource from '~/examples/hotkeys/Listening.vue?raw'
import HotkeysPlatform from '~/examples/hotkeys/Platform.vue'
import hotkeysPlatformSource from '~/examples/hotkeys/Platform.vue?raw'
import HotkeysSeparator from '~/examples/hotkeys/Separator.vue'
import hotkeysSeparatorSource from '~/examples/hotkeys/Separator.vue?raw'
import HotkeysSizes from '~/examples/hotkeys/Sizes.vue'
import hotkeysSizesSource from '~/examples/hotkeys/Sizes.vue?raw'
import HotkeysVariants from '~/examples/hotkeys/Variants.vue'
import hotkeysVariantsSource from '~/examples/hotkeys/Variants.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('hotkeys')

/**
 * The vocabulary, rendered rather than described: the first column is what may be
 * written, the other two what the component draws for it. Only the first two rows
 * differ from one system to the next, which is the point the table makes on its own.
 */
const KEYS: { write: string[]; render: string[] }[] = [
  { write: ['mod'], render: ['mod'] },
  { write: ['meta', 'cmd', 'command', 'win', 'super'], render: ['meta'] },
  { write: ['ctrl', 'control'], render: ['ctrl'] },
  { write: ['alt', 'option', 'opt'], render: ['alt'] },
  { write: ['shift'], render: ['shift'] },
  { write: ['enter', 'return'], render: ['enter'] },
  { write: ['esc', 'escape'], render: ['esc'] },
  { write: ['space'], render: ['space'] },
  { write: ['backspace'], render: ['backspace'] },
  { write: ['delete', 'del'], render: ['delete'] },
  { write: ['tab'], render: ['tab'] },
  { write: ['up', 'down', 'left', 'right'], render: ['up', 'down', 'left', 'right'] },
  { write: ['plus'], render: ['plus'] },
  { write: ['k', 'f5', ','], render: ['k', 'f5', ','] },
]

const keyColumns = computed(() => [
  t('hotkeys.examples.keys.written'),
  'macOS',
  t('hotkeys.examples.keys.elsewhere'),
])
</script>

<template>
  <h1>{{ t('hotkeys.title') }}</h1>
  <DocsProse class="vd-lead" keypath="hotkeys.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="hotkeysBasicSource">
    <HotkeysBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="keys">{{ t('hotkeys.examples.keys.title') }}</h3>
  <DocsProse keypath="hotkeys.examples.keys.text" />
  <DocsTable :columns="keyColumns">
    <tr v-for="row in KEYS" :key="row.write.join()">
      <td>
        <code v-for="token in row.write" :key="token" class="vd-key-token">{{ token }}</code>
      </td>
      <td>
        <span class="vd-key-render">
          <VHotkeys v-for="token in row.render" :key="token" :keys="token" platform="mac" />
        </span>
      </td>
      <td>
        <span class="vd-key-render">
          <VHotkeys v-for="token in row.render" :key="token" :keys="token" platform="windows" />
        </span>
      </td>
    </tr>
  </DocsTable>

  <h3 id="variants">{{ t('hotkeys.examples.variants.title') }}</h3>
  <DocsProse keypath="hotkeys.examples.variants.text" />
  <DocsExample :source="hotkeysVariantsSource">
    <HotkeysVariants />
  </DocsExample>

  <h3 id="sizes">{{ t('hotkeys.examples.sizes.title') }}</h3>
  <DocsProse keypath="hotkeys.examples.sizes.text" />
  <DocsExample :source="hotkeysSizesSource">
    <HotkeysSizes />
  </DocsExample>

  <h3 id="attached">{{ t('hotkeys.examples.attached.title') }}</h3>
  <DocsProse keypath="hotkeys.examples.attached.text" />
  <DocsExample :source="hotkeysAttachedSource">
    <HotkeysAttached />
  </DocsExample>

  <h3 id="platform">{{ t('hotkeys.examples.platform.title') }}</h3>
  <DocsProse keypath="hotkeys.examples.platform.text" />
  <DocsExample :source="hotkeysPlatformSource">
    <HotkeysPlatform />
  </DocsExample>

  <h3 id="separator">{{ t('hotkeys.examples.separator.title') }}</h3>
  <DocsProse keypath="hotkeys.examples.separator.text" />
  <DocsExample :source="hotkeysSeparatorSource">
    <HotkeysSeparator />
  </DocsExample>

  <h3 id="in-text">{{ t('hotkeys.examples.inText.title') }}</h3>
  <DocsProse keypath="hotkeys.examples.inText.text" />
  <DocsExample :source="hotkeysInTextSource">
    <HotkeysInText />
  </DocsExample>

  <h3 id="listening">{{ t('hotkeys.examples.listening.title') }}</h3>
  <DocsProse keypath="hotkeys.examples.listening.text" />
  <DocsExample :source="hotkeysListeningSource">
    <HotkeysListening />
  </DocsExample>

  <DocsApi page="hotkeys" :api="api" />
</template>

<style scoped>
.vd-key-token + .vd-key-token {
  margin-inline-start: var(--vectis-space-2);
}
.vd-key-render {
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-2);
}
</style>
