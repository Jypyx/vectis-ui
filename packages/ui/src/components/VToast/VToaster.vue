<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { usePopover } from '../../composables/usePopover'
import VToast from './VToast.vue'
import { dismissToast, toasts, type ToastItem, type ToastPlacement } from './state'

import { useAriaLabel } from '../../composables/useAriaLabel'
import { useMessages } from '../../i18n/state'

/**
 * Hôte des notifications, à monter UNE fois (racine de l'app). Rend un
 * popover="manual" PAR PLACEMENT (pile flex — l'empilement est du pur CSS) :
 * des popovers individuels, fixes et sans ancre, se superposeraient tous au
 * même point du top-layer et exigeraient des offsets JS. Les six conteneurs
 * existent en permanence (refs stables, coût nul : divs vides cachées par le
 * style UA `[popover] { display: none }`, SSR inoffensif).
 *
 * JS justifié : pont entre la file réactive (state.ts) et l'API impérative
 * VPopover (showPopover/hidePopover — seule voie vers le top-layer), timers
 * d'auto-fermeture et leur pause au survol (WCAG 2.2.1, contrôle des limites
 * de temps).
 */
interface ToasterProps {
  /** Placement par défaut (surchargeable par toast). */
  placement?: ToastPlacement
  /** Durée d'affichage par défaut en ms (surchargeable par toast ; 0 = persistant). */
  duration?: number
  /** Libellé accessible de la croix de fermeture. Défaut : dictionnaire du DS. */
  closeLabel?: string
  /** Libellé accessible des régions de notifications (landmarks). Défaut : dictionnaire du DS. */
  label?: string
}

const props = withDefaults(defineProps<ToasterProps>(), {
  placement: 'bottom-right',
  duration: 5000,
  closeLabel: undefined,
  label: undefined,
})

const m = useMessages()
const ariaLabel = useAriaLabel(() => props.label ?? m.value.toaster.label)
const resolvedCloseLabel = computed(() => props.closeLabel ?? m.value.common.close)

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

/*
 * Une instance de usePopover PAR placement : elle porte la ref de l'élément,
 * l'état d'ouverture (alimenté par les événements du popover, cf. syncStack) et
 * les gardes d'idempotence — re-showPopover() sur un popover déjà ouvert lève
 * InvalidStateError. Les six conteneurs étant permanents, la fabrique ne tourne
 * qu'une fois au setup.
 */
const stacks = new Map(
  PLACEMENTS.map((placement) => {
    const el = ref<HTMLElement | null>(null)
    return [placement, { el, ...usePopover(el) }] as const
  }),
)

function setStackEl(placement: ToastPlacement, el: unknown) {
  const stack = stacks.get(placement)
  if (stack) stack.el.value = (el as HTMLElement | null) ?? null
}

function syncStack(placement: ToastPlacement, event: Event) {
  stacks.get(placement)?.syncShown(event)
}

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

  // Les gardes de usePopover rendent show()/hide() idempotents : pas de suivi
  // manuel des piles déjà ouvertes.
  for (const placement of PLACEMENTS) {
    const stack = stacks.get(placement)
    if (!stack?.el.value) continue
    if ((groups.value.get(placement)?.length ?? 0) > 0) stack.show()
    else stack.hide()
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

/* La file (état module) survit à un démontage/remontage du VToaster — seuls
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
    class="v-overlay v-toast-stack"
    popover="manual"
    :data-placement="p"
    role="region"
    :aria-label="ariaLabel"
    @pointerenter="pause(p)"
    @pointerleave="resume(p)"
    @beforetoggle="syncStack(p, $event)"
    @toggle="syncStack(p, $event)"
  >
    <VToast
      v-for="item in groups.get(p) ?? []"
      :key="item.id"
      :item="item"
      :close-label="resolvedCloseLabel"
      @close="dismissToast($event)"
    />
  </div>
</template>

<style>
@layer vectis.components {
  /* `position: fixed`, `inset: auto` et le garde-fou `display: none` du popover
     fermé viennent de `.v-overlay` (styles/floating.css), posée avec cette
     classe. Ne restent ici que les neutralisations UA propres à une pile
     (bordure, padding, fond Canvas, overflow) et sa mise en page. */
  .v-toast-stack {
    margin: 0;
    border: none;
    padding: 0;
    background: transparent;
    overflow: visible;
    width: fit-content;
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-3);
  }

  /*
   * Coordonnées PHYSIQUES (top/left…) : une notification est une position
   * d'écran, indépendante de la direction de lecture (comme les
   * notifications de l'OS).
   */
  .v-toast-stack[data-placement^='top-'] {
    top: var(--vectis-space-4);
    /* le plus récent près du bord : la file est append-only, le CSS inverse */
    flex-direction: column-reverse;
    --toast-enter-y: calc(-1 * var(--vectis-space-4));
  }

  .v-toast-stack[data-placement^='bottom-'] {
    bottom: var(--vectis-space-4);
    --toast-enter-y: var(--vectis-space-4);
  }

  .v-toast-stack[data-placement$='-left'] {
    left: var(--vectis-space-4);
  }

  .v-toast-stack[data-placement$='-right'] {
    right: var(--vectis-space-4);
  }

  .v-toast-stack[data-placement$='-center'] {
    left: 0;
    right: 0;
    margin-inline: auto;
  }

  /* Entrée/sortie animées de la pile (allow-discrete + @starting-style) —
     progressive enhancement, comme floating.css */
  .v-toast-stack {
    opacity: 1;
    transition:
      opacity var(--vectis-duration-base) var(--vectis-ease-default),
      overlay var(--vectis-duration-base) allow-discrete,
      display var(--vectis-duration-base) allow-discrete;
  }

  .v-toast-stack:not(:popover-open) {
    opacity: 0;
  }

  @starting-style {
    .v-toast-stack:popover-open {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .v-toast-stack {
      transition: none;
    }
  }
}
</style>
