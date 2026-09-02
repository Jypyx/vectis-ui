<script setup lang="ts">
import { VButton, snackbar } from 'vectis-ui'

function remove() {
  snackbar({ message: 'Message deleted.', actionLabel: 'Undo', action: () => {} })
}
</script>

<template>
  <!-- Mount <VSnackbar /> once, at the root of your application. This site does it in its layout,
       which is why the example does not: a second one would render the same bar twice. -->
  <VButton variant="outline" tone="neutral" @click="remove">Delete</VButton>
</template>
