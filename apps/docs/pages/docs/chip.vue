<script setup lang="ts">
import { VChip } from '@vectis/ui'

definePageMeta({ layout: 'docs' })
useHead({ title: 'Chip' })

const only3 = ref(false)
const tags = ref(['accessibility', 'tokens'])

const selectCode = `<VChip selectable check v-model:selected="only3">Vue 3 only</VChip>
<VChip dismissible @dismiss="remove('accessibility')">accessibility</VChip>`

const colorCode = `<!-- a tag list out of a database: its colours are DATA,
     not design decisions, so they replace the tone -->
<VChip v-for="tag in tags" :key="tag.id" :color="tag.colour">
  {{ tag.name }}
</VChip>`
</script>

<template>
  <h1>Chip</h1>
  <p class="vd-lead">
    A small piece of information: a status, a tag, a filter that stays chosen. It shares its variant
    and tone table verbatim with VButton, and adds the two states a button does not have.
  </p>

  <h2 id="tones-and-variants">Tones and variants</h2>
  <p>
    A chip carries five tones, not three: here a tone is a STATUS rather than an intention, so
    success and warning belong.
  </p>
  <DocsDemo>
    <VChip tone="neutral">Neutral</VChip>
    <VChip tone="accent">Accent</VChip>
    <VChip tone="success">Passing</VChip>
    <VChip tone="warning">Deprecated</VChip>
    <VChip tone="danger">Failing</VChip>
  </DocsDemo>
  <DocsDemo>
    <VChip variant="solid" tone="accent">Solid</VChip>
    <VChip variant="soft" tone="accent">Soft</VChip>
    <VChip variant="outline" tone="accent">Outline</VChip>
    <VChip shape="pill" tone="neutral">Pill</VChip>
    <VChip size="sm" tone="neutral">sm</VChip>
    <span style="font-size: var(--vectis-text-body-sm-size); color: var(--vectis-color-text-muted)">
      Only the two smallest control sizes: a chip larger than that is a button.
    </span>
  </DocsDemo>

  <h2 id="chosen-and-dismissed">Chosen, and dismissed</h2>
  <p>
    <code>selectable</code> makes the chip something that STAYS chosen, and wins over
    <code>href</code> and <code>clickable</code>; <code>check</code> shows a tick before the label
    while selected, replacing the start icon. <code>dismissible</code> adds a button that ASKS for
    removal — taking the chip away stays your decision, so the component emits
    <code>dismiss</code> and removes nothing itself.
  </p>
  <DocsDemo>
    <VChip v-model:selected="only3" selectable check tone="accent">Vue 3 only</VChip>
    <VChip clickable tone="neutral" icon-start="schedule">Last 7 days</VChip>
    <VChip
      v-for="tag in tags"
      :key="tag"
      dismissible
      tone="neutral"
      @dismiss="tags = tags.filter((entry) => entry !== tag)"
    >
      {{ tag }}
    </VChip>
    <VChip disabled tone="neutral">Archived</VChip>
  </DocsDemo>
  <DocsCode lang="vue" :code="selectCode" />

  <h2 id="a-colour-of-your-own">A colour of your own</h2>
  <p>
    <code>color</code> REPLACES the tone, and every shade is derived from it with
    <code>color-mix()</code> — which is what a tag list coming from a database needs, since its
    colours are data rather than design decisions. Light and dark are handled for you.
  </p>
  <DocsDemo>
    <VChip color="oklch(58% 0.2 25)">coral</VChip>
    <VChip color="oklch(55% 0.14 200)">cyan</VChip>
    <VChip color="oklch(50% 0.16 300)" variant="outline">violet</VChip>
  </DocsDemo>
  <DocsCode lang="vue" :code="colorCode" />

  <h2 id="api">API</h2>
  <DocsTable :columns="['Prop', 'Type', 'Default']">
    <tr>
      <td><code>variant</code></td>
      <td><code>'soft' | 'solid' | 'outline'</code></td>
      <td><code>'soft'</code></td>
    </tr>
    <tr>
      <td><code>tone</code></td>
      <td><code>'neutral' | 'accent' | 'danger' | 'success' | 'warning'</code></td>
      <td><code>'neutral'</code></td>
    </tr>
    <tr>
      <td><code>color</code></td>
      <td><code>string</code> — any CSS colour; replaces the tone</td>
      <td>—</td>
    </tr>
    <tr>
      <td><code>shape</code></td>
      <td><code>'chip' | 'pill'</code></td>
      <td><code>'chip'</code></td>
    </tr>
    <tr>
      <td><code>size</code></td>
      <td><code>'xs' | 'sm'</code></td>
      <td><code>'xs'</code></td>
    </tr>
    <tr>
      <td><code>clickable</code> · <code>selectable</code> · <code>disabled</code></td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>v-model:selected</code></td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>check</code></td>
      <td><code>boolean</code> — replaces <code>iconStart</code> while selected</td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>dismissible</code></td>
      <td><code>boolean</code> — emits <code>dismiss</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>dismissIcon</code></td>
      <td><code>IconSource</code></td>
      <td><code>'close'</code></td>
    </tr>
  </DocsTable>
  <p>
    Which element is rendered follows the same priority: <code>selectable</code> and
    <code>clickable</code> give a <code>&lt;button&gt;</code>, <code>href</code> an
    <code>&lt;a&gt;</code>, and a chip with none of them is a plain <code>&lt;span&gt;</code> —
    never a focusable thing that does nothing.
  </p>
</template>
