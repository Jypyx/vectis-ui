<script setup lang="ts">
import { VTypography } from 'vectis-ui'

const { t } = useI18n()
</script>

<template>
  <footer class="vd-footer">
    <div class="vd-limit vd-footer-row">
      <VTypography variant="body-sm" as="p" tone="muted">
        {{ t('common.footer.licence') }}
      </VTypography>

      <p class="vd-footer-credit">
        <DocsProse
          tag="span"
          keypath="common.footer.builtWith"
          variant="body-sm"
          tone="muted"
          as="span"
        />
        <span class="vd-footer-heart" aria-hidden="true">♥</span>
      </p>
    </div>
  </footer>
</template>

<style scoped>
/* Catalogue HTML has no scope attributes; :deep is required to style its links. */
.vd-footer :deep(a) {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.vd-footer :deep(a:hover) {
  color: var(--vectis-color-accent-text);
}
.vd-footer :deep(a:focus-visible) {
  outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
  outline-offset: var(--vectis-focus-ring-offset);
  border-radius: var(--vectis-radius-xs);
}
</style>
