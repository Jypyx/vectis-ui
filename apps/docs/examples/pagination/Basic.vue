<script setup lang="ts">
import { ref } from 'vue'
import { VPagination } from 'vectis-ui'

const page = ref(1)
</script>

<template>
  <VPagination v-model="page" :length="8" />
</template>
