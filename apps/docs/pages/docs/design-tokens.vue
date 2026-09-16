<script setup lang="ts">
import type { TextRole, TextRoleRow } from '~/content/designTokens'

import {
  colorGroups,
  componentGroups,
  durationRows,
  familyRows,
  focusRows,
  radiusRows,
  sizeGroups,
  textRoleRows,
} from '~/content/designTokens'

definePageMeta({ layout: 'docs' })

const { t, tm, rt } = useI18n()
const localePath = useLocalePath()
useDocsHead('designTokens')

/*
 * Every value, name and English description on this page comes from `vectis-ui/tokens` through
 * `content/designTokens.ts`. Nothing here restates a token, so the page follows the library.
 */

const themedColumns = computed(() => [
  t('designTokens.columnToken'),
  t('designTokens.columnDescription'),
  t('designTokens.columnLight'),
  t('designTokens.columnDark'),
])

const plainColumns = computed(() => [
  t('designTokens.columnToken'),
  t('designTokens.columnDescription'),
  t('designTokens.columnDefault'),
])

const roleColumns = computed(() => [
  t('designTokens.columnRole'),
  t('designTokens.columnSize'),
  t('designTokens.columnWeight'),
  t('designTokens.columnLeading'),
  t('designTokens.columnTracking'),
])

const ROLE_PARTS = ['size', 'weight', 'leading', 'tracking'] as const

/* The same plain-string-or-compiled-message split `DocsTokenRow` explains. */
function roleDescription(role: TextRole): string {
  const entry = (tm('designTokens.roles') as Record<string, unknown>)[role]
  return typeof entry === 'string' ? entry : rt(entry as never)
}

const roleRows = computed(() =>
  textRoleRows.map((row: TextRoleRow) => ({
    ...row,
    description: roleDescription(row.role),
    parts: ROLE_PARTS.map((part) => ({ part, value: row[part] })),
  })),
)
</script>

<template>
  <h1>{{ t('designTokens.title') }}</h1>
  <DocsProse class="vd-lead" keypath="designTokens.lead" />

  <DocsProse keypath="designTokens.readingBody" />
  <p>
    <DocsProse tag="span" keypath="designTokens.readingOverrideBefore" />
    {{ ' ' }}
    <NuxtLink :to="localePath('/docs/theming')">{{ t('nav.theming') }}</NuxtLink>
    <DocsProse tag="span" keypath="designTokens.readingOverrideAfter" />
  </p>
  <DocsProse keypath="designTokens.readingSiteAccent" />

  <h2 id="colors">{{ t('designTokens.colorsHeading') }}</h2>
  <DocsProse keypath="designTokens.colorsBody" />
  <DocsTable :columns="themedColumns">
    <template v-for="group in colorGroups" :key="group.label">
      <tr class="vd-token-group">
        <th colspan="4" scope="colgroup">{{ t(`designTokens.groups.${group.label}`) }}</th>
      </tr>
      <DocsTokenRow v-for="row in group.rows" :key="row.name" :row="row" themed />
    </template>
  </DocsTable>

  <h2 id="focus-ring">{{ t('designTokens.focusHeading') }}</h2>
  <DocsProse keypath="designTokens.focusBody" />
  <DocsTable :columns="themedColumns">
    <DocsTokenRow v-for="row in focusRows" :key="row.name" :row="row" themed />
  </DocsTable>

  <h2 id="typography">{{ t('designTokens.typographyHeading') }}</h2>
  <DocsProse keypath="designTokens.typographyBody" />
  <p>
    <DocsProse tag="span" keypath="designTokens.typographyFontBefore" />
    {{ ' ' }}
    <NuxtLink :to="localePath('/docs/font-family')">{{ t('nav.font-family') }}</NuxtLink>
    <DocsProse tag="span" keypath="designTokens.typographyFontAfter" />
  </p>
  <DocsTable :columns="plainColumns" :caption="t('designTokens.familiesCaption')">
    <DocsTokenRow v-for="row in familyRows" :key="row.name" :row="row" />
  </DocsTable>
  <DocsTable :columns="roleColumns" :caption="t('designTokens.rolesCaption')">
    <tr v-for="row in roleRows" :key="row.role">
      <td class="vd-token-name">
        <code>--vectis-text-{{ row.role }}-*</code>
        <span class="vd-token-role-description">{{ row.description }}</span>
      </td>
      <td v-for="{ part, value } in row.parts" :key="part">
        <DocsTokenValue v-if="value" :value="value" />
        <template v-else>{{ t('designTokens.noToken') }}</template>
      </td>
    </tr>
  </DocsTable>

  <h2 id="radius">{{ t('designTokens.radiusHeading') }}</h2>
  <DocsProse keypath="designTokens.radiusBody" />
  <DocsTable :columns="plainColumns">
    <DocsTokenRow v-for="row in radiusRows" :key="row.name" :row="row" />
  </DocsTable>

  <h2 id="motion">{{ t('designTokens.motionHeading') }}</h2>
  <DocsProse keypath="designTokens.motionBody" />
  <DocsTable :columns="plainColumns">
    <DocsTokenRow v-for="row in durationRows" :key="row.name" :row="row" />
  </DocsTable>

  <h2 id="sizes">{{ t('designTokens.sizesHeading') }}</h2>
  <DocsProse keypath="designTokens.sizesBody" />
  <DocsTable :columns="plainColumns">
    <template v-for="group in sizeGroups" :key="group.label">
      <tr class="vd-token-group">
        <th colspan="3" scope="colgroup">{{ t(`designTokens.groups.${group.label}`) }}</th>
      </tr>
      <DocsTokenRow v-for="row in group.rows" :key="row.name" :row="row" />
    </template>
  </DocsTable>

  <h2 id="component-dimensions">{{ t('designTokens.componentsHeading') }}</h2>
  <DocsProse keypath="designTokens.componentsBody" />
  <DocsTable :columns="plainColumns">
    <template v-for="group in componentGroups" :key="group.slugs?.join()">
      <tr class="vd-token-group">
        <th colspan="3" scope="colgroup">
          <template v-for="(slug, index) in group.slugs" :key="slug">
            <template v-if="index > 0">, </template>
            <NuxtLink :to="localePath(`/docs/${slug}`)">{{ t(`nav.${slug}`) }}</NuxtLink>
          </template>
        </th>
      </tr>
      <DocsTokenRow v-for="row in group.rows" :key="row.name" :row="row" />
    </template>
  </DocsTable>
</template>

<style scoped>
/*
 * A group heading inside a table, set in the label weight, so the rows under it read as
 * one family without an extra heading in the outline.
 */
.vd-token-group > th {
  padding: var(--vectis-space-4) var(--vectis-space-3) var(--vectis-space-2);
  border-bottom: 1px solid var(--vectis-color-border-strong);
  text-align: start;
  font-weight: var(--vectis-text-label-weight);
  color: var(--vectis-color-text);
}
.vd-token-name > code {
  white-space: nowrap;
}
.vd-token-role-description {
  display: block;
  margin-block-start: var(--vectis-space-1);
}
</style>
