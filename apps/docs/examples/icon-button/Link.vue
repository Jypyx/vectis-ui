<script setup lang="ts">
import { VIconButton } from 'vectis-ui'
import { arrow_right_alt as arrowRightAlt, code } from 'vectis-ui/icons'
</script>

<template>
  <!-- `href` is not a prop of this component: it falls through to the VButton
       underneath, which renders an <a> instead of a <button>. -->
  <VIconButton href="#usage" :icon="arrowRightAlt" variant="outline" label="Back to usage" />

  <VIconButton
    href="https://github.com"
    target="_blank"
    rel="noreferrer"
    :icon="code"
    variant="outline"
    label="View the source, opens in a new tab"
  />

  <!-- A disabled link keeps its place and loses its destination: the href is removed
       and the clicks are dropped, since nothing in HTML disables an anchor. -->
  <VIconButton href="#usage" :icon="arrowRightAlt" variant="outline" disabled label="Unavailable" />
</template>
