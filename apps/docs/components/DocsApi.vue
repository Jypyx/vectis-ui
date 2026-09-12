<script setup lang="ts">
/**
 * The API section of a component page: props, events, slots, named types and CSS variables.
 *
 * It renders the whole section, headings included, so that forty-four pages cannot each grow
 * their own shape. The structure comes from `content/api/<slug>.ts`, which a script extracts
 * from the library source; the words come from the page's catalogue.
 *
 * TRAP — this component has SEVERAL ROOTS on purpose, and must keep them. `useDocsOutline`
 * harvests `.vd-prose > h2[id], .vd-prose > h3[id]`, and every prose rule in docs-layout.css is
 * a direct-child chain from `.vd-prose`. A Vue fragment renders its roots as siblings, with
 * comment nodes rather than elements for anchors, so both keep matching. Wrapping this in a
 * `<div>` would cost every page its API headings AND their entries in the outline rail, with
 * nothing failing.
 *
 * Each kind gets ONE heading, and a family lists its components as table captions underneath
 * rather than as headings of their own: three sub-headings per component would bury the four
 * entries a reader actually navigates by, and a caption is what assistive technology reads as
 * a table's name anyway.
 */
import type { ApiEntry, ComponentApi, PageApi } from '~/content/api/types'

import { anchorOf, keyOf } from '~/content/api/types'

const props = defineProps<{
  /** The page's catalogue namespace, e.g. `switch` — the root of every description keypath. */
  page: string
  /** The generated API of the family. */
  api: PageApi
}>()

const { t } = useI18n()

const propColumns = computed(() => [
  t('common.table.prop'),
  t('common.table.type'),
  t('common.table.default'),
])
const eventColumns = computed(() => [t('common.table.event'), t('common.table.type')])
const slotColumns = computed(() => [t('common.table.slot'), t('common.table.type')])
const tokenColumns = computed(() => [t('common.table.token'), t('common.table.value')])

/** A page documenting a single component has nothing to disambiguate, so its tables have no name. */
function captionOf(component: ComponentApi): string | undefined {
  return props.api.components.length > 1 ? component.name : undefined
}

/** Where a row's description lives: `tabs.api.VTabPanel.props.lazy`. */
function keypathOf(component: ComponentApi, kind: string, entry: ApiEntry): string {
  return `${props.page}.api.${component.name}.${kind}.${keyOf(entry)}`
}

const withProps = computed(() => props.api.components.filter((one) => one.props?.length))
const withEvents = computed(() => props.api.components.filter((one) => one.events?.length))
const withSlots = computed(() => props.api.components.filter((one) => one.slots?.length))
</script>

<template>
  <h2 id="api">{{ t('common.api.heading') }}</h2>

  <template v-if="withProps.length">
    <h3 id="props">{{ t('common.api.props') }}</h3>
    <DocsTable
      v-for="component in withProps"
      :key="component.name"
      :columns="propColumns"
      :caption="captionOf(component)"
    >
      <template v-for="entry in component.props" :key="keyOf(entry)">
        <tr class="vd-api-row">
          <td>
            <code>{{ entry.name }}</code>
          </td>
          <DocsApiType :entry="entry" :types="api.types" />
          <td>
            <code v-if="entry.default">{{ entry.default }}</code>
            <template v-else>{{ t('common.table.noDefault') }}</template>
          </td>
        </tr>
        <tr class="vd-api-note">
          <DocsProse tag="td" :colspan="3" :keypath="keypathOf(component, 'props', entry)" />
        </tr>
      </template>
    </DocsTable>
  </template>

  <template v-if="withEvents.length">
    <h3 id="events">{{ t('common.api.events') }}</h3>
    <DocsTable
      v-for="component in withEvents"
      :key="component.name"
      :columns="eventColumns"
      :caption="captionOf(component)"
    >
      <template v-for="entry in component.events" :key="keyOf(entry)">
        <tr class="vd-api-row">
          <td>
            <code>{{ entry.name }}</code>
          </td>
          <DocsApiType :entry="entry" :types="api.types" />
        </tr>
        <tr class="vd-api-note">
          <DocsProse tag="td" :colspan="2" :keypath="keypathOf(component, 'events', entry)" />
        </tr>
      </template>
    </DocsTable>
  </template>

  <template v-if="withSlots.length">
    <h3 id="slots">{{ t('common.api.slots') }}</h3>
    <DocsTable
      v-for="component in withSlots"
      :key="component.name"
      :columns="slotColumns"
      :caption="captionOf(component)"
    >
      <template v-for="entry in component.slots" :key="keyOf(entry)">
        <tr class="vd-api-row">
          <td>
            <code>{{ entry.name }}</code>
          </td>
          <DocsApiType :entry="entry" :types="api.types" />
        </tr>
        <tr class="vd-api-note">
          <DocsProse tag="td" :colspan="2" :keypath="keypathOf(component, 'slots', entry)" />
        </tr>
      </template>
    </DocsTable>
  </template>

  <!--
    The shapes the tables above could not print in a cell, each under the anchor its Type column
    links to. A `.vd-code` card and not a DocsCode: a definition is read, never pasted — a
    consumer imports the type instead of copying it — so the language tag and the copy button
    would be chrome around nine blocks that nobody presses.
  -->
  <template v-if="api.types?.length">
    <h3 id="types">{{ t('common.api.types') }}</h3>
    <DocsProse tag="p" keypath="common.api.typesLead" />
    <div v-for="type in api.types" :id="anchorOf(type.name)" :key="type.name" class="vd-code">
      <pre>{{ type.definition }}</pre>
    </div>
  </template>

  <template v-if="api.cssVars?.length">
    <h3 id="css-variables">{{ t('common.api.cssVariables') }}</h3>
    <DocsTable :columns="tokenColumns">
      <tr v-for="token in api.cssVars" :key="token.name">
        <td>
          <code>{{ token.name }}</code>
        </td>
        <td>
          <code>{{ token.value }}</code>
        </td>
      </tr>
    </DocsTable>
  </template>
</template>
