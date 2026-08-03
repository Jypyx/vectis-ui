<script setup lang="ts">
import { computed, inject, ref, watchEffect } from 'vue'

import { tabsKey } from './context'

/**
 * Panneau associé à un onglet de même `value`. Il est toujours rendu et
 * masqué par l'attribut natif `hidden` quand il n'est pas actif : zéro JS,
 * l'état du contenu (saisie en cours, défilement) survit au changement
 * d'onglet.
 */
interface TabPanelProps {
  /** Doit correspondre au `value` d'un `Tab`. */
  value: string | number
  /** Diffère le montage du contenu au premier affichage, puis le conserve. */
  lazy?: boolean
}

const props = withDefaults(defineProps<TabPanelProps>(), { lazy: false })

defineSlots<{
  /** Contenu du panneau */
  default(): unknown
}>()

const tabs = inject(tabsKey, null)

const selected = computed(() => tabs != null && tabs.value === props.value)
const tabId = computed(() => tabs?.tabId(props.value))
const panelId = computed(() => tabs?.panelId(props.value))

/** `lazy` : une fois révélé, le contenu reste monté (l'état n'est pas perdu). */
const revealed = ref(false)
watchEffect(() => {
  if (selected.value) revealed.value = true
})
</script>

<template>
  <div
    :id="panelId"
    class="v-tabs-panel"
    role="tabpanel"
    :aria-labelledby="tabId"
    tabindex="0"
    :hidden="!selected"
  >
    <slot v-if="!lazy || revealed" />
  </div>
</template>

<style>
@layer vectis.components {
  /*
   * Garde-fou : [hidden] ne vient que de la feuille UA, que la moindre
   * déclaration `display` d'auteur écrase — y compris un style consommateur
   * non layerisé. Spécificité (0,2,0), et surtout pas d'!important : Tabs
   * resterait sinon le seul composant du DS impossible à surcharger. Pour
   * poser un display sur le panneau, cibler .v-tabs-panel:not([hidden]).
   */
  .v-tabs-panel[hidden] {
    display: none;
  }

  .v-tabs-panel:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }
}
</style>
