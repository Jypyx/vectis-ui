<script setup lang="ts">
import { ref } from 'vue'
import { VPopover, VTypography } from 'vectis-ui'

const CITIES = ['Bordeaux', 'Lyon', 'Marseille', 'Nantes', 'Paris', 'Toulouse']

const query = ref('')
const open = ref(false)

const matches = () =>
  CITIES.filter((city) => city.toLowerCase().startsWith(query.value.toLowerCase()))

function choose(city: string) {
  query.value = city
  open.value = false
}
</script>

<template>
  <!-- The wrapper CONFINES the name to this instance. Without it, a shown popover moves
       to the top layer and is resolved against the whole document, so every panel on the
       page would attach to the last element that named the anchor. -->
  <div class="field-wrapper">
    <!-- A plain input, because that is the case the prop exists for: `popovertarget` is
         not valid on a text field, so the panel cannot be wired to it that way. -->
    <input
      v-model="query"
      class="field"
      type="text"
      placeholder="A city"
      aria-label="A city"
      @focus="open = true"
      @input="open = true"
    />

    <!-- Given a name, VPopover renders no wrapper of its own and positions the panel
         against whatever carries it. -->
    <VPopover v-model:open="open" anchor="--city-anchor" match-trigger mode="manual" bare>
      <ul class="list">
        <li v-for="city in matches()" :key="city">
          <button type="button" class="row" @click="choose(city)">{{ city }}</button>
        </li>
        <li v-if="matches().length === 0" class="empty">
          <VTypography variant="body-sm" tone="muted">No city matches</VTypography>
        </li>
      </ul>
    </VPopover>
  </div>
</template>

<style scoped>
.field-wrapper {
  anchor-scope: --city-anchor;
  inline-size: 16rem;
}
.field {
  anchor-name: --city-anchor;
  inline-size: 100%;
  padding: 0 var(--vectis-space-3);
  block-size: var(--vectis-control-height-md);
  border: 1px solid var(--vectis-color-border);
  border-radius: var(--vectis-radius-interactive);
  background: var(--vectis-color-surface);
  color: var(--vectis-color-text);
  font: inherit;
}
.list {
  display: grid;
  margin: 0;
  padding: var(--vectis-space-1);
  border: 1px solid var(--vectis-color-border);
  border-radius: var(--vectis-radius-overlay);
  background: var(--vectis-color-surface-overlay);
  box-shadow: var(--vectis-shadow-lg);
  list-style: none;
}
.row {
  inline-size: 100%;
  padding: var(--vectis-space-2) var(--vectis-space-3);
  border: none;
  border-radius: var(--vectis-radius-interactive);
  background: none;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;
}
.row:hover {
  background: var(--vectis-color-surface-muted);
}
.empty {
  padding: var(--vectis-space-2) var(--vectis-space-3);
}
</style>
