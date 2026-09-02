<script setup lang="ts">
import { ref } from 'vue'
import { VSwitch } from 'vectis-ui'

const notifications = ref(true)
</script>

<template>
  <VSwitch v-model="notifications">Notifications</VSwitch>
</template>
