<script setup lang="ts">
/*
 * The sidebar, which is a `VSideNavigation` and nothing else — no wrapper reproducing
 * its chrome, no override of its rows.
 *
 * There is no behavioural JS here, and none is needed: the DS renders a leaf as a plain
 * `<a href>`, and vitepress's router installs a global click listener that does
 * `closest('a')` then `preventDefault()` + `router.go(href)`. SPA navigation therefore
 * comes for free, with no `<RouterLink>` in sight. The row is clickable across its full
 * width because the DS stretches that `<a>` with an absolute `::after`, and a click on a
 * pseudo-element dispatches on its originating element — so `closest('a')` still finds it.
 *
 * Two invariants this component must not break:
 *   - `active` is MANUAL. `VSideNavigationItem` has no router awareness and no
 *     `currentPath` prop (unlike VBreadcrumb); `useActiveLink()` is the whole answer, and
 *     the DS lights up a collapsed ancestor by itself, in CSS, from the `[aria-current]`
 *     it finds inside.
 *   - an entry never carries both `#items` and `href`. The DS renders `<a>` only when
 *     `!hasChildren && href !== undefined`, so an entry given both silently becomes a
 *     `<button>` — on which vitepress's router bails, hard-navigating the page. Sections
 *     are `VSideNavigationGroup` (a labelled `<ul>`, not a `<details>`), pages are leaves.
 */
import { useData } from 'vitepress'
import { VSideNavigation, VSideNavigationGroup, VSideNavigationItem } from '@vectis/ui'
import { computed } from 'vue'

import { useActiveLink, useDocsHref } from '../composables/useActiveLink'
import type { DocsSidebarSection, DocsThemeConfig } from '../types'

const { theme } = useData<DocsThemeConfig>()
const active = useActiveLink()
const docsHref = useDocsHref()

/** The section whose prefix owns the current page; none for a page outside them all. */
const sections = computed<DocsSidebarSection[]>(() => {
  const entry = Object.entries(theme.value.sidebar).find(([prefix]) =>
    active.value.startsWith(prefix),
  )
  return entry?.[1] ?? []
})
</script>

<template>
  <!-- `size` is set on the <nav> alone: every sublevel inherits it through `v-control`. -->
  <VSideNavigation v-if="sections.length" size="sm" label="Documentation">
    <VSideNavigationGroup v-for="section in sections" :key="section.label" :label="section.label">
      <VSideNavigationItem
        v-for="item in section.items"
        :key="item.link"
        :href="docsHref(item.link)"
        :active="item.link === active"
      >
        {{ item.text }}
      </VSideNavigationItem>
    </VSideNavigationGroup>
  </VSideNavigation>
</template>
