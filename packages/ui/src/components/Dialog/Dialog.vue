<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useAttrs, useId, watch } from 'vue'

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
  /** Largeur de la modale (toute unité CSS) ; bornée à 100 % du viewport. */
  width?: string
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
  width: '400px',
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

// Montage paresseux : le <dialog> (et son contenu potentiellement lourd) n'existe
// dans le DOM que pendant qu'il est ouvert. Chaque ouverture crée un élément NEUF
// → showModal() sur un DOM propre (toujours modal donc centré), et la fermeture le
// retire entièrement (aucun résidu qui capterait les clics, pas de race à la
// réouverture). Le slot #trigger, lui, reste toujours rendu.
const rendered = ref(open.value)

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

// Asymétrie native de <dialog> : il émet 'close' à toute fermeture, mais AUCUN
// événement à l'ouverture (contrairement au 'toggle' du popover). D'où deux
// chemins pour le pont v-model ↔ API impérative (client uniquement) :
//  - OUVERTURE : monter le <dialog>, puis showModal() une fois le DOM en place.
//  - FERMETURE : fermeture native (croix, close(), Échap/backdrop) → 'close'
//    resynchronise le v-model (onClose), puis on démonte.
watch(open, async (value) => {
  if (value) {
    rendered.value = true
    await nextTick() // laisse Vue monter le <dialog> neuf avant showModal()
    dialogEl.value?.showModal()
  } else {
    dialogEl.value?.close()
    rendered.value = false
  }
})

