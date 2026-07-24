<script setup lang="ts">
import { computed, onMounted, ref, useAttrs, useId, watch } from 'vue'

import Icon from '../Icon/Icon.vue'
import IconButton from '../IconButton/IconButton.vue'

/**
 * Modale bloquante bâtie sur la primitive native `<dialog>` + `showModal()` :
 * top-layer, `::backdrop`, piège de focus et fond inerte GRATUITS, retour du
 * focus au déclencheur à la fermeture — aucun JS pour tout cela. Le light
 * dismiss (clic backdrop / Échap) est lui aussi déclaratif via l'attribut
 * `closedby`. Le SEUL JS de comportement est le pont `v-model:open` ↔ API
 * impérative (`showModal()`/`close()` n'ont pas d'équivalent déclaratif), gardé
 * SSR-safe (accès DOM confiné à onMounted/watch/handlers).
 *
 * Trois zones : header (titre + sous-titre, remplaçables par le slot #header ;
 * croix à droite, slot #headerActions juste à sa gauche), contenu scrollable
 * (slot par défaut) et footer d'actions (slot #footer). Les séparateurs
 * header/contenu et contenu/footer n'apparaissent que si le contenu déborde —
 * voir le `<style>` (scroll-state container queries).
 */
interface DialogProps {
  /** Titre du header (ignoré si le slot #header est fourni). */
  title?: string
  /** Sous-titre du header, sous le titre. */
  subtitle?: string
  /** Largeur : sm (20rem) / md (32rem) / lg (48rem). */
  size?: 'sm' | 'md' | 'lg'
  /** `alertdialog` pour une modale exigeant une action explicite (cf. DialogAlert). */
  role?: 'dialog' | 'alertdialog'
  /** Affiche la croix de fermeture dans le header. */
  closable?: boolean
  /** Le clic sur le backdrop ferme la modale. */
  closeOnBackdrop?: boolean
  /** La touche Échap ferme la modale. */
  closeOnEscape?: boolean
  /** Nom accessible de la croix de fermeture. */
  closeLabel?: string
}

const props = withDefaults(defineProps<DialogProps>(), {
  title: undefined,
  subtitle: undefined,
  size: 'md',
  role: 'dialog',
  closable: true,
  closeOnBackdrop: true,
  closeOnEscape: true,
  closeLabel: 'Fermer',
})

const open = defineModel<boolean>('open', { default: false })

/** Props à poser sur un déclencheur (slot #trigger) via `v-bind="triggerProps"`. */
type TriggerProps = {
  onClick: () => void
  'aria-haspopup': 'dialog'
}

defineSlots<{
  /** Contenu de la modale (zone scrollable). */
  default(): unknown
  /** Remplace le bloc titre/sous-titre du header. */
  header?(): unknown
  /** Actions posées à gauche de la croix (menu, plein écran…). */
  headerActions?(): unknown
  /** Actions du footer (boutons). */
  footer?(): unknown
  /** Déclencheur : `v-bind="triggerProps"` sur un <Button>/<button>. */
  trigger?(props: { triggerProps: TriggerProps }): unknown
}>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const dialogEl = ref<HTMLDialogElement | null>(null)
const titleId = useId()
const subtitleId = useId()

/**
 * `closedby` (déclaratif, natif) : 'any' = backdrop + Échap, 'closerequest' =
 * Échap seul, 'none' = aucun light dismiss. Le combo « backdrop sans Échap »
 * n'est pas exprimable et retombe sur 'any' (non requis par nos composants).
 */
const closedby = computed(() =>
  props.closeOnBackdrop ? 'any' : props.closeOnEscape ? 'closerequest' : 'none',
)

// `closedby` n'est pas encore typé sur <dialog> dans lib.dom : on le pose via un
// objet v-bind (fallthrough + attribut natif), ce qui évite le contrôle
// d'attribut par élément de vue-tsc. Vue fusionne `class`/`style` du fallthrough
// avec la classe statique.
const rootAttrs = computed(() => ({ ...attrs, closedby: closedby.value }))

