<script setup lang="ts">
/**
 * Fix VDialog to alertdialog semantics and require an explicit answer instead of light
 * dismissal.
 */

import { computed, ref } from 'vue'

import VDialog from './VDialog.vue'
import type { DialogTriggerProps } from './VDialog.vue'

interface DialogAlertProps {
  /**
   * The question being asked, which also names the dialog for assistive technology.
   * It is ignored when the `#header` slot replaces the whole header.
   */
  title?: string
  /** A line under the title, spelling out the consequences of the answer. */
  subtitle?: string
  /**
   * How wide the alert is: a number is read as pixels, a string as any CSS length. Left out, it
   * takes the `--vectis-control-size-dialog-width` token, 400px by default.
   */
  width?: number | string
}

withDefaults(defineProps<DialogAlertProps>(), {
  title: undefined,
  subtitle: undefined,
  width: undefined,
})

/** Whether the alert is showing. It starts closed, and closing writes back to it. */
const open = defineModel<boolean>('open', { default: false })

defineSlots<{
  /** What the alert says. */
  default(): unknown
  /** Replaces the title and subtitle block with content of your own. */
  header?(): unknown
  /**
   * Extra controls in the header, where a dialog puts them before its cross: a link to help,
   * for instance. An alert has no cross, so they sit at the end of the header alone.
   */
  'header-actions'?(): unknown
  /**
   * The buttons that answer the alert. They are not optional: nothing else can close
   * this dialog.
   */
  footer?(): unknown
  /**
   * The button that opens the alert. Bind the `triggerProps` it receives onto it.
   */
  trigger?(props: { triggerProps: DialogTriggerProps }): unknown
}>()

/*
 * This component is VDialog with its options fixed, so a ref on it has to answer the same way;
 * without this, the one dialog that CANNOT be dismissed by Escape or by a click outside would
 * also be the one a consumer could not close from code.
 */
const dialogRef = ref<InstanceType<typeof VDialog> | null>(null)

defineExpose({
  /**
   * Opens the alert, exactly as setting `open` does. The opening lands on the next tick:
   * the promise returned settles once the alert is showing.
   */
  show: (): Promise<void> => dialogRef.value?.show() ?? Promise.resolve(),
  /** Closes it. The footer's buttons are the reader's only way out; this is yours. */
  close: () => dialogRef.value?.close(),
  /** The `<dialog>` element. It is null while closed: each opening builds a fresh one. */
  el: computed(() => dialogRef.value?.el ?? null),
})
</script>

<template>
  <VDialog
    ref="dialogRef"
    v-model:open="open"
    role="alertdialog"
    :title="title"
    :subtitle="subtitle"
    :width="width"
    hide-close
    persistent-backdrop
    persistent-escape
  >
    <template v-if="$slots.trigger" #trigger="{ triggerProps }">
      <slot name="trigger" :trigger-props="triggerProps" />
    </template>
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>
    <template v-if="$slots['header-actions']" #header-actions>
      <slot name="header-actions" />
    </template>
    <slot />
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </VDialog>
</template>