onMounted(() => {
  // Les watchers ne tournent pas en SSR : on rejoue l'état initial au montage
  // (rendered vaut déjà open.value, donc le <dialog> est présent si ouvert).
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
    v-if="rendered"
    ref="dialogEl"
    v-bind="rootAttrs"
    class="ds-dialog"
    :style="{ '--_dialog-width': width }"
    :role="role === 'alertdialog' ? 'alertdialog' : undefined"
    :aria-labelledby="title ? titleId : undefined"
    :aria-describedby="subtitle ? subtitleId : undefined"
    @close="onClose"
  >
    <!--
      Header et footer sont des frères FIXES (flex: none) : seul le contenu
      central défile → la barre de défilement reste confinée à la zone du contenu,
      sans empiéter sur le header ni le footer. Le conteneur de défilement porte
      `container-type: scroll-state` ; les séparateurs sont deux sentinelles
      sticky À L'INTÉRIEUR (donc descendantes interrogeables — les container
      queries stylent les descendants, jamais les frères).
    -->
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
    <div class="ds-dialog-scroll">
      <span class="ds-dialog-edge ds-dialog-edge--top" aria-hidden="true" />
      <div class="ds-dialog-body">
        <slot />
      </div>
      <span class="ds-dialog-edge ds-dialog-edge--bottom" aria-hidden="true" />
    </div>
    <footer v-if="$slots.footer" class="ds-dialog-footer">
      <slot name="footer" />
    </footer>
  </dialog>
</template>

<style>
@layer ds.components {
  .ds-dialog {
    /* largeur posée inline (prop width) ; jamais plus large/haut que le viewport
       moins les marges */
    inline-size: var(--_dialog-width);
    max-inline-size: calc(100dvi - 2 * var(--ds-space-4));
    max-block-size: calc(100dvb - 2 * var(--ds-space-4));
    /* recentre la modale : l'UA centre les <dialog> modaux via `margin: auto`,
       mais notre reset (`* { margin: 0 }`, layer ds.reset) l'écrase — on le
       restaure ici (layer ds.components, plus fort que ds.reset) */
    margin: auto;
    /* header/footer fixes, seul .ds-dialog-scroll défile ; overflow:hidden
       clippe les coins arrondis */
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

  /*
   * Garde-fou indispensable : `.ds-dialog { display: flex }` (auteur) battrait le
   * `dialog:not([open]) { display: none }` de l'UA — une modale fermée resterait
   * dans le flux, en haut à gauche, captant les clics. On restaure le display:none
   * fermé (même rôle que `.ds-floating:not(:popover-open)`). Utile aussi le temps
   * de la frame montage → showModal() et en SSR.
   */
  .ds-dialog:not([open]) {
    display: none;
  }

  /* le conteneur reçoit le focus à l'ouverture (showModal) : pas d'anneau
     autour de toute la modale, le focus utile est sur les contrôles internes */
  .ds-dialog:focus-visible {
    outline: none;
  }

  .ds-dialog-scroll {
    /* la SEULE zone qui défile : occupe l'espace entre header et footer, la
       barre de défilement y reste donc confinée */
    flex: 1 1 auto;
    min-block-size: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    /* établit le conteneur de requête d'état de défilement (pas de containment
       de taille) : ses descendants (les sentinelles) peuvent interroger
       `scroll-state(...)` */
    container-type: scroll-state;
  }

  /*
   * Sentinelles de séparation : fines lignes sticky en haut et en bas de la zone
   * de défilement (descendantes du conteneur scroll-state). Les marges négatives
   * évitent qu'elles n'occupent de l'espace. Transparentes par défaut, révélées
   * au débordement plus bas.
   */
  .ds-dialog-edge {
    flex: none;
    block-size: 1px;
    position: sticky;
    background: transparent;
  }

  .ds-dialog-edge--top {
    inset-block-start: 0;
    margin-block-end: -1px;
  }

  .ds-dialog-edge--bottom {
    inset-block-end: 0;
    margin-block-start: -1px;
  }

  .ds-dialog-header {
    flex: none; /* fixe en haut, hors zone de défilement */
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--ds-space-4);
    padding: var(--ds-space-6) var(--ds-space-6) var(--ds-space-3);
  }

  .ds-dialog-titles {
    display: flex;
    flex-direction: column;
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
    /* grandit pour remplir la zone quand le contenu est court ; garde sa hauteur
       naturelle (donc déborde et fait défiler) quand il est long */
    flex: 1 0 auto;
    padding: var(--ds-space-1) var(--ds-space-6) var(--ds-space-3);
    color: var(--ds-color-text);
    font-size: var(--ds-font-size-sm);
    line-height: var(--ds-font-leading-normal);
  }

  .ds-dialog-footer {
    flex: none; /* fixe en bas, hors zone de défilement */
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: var(--ds-space-3);
    padding: var(--ds-space-3) var(--ds-space-6) var(--ds-space-6);
  }

  /*
   * Séparateurs conditionnels — dernières features CSS (scroll-state container
   * queries) sur les sentinelles. `scrollable: top` = du contenu est masqué
   * AU-DESSUS (on a scrollé) → on révèle le trait sous le header ;
   * `scrollable: bottom` = du contenu reste EN DESSOUS → on révèle le trait
   * au-dessus du footer. Exactement « visible seulement si le contenu passe
   * sous le header/footer ». Support : Chrome 133+ (Safari/Firefox pas encore).
   * Dégradation gracieuse : là où non supporté, les traits restent transparents.
   */
  @container scroll-state(scrollable: top) {
    .ds-dialog-edge--top {
      background: var(--ds-color-border);
    }
  }

  @container scroll-state(scrollable: bottom) {
    .ds-dialog-edge--bottom {
      background: var(--ds-color-border);
    }
  }

  /*
   * Animation d'ENTRÉE uniquement (progressive enhancement, `@starting-style`).
   * Le montage paresseux retire le <dialog> du DOM à la fermeture : il n'y a plus
   * d'animation de sortie (le prix d'un DOM propre et sans race de réouverture),
   * donc pas besoin de `overlay`/`display allow-discrete`. L'élément fraîchement
   * monté part des valeurs @starting-style puis rejoint l'état ouvert.
   */
  .ds-dialog {
    transition:
      opacity var(--ds-duration-base) var(--ds-ease-default),
      transform var(--ds-duration-base) var(--ds-ease-default);
  }

  @starting-style {
    .ds-dialog[open] {
      opacity: 0;
      transform: scale(0.97);
    }
  }

  .ds-dialog::backdrop {
    background: var(--ds-color-backdrop);
    transition: opacity var(--ds-duration-base) var(--ds-ease-default);
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
