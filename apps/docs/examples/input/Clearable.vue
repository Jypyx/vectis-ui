<script setup lang="ts">
import { ref } from 'vue'
import { VInput } from 'vectis-ui'
import { search } from 'vectis-ui/icons'

const query = ref('wool socks')
</script>

<template>
  <VInput v-model="query" label="Search" :icon-start="search" clearable />
</template>