// Asymétrie native de <dialog> : il émet 'close' à toute fermeture, mais AUCUN
// événement à l'ouverture (contrairement au 'toggle' du popover). D'où deux
// chemins :
//  - OUVERTURE : on pose open.value = true, et le watcher appelle showModal().
//  - FERMETURE : on demande la fermeture NATIVE (croix, méthode exposée) →
//    l'événement 'close' resynchronise le v-model (onClose). Le light dismiss
//    (Échap/backdrop via closedby) emprunte exactement le même événement.
function show() {
  open.value = true
}

function requestClose() {
  // ferme l'élément natif → déclenche 'close' → onClose met open.value à false
  dialogEl.value?.close()
}

const triggerProps = computed<TriggerProps>(() => ({
  onClick: show,
  'aria-haspopup': 'dialog',
}))

// Pont v-model ↔ API impérative (client uniquement). Garde anti-InvalidStateError :
// showModal()/close() lèvent si l'état est déjà atteint.
watch(open, (value) => {
  const el = dialogEl.value
  if (!el || value === el.open) return
  if (value) el.showModal()
  else el.close()
})

onMounted(() => {
  // Les watchers ne tournent pas en SSR : on rejoue l'état initial au montage.
  if (open.value) dialogEl.value?.showModal()
})

// 'close' natif (croix, close(), Échap/backdrop via closedby) → resync v-model.
function onClose() {
  open.value = false
}

defineExpose({ show, close: requestClose, el: dialogEl })
</script>

