<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VCard } from 'vectis-ui'

const trails = [
  { id: 'coast', title: 'Coastal trail', text: 'A cliff path above the sea.', hue: 230 },
  { id: 'forest', title: 'Forest loop', text: 'A shaded walk under old oaks.', hue: 150 },
  {
    id: 'ridge',
    title: 'Sunset ridge',
    text: 'A short climb to a viewpoint facing west.',
    hue: 40,
  },
]

const saved = ref<string[]>([])

function toggle(id: string) {
  saved.value = saved.value.includes(id)
    ? saved.value.filter((item) => item !== id)
    : [...saved.value, id]
}
</script>

<template>
  <ul class="grid">
    <VCard
      v-for="trail in trails"
      :key="trail.id"
      as="li"
      variant="elevated"
      :heading-level="3"
      :href="`#${trail.id}`"
      :title="trail.title"
    >
      <template #media>
        <div class="cover" :style="{ '--hue': trail.hue }" />
      </template>
      {{ trail.text }}
      <template #footer>
        <VButton
          size="sm"
          variant="outline"
          tone="neutral"
          :aria-pressed="saved.includes(trail.id)"
          @click="toggle(trail.id)"
        >
          Save
        </VButton>
      </template>
    </VCard>
  </ul>
</template>

<style scoped>
.grid {
  display: grid;
  flex: 1;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: var(--vectis-space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.cover {
  aspect-ratio: 4 / 3;
  background: linear-gradient(135deg, oklch(0.6 0.12 var(--hue)), oklch(0.4 0.1 var(--hue)));
}
</style>
