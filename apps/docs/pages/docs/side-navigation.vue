<script setup lang="ts">
import {
  VSideNavigation,
  VSideNavigationGroup,
  VSideNavigationItem,
  VSideNavigationSeparator,
} from '@vectis/ui'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
const { apiColumns } = useDocsTable()
useHead({ title: () => t('sideNavigation.title') })

const branchCode = `<VSideNavigation label="Documentation">
  <VSideNavigationGroup label="Components">
    <VSideNavigationItem default-open>
      Forms
      <template #items>
        <VSideNavigationItem href="/components/input" active>Input</VSideNavigationItem>
        <VSideNavigationItem href="/components/switch">Switch</VSideNavigationItem>
      </template>
    </VSideNavigationItem>
  </VSideNavigationGroup>
</VSideNavigation>`

const routerCode = `<!-- \`active\` is manual: the component knows nothing about a router.
     A real <a href> plus NuxtLink's \`navigate\` keeps middle-click
     working and the transition client-side. -->
<NuxtLink :to="page.to" custom #default="{ href, navigate }">
  <VSideNavigationItem :href="href ?? undefined" :active="route.path === page.to" @click="navigate">
    {{ page.title }}
  </VSideNavigationItem>
</NuxtLink>`
</script>

<template>
  <h1>{{ t('sideNavigation.title') }}</h1>
  <DocsProse class="vd-lead" keypath="sideNavigation.lead" />
  <DocsProse keypath="sideNavigation.self" />

  <h2 id="a-tree-of-links">{{ t('sideNavigation.treeHeading') }}</h2>
  <DocsDemo stack>
    <VSideNavigation label="Example" size="md">
      <VSideNavigationGroup label="Workspace">
        <VSideNavigationItem href="#a-tree-of-links" icon="description" active>
          Overview
        </VSideNavigationItem>
        <VSideNavigationItem href="#a-tree-of-links" icon="table_chart" sublabel="12 tables">
          Data
        </VSideNavigationItem>
        <VSideNavigationItem href="#a-tree-of-links" icon="notifications">
          Alerts
        </VSideNavigationItem>
      </VSideNavigationGroup>
      <VSideNavigationSeparator />
      <VSideNavigationGroup label="Account">
        <VSideNavigationItem href="#a-tree-of-links" icon="schedule">Usage</VSideNavigationItem>
        <VSideNavigationItem icon="folder_zip" disabled>Exports</VSideNavigationItem>
      </VSideNavigationGroup>
    </VSideNavigation>
  </DocsDemo>
  <DocsProse keypath="sideNavigation.treeBody" />

  <h2 id="branches">{{ t('sideNavigation.branchesHeading') }}</h2>
  <DocsProse keypath="sideNavigation.branchesBody" />
  <DocsCode lang="vue" :code="branchCode" />

  <h2 id="with-a-router">{{ t('sideNavigation.routerHeading') }}</h2>
  <DocsProse keypath="sideNavigation.routerBody" />
  <DocsCode lang="vue" :code="routerCode" />

  <h2 id="invariants">{{ t('sideNavigation.invariantsHeading') }}</h2>
  <DocsProseList keypath="sideNavigation.invariants" />

  <h2 id="api">{{ t('sideNavigation.apiHeading') }}</h2>
  <DocsTable :columns="apiColumns">
    <tr>
      <td><code>label</code> <span>(VSideNavigation)</span></td>
      <DocsProse tag="td" keypath="sideNavigation.apiNavLabel" />
      <td>{{ t('sideNavigation.apiNavLabelDefault') }}</td>
    </tr>
    <tr>
      <td><code>size</code></td>
      <td><code>'sm' | 'md'</code></td>
      <td><code>'md'</code></td>
    </tr>
    <tr>
      <td><code>compact</code></td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>exclusive</code></td>
      <DocsProse tag="td" keypath="sideNavigation.apiExclusive" />
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>expandIcon</code> · <code>collapseIcon</code></td>
      <DocsProse tag="td" keypath="sideNavigation.apiIcons" />
      <td><code>'expand_more'</code></td>
    </tr>
    <tr>
      <td><code>active</code> <span>(item)</span></td>
      <DocsProse tag="td" keypath="sideNavigation.apiActive" />
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>href</code></td>
      <DocsProse tag="td" keypath="sideNavigation.apiHref" />
      <td>—</td>
    </tr>
    <tr>
      <td><code>icon</code> · <code>sublabel</code></td>
      <td><code>IconSource</code> · <code>string</code></td>
      <td>—</td>
    </tr>
    <tr>
      <td><code>defaultOpen</code> · <code>disabled</code></td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>v-model:open</code> <span>(item)</span></td>
      <DocsProse tag="td" keypath="sideNavigation.apiOpen" />
      <td><code>null</code></td>
    </tr>
  </DocsTable>
  <DocsProse keypath="sideNavigation.apiSlots" />
  <DocsProse tag="blockquote" keypath="sideNavigation.apiQuote" />
</template>
