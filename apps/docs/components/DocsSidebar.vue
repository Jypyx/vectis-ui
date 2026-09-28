<script setup lang="ts">
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

/* Compare against localePath so French routes also mark the current navigation item. */
const isCurrent = (slug: string) => route.path === localePath(`/docs/${slug}`)

/** Below 1024px the rail is an overlay over the article: following a link has to fold it. */
function follow(navigate: (event: MouseEvent) => void, event: MouseEvent) {
  closeNav()
  navigate(event)
}
</script>

<template>
  <VSideNavigation :label="t('common.sidebar')" size="md">
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
              :current="isCurrent(page.slug)"
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
