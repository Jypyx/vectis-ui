<script setup lang="ts">
import { VButton, snackbar } from 'vectis-ui'

function remove() {
  snackbar({ message: 'Message deleted.', actionText: 'Undo', action: () => {} })
}
</script>

<template>
  <!-- Mount VSnackbar once in your application. This site already provides it. -->
  <VButton variant="outline" tone="neutral" @click="remove">Delete</VButton>
</template>
