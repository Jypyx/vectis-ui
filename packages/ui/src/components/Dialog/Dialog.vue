<script setup lang="ts">
import { onMounted, ref, useId, watch } from 'vue'

/**
 * <dialog> natif : showModal() fournit top-layer, focus trap, Esc et inertie
 * du fond sans aucun JS. Le JS restant est le pont entre l'état déclaratif
 * (v-model:open) et l'API impérative du <dialog>, que le HTML seul ne permet
 * pas d'exprimer.
 */
interface DialogProps {
  /** Titre de l'en-tête ; remplaçable par le slot #title. */
  title?: string
  /** Ferme au clic sur le backdrop. */
  closeOnBackdrop?: boolean
  /** Affiche le bouton de fermeture. */
  dismissible?: boolean
}

const props = withDefaults(defineProps<DialogProps>(), {
  title: undefined,
  closeOnBackdrop: true,
  dismissible: true,
})

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  /** Émis après fermeture, quelle qu'en soit la cause (Esc, backdrop, bouton). */
  close: []
}>()

defineSlots<{
  /** Corps du dialog */
  default(): unknown
  /** Titre riche (remplace la prop `title`) */
  title?(): unknown
  /** Actions, alignées à droite */
  footer?(): unknown
}>()

const dialogEl = ref<HTMLDialogElement | null>(null)
const titleId = useId()

// SSR-safe : tout accès DOM vit dans watch/onMounted (client uniquement).
watch(open, (value) => {
  const el = dialogEl.value
  if (!el) return
  if (value && !el.open) el.showModal()
  else if (!value && el.open) el.close()
})

onMounted(() => {
  if (open.value) dialogEl.value?.showModal()
})

/** Événement natif `close` (Esc, close()) : on synchronise le modèle. */
function onNativeClose() {
  if (open.value) {
    open.value = false
    emit('close')
  }
}

/**
 * Clic backdrop : le backdrop natif n'est pas un élément ciblable ; un clic
 * dont la cible est le <dialog> lui-même (et non .ds-dialog-content, qui
 * couvre tout l'intérieur) est donc un clic backdrop. À terme, l'attribut
 * natif `closedby="any"` rendra ce handler inutile.
 */
function onClick(event: MouseEvent) {
  if (props.closeOnBackdrop && event.target === dialogEl.value) {
    dialogEl.value?.close()
  }
}
</script>

<template>
  <dialog
    ref="dialogEl"
    class="ds-dialog"
    :aria-labelledby="title || $slots.title ? titleId : undefined"
    @close="onNativeClose"
    @click="onClick"
  >
    <div class="ds-dialog-content">
      <header v-if="title || $slots.title || dismissible" class="ds-dialog-header">
        <h2 v-if="title || $slots.title" :id="titleId" class="ds-dialog-title">
          <slot name="title">{{ title }}</slot>
        </h2>
        <button
          v-if="dismissible"
          class="ds-dialog-close"
          type="button"
          aria-label="Fermer"
          @click="dialogEl?.close()"
        >
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path
              d="M4 4l8 8M12 4l-8 8"
              stroke="currentcolor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </header>
      <div class="ds-dialog-body">
        <slot />
      </div>
      <footer v-if="$slots.footer" class="ds-dialog-footer">
        <slot name="footer" />
      </footer>
    </div>
  </dialog>
</template>

<style>
@layer ds.components {
  .ds-dialog {
    width: min(28rem, calc(100vw - var(--ds-space-8)));
    /* padding: 0 → tout clic intérieur cible .ds-dialog-content (détection backdrop) */
    padding: 0;
    border: 1px solid var(--ds-color-border);
    border-radius: var(--ds-radius-overlay);
    background: var(--ds-color-surface-overlay);
    color: var(--ds-color-text);
    box-shadow: var(--ds-shadow-5);
  }

  .ds-dialog::backdrop {
    background: var(--ds-color-backdrop);
  }

  /* Entrée/sortie animées — progressive enhancement pur CSS (@starting-style,
     transition-behavior: allow-discrete) ; sans support, ouverture instantanée. */
  .ds-dialog {
    opacity: 0;
    transform: translateY(var(--ds-space-2)) scale(0.98);
    transition:
      opacity var(--ds-duration-base) var(--ds-ease-default),
      transform var(--ds-duration-base) var(--ds-ease-default),
      overlay var(--ds-duration-base) allow-discrete,
      display var(--ds-duration-base) allow-discrete;
  }

  .ds-dialog[open] {
    opacity: 1;
    transform: none;
  }

  @starting-style {
    .ds-dialog[open] {
      opacity: 0;
      transform: translateY(var(--ds-space-2)) scale(0.98);
    }
  }

  .ds-dialog::backdrop {
    transition:
      background-color var(--ds-duration-base) var(--ds-ease-default),
      overlay var(--ds-duration-base) allow-discrete,
      display var(--ds-duration-base) allow-discrete;
  }

  .ds-dialog-header {
    display: flex;
    align-items: flex-start;
    gap: var(--ds-space-3);
    padding: var(--ds-space-5) var(--ds-space-5) 0;
  }

  .ds-dialog-title {
    flex: 1;
    font-size: var(--ds-font-size-lg);
    font-weight: var(--ds-font-weight-semibold);
    line-height: var(--ds-font-leading-tight);
  }

  .ds-dialog-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--ds-control-height-sm);
    height: var(--ds-control-height-sm);
    margin-inline-start: auto;
    flex: none;
    border: none;
    background: transparent;
    color: var(--ds-color-text-muted);
    border-radius: var(--ds-radius-interactive);
    cursor: pointer;
  }

  .ds-dialog-close:hover {
    background: var(--ds-color-surface-muted);
    color: var(--ds-color-text);
  }

  .ds-dialog-close:focus-visible {
    outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color);
    outline-offset: calc(var(--ds-focus-ring-offset) * -1);
  }

  .ds-dialog-body {
    padding: var(--ds-space-4) var(--ds-space-5) var(--ds-space-5);
    font-size: var(--ds-font-size-sm);
    line-height: var(--ds-font-leading-normal);
    color: var(--ds-color-text-muted);
  }

  .ds-dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--ds-space-2);
    padding: 0 var(--ds-space-5) var(--ds-space-5);
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-dialog,
    .ds-dialog::backdrop {
      transition: none;
    }
  }
}
</style>
