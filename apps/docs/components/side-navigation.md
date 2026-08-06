<script setup lang="ts">
import {
  VSideNavigation,
  VSideNavigationGroup,
  VSideNavigationItem,
  VSideNavigationSeparator,
} from '@vectis/ui'
</script>

# Side navigation

Vertical sidebar navigation. The tree is rendered inline from subcomponents rather than
driven by an `items` prop, and the label is the default slot — so a row can hold anything
a row needs.

The sidebar to the left of this page is this component.

<DocsDemo>
  <VSideNavigation size="sm" label="Example" style="inline-size: 15rem">
    <VSideNavigationItem href="#overview" icon="description" active>Overview</VSideNavigationItem>
    <VSideNavigationItem href="#reports" icon="table_chart">Reports</VSideNavigationItem>
    <VSideNavigationSeparator />
    <VSideNavigationGroup label="Workspace">
      <VSideNavigationItem href="#members">Members</VSideNavigationItem>
      <VSideNavigationItem href="#billing" sublabel="Plan and invoices">Billing</VSideNavigationItem>
    </VSideNavigationGroup>
  </VSideNavigation>
</DocsDemo>

## Structure

The markup is a `<nav>` with nested `<ul>`/`<li>`, not the `<div>`s `VMenu` uses, and the
difference is not cosmetic. The ARIA `menu` pattern forbids lists — it owns only
`menuitem` and `group` — whereas for navigation the counting and the nesting **are** the
information a screen reader should convey.

A group folds into that without `role="group"`, which cannot be a direct child of a
`<ul>`: it is an `<li>` holding a label and a labelled `<ul>`. A separator is a decorative
`<li>`, not an `<hr>` — a list owns list items and nothing else.

## Folding is native

Every branch is a `<details>`/`<summary>` pair. State, keyboard activation and the
open/close animation come from the platform, and exclusivity — at most one branch open per
level — comes from the `name` attribute, with a fresh name per level so exclusivity stays
local.

```vue
<VSideNavigation exclusive>
  <VSideNavigationItem>
    Settings
    <template #items>
      <VSideNavigationItem href="/settings/profile">Profile</VSideNavigationItem>
      <VSideNavigationItem href="/settings/keys">API keys</VSideNavigationItem>
    </template>
  </VSideNavigationItem>
</VSideNavigation>
```

`defaultOpen` sets the initial state; `v-model:open` binds it, fed by the native `toggle`
event.

## Two row shapes

This follows from the `<details>`, and it is worth knowing before you reach for the `#end`
slot.

A **branch**'s row is its `<summary>`, which must contain the whole line. So `#end` lives
inside it, and its content must not be focusable: a control there would be a control
nested inside a control, which fails WCAG 4.1.2 — and a `<summary>`'s subtree doubles as
its accessible name, which some screen readers flatten.

A **leaf**'s row is a container, with the action stretched over it by an absolute
pseudo-element. That keeps `#end` a _sibling_ of the link rather than a control inside it,
while still making the whole row clickable.

## The active item is yours to set

There is no router awareness and no `currentPath` prop, deliberately: routing conventions
differ too much to guess. You set `:active` on the leaf, and the component derives the
rest — `aria-current="page"` on a link, the accent surface, and a pure-CSS highlight on
any collapsed ancestor containing the current page.

```vue
<VSideNavigationItem :href="item.href" :active="item.href === currentPath">
  {{ item.label }}
</VSideNavigationItem>
```

A leaf with an `href` renders a plain `<a>`, which is what lets a router intercept it
normally — this site adds no click handler at all and gets client-side navigation from
VitePress's own listener.

One thing to avoid: an entry given **both** an `#items` slot and an `href` renders a
`<button>`, and the `href` is silently dropped. Sections are branches, pages are leaves.

## Depth

Indentation is derived from the markup, with no `level` prop to thread and no registry:
each level advances a CSS counter, and the step is exactly the width of a start icon plus
the control gap. That is what puts a child's label on the same vertical as its parent's,
and it follows the size scale on its own.

## Sizes

`sm` and `md`, plus `compact`. Set them on the `<nav>` alone — every sublevel inherits
through the shared control-size class.

## Accessibility

- Up, Down, Home and End move focus through the visible rows; the arrows move focus and
  never activate.
- No roving tabindex: every visible row is a tab stop, which is the right model for
  navigation.
- Rows inside a collapsed branch are skipped, which a naive DOM query would get wrong —
  the content of a closed `<details>` is not `display: none`.
- A disabled item is `aria-disabled` with `tabindex="-1"`, and its click is cancelled.
