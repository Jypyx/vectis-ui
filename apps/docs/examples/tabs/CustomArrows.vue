<script setup lang="ts">
import { ref } from 'vue'
import { VTab, VTabs } from 'vectis-ui'
import { arrow_left_alt as arrowLeftAlt, arrow_right_alt as arrowRightAlt } from 'vectis-ui/icons'

const cities = ['Paris', 'Lisbon', 'Berlin', 'Madrid', 'Rome', 'Vienna', 'Prague', 'Oslo']
const tab = ref('Paris')
</script>

<template>
  <!-- The default icons follow the orientation, chevrons across and carets down, so
       there is nothing to set on either axis. Replace them when the surrounding design
       asks for another glyph; the labels are what a screen reader reads, and they fall
       back to the dictionary in the current language. -->
  <div class="narrow">
    <VTabs
      v-model="tab"
      scroll-buttons
      :prev-icon="arrowLeftAlt"
      :next-icon="arrowRightAlt"
      prev-label="Earlier cities"
      next-label="Later cities"
      label="Cities"
    >
      <VTab v-for="city in cities" :key="city" :value="city" :label="city" />
    </VTabs>
  </div>
</template>

<style scoped>
.narrow {
  min-inline-size: 0;
  max-inline-size: 26rem;
}
</style>
