<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'

import Toast from './Toast.vue'
import { dismissToast, toasts, type ToastItem, type ToastPlacement } from './state'

/**
 * Hôte des notifications, à monter UNE fois (racine de l'app). Rend un
 * popover="manual" PAR PLACEMENT (pile flex — l'empilement est du pur CSS) :
 * des popovers individuels, fixes et sans ancre, se superposeraient tous au
 * même point du top-layer et exigeraient des offsets JS. Les six conteneurs
 * existent en permanence (refs stables, coût nul : divs vides cachées par le
 * style UA `[popover] { display: none }`, SSR inoffensif).
 *
 * JS justifié : pont entre la file réactive (state.ts) et l'API impérative
 * Popover (showPopover/hidePopover — seule voie vers le top-layer), timers
 * d'auto-fermeture et leur pause au survol (WCAG 2.2.1, contrôle des limites
 * de temps).
 */
interface ToasterProps {
  /** Placement par défaut (surchargeable par toast). */
  placement?: ToastPlacement
  /** Durée d'affichage par défaut en ms (surchargeable par toast ; 0 = persistant). */
  duration?: number
  /** Libellé accessible de la croix de fermeture. */
  closeLabel?: string
  /** Libellé accessible des régions de notifications (landmarks). */
  label?: string
}

const props = withDefaults(defineProps<ToasterProps>(), {
  placement: 'bottom-right',
  duration: 5000,
  closeLabel: 'Fermer',
  label: 'Notifications',
})

const PLACEMENTS: ToastPlacement[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
]

/** File groupée par placement effectif (option du toast, sinon prop). */
const groups = computed(() => {
  const map = new Map<ToastPlacement, ToastItem[]>()
  for (const item of toasts) {
    const placement = item.placement ?? props.placement
    const list = map.get(placement)
    if (list) list.push(item)
    else map.set(placement, [item])
  }
  return map
})

const stackEls = new Map<ToastPlacement, HTMLElement>()

function setStackEl(placement: ToastPlacement, el: unknown) {
  if (el) stackEls.set(placement, el as HTMLElement)
  else stackEls.delete(placement)
}

/* Garde : re-showPopover() sur un popover déjà ouvert lève InvalidStateError. */
const shown = new Set<ToastPlacement>()
/* Timers d'auto-fermeture — ids déjà armés (un toast n'est armé qu'une fois). */
const timers = new Map<number, ReturnType<typeof setTimeout>>()
const armed = new Set<number>()
/* Piles survolées : timers suspendus (repartent à la durée pleine au leave). */
const paused = new Set<ToastPlacement>()

function effectivePlacement(item: ToastItem): ToastPlacement {
  return item.placement ?? props.placement
}

function startTimer(item: ToastItem) {
  const duration = item.duration ?? props.duration
  if (duration <= 0 || timers.has(item.id)) return
  timers.set(
    item.id,
    setTimeout(() => {
      timers.delete(item.id)
      dismissToast(item.id)
    }, duration),
  )
}

/**
 * Synchronise file → DOM : arme les timers des nouveaux toasts, purge ceux
 * des disparus, ouvre les piles non vides et ferme les vides. Appelé au
 * montage (toasts émis avant — ils s'affichent) puis à chaque changement.
 */
function sync() {
  const alive = new Set(toasts.map((item) => item.id))
  for (const [id, timer] of timers) {
    if (!alive.has(id)) {
      clearTimeout(timer)
      timers.delete(id)
    }
  }
  for (const id of armed) if (!alive.has(id)) armed.delete(id)
  for (const item of toasts) {
    if (armed.has(item.id)) continue
    armed.add(item.id)
    if (!paused.has(effectivePlacement(item))) startTimer(item)
  }

  for (const placement of PLACEMENTS) {
    const el = stackEls.get(placement)
    if (!el) continue
    const hasToasts = (groups.value.get(placement)?.length ?? 0) > 0
    if (hasToasts && !shown.has(placement)) {
      el.showPopover()
      shown.add(placement)
    } else if (!hasToasts && shown.has(placement)) {
      el.hidePopover()
      shown.delete(placement)
    }
  }
}

