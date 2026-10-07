<script setup lang="ts">
import { ref } from 'vue'
import { VField } from 'vectis-ui'

const bio = ref('')
</script>

<template>
  <VField label="About you" hint="A few lines shown on your profile.">
    <template #default="{ fieldProps }">
      <!-- The label's `for` matches the id inside fieldProps, which the rule cannot follow. -->
      <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
      <textarea v-bind="fieldProps" v-model="bio" maxlength="160" />
    </template>
    <template #meta="{ id }">
      <span :id="id" class="v-field-counter">{{ bio.length }}/160</span>
    </template>
  </VField>
</template>
