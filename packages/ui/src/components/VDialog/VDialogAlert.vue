<script setup lang="ts">
/**
 * A dialog demanding an answer: confirming something irreversible, acknowledging a
 * failure. It looks exactly like VDialog and is nothing more than VDialog with its
 * options fixed, but those fixed options change what it is.
 *
 * It is announced to assistive technology as an alert rather than an ordinary dialog,
 * and every casual way out is closed off: there is no cross, a click outside does
 * nothing, and Escape does nothing either. The buttons in the footer are the only way
 * to dismiss it — which is why supplying them is not optional.
 */

import VDialog from './VDialog.vue'

interface DialogAlertProps {
  /**
   * The question being asked, which also names the dialog for assistive technology.
   * It is ignored when the `#header` slot replaces the whole header.
   */
  title?: string
  /** A line under the title, spelling out the consequences of the answer. */
  subtitle?: string
  /**
   * How wide the dialog is, in any CSS unit. It is never allowed to exceed the width
   * of the viewport.
   */
  width?: string
}

withDefaults(defineProps<DialogAlertProps>(), {
  title: undefined,
  subtitle: undefined,
  width: '400px',
})

/** Whether the alert is showing. It starts closed, and closing writes back to it. */
const open = defineModel<boolean>('open', { default: false })

type TriggerProps = {
  onClick: () => void
  'aria-haspopup': 'dialog'
}

defineSlots<{
  /** What the alert says. */
  default(): unknown
  /** Replaces the title and subtitle block with content of your own. */
  header?(): unknown
  /**
   * The buttons that answer the alert. They are not optional: nothing else can close
   * this dialog.
   */
  footer?(): unknown
  /**
   * The button that opens the alert. Bind the `triggerProps` it receives onto it.
   */
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
