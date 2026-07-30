import { computed, watchEffect, type ComputedRef, type Ref } from 'vue'

import { useMessages } from '../i18n/state'

/** Contrat minimal du contrôle natif : `<input>` comme `<textarea>` l'exposent. */
interface ValidatableControl {
  setCustomValidity: (message: string) => void
}

/**
 * Longueur saisie vs `maxlength` : le texte du compteur, le dépassement et la
 * **limite souple**.
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
  const m = useMessages()

  // La lecture du dictionnaire est DANS l'effet : le message de validation se
  // réécrit donc tout seul si `setLocale` est appelé après le montage.
  // `if/else` plutôt qu'un ternaire, pour que TS restreigne `limit` à `number`.
  watchEffect(
    () => {
      const el = options.el.value
      if (!el) return
      const limit = max.value
      if (options.softLimit() && limit != null && length.value > limit) {
        el.setCustomValidity(m.value.field.limitExceeded(limit))
      } else {
        el.setCustomValidity('')
      }
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
