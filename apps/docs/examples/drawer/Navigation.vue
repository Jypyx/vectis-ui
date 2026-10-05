<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VDrawer, VSideNavigation, VSideNavigationItem } from 'vectis-ui'

const open = ref(false)

const PAGES = [
  'Overview',
  'Activity',
  'Orders',
  'Invoices',
  'Customers',
  'Products',
  'Inventory',
  'Shipping',
  'Returns',
  'Discounts',
  'Reports',
  'Analytics',
  'Integrations',
  'Team',
  'Billing',
  'Settings',
]
</script>

<template>
  <VDrawer v-model:open="open" side="start" size="sm" title="Store">
    <template #trigger="{ triggerProps }">
      <VButton v-bind="triggerProps" variant="outline" tone="neutral">Menu</VButton>
    </template>
    <VSideNavigation label="Store">
      <VSideNavigationItem
        v-for="(page, index) in PAGES"
        :key="page"
        href="#navigation"
        :current="index === 0"
        @select="open = false"
      >
        {{ page }}
      </VSideNavigationItem>
    </VSideNavigation>
    <template #footer>
      <VButton variant="ghost" tone="neutral" @click="open = false">Sign out</VButton>
    </template>
  </VDrawer>
</template>
