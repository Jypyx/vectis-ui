<script setup lang="ts">
import { ref } from 'vue'
import { VPagination, VTypography } from 'vectis-ui'

const page = ref(3)

const href = (n: number) => `/app/products?page=${n}`

// The browser would load the address. A single-page application cancels that and routes
// by hand, with `navigateTo(href(n))` in Nuxt or `router.push(href(n))` with Vue Router.
function onNavigate(_n: number, event: MouseEvent) {
  event.preventDefault()
}
</script>

<template>
  <div class="row">
    <VPagination
      v-model="page"
      :length="12"
      :total-visible="7"
      :href="href"
      label="Products"
      @navigate="onNavigate"
    />
    <VTypography variant="caption" tone="muted">Links to {{ href(page) }}</VTypography>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--vectis-space-5);
}
</style>
