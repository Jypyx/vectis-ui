<script setup lang="ts">
import { VAvatar } from 'vectis-ui'
import { code, notifications, table_chart as tableChart } from 'vectis-ui/icons'
</script>

<template>
  <VAvatar :icon="code" alt="Build bot" />
  <VAvatar :icon="notifications" alt="System alerts" />
  <VAvatar :icon="tableChart" alt="Nightly report" />
</template>
