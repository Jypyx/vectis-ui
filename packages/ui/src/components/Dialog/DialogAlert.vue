<script setup lang="ts">
import Dialog from './Dialog.vue'

/**
 * Variante d'alerte : même design que <Dialog>, mais `role="alertdialog"` —
 * une modale qui exige une action EXPLICITE de l'utilisateur. Un simple wrapper
 * de <Dialog> suffit : il verrouille la sémantique et coupe tout light dismiss.
 * Pas de croix (`closable=false`), ni clic backdrop, NI Échap (`closedby="none"`
 * dérivé de closeOnBackdrop/closeOnEscape à false) : seuls les boutons du footer
 * ferment la modale.
 */
interface DialogAlertProps {
  /** Titre du header (ignoré si le slot #header est fourni). */
  title?: string
  /** Sous-titre du header, sous le titre. */
  subtitle?: string
  /** Largeur : sm (20rem) / md (32rem) / lg (48rem). Défaut sm (alerte compacte). */
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<DialogAlertProps>(), {
  title: undefined,
  subtitle: undefined,
  size: 'sm',
})

const open = defineModel<boolean>('open', { default: false })

type TriggerProps = {
  onClick: () => void
  'aria-haspopup': 'dialog'
}

defineSlots<{
  /** Contenu de l'alerte. */
  default(): unknown
  /** Remplace le bloc titre/sous-titre du header. */
  header?(): unknown
  /** Actions du footer — obligatoires pour fermer l'alerte. */
  footer?(): unknown
  /** Déclencheur : `v-bind="triggerProps"` sur un <Button>/<button>. */
  trigger?(props: { triggerProps: TriggerProps }): unknown
}>()
</script>

<template>
  <Dialog
    v-model:open="open"
    role="alertdialog"
    :title="title"
    :subtitle="subtitle"
    :size="size"
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
  </Dialog>
</template>
