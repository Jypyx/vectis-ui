import { onBeforeUnmount } from 'vue'

/**
 * Un `setTimeout` réarmable, annulé au démontage.
 *
 * Trois règles que toutes les copies manuelles du DS appliquaient — délai
 * d'intention d'un sous-menu, délai d'apparition d'un Tooltip, débounce d'une
 * recherche — et qu'il ne faut pas réécrire à chaque fois :
 * - le handle vit dans un `let` NON réactif : personne ne le rend, en faire une
 *   `ref` déclencherait des rendus pour rien ;
 * - `start()` annule toujours le précédent, sinon deux timers courent ;
 * - annulation au démontage, sinon le callback s'exécute sur un composant mort.
 *
 * `start()` avec un délai ≤ 0 exécute **synchroniquement** : `setTimeout(…, 0)`
 * ne l'est pas, et la convention du DS est que 0 désarme le report (débounce
 * synchrone, toast persistant).
 */
export function useTimer(): { start: (fn: () => void, delay: number) => void; cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined

  function cancel() {
    clearTimeout(timer)
    timer = undefined
  }

  function start(fn: () => void, delay: number) {
    cancel()
    if (delay <= 0) fn()
    else timer = setTimeout(fn, delay)
  }

  onBeforeUnmount(cancel)

  return { start, cancel }
}
