<script setup lang="ts">
import { computed, ref } from 'vue'
import { VCheckbox } from 'vectis-ui'

const scopes = ref([
  { label: 'Read', granted: true },
  { label: 'Write', granted: false },
  { label: 'Delete', granted: false },
])

const all = computed({
  get: () => scopes.value.every((scope) => scope.granted),
  set: (value: boolean) => {
    scopes.value.forEach((scope) => {
      scope.granted = value
    })
  },
})

/* The dash is a third appearance and not a third value: the parent is genuinely unticked
   here, and `indeterminate` is what draws it as partially checked. */
const some = computed(() => scopes.value.some((scope) => scope.granted) && !all.value)
</script>

<template>
  <div class="tree">
    <VCheckbox v-model="all" :indeterminate="some">Permissions</VCheckbox>
    <div class="children">
      <VCheckbox v-for="scope in scopes" :key="scope.label" v-model="scope.granted">
        {{ scope.label }}
      </VCheckbox>
    </div>
  </div>
</template>

<style scoped>
.tree,
.children {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-2);
}
.children {
  padding-inline-start: var(--vectis-space-6);
}
</style>
