<script setup lang="ts">
import { ref } from 'vue'
import { VHotkeys, VInput, VTypography } from 'vectis-ui'

const opened = ref(0)
const saved = ref(0)
const strict = ref(0)
const permissive = ref(0)
</script>

<template>
  <div class="stack">
    <!-- No platform is pinned, so the caps show what this keyboard has and the matcher
         answers to the same thing: a Mac reader presses Command, everyone else Ctrl. -->
    <p class="line">
      <VHotkeys keys="mod+k" variant="outlined" listen @trigger="opened++" />
      <VTypography as="span">Press it anywhere on the page. Fired {{ opened }} times.</VTypography>
    </p>

    <!-- The browser's own binding is cancelled unless allowDefault says otherwise,
         which is the whole point of taking over a combination it already uses. Here
         both happen: the count goes up and the browser opens its save dialog. -->
    <p class="line">
      <VHotkeys keys="mod+s" variant="outlined" listen allow-default @trigger="saved++" />
      <VTypography as="span" tone="muted">
        With allowDefault, the browser still saves the page. Fired {{ saved }} times.
      </VTypography>
    </p>

    <VInput label="Type in here, then press the shortcut below" class="field" />

    <p class="line">
      <VHotkeys keys="mod+j" variant="outlined" listen @trigger="strict++" />
      <VTypography as="span">Quiet while a field has the focus: {{ strict }}</VTypography>
    </p>

    <p class="line">
      <VHotkeys keys="mod+j" variant="outlined" listen allow-in-input @trigger="permissive++" />
      <VTypography as="span">With allowInInput, it fires there too: {{ permissive }}</VTypography>
    </p>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: var(--vectis-space-4);
}
.line {
  display: flex;
  align-items: center;
  gap: var(--vectis-space-3);
  margin: 0;
}
.field {
  inline-size: 22rem;
}
</style>
