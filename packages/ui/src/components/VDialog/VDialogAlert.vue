<script setup lang="ts">
import VDialog from './VDialog.vue'

/**
 * The alert variant: the same design as <VDialog>, but with `role="alertdialog"` — a
 * modal requiring an EXPLICIT action from the user. A plain <VDialog> wrapper is
 * enough: it locks the semantics down and cuts off every light dismiss. No cross
 * (`closable=false`), no backdrop click, NO Escape (`closedby="none"` derived from
 * closeOnBackdrop/closeOnEscape being false): only the footer buttons close the modal.
 */
interface DialogAlertProps {
  /** Title of the header (ignored when the #header slot is supplied). */
  title?: string
  /** Subtitle of the header, under the title. */
  subtitle?: string
  /** Width of the modal (any CSS unit); bounded to 100% of the viewport. */
  width?: string
}

withDefaults(defineProps<DialogAlertProps>(), {
  title: undefined,
  subtitle: undefined,
  width: '400px',
})

const open = defineModel<boolean>('open', { default: false })

type TriggerProps = {
  onClick: () => void
  'aria-haspopup': 'dialog'
}

defineSlots<{
  /** Content of the alert. */
  default(): unknown
  /** Replaces the header's title/subtitle block. */
  header?(): unknown
  /** Footer actions — mandatory, since they are the only way to close the alert. */
  footer?(): unknown
  /** Trigger: `v-bind="triggerProps"` on a <VButton>/<button>. */
  trigger?(props: { triggerProps: TriggerProps }): unknown
}>()
</script>

<template>
  <VDialog
    v-model:open="open"
    role="alertdialog"
    :title="title"
    :subtitle="subtitle"
    :width="width"
    :closable="false"
    :close-on-backdrop="false"
    :close-on-escape="false"
  >
    <template v-if="$slots.trigger" #trigger="{ triggerProps }">
      <slot name="trigger" :trigger-props="triggerProps" />
    </template>
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>
    <slot />
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </VDialog>
</template>
