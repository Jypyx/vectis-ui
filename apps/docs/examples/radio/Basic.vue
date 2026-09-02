<script setup lang="ts">
import { ref } from 'vue'
import { VRadio } from 'vectis-ui'

const plan = ref('standard')
</script>

<template>
  <VRadio v-model="plan" name="plan" value="free">Free</VRadio>
  <VRadio v-model="plan" name="plan" value="standard">Standard</VRadio>
  <VRadio v-model="plan" name="plan" value="pro">Pro</VRadio>
</template>