/*
 * `groups` couvre tout changement de la file ET du placement par défaut ;
 * flush post : le toast est dans le DOM avant showPopover(). onMounted gère
 * les toasts émis avant le montage (les watchers ne tournent pas en SSR).
 */
watch(groups, sync, { flush: 'post' })
onMounted(sync)

/*
 * Pause au survol : suspend les timers de la pile ; au leave ils repartent à
 * la durée PLEINE (pas de décompte du temps restant — plus simple et plus
 * généreux pour l'utilisateur).
 */
function pause(placement: ToastPlacement) {
  paused.add(placement)
  for (const item of toasts) {
    if (effectivePlacement(item) !== placement) continue
    const timer = timers.get(item.id)
    if (timer !== undefined) {
      clearTimeout(timer)
      timers.delete(item.id)
    }
  }
}

function resume(placement: ToastPlacement) {
  paused.delete(placement)
  for (const item of toasts) {
    if (effectivePlacement(item) === placement) startTimer(item)
  }
}

/* La file (état module) survit à un démontage/remontage du Toaster — seuls
   les timers sont nettoyés (ils repartiront au prochain montage). */
onBeforeUnmount(() => {
  for (const timer of timers.values()) clearTimeout(timer)
  timers.clear()
})
</script>

<template>
  <div
    v-for="p in PLACEMENTS"
    :key="p"
    :ref="(el) => setStackEl(p, el)"
    class="ds-toast-stack"
    popover="manual"
    :data-placement="p"
    role="region"
    :aria-label="label"
    @pointerenter="pause(p)"
    @pointerleave="resume(p)"
  >
    <Toast
      v-for="item in groups.get(p) ?? []"
      :key="item.id"
      :item="item"
      :close-label="closeLabel"
      @close="dismissToast($event)"
    />
  </div>
</template>

<style>
@layer ds.components {
  .ds-toast-stack {
    position: fixed;
    /* neutralise les styles UA de [popover] (inset: 0 ; margin: auto ;
       border ; padding ; overflow: auto ; fond Canvas) */
    inset: auto;
    margin: 0;
    border: none;
    padding: 0;
    background: transparent;
    overflow: visible;
    width: fit-content;
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-3);
  }

  /*
   * Garde-fou : le `display: flex` ci-dessus écraserait le
   * `[popover] { display: none }` du style UA (les styles auteur battent
   * toujours l'UA) — la pile fermée resterait cliquable en opacity: 0.
   * `display … allow-discrete` plus bas préserve l'animation de sortie.
   */
  .ds-toast-stack:not(:popover-open) {
    display: none;
  }

  /*
   * Coordonnées PHYSIQUES (top/left…) : une notification est une position
   * d'écran, indépendante de la direction de lecture (comme les
   * notifications de l'OS).
   */
  .ds-toast-stack[data-placement^='top-'] {
    top: var(--ds-space-4);
    /* le plus récent près du bord : la file est append-only, le CSS inverse */
    flex-direction: column-reverse;
    --_enter-y: calc(-1 * var(--ds-space-4));
  }

  .ds-toast-stack[data-placement^='bottom-'] {
    bottom: var(--ds-space-4);
    --_enter-y: var(--ds-space-4);
  }

  .ds-toast-stack[data-placement$='-left'] {
    left: var(--ds-space-4);
  }

  .ds-toast-stack[data-placement$='-right'] {
    right: var(--ds-space-4);
  }

  .ds-toast-stack[data-placement$='-center'] {
    left: 0;
    right: 0;
    margin-inline: auto;
  }

  /* Entrée/sortie animées de la pile (allow-discrete + @starting-style) —
     progressive enhancement, comme floating.css */
  .ds-toast-stack {
    opacity: 1;
    transition:
      opacity var(--ds-duration-base) var(--ds-ease-default),
      overlay var(--ds-duration-base) allow-discrete,
      display var(--ds-duration-base) allow-discrete;
  }

  .ds-toast-stack:not(:popover-open) {
    opacity: 0;
  }

  @starting-style {
    .ds-toast-stack:popover-open {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-toast-stack {
      transition: none;
    }
  }
}
</style>
