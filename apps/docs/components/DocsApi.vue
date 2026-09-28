<script setup lang="ts">
/**
 * Shared API tables and type definitions. Keep fragment roots: prose styling and outline
 * discovery require headings directly under .vd-prose.
 */
import type { ApiEntry, ComponentApi, PageApi } from '~/content/api/types'

import { anchorOf, keyOf } from '~/content/api/types'

const props = defineProps<{
  /** The page's catalogue namespace, e.g. `switch`; the root of every description keypath. */
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

function captionOf(component: ComponentApi): string | undefined {
  return props.api.components.length > 1 ? component.name : undefined
}

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
