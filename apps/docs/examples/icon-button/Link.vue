<script setup lang="ts">
import { VIconButton } from 'vectis-ui'
import { arrow_right_alt as arrowRightAlt, code } from 'vectis-ui/icons'
</script>

<template>
  <VIconButton href="#usage" :icon="arrowRightAlt" variant="outline" label="Back to usage" />

  <VIconButton
    href="https://github.com"
    target="_blank"
    rel="noreferrer"
    :icon="code"
    variant="outline"
    label="View the source, opens in a new tab"
  />

  <VIconButton href="#usage" :icon="arrowRightAlt" variant="outline" disabled label="Unavailable" />
</template>