<template>
  <slot name="trigger" :trigger-props="triggerProps" />
  <dialog
    ref="dialogEl"
    v-bind="rootAttrs"
    class="ds-dialog"
    :data-size="size"
    :role="role === 'alertdialog' ? 'alertdialog' : undefined"
    :aria-labelledby="title ? titleId : undefined"
    :aria-describedby="subtitle ? subtitleId : undefined"
    @close="onClose"
  >
    <!--
      Le conteneur de défilement est aussi le conteneur `scroll-state` : header
      et footer, en position sticky À L'INTÉRIEUR, restent toujours visibles ET
      deviennent descendants interrogeables (les container queries stylent les
      descendants, jamais les frères).
    -->
    <div class="ds-dialog-scroll">
      <header class="ds-dialog-header">
        <slot name="header">
          <div class="ds-dialog-titles">
            <h2 v-if="title" :id="titleId" class="ds-dialog-title">{{ title }}</h2>
            <p v-if="subtitle" :id="subtitleId" class="ds-dialog-subtitle">{{ subtitle }}</p>
          </div>
        </slot>
        <div v-if="closable || $slots.headerActions" class="ds-dialog-header-actions">
          <slot name="headerActions" />
          <IconButton
            v-if="closable"
            class="ds-dialog-close"
            :label="closeLabel"
            variant="ghost"
            tone="neutral"
            size="sm"
            @click="requestClose"
          >
            <Icon name="close" />
          </IconButton>
        </div>
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
    /* fit-content borné : jamais plus large/haut que 100% moins les marges */
    inline-size: var(--_dialog-width, var(--ds-control-size-dialog-md));
    max-inline-size: calc(100dvi - 2 * var(--ds-space-4));
    max-block-size: calc(100dvb - 2 * var(--ds-space-4));
    /* le défilement vit dans .ds-dialog-scroll ; overflow:hidden clippe les
       coins arrondis (fond des header/footer sticky compris) */
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 0;
    border: none;
    border-radius: var(--ds-radius-overlay);
    background: var(--ds-color-surface-overlay);
    color: var(--ds-color-text);
    box-shadow: var(--ds-shadow-5);
    font-family: var(--ds-font-family-sans);
  }

  .ds-dialog[data-size='sm'] {
    --_dialog-width: var(--ds-control-size-dialog-sm);
  }

  .ds-dialog[data-size='md'] {
    --_dialog-width: var(--ds-control-size-dialog-md);
  }

  .ds-dialog[data-size='lg'] {
    --_dialog-width: var(--ds-control-size-dialog-lg);
  }

  /* le conteneur reçoit le focus à l'ouverture (showModal) : pas d'anneau
     autour de toute la modale, le focus utile est sur les contrôles internes */
  .ds-dialog:focus-visible {
    outline: none;
  }

  .ds-dialog-scroll {
    flex: 1 1 auto;
    min-block-size: 0;
    overflow-y: auto;
    /* établit le conteneur de requête d'état de défilement (pas de containment
       de taille) : ses descendants peuvent interroger `scroll-state(...)` */
    container-type: scroll-state;
  }

  .ds-dialog-header {
    /* sticky : header toujours visible pendant le défilement du contenu */
    position: sticky;
    inset-block-start: 0;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--ds-space-4);
    padding: var(--ds-space-5) var(--ds-space-6);
    background: var(--ds-color-surface-overlay);
    /* séparateur transparent par défaut : révélé au débordement (plus bas) */
    border-block-end: 1px solid transparent;
  }

  .ds-dialog-titles {
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-1);
    min-inline-size: 0;
  }

  .ds-dialog-title {
    margin: 0;
    font-size: var(--ds-font-size-lg);
    font-weight: var(--ds-font-weight-semibold);
    line-height: var(--ds-font-leading-snug);
  }

  .ds-dialog-subtitle {
    margin: 0;
    color: var(--ds-color-text-muted);
    font-size: var(--ds-font-size-sm);
    line-height: var(--ds-font-leading-normal);
  }

  .ds-dialog-header-actions {
    display: flex;
    align-items: center;
    gap: var(--ds-space-1);
    /* réduit l'emprise de la croix dans le padding du header (idiome Toast) */
    margin-block-start: calc(-1 * var(--ds-space-1));
    margin-inline-end: calc(-1 * var(--ds-space-2));
  }

  .ds-dialog-body {
    padding: var(--ds-space-2) var(--ds-space-6) var(--ds-space-5);
    color: var(--ds-color-text);
    font-size: var(--ds-font-size-sm);
    line-height: var(--ds-font-leading-normal);
  }

  .ds-dialog-footer {
    /* sticky : footer toujours visible pendant le défilement du contenu */
    position: sticky;
    inset-block-end: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: var(--ds-space-3);
    padding: var(--ds-space-4) var(--ds-space-6);
    background: var(--ds-color-surface-overlay);
    /* séparateur transparent par défaut : révélé au débordement (plus bas) */
    border-block-start: 1px solid transparent;
  }

  /*
   * Séparateurs conditionnels — dernières features CSS (scroll-state container
   * queries). `scrollable: top` = du contenu est masqué AU-DESSUS (on a scrollé)
   * → on révèle le trait sous le header ; `scrollable: bottom` = du contenu
   * reste EN DESSOUS → on révèle le trait au-dessus du footer. Exactement
   * « visible seulement si le contenu passe sous le header/footer ».
   * Support : Chrome 133+ (Safari/Firefox pas encore). Dégradation gracieuse :
   * là où non supporté, les traits restent transparents (aucun séparateur).
   */
  @container scroll-state(scrollable: top) {
    .ds-dialog-header {
      border-block-end-color: var(--ds-color-border);
    }
  }

  @container scroll-state(scrollable: bottom) {
    .ds-dialog-footer {
      border-block-start-color: var(--ds-color-border);
    }
  }

  /*
   * Entrée/sortie animées (progressive enhancement, idiome floating.css adapté
   * à <dialog>) : allow-discrete + @starting-style sur l'élément ET son
   * ::backdrop ; `overlay`/`display` maintiennent la modale en top-layer le
   * temps de la transition de sortie.
   */
  .ds-dialog {
    opacity: 0;
    transform: scale(0.97);
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
      transform: scale(0.97);
    }
  }

  .ds-dialog::backdrop {
    background: var(--ds-color-backdrop);
    opacity: 0;
    transition:
      opacity var(--ds-duration-base) var(--ds-ease-default),
      overlay var(--ds-duration-base) allow-discrete,
      display var(--ds-duration-base) allow-discrete;
  }

  .ds-dialog[open]::backdrop {
    opacity: 1;
  }

  @starting-style {
    .ds-dialog[open]::backdrop {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-dialog,
    .ds-dialog::backdrop {
      transition: none;
    }
  }
}
</style>
