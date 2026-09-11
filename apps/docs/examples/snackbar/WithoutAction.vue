<script setup lang="ts">
import { VButton, snackbar } from 'vectis-ui'
</script>

<template>
  <!-- Raised into the <VSnackbar /> mounted once at the root of the application. -->
  <!-- No `action`, no button at all. The bar is then a plain statement of what just
       happened, and it takes itself away on its own. -->
  <VButton variant="outline" tone="neutral" @click="snackbar({ message: 'Settings saved.' })">
    Save
  </VButton>
</template>
