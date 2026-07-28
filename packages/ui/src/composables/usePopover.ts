import { ref, type Ref } from 'vue'

/**
 * Plomberie d'état d'un élément `[popover]` — pendant de `styles/floating.css`,
 * qui porte la moitié « positionnement » du même sujet.
 *
 * JS justifié : la Popover API est impérative (`showPopover`/`hidePopover`) là
 * où le reste du DS est déclaratif, et elle pose deux pièges qu'un simple
 * booléen local ne couvre pas —
 * - `hidePopover()` sur un popover déjà fermé (ou `showPopover()` sur un déjà
 *   ouvert) lève `InvalidStateError` : d'où les gardes d'idempotence ;
 * - un popover `auto` se ferme SANS qu'on le lui demande (light dismiss) :
 *   l'état se lit dans le DOM, il ne se devine jamais. `beforetoggle` est émis
 *   de façon SYNCHRONE pendant show/hidePopover() et lors du light dismiss ;
 *   `toggle` est asynchrone en navigateur, mais c'est le seul émis par le stub
 *   jsdom (vitest.setup.ts) — les deux doivent donc être écoutés.
 *
 * Corollaire : ne jamais poser `shown` à la main (`shown.value = true` dans
 * `show()`), sinon un light dismiss désynchronise l'état et `hide()` devient un
 * no-op silencieux.
 */

// L'option `source` de showPopover() n'est pas encore dans lib.dom (TS 5.9).
type PopoverWithSource = HTMLElement & { showPopover(options?: { source?: HTMLElement }): void }

export function usePopover(el: Ref<HTMLElement | null>) {
  const shown = ref(false)

  /** À câbler sur `@beforetoggle` ET `@toggle` de l'élément popover. */
  function syncShown(event: Event) {
    shown.value = (event as ToggleEvent).newState === 'open'
  }

  /**
   * `source` rétablit la relation d'invocateur (donc l'ancre implicite et le
   * rattachement à la pile) lors des ouvertures PROGRAMMATIQUES — l'invocation
   * par clic via `popovertarget` la pose nativement.
   */
  function show(source?: HTMLElement) {
    if (!shown.value)
      (el.value as PopoverWithSource | null)?.showPopover(source ? { source } : undefined)
  }

  function hide() {
    if (shown.value) el.value?.hidePopover()
  }

  return { shown, syncShown, show, hide }
}
