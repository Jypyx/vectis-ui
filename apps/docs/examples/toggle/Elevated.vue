<script setup lang="ts">
import { ref } from 'vue'
import { VToggle, VToggleItem } from 'vectis-ui'

const period = ref('week')
</script>

<template>
  <!-- The row is raised off the page, and the shadow belongs to the row rather than to
       each item: segments overlap by a pixel, so a shadow per item would fall on its
       neighbour and fill every joint with a dark band instead of lifting one object.
       The whole row rises together on hover for the same reason. -->
  <VToggle v-model="period" elevated item-variant="ghost" label="Period">
    <VToggleItem value="day" label="Day" />
    <VToggleItem value="week" label="Week" />
    <VToggleItem value="month" label="Month" />
  </VToggle>
</template>
