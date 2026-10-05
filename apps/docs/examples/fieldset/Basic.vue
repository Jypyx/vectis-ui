<script setup lang="ts">
import { ref } from 'vue'
import { VFieldset, VRadio } from 'vectis-ui'

const plan = ref('free')
</script>

<template>
  <VFieldset legend="Plan" hint="You can change it at any time.">
    <VRadio v-model="plan" name="plan" value="free" label="Free" />
    <VRadio v-model="plan" name="plan" value="pro" label="Pro" />
    <VRadio v-model="plan" name="plan" value="team" label="Team" />
  </VFieldset>
</template>
