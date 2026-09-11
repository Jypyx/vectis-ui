<script setup lang="ts">
import { ref } from 'vue'
import { VTab, VTabs } from 'vectis-ui'

const cities = ['Paris', 'Lisbon', 'Berlin', 'Madrid', 'Rome', 'Vienna', 'Prague', 'Oslo']
const tab = ref('Paris')
</script>

<template>
  <!-- Too many tabs for the room, and the bar scrolls: by touch, by trackpad, and from
       the keyboard, where the arrow keys bring the tab they reach back into view. The
       scrollbar itself is hidden, the tabs running off the edge being the cue. -->
  <div class="narrow">
    <VTabs v-model="tab" label="Cities">
      <VTab v-for="city in cities" :key="city" :value="city" :label="city" />
    </VTabs>
  </div>
</template>

<style scoped>
.narrow {
  /* A grid or flex item does not shrink below its content unless told to, so without
     this the list would simply widen its container instead of overflowing. */
  min-inline-size: 0;
  max-inline-size: 26rem;
}
</style>
