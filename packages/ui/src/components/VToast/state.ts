import { reactive } from 'vue'

import type { IconSource } from '../Icon/types'

/**
 * File de notifications globale. JS justifié : aucune primitive HTML ne
 * couvre une file de notifications programmatique — l'état vit au niveau
 * module (pattern sonner) pour que `toast()` soit appelable PARTOUT
 * (composant, store, helper d'API), sans provide/inject.
 *
 * SSR-safe par contrat : `toast()` ne s'appelle que côté client (handlers,
 * retours d'API asynchrones), jamais pendant le rendu serveur — où l'état
 * module serait partagé entre requêtes. Seul le <Toaster> monté touche le
 * DOM (Popover API) et arme les timers d'auto-fermeture.
 */

export type ToastTone = 'neutral' | 'accent' | 'success' | 'danger' | 'warning'

export type ToastPlacement =
  'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'

export interface ToastOptions {
  /** Corps de la notification. */
  message: string
  title?: string
  tone?: ToastTone
  /** `tonal` : fond teinté + bordure ; `solid` : couleur pleine. */
  variant?: 'tonal' | 'solid'
  /**
   * Nom d'icône ou rendu explicite ; `false` = pas d'icône ;
   * absent = icône par défaut du tone.
   */
  icon?: IconSource | false
  /**
   * Durée d'affichage en ms ; `0` = reste affiché jusqu'à fermeture
   * manuelle ; absent = durée du Toaster (5000 par défaut).
   */
  duration?: number
  /** Absent = placement du Toaster (`bottom-right` par défaut). */
  placement?: ToastPlacement
  /** Affiche la croix de fermeture. */
  closable?: boolean
  /**
   * Largeur (longueur CSS) ; défaut `--vectis-control-size-toast-width`.
   * Toujours bornée à la largeur du viewport moins les marges.
   */
  width?: string
}

/** Un toast normalisé dans la file (interne, rendu par <Toaster>). */
export interface ToastItem extends ToastOptions {
  id: number
  tone: ToastTone
  variant: 'tonal' | 'solid'
  closable: boolean
}

/** File réactive, consommée par <Toaster> — non réexportée par index.ts. */
export const toasts = reactive<ToastItem[]>([])

let nextId = 0

/**
 * Ajoute une notification à la file et retourne son id (utilisable avec
 * `dismissToast`). Les défauts dépendant du Toaster (placement, duration)
 * sont résolus par lui — seule source de vérité de ses props.
 */
export function toast(options: ToastOptions): number {
  const id = nextId++
  toasts.push({ tone: 'neutral', variant: 'tonal', closable: true, ...options, id })
  return id
}

/** Retire un toast par id ; sans argument, vide toute la file. */
export function dismissToast(id?: number): void {
  if (id === undefined) {
    toasts.length = 0
    return
  }
  const index = toasts.findIndex((item) => item.id === id)
  if (index !== -1) toasts.splice(index, 1)
}
