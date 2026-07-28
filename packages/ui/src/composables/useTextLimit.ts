import { computed, watchEffect, type ComputedRef, type Ref } from 'vue'

/** Contrat minimal du contrôle natif : `<input>` comme `<textarea>` l'exposent. */
interface ValidatableControl {
  setCustomValidity: (message: string) => void
}

/**
 * Longueur saisie vs `maxlength` : le texte du compteur, le dépassement, et la
 * **limite souple** (Input et Textarea, à l'identique).
 *
 * Limite souple = la saisie n'est pas bloquée, le champ passe en erreur. Elle
 * passe par `setCustomValidity` plutôt que par un événement maison : le rouge
 * n'apparaît qu'après interaction (`:user-invalid`, même timing que le natif),
 * la soumission est bloquée, et l'état se lit par l'API standard `el.validity`.
 * Le composant POSSÈDE donc la custom validity tant que `softLimit` est actif.
 *
 * `flush: 'post'` : la ref template n'est pas encore posée en flush `pre`.
 * Inerte côté serveur, où la ref reste nulle.
 */
export function useTextLimit(options: {
  el: Ref<ValidatableControl | null>
  text: () => string
  maxlength: () => number | undefined
  softLimit: () => boolean
}): { counterText: ComputedRef<string>; over: ComputedRef<boolean> } {
  const length = computed(() => options.text().length)
  const max = computed(() => options.maxlength())

  watchEffect(
    () => {
      const el = options.el.value
      if (!el) return
      const overLimit = options.softLimit() && max.value != null && length.value > max.value
      el.setCustomValidity(overLimit ? `Dépasse la limite de ${max.value} caractères` : '')
    },
    { flush: 'post' },
  )

  return {
    counterText: computed(() =>
      max.value != null ? `${length.value}/${max.value}` : `${length.value}`,
    ),
    over: computed(() => max.value != null && length.value > max.value),
  }
}
