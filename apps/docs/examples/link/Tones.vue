<script setup lang="ts">
import { VLink } from 'vectis-ui'
</script>

<template>
  <ul class="links">
    <li><VLink href="#tones">Accent</VLink></li>
    <li><VLink href="#tones" tone="neutral">Neutral</VLink></li>
    <li><VLink href="#tones" tone="danger">Delete account</VLink></li>
    <li><VLink href="#tones" tone="success">View receipt</VLink></li>
    <li><VLink href="#tones" tone="warning">Review settings</VLink></li>
  </ul>
</template>

<style scoped>
.links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-6);
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
