<script setup lang="ts">
import {
  VSideNavigation,
  VSideNavigationGroup,
  VSideNavigationItem,
  VSideNavigationSeparator,
} from '@vectis/ui'

definePageMeta({ layout: 'docs' })
useHead({ title: 'Side navigation' })

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
  <h1>Side navigation</h1>
  <p class="vd-lead">
    The navigation of a sidebar: a tree of links, shown in place rather than in a floating panel,
    whose branches open and close. It is written out level by level with its own subcomponents,
    never described as a list of data.
  </p>
  <p>The rail on the left of this page is this component, driven by this site's own page list.</p>

  <h2 id="a-tree-of-links">A tree of links</h2>
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
  <p>
    A group label is plain text: it cannot be focused or clicked, because a heading that looks
    clickable and is not is worse than no heading. <code>compact</code> is a DENSITY setting, not a
    collapsed icon-only rail — this component does not offer one.
  </p>

  <h2 id="branches">Branches</h2>
  <p>
    Giving an item an <code>#items</code> slot turns it into a branch, and nesting is not limited. A
    branch folds; it does not go anywhere. The folding is a real <code>&lt;details&gt;</code>, so
    the state, the keyboard and the animation come from the browser, and
    <code>exclusive</code> makes it one-open-at-a-time PER LEVEL.
  </p>
  <DocsCode lang="vue" :code="branchCode" />

  <h2 id="with-a-router">With a router</h2>
  <p>
    <code>active</code> is MANUAL: the component has no router awareness, and adding some would tie
    it to one. Compare the route yourself and pass the answer in. It does light up a COLLAPSED
    ancestor by itself, in CSS, from the <code>[aria-current]</code> it finds inside.
  </p>
  <DocsCode lang="vue" :code="routerCode" />

  <h2 id="invariants">Invariants</h2>
  <ul>
    <li>
      The label is the DEFAULT SLOT and is required — there is no <code>label</code> prop, so a row
      can hold a badge or an abbreviation alongside its words.
    </li>
    <li>
      An entry never carries both <code>#items</code> and <code>href</code>. Given both it silently
      becomes a <code>&lt;button&gt;</code>, on which a router's click interception bails.
    </li>
    <li>
      The <code>#end</code> slot of a BRANCH must not be focusable: a branch row is a
      <code>&lt;summary&gt;</code>, and a control inside a control is WCAG 4.1.2 and axe's
      <code>nested-interactive</code>. On a leaf it is free — the link is stretched over the row by
      a pseudo-element, so the end slot stays its sibling rather than its child.
    </li>
    <li>
      Depth is counted entirely in CSS, through two ALTERNATING custom-property names. TRAP — the
      obvious one-name form is a cycle as far as CSS is concerned, and the whole tree renders flat
      with nothing in the console to say why.
    </li>
  </ul>

  <h2 id="api">API</h2>
  <DocsTable :columns="['Prop', 'Type', 'Default']">
    <tr>
      <td><code>label</code> <span>(VSideNavigation)</span></td>
      <td><code>string</code> — what screen readers announce for the <code>&lt;nav&gt;</code></td>
      <td>dictionary</td>
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
      <td><code>boolean</code> — one branch open per level</td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>expandIcon</code> · <code>collapseIcon</code></td>
      <td><code>IconSource</code> — give both and they swap instead of rotating</td>
      <td><code>'expand_more'</code></td>
    </tr>
    <tr>
      <td><code>active</code> <span>(item)</span></td>
      <td><code>boolean</code> — <code>aria-current</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>href</code></td>
      <td><code>string</code> — ignored on a branch</td>
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
      <td><code>boolean | null</code> — <code>null</code> leaves the state to the browser</td>
      <td><code>null</code></td>
    </tr>
  </DocsTable>
  <p>
    Slots: <code>#default</code> (the label, required), <code>#items</code> (the branch),
    <code>#sublabel</code>, <code>#start</code>, <code>#end</code>. A leaf emits
    <code>select</code> on click and on keyboard activation; there is deliberately no
    <code>click</code> emit, so your own <code>@click</code> still reaches the link.
  </p>
  <blockquote>
    The markup is real <code>&lt;ul&gt;</code> and <code>&lt;li&gt;</code>, unlike VMenu's. That is
    not a style difference: the ARIA menu pattern forbids lists, while for navigation the counting
    and the nesting ARE the information.
  </blockquote>
</template>
