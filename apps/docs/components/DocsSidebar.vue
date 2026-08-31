<script setup lang="ts">
/**
 * The documentation rail — and the site's own largest demonstration, since it IS
 * VSideNavigation doing the job it was written for.
 *
 * The tree is rendered inline from `content/nav.ts` rather than handed to the component as
 * data, which is the component's own contract: it composes from subcomponents and never
 * takes an `items` prop. `active` is manual there too — VSideNavigation knows nothing about
 * a router — so the current route is compared here.
 *
 * Every row is a real `<a href>`; `navigate` from NuxtLink turns an ordinary click into a
 * client-side transition and leaves middle-click and Ctrl-click to the browser.
 */
import {
  VSideNavigation,
  VSideNavigationGroup,
  VSideNavigationItem,
  VSideNavigationSeparator,
} from 'vectis-ui'

import { groups } from '~/content/nav'

const route = useRoute()
const { closeNav } = useDocsNav()
const { t } = useI18n()
const localePath = useLocalePath()

/*
 * Compared against the LOCALISED path, not a literal `/docs/${slug}`: on the French site every
 * route carries the `/fr` segment, so the literal would match nothing and no row would ever be
 * marked current — a rail that looks identical on all fifty pages.
 */
const isCurrent = (slug: string) => route.path === localePath(`/docs/${slug}`)

/** Below 1024px the rail is an overlay over the article: following a link has to fold it. */
function follow(navigate: (event: MouseEvent) => void, event: MouseEvent) {
  closeNav()
  navigate(event)
}
</script>

<template>
  <VSideNavigation :label="t('common.sidebar')" size="sm">
    <template v-for="(group, index) in groups" :key="group.id">
      <VSideNavigationSeparator v-if="index > 0" />
      <VSideNavigationGroup :label="t(`nav.group.${group.id}`)">
        <NuxtLink
          v-for="page in group.entries"
          :key="page.slug"
          :to="localePath(`/docs/${page.slug}`)"
          custom
        >
          <template #default="{ href, navigate }">
            <VSideNavigationItem
              :href="href ?? undefined"
              :active="isCurrent(page.slug)"
              @click="follow(navigate, $event)"
            >
              {{ t(`nav.${page.slug}`) }}
            </VSideNavigationItem>
          </template>
        </NuxtLink>
      </VSideNavigationGroup>
    </template>
  </VSideNavigation>
</template>
